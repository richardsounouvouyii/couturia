import { useMemo, useState, type FormEvent } from 'react'
import {
  Eye,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import {
  ADMIN_ACTIVITY,
  ADMIN_BANNERS,
  ADMIN_KPIS,
  ADMIN_SLIDES,
  type AdminSlide,
} from '@/lib/admin-mock'

const emptyForm: Omit<AdminSlide, 'id'> = {
  titre: '',
  sousTitre: '',
  ctaLabel: '',
  ctaHref: '/',
  image: '',
  ordre: 1,
  active: true,
  debut: '',
  fin: '',
}

export function AdminCarouselPage() {
  const [slides, setSlides] = useState(ADMIN_SLIDES)
  const [selectedId, setSelectedId] = useState<string | null>(ADMIN_SLIDES[0]?.id ?? null)
  const [form, setForm] = useState<Omit<AdminSlide, 'id'>>(
    ADMIN_SLIDES[0]
      ? {
          titre: ADMIN_SLIDES[0].titre,
          sousTitre: ADMIN_SLIDES[0].sousTitre,
          ctaLabel: ADMIN_SLIDES[0].ctaLabel,
          ctaHref: ADMIN_SLIDES[0].ctaHref,
          image: ADMIN_SLIDES[0].image,
          ordre: ADMIN_SLIDES[0].ordre,
          active: ADMIN_SLIDES[0].active,
          debut: ADMIN_SLIDES[0].debut,
          fin: ADMIN_SLIDES[0].fin,
        }
      : emptyForm,
  )
  const [savedHint, setSavedHint] = useState<string | null>(null)

  const previewSlide = useMemo(() => {
    const fromSelection = slides.find((s) => s.id === selectedId && s.active)
    return fromSelection || slides.find((s) => s.active) || slides[0]
  }, [slides, selectedId])

  function selectSlide(slide: AdminSlide) {
    setSelectedId(slide.id)
    setForm({
      titre: slide.titre,
      sousTitre: slide.sousTitre,
      ctaLabel: slide.ctaLabel,
      ctaHref: slide.ctaHref,
      image: slide.image,
      ordre: slide.ordre,
      active: slide.active,
      debut: slide.debut,
      fin: slide.fin,
    })
    setSavedHint(null)
  }

  function startCreate() {
    setSelectedId(null)
    setForm({
      ...emptyForm,
      ordre: slides.length + 1,
      image: slides[0]?.image ?? '',
    })
    setSavedHint(null)
  }

  function toggleActive(id: string) {
    setSlides((prev) =>
      prev.map((slide) =>
        slide.id === id ? { ...slide, active: !slide.active } : slide,
      ),
    )
  }

  function updateOrdre(id: string, ordre: number) {
    setSlides((prev) =>
      prev.map((slide) => (slide.id === id ? { ...slide, ordre } : slide)),
    )
  }

  function removeSlide(id: string) {
    setSlides((prev) => prev.filter((slide) => slide.id !== id))
    if (selectedId === id) {
      setSelectedId(null)
      setForm(emptyForm)
    }
  }

  function onSave(event: FormEvent) {
    event.preventDefault()
    if (!form.titre.trim()) return

    if (selectedId) {
      setSlides((prev) =>
        prev.map((slide) =>
          slide.id === selectedId ? { ...slide, ...form, titre: form.titre.trim() } : slide,
        ),
      )
      setSavedHint('Slide mise à jour (mock local).')
    } else {
      const id = `s-${Date.now()}`
      const next: AdminSlide = { id, ...form, titre: form.titre.trim() }
      setSlides((prev) => [...prev, next])
      setSelectedId(id)
      setSavedHint('Slide ajoutée (mock local).')
    }
  }

  const fieldClass =
    'h-10 w-full rounded-xl border border-line bg-[#faf7f5] px-3 text-sm text-heading outline-none transition placeholder:text-muted focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/25'

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary">
          Gestion du carousel & des publicités
        </h1>
        <p className="mt-1 text-sm text-muted">
          Front mock — l’enregistrement API arrivera dans une prochaine étape.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {ADMIN_KPIS.map((kpi) => (
          <article
            key={kpi.id}
            className="rounded-2xl border border-line bg-white p-3.5 shadow-sm"
          >
            <p className="text-[11px] font-medium text-muted">{kpi.label}</p>
            <p className="mt-1.5 text-xl font-semibold tabular-nums text-heading">
              {kpi.value}
            </p>
            <p
              className={[
                'mt-1 inline-flex items-center gap-1 text-[11px] font-semibold',
                kpi.positive ? 'text-emerald-700' : 'text-rose-700',
              ].join(' ')}
            >
              {kpi.id === 'slides' ? null : kpi.positive ? (
                <TrendingUp className="size-3" aria-hidden />
              ) : (
                <TrendingDown className="size-3" aria-hidden />
              )}
              {kpi.delta}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
        <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-heading">
              Slides du carousel principal
            </h2>
            <button
              type="button"
              onClick={startCreate}
              className="btn btn-primary btn-sm h-9 min-h-9 gap-1.5 rounded-xl"
            >
              <Plus className="size-3.5" aria-hidden />
              Ajouter une slide
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#faf7f5] text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Aperçu</th>
                  <th className="px-3 py-3 font-semibold">Titre</th>
                  <th className="px-3 py-3 font-semibold">Ordre</th>
                  <th className="px-3 py-3 font-semibold">Visibilité</th>
                  <th className="px-3 py-3 font-semibold">Période</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...slides]
                  .sort((a, b) => a.ordre - b.ordre)
                  .map((slide) => {
                    const activeRow = selectedId === slide.id
                    return (
                      <tr
                        key={slide.id}
                        className={[
                          'border-t border-line/80 transition',
                          activeRow ? 'bg-ribbon/50' : 'hover:bg-[#faf7f5]',
                        ].join(' ')}
                      >
                        <td className="px-4 py-3">
                          <img
                            src={slide.image}
                            alt=""
                            className="h-12 w-16 rounded-lg object-cover"
                          />
                        </td>
                        <td className="max-w-[220px] px-3 py-3">
                          <p className="truncate font-medium text-heading">{slide.titre}</p>
                          <p className="truncate text-xs text-muted">{slide.sousTitre}</p>
                          <p className="mt-0.5 truncate text-[11px] text-primary">
                            CTA · {slide.ctaLabel}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min={1}
                            value={slide.ordre}
                            onChange={(e) =>
                              updateOrdre(slide.id, Number(e.target.value) || 1)
                            }
                            className="h-9 w-14 rounded-lg border border-line bg-white px-2 text-sm tabular-nums"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={slide.active}
                            onClick={() => toggleActive(slide.id)}
                            className={[
                              'relative h-6 w-11 rounded-full transition',
                              slide.active ? 'bg-primary' : 'bg-line',
                            ].join(' ')}
                          >
                            <span
                              className={[
                                'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition',
                                slide.active ? 'translate-x-5' : '',
                              ].join(' ')}
                            />
                          </button>
                        </td>
                        <td className="px-3 py-3 text-xs text-muted">
                          {slide.debut || '—'}
                          <br />
                          {slide.fin || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              className="grid size-8 place-items-center rounded-lg text-muted hover:bg-ribbon hover:text-primary"
                              aria-label="Voir"
                              onClick={() => selectSlide(slide)}
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              type="button"
                              className="grid size-8 place-items-center rounded-lg text-muted hover:bg-ribbon hover:text-primary"
                              aria-label="Modifier"
                              onClick={() => selectSlide(slide)}
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              type="button"
                              className="grid size-8 place-items-center rounded-lg text-muted hover:bg-rose-50 hover:text-rose-700"
                              aria-label="Supprimer"
                              onClick={() => removeSlide(slide.id)}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-heading">
            {selectedId ? 'Modifier une slide' : 'Ajouter une slide'}
          </h2>

          <form onSubmit={onSave} className="mt-4 space-y-3">
            <div className="grid grid-cols-[1fr_96px] gap-3">
              <label className="flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-[#faf7f5] px-3 text-center">
                <ImagePlus className="size-5 text-primary" aria-hidden />
                <span className="mt-1 text-[11px] text-muted">
                  Image (mock — upload API plus tard)
                </span>
                <input type="file" accept="image/*" className="sr-only" disabled />
              </label>
              {form.image ? (
                <img
                  src={form.image}
                  alt=""
                  className="h-24 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="rounded-xl bg-ribbon" />
              )}
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-heading">Titre</span>
              <input
                required
                value={form.titre}
                onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-heading">Sous-titre</span>
              <input
                value={form.sousTitre}
                onChange={(e) => setForm((f) => ({ ...f, sousTitre: e.target.value }))}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-heading">
                Texte du bouton (CTA)
              </span>
              <input
                value={form.ctaLabel}
                onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-heading">Lien du bouton</span>
              <input
                value={form.ctaHref}
                onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))}
                className={fieldClass}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-heading">Ordre</span>
                <input
                  type="number"
                  min={1}
                  value={form.ordre}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ordre: Number(e.target.value) || 1 }))
                  }
                  className={fieldClass}
                />
              </label>
              <div>
                <span className="mb-1 block text-xs font-medium text-heading">Visibilité</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.active}
                  onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                  className={[
                    'relative mt-1 h-6 w-11 rounded-full transition',
                    form.active ? 'bg-primary' : 'bg-line',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition',
                      form.active ? 'translate-x-5' : '',
                    ].join(' ')}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-heading">Début</span>
                <input
                  type="date"
                  value={form.debut}
                  onChange={(e) => setForm((f) => ({ ...f, debut: e.target.value }))}
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-heading">Fin</span>
                <input
                  type="date"
                  value={form.fin}
                  onChange={(e) => setForm((f) => ({ ...f, fin: e.target.value }))}
                  className={fieldClass}
                />
              </label>
            </div>

            {savedHint ? (
              <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                {savedHint}
              </p>
            ) : null}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={startCreate}
                className="btn btn-sm h-10 min-h-10 flex-1 rounded-xl border border-line bg-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm h-10 min-h-10 flex-1 rounded-xl"
              >
                Enregistrer la slide
              </button>
            </div>
          </form>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm lg:col-span-1">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-heading">Aperçu du carousel</h2>
            <p className="text-[11px] text-muted">Prévisualisation live (mock)</p>
          </div>
          {previewSlide ? (
            <div className="relative aspect-[16/10]">
              <img
                src={previewSlide.image}
                alt=""
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="font-display text-lg font-semibold leading-snug">
                  {previewSlide.titre}
                </p>
                <p className="mt-1 text-xs text-white/85">{previewSlide.sousTitre}</p>
                <span className="btn btn-sm mt-3 h-8 min-h-8 border-0 bg-gold text-heading">
                  {previewSlide.ctaLabel}
                </span>
              </div>
            </div>
          ) : (
            <p className="p-6 text-sm text-muted">Aucune slide active.</p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white p-4 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold text-heading">Bannières secondaires</h2>
          <div className="mt-3 space-y-3">
            {ADMIN_BANNERS.map((banner) => (
              <article
                key={banner.id}
                className="flex gap-3 overflow-hidden rounded-xl border border-line"
              >
                <img
                  src={banner.image}
                  alt=""
                  className="h-16 w-20 shrink-0 object-cover"
                />
                <div className="min-w-0 py-2 pr-2">
                  <p className="truncate text-sm font-semibold text-heading">
                    {banner.titre}
                  </p>
                  <p className="truncate text-xs text-muted">{banner.sousTitre}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-4 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold text-heading">Activité récente</h2>
          <ul className="mt-3 space-y-3">
            {ADMIN_ACTIVITY.map((item) => (
              <li key={item.id} className="border-b border-line/70 pb-3 last:border-0 last:pb-0">
                <p className="text-sm text-heading">{item.message}</p>
                <p className="mt-0.5 text-[11px] text-muted">{item.when}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
