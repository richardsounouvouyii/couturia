import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { DocumentMeta } from '@/components/DocumentMeta'
import { MOCK_CATEGORIES, MOCK_CREATIONS } from '@/lib/mock-data'
import {
  getStylistCreation,
  saveStylistCreation,
} from '@/lib/stylist-creations'

const categoryOptions = MOCK_CATEGORIES.filter((c) => c.id !== 'tous').map((c) => c.label)
const imageOptions = Array.from(new Set(MOCK_CREATIONS.map((c) => c.image)))

export function StylistCreationFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const existing = id ? getStylistCreation(id) : undefined
  const isEdit = Boolean(existing)

  const [titre, setTitre] = useState(existing?.titre ?? '')
  const [categorie, setCategorie] = useState(existing?.categorie ?? categoryOptions[0])
  const [ville, setVille] = useState(existing?.ville ?? 'Cotonou')
  const [prix, setPrix] = useState(
    existing?.prixIndicatif != null ? String(existing.prixIndicatif) : '',
  )
  const [description, setDescription] = useState(existing?.description ?? '')
  const [image, setImage] = useState(existing?.image ?? imageOptions[0])
  const [published, setPublished] = useState(existing?.published ?? true)
  const [message, setMessage] = useState<string | null>(null)

  const title = useMemo(
    () => (isEdit ? 'Modifier la création' : 'Nouvelle création'),
    [isEdit],
  )

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const saved = saveStylistCreation({
      id: existing?.id,
      titre: titre.trim(),
      categorie,
      ville: ville.trim(),
      prixIndicatif: prix.trim() ? Number(prix) : null,
      description: description.trim(),
      image,
      published,
    })
    setMessage('Enregistré sur cet appareil (démo front).')
    window.setTimeout(() => {
      navigate('/espace-styliste/creations')
    }, 600)
    return saved
  }

  if (id && !existing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-primary">
          Création introuvable
        </h1>
        <Link to="/espace-styliste/creations" className="btn btn-primary btn-sm mt-6 rounded-xl">
          Retour
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-page">
      <DocumentMeta title={title} path="/espace-styliste/creations/form" noIndex />

      <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8 lg:py-8">
        <Link
          to="/espace-styliste/creations"
          className="btn btn-ghost btn-sm mb-4 gap-2 px-0 text-primary hover:bg-transparent"
        >
          <ArrowLeft className="size-4" />
          Retour
        </Link>

        <h1 className="font-display text-2xl font-semibold text-primary sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Formulaire démo — les données restent dans votre navigateur.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6"
        >
          <label className="form-control w-full">
            <span className="mb-1.5 text-sm font-medium text-heading">Titre</span>
            <input
              required
              minLength={3}
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="input input-bordered w-full rounded-xl border-line bg-page focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-control w-full">
              <span className="mb-1.5 text-sm font-medium text-heading">Catégorie</span>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                className="select select-bordered w-full rounded-xl border-line bg-page focus:border-primary"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control w-full">
              <span className="mb-1.5 text-sm font-medium text-heading">Ville</span>
              <input
                required
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="input input-bordered w-full rounded-xl border-line bg-page focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              />
            </label>
          </div>

          <label className="form-control w-full">
            <span className="mb-1.5 text-sm font-medium text-heading">
              Prix indicatif (FCFA)
            </span>
            <input
              type="number"
              min={0}
              step={500}
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              placeholder="Optionnel"
              className="input input-bordered w-full rounded-xl border-line bg-page focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </label>

          <label className="form-control w-full">
            <span className="mb-1.5 text-sm font-medium text-heading">Description</span>
            <textarea
              required
              minLength={10}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered w-full rounded-xl border-line bg-page focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-heading">Image</legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {imageOptions.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImage(src)}
                  className={[
                    'overflow-hidden rounded-xl border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    image === src ? 'border-primary' : 'border-transparent',
                  ].join(' ')}
                  aria-pressed={image === src}
                  aria-label="Choisir cette image"
                >
                  <img src={src} alt="" className="aspect-square object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex items-center gap-2 text-sm text-heading">
            <input
              type="checkbox"
              className="checkbox checkbox-primary checkbox-sm"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Publier sur ma vitrine
          </label>

          {message ? (
            <p className="rounded-xl bg-ribbon px-3 py-2 text-sm text-primary">{message}</p>
          ) : null}

          <button type="submit" className="btn btn-primary w-full rounded-xl gap-2">
            <Save className="size-4" aria-hidden />
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  )
}
