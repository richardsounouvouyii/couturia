import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Images,
  Save,
  Trash2,
} from 'lucide-react'
import {
  CreationTurnViewer,
  TURN_360_MIN_FRAMES,
} from '@/components/CreationTurnViewer'
import { DocumentMeta } from '@/components/DocumentMeta'
import { MOCK_CATEGORIES } from '@/lib/mock-data'
import { useAuthSession } from '@/lib/auth-session'
import {
  getStylistCreation,
  MAX_CREATION_PHOTOS,
  PHOTO_ANGLES,
  photoAngleLabel,
  readImageFileAsDataUrl,
  saveStylistCreation,
  STYLIST_DEMO,
  type PhotoAngle,
  type StylistPhoto,
} from '@/lib/stylist-creations'

const categoryOptions = MOCK_CATEGORIES.filter((c) => c.id !== 'tous').map((c) => c.label)
const SUGGESTED_ANGLES: PhotoAngle[] = ['face', 'cote', 'dos', 'cote', 'detail']

const fieldClass =
  'h-11 w-full rounded-xl border border-line bg-page px-3 text-sm text-heading outline-none transition placeholder:text-muted focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30'

function suggestedAngleForIndex(index: number, totalHint: number): PhotoAngle {
  if (totalHint >= TURN_360_MIN_FRAMES) return 'autre'
  return SUGGESTED_ANGLES[index] ?? 'autre'
}

export function StylistCreationFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthSession()
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const existing = id ? getStylistCreation(id) : undefined
  const isEdit = Boolean(existing)

  const atelierName =
    user?.atelierName?.trim() ||
    existing?.atelier ||
    user?.fullName?.trim() ||
    STYLIST_DEMO.atelierName

  const [titre, setTitre] = useState(existing?.titre ?? '')
  const [categorie, setCategorie] = useState(existing?.categorie ?? categoryOptions[0])
  const [ville, setVille] = useState(existing?.ville ?? 'Cotonou')
  const [prix, setPrix] = useState(
    existing?.prixIndicatif != null ? String(existing.prixIndicatif) : '',
  )
  const [description, setDescription] = useState(existing?.description ?? '')
  const [photos, setPhotos] = useState<StylistPhoto[]>(existing?.photos ?? [])
  const [activeIndex, setActiveIndex] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const images = useMemo(() => photos.map((photo) => photo.src), [photos])
  const is360 = photos.length >= TURN_360_MIN_FRAMES
  const angleLabels = useMemo(
    () =>
      photos.map((photo, index) =>
        is360
          ? `${Math.round((index / photos.length) * 360) % 360}°`
          : photoAngleLabel(photo.angle),
      ),
    [is360, photos],
  )

  const title = useMemo(
    () => (isEdit ? 'Modifier la création' : 'Nouvelle création'),
    [isEdit],
  )

  async function onPickFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0) return

    const remaining = MAX_CREATION_PHOTOS - photos.length
    if (remaining <= 0) {
      setImageError(`Maximum ${MAX_CREATION_PHOTOS} photos par création.`)
      return
    }

    setUploading(true)
    setImageError(null)
    try {
      const batch = files.slice(0, remaining)
      const totalHint = photos.length + batch.length
      const next: StylistPhoto[] = []
      for (const [offset, file] of batch.entries()) {
        const src = await readImageFileAsDataUrl(file)
        next.push({
          src,
          angle: suggestedAngleForIndex(photos.length + offset, totalHint),
        })
      }
      setPhotos((current) => {
        const start = current.length
        const merged = [...current, ...next]
        setActiveIndex(start)
        return merged
      })
      if (files.length > remaining) {
        setImageError(
          `Seules ${remaining} photo(s) ont été ajoutées (max ${MAX_CREATION_PHOTOS}).`,
        )
      }
    } catch {
      setImageError('Impossible de lire une des images. Réessayez.')
    } finally {
      setUploading(false)
    }
  }

  function removeImage(index: number) {
    setPhotos((current) => {
      const next = current.filter((_, i) => i !== index)
      setActiveIndex((prev) => {
        if (next.length === 0) return 0
        if (prev > index) return prev - 1
        if (prev >= next.length) return next.length - 1
        return prev
      })
      return next
    })
  }

  function makeCover(index: number) {
    setPhotos((current) => {
      if (index <= 0 || index >= current.length) return current
      const next = [...current]
      const [picked] = next.splice(index, 1)
      setActiveIndex(0)
      return [picked, ...next]
    })
  }

  function movePhoto(index: number, direction: -1 | 1) {
    setPhotos((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      const [picked] = next.splice(index, 1)
      next.splice(target, 0, picked)
      setActiveIndex(target)
      return next
    })
  }

  function setPhotoAngle(index: number, angle: PhotoAngle) {
    setPhotos((current) =>
      current.map((photo, i) => (i === index ? { ...photo, angle } : photo)),
    )
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (photos.length === 0) {
      setImageError('Ajoutez au moins une photo depuis votre téléphone.')
      return
    }

    const prixNumber = Number(prix.replace(/\D/g, ''))
    if (!Number.isFinite(prixNumber) || prixNumber < 1) {
      setImageError('Indiquez un prix valide en chiffres uniquement.')
      return
    }

    const saved = saveStylistCreation({
      id: existing?.id,
      titre: titre.trim(),
      categorie,
      ville: ville.trim(),
      atelier: atelierName,
      prixIndicatif: prixNumber,
      description: description.trim(),
      photos,
      images: photos.map((photo) => photo.src),
      telephoneWhatsapp: user?.phone?.trim() || existing?.telephoneWhatsapp,
      published: true,
    })
    if (!saved.ok) {
      setImageError(saved.message)
      return
    }
    setMessage('Enregistré sur cet appareil (démo front).')
    window.setTimeout(() => {
      navigate('/espace-styliste/creations')
    }, 500)
  }

  if (id && !existing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
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

      <div className="mx-auto max-w-2xl px-4 pt-3 pb-8 sm:pt-5 lg:px-8 lg:pb-10">
        <Link
          to="/espace-styliste/creations"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          <ArrowLeft className="size-4" />
          Retour
        </Link>

        <h1 className="font-display mt-2 text-2xl font-semibold text-primary sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Pour un tour 360°, photographiez le vêtement en tournant autour, dans le même sens,
          puis importez les photos dans l’ordre.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-4 space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:space-y-5 sm:p-6"
        >
          <label className="block w-full">
            <span className="mb-1.5 block text-sm font-medium text-heading">Titre</span>
            <input
              required
              minLength={3}
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex. Robe wax soirée"
              className={fieldClass}
            />
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-heading">Catégorie</legend>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((c) => {
                const active = categorie === c
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategorie(c)}
                    aria-pressed={active}
                    className={[
                      'inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition',
                      active
                        ? 'bg-primary text-white'
                        : 'border border-line bg-page text-heading hover:border-primary/35',
                    ].join(' ')}
                  >
                    {active ? <Check className="size-3.5" aria-hidden /> : null}
                    {c}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block w-full">
              <span className="mb-1.5 block text-sm font-medium text-heading">Ville</span>
              <input
                required
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="block w-full">
              <span className="mb-1.5 block text-sm font-medium text-heading">
                Prix (F)
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                minLength={1}
                value={prix}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '')
                  setPrix(digits)
                }}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                    e.preventDefault()
                  }
                }}
                placeholder="Exemple : 25000"
                className={`${fieldClass} placeholder:italic`}
                autoComplete="off"
              />
            </label>
          </div>

          <label className="block w-full">
            <span className="mb-1.5 block text-sm font-medium text-heading">Description</span>
            <textarea
              required
              minLength={3}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Matières, coupe, occasion…"
              className="min-h-28 w-full rounded-xl border border-line bg-page px-3 py-2.5 text-sm text-heading outline-none transition placeholder:text-muted focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-heading">
              Photos ({photos.length}/{MAX_CREATION_PHOTOS})
              {is360 ? (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  Tour 360° actif
                </span>
              ) : null}
            </legend>

            <div className="mb-3 rounded-xl border border-line bg-page px-3 py-2.5 text-xs leading-relaxed text-muted">
              <p className="font-medium text-heading">Astuce tour 360°</p>
              <p className="mt-1">
                Idéal : {TURN_360_MIN_FRAMES} à {MAX_CREATION_PHOTOS} photos, toujours dans le
                même sens autour du mannequin. À partir de {TURN_360_MIN_FRAMES} photos, le
                client peut faire tourner la pièce en glissant.
              </p>
            </div>

            {/* Galerie : multi-sélection (sans capture → évite l’appareil photo seul) */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp"
              multiple
              className="sr-only"
              onChange={onPickFiles}
            />
            {/* Appareil photo : 1 cliché à la fois */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={onPickFiles}
            />

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploading || photos.length >= MAX_CREATION_PHOTOS}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/35 bg-page px-4 py-6 text-center transition hover:border-primary hover:bg-primary/5 disabled:opacity-60"
              >
                <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
                  <Images className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-heading">
                  {uploading ? 'Chargement…' : 'Choisir plusieurs photos'}
                </span>
                <span className="text-[11px] leading-snug text-muted">
                  Galerie · sélection multiple
                </span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading || photos.length >= MAX_CREATION_PHOTOS}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-page px-4 py-6 text-center transition hover:border-primary/35 hover:bg-primary/5 disabled:opacity-60"
              >
                <span className="grid size-11 place-items-center rounded-full bg-ribbon text-primary">
                  <Camera className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-heading">Prendre une photo</span>
                <span className="text-[11px] leading-snug text-muted">
                  Appareil photo · 1 à la fois
                </span>
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted">
              Astuce téléphone : dans la galerie, appuyez longuement ou cochez plusieurs
              images avant « OK / Ajouter ».
            </p>

            {photos.length > 0 ? (
              <>
                <div className="mt-3">
                  <CreationTurnViewer
                    images={images}
                    labels={angleLabels}
                    alt={titre || 'Création'}
                    activeIndex={activeIndex}
                    onActiveIndexChange={setActiveIndex}
                  />
                </div>

                <p className="mt-3 text-xs text-muted">
                  {is360
                    ? 'Réordonnez avec ← → si besoin. L’ordre définit le sens de rotation.'
                    : `Ajoutez encore ${TURN_360_MIN_FRAMES - photos.length} photo(s) pour activer le tour 360°, ou étiquetez Face / Dos.`}
                </p>
                <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((photo, index) => {
                    const isActive = index === activeIndex
                    const isCover = index === 0
                    return (
                      <li key={`${index}-${photo.src.slice(0, 24)}`} className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveIndex(index)}
                          className={[
                            'block w-full overflow-hidden rounded-xl border-2 transition',
                            isActive ? 'border-primary ring-2 ring-primary/25' : 'border-line',
                          ].join(' ')}
                          aria-label={`Voir la photo ${index + 1}`}
                          aria-current={isActive ? 'true' : undefined}
                        >
                          <img
                            src={photo.src}
                            alt=""
                            className="aspect-square w-full object-cover"
                          />
                        </button>
                        {isCover ? (
                          <span className="absolute top-1 left-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-white">
                            Couverture
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => makeCover(index)}
                            className="absolute top-8 left-1 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-semibold text-heading shadow-sm"
                          >
                            Couverture
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-white/95 text-primary shadow-sm"
                          aria-label="Supprimer cette photo"
                        >
                          <Trash2 className="size-3.5" />
                        </button>

                        <div className="mt-1.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => movePhoto(index, -1)}
                            disabled={index === 0}
                            className="grid size-8 place-items-center rounded-lg border border-line bg-page text-heading disabled:opacity-40"
                            aria-label="Déplacer à gauche"
                          >
                            <ChevronLeft className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePhoto(index, 1)}
                            disabled={index === photos.length - 1}
                            className="grid size-8 place-items-center rounded-lg border border-line bg-page text-heading disabled:opacity-40"
                            aria-label="Déplacer à droite"
                          >
                            <ChevronRight className="size-4" />
                          </button>
                          {is360 ? (
                            <span className="ml-auto text-[10px] font-semibold text-muted">
                              {Math.round((index / photos.length) * 360) % 360}°
                            </span>
                          ) : null}
                        </div>

                        {!is360 ? (
                          <label className="mt-1.5 block">
                            <span className="sr-only">Angle de la photo {index + 1}</span>
                            <select
                              value={photo.angle}
                              onChange={(e) =>
                                setPhotoAngle(index, e.target.value as PhotoAngle)
                              }
                              className="h-9 w-full rounded-lg border border-line bg-page px-2 text-xs font-medium text-heading outline-none focus:border-primary"
                            >
                              {PHOTO_ANGLES.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              </>
            ) : null}

            {imageError ? (
              <p className="mt-2 text-sm text-primary">{imageError}</p>
            ) : null}
          </fieldset>

          {message ? (
            <p className="rounded-xl bg-ribbon px-3 py-2 text-sm text-primary">{message}</p>
          ) : null}

          <button type="submit" className="btn btn-primary h-11 min-h-11 w-full rounded-xl gap-2">
            <Save className="size-4" aria-hidden />
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  )
}
