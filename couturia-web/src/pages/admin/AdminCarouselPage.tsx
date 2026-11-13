import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  ImagePlus,
  Images,
  Layers3,
  Megaphone,
  Pencil,
  Plus,
  Scissors,
  Shirt,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import {
  ADMIN_ACTIVITY,
  ADMIN_BANNERS,
  ADMIN_KPIS,
  ADMIN_SLIDES,
  DEFAULT_SLIDE_DISPLAY,
  SLIDE_LINK_OPTIONS,
  type AdminSlide,
} from '@/lib/admin-mock'
import { formatFcfa } from '@/lib/format'

type ModalMode = 'create' | 'edit' | 'view'

const PAGE_SIZE = 5
const DESC_MAX_WORDS = 8

const emptyForm: Omit<AdminSlide, 'id'> = {
  titre: '',
  sousTitre: '',
  ctaLabel: '',
  ctaHref: '/catalogue',
  prix: null,
  image: '',
  ordre: 1,
  active: true,
  debut: '',
  fin: '',
  display: { ...DEFAULT_SLIDE_DISPLAY },
}

function truncateWords(text: string, maxWords: number): {
  short: string
  truncated: boolean
} {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return { short: text.trim(), truncated: false }
  return { short: `${words.slice(0, maxWords).join(' ')}…`, truncated: true }
}

const KPI_ICONS = {
  stylistes: Scissors,
  creations: Shirt,
  users: Users,
  slides: Images,
} as const

export function AdminCarouselPage() {
  const [slides, setSlides] = useState(ADMIN_SLIDES)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<AdminSlide, 'id'>>(emptyForm)
  const [savedHint, setSavedHint] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [previewIndex, setPreviewIndex] = useState(0)

  const sorted = useMemo(
    () => [...slides].sort((a, b) => a.ordre - b.ordre),
    [slides],
  )

  const activeSlides = useMemo(
    () => sorted.filter((slide) => slide.active),
    [sorted],
  )

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageItems = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  useEffect(() => {
    if (previewIndex >= activeSlides.length) {
      setPreviewIndex(0)
    }
  }, [activeSlides.length, previewIndex])

  useEffect(() => {
    if (activeSlides.length <= 1) return
    const timer = window.setInterval(() => {
      setPreviewIndex((index) => (index + 1) % activeSlides.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [activeSlides.length])

  // Verrouille le scroll de la page derrière les modales
  useEffect(() => {
    if (!modalOpen && !deleteId) return
    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`
    }
    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
    }
  }, [modalOpen, deleteId])

  const previewSlide = activeSlides[previewIndex] ?? activeSlides[0]
  const deleteTarget = slides.find((slide) => slide.id === deleteId)
  const readOnly = modalMode === 'view'

  function openCreate() {
    setModalMode('create')
    setEditingId(null)
    setForm({
      ...emptyForm,
      ordre: slides.length + 1,
      image: slides[0]?.image ?? '',
    })
    setSavedHint(null)
    setModalOpen(true)
  }

  function fillForm(slide: AdminSlide) {
    setForm({
      titre: slide.titre,
      sousTitre: slide.sousTitre,
      ctaLabel: slide.ctaLabel,
      ctaHref: slide.ctaHref,
      prix: slide.prix,
      image: slide.image,
      ordre: slide.ordre,
      active: slide.active,
      debut: slide.debut,
      fin: slide.fin,
      display: { ...slide.display },
    })
  }

  function toggleDisplay(
    key: keyof AdminSlide['display'],
    value: boolean,
  ) {
    setForm((f) => ({
      ...f,
      display: { ...f.display, [key]: value },
    }))
  }

  function openEdit(slide: AdminSlide) {
    setModalMode('edit')
    setEditingId(slide.id)
    fillForm(slide)
    setSavedHint(null)
    setModalOpen(true)
  }

  function openView(slide: AdminSlide) {
    setModalMode('view')
    setEditingId(slide.id)
    fillForm(slide)
    setSavedHint(null)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
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

  function confirmDelete() {
    if (!deleteId) return
    setSlides((prev) => prev.filter((slide) => slide.id !== deleteId))
    if (editingId === deleteId) closeModal()
    setDeleteId(null)
  }

  function onSave(event: FormEvent) {
    event.preventDefault()
    if (readOnly || !form.titre.trim()) return

    if (modalMode === 'edit' && editingId) {
      setSlides((prev) =>
        prev.map((slide) =>
          slide.id === editingId
            ? { ...slide, ...form, titre: form.titre.trim() }
            : slide,
        ),
      )
      setSavedHint('Slide mise à jour (mock).')
    } else {
      const id = `s-${Date.now()}`
      setSlides((prev) => [...prev, { id, ...form, titre: form.titre.trim() }])
      setEditingId(id)
      setModalMode('edit')
      setSavedHint('Slide ajoutée (mock).')
    }
  }

  const fieldClass =
    'h-8 w-full rounded-lg border border-line bg-[#faf7f5] px-2.5 text-xs text-heading outline-none transition placeholder:text-muted focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-default disabled:opacity-80'

  const modalTitle =
    modalMode === 'create'
      ? 'Ajouter une slide'
      : modalMode === 'edit'
        ? 'Modifier la slide'
        : 'Aperçu de la slide'

  return (
    <div className="space-y-4">
      <div className="sticky top-12 z-20 -mx-3 flex flex-wrap items-center justify-between gap-2 border-b border-line/70 bg-[#f6f1ee]/95 px-3 py-2 backdrop-blur lg:-mx-5 lg:px-5">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-primary sm:text-lg">
            Publicités & carousel
          </h1>
          <p className="hidden text-[11px] text-muted sm:block">
            Front mock — API d’enregistrement plus tard.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn btn-primary btn-sm h-9 min-h-9 shrink-0 gap-1.5 rounded-xl px-3 text-xs shadow-md"
        >
          <Plus className="size-3.5" aria-hidden />
          Ajouter une slide
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ADMIN_KPIS.map((kpi) => {
          const Icon = KPI_ICONS[kpi.id as keyof typeof KPI_ICONS] ?? Megaphone
          return (
            <article
              key={kpi.id}
              className="flex items-start justify-between gap-2 rounded-xl border border-line bg-white px-3 py-2.5 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-[10px] font-medium text-muted">
                  {kpi.label}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-heading">
                  {kpi.value}
                </p>
                <p
                  className={[
                    'mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-semibold',
                    kpi.positive ? 'text-emerald-700' : 'text-rose-700',
                  ].join(' ')}
                >
                  {kpi.id === 'slides' ? null : kpi.positive ? (
                    <TrendingUp className="size-2.5" aria-hidden />
                  ) : (
                    <TrendingDown className="size-2.5" aria-hidden />
                  )}
                  {kpi.delta}
                </p>
              </div>
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ribbon text-primary">
                <Icon className="size-4" aria-hidden />
              </span>
            </article>
          )
        })}
      </div>

      <section className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <div className="border-b border-line px-3 py-2.5">
          <h2 className="text-xs font-semibold text-heading">
            Slides du carousel ({sorted.length})
          </h2>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[960px] table-fixed text-left text-xs">
            <colgroup>
              <col className="w-[76px]" />
              <col className="w-[16%]" />
              <col />
              <col className="w-[12%]" />
              <col className="w-[100px]" />
              <col className="w-[64px]" />
              <col className="w-[88px]" />
              <col className="w-[118px]" />
              <col className="w-[108px]" />
            </colgroup>
            <thead className="bg-[#faf7f5] text-[10px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2.5 font-semibold">Image</th>
                <th className="px-2 py-2.5 font-semibold">Titre</th>
                <th className="px-2 py-2.5 font-semibold">Description</th>
                <th className="px-2 py-2.5 font-semibold">Bouton</th>
                <th className="px-2 py-2.5 font-semibold">Prix</th>
                <th className="px-2 py-2.5 font-semibold">Ordre</th>
                <th className="px-2 py-2.5 font-semibold">Visibilité</th>
                <th className="px-2 py-2.5 font-semibold">Période</th>
                <th className="px-3 py-2.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((slide) => {
                const desc = truncateWords(slide.sousTitre || '', DESC_MAX_WORDS)
                return (
                <tr
                  key={slide.id}
                  className="border-t border-line/80 transition hover:bg-[#faf7f5]"
                >
                  <td className="px-3 py-2 align-middle">
                    <img
                      src={slide.image}
                      alt=""
                      className="h-10 w-14 rounded-md object-cover"
                    />
                  </td>
                  <td className="min-w-0 px-2 py-2 align-middle">
                    <p className="truncate font-semibold text-heading">{slide.titre}</p>
                  </td>
                  <td className="min-w-0 px-2 py-2 align-middle">
                    {slide.sousTitre ? (
                      <button
                        type="button"
                        onClick={() => openView(slide)}
                        className="max-w-full text-left text-[11px] leading-snug text-muted hover:text-primary"
                        title="Voir la description complète"
                      >
                        {desc.short}
                        {desc.truncated ? (
                          <span className="ml-1 font-semibold text-primary">voir</span>
                        ) : null}
                      </button>
                    ) : (
                      <span className="text-[11px] text-muted">—</span>
                    )}
                  </td>
                  <td className="min-w-0 px-2 py-2 align-middle">
                    <p className="truncate text-[11px] font-medium text-primary">
                      {slide.ctaLabel || '—'}
                    </p>
                    <p className="truncate text-[10px] text-muted">
                      {SLIDE_LINK_OPTIONS.find((o) => o.value === slide.ctaHref)
                        ?.label ?? slide.ctaHref}
                    </p>
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <p className="text-[11px] font-semibold tabular-nums text-heading">
                      {slide.prix != null ? formatFcfa(slide.prix) : '—'}
                    </p>
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <input
                      type="number"
                      min={1}
                      value={slide.ordre}
                      onChange={(e) =>
                        updateOrdre(slide.id, Number(e.target.value) || 1)
                      }
                      className="h-8 w-12 rounded-md border border-line bg-white px-1 text-center text-[11px] tabular-nums"
                      aria-label={`Ordre de ${slide.titre}`}
                    />
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={slide.active}
                      aria-label={slide.active ? 'Désactiver' : 'Activer'}
                      onClick={() => toggleActive(slide.id)}
                      className={[
                        'relative h-5 w-9 rounded-full transition',
                        slide.active ? 'bg-primary' : 'bg-line',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition',
                          slide.active ? 'translate-x-4' : '',
                        ].join(' ')}
                      />
                    </button>
                  </td>
                  <td className="px-2 py-2 align-middle text-[11px] tabular-nums text-muted">
                    <span className="block">{slide.debut || '—'}</span>
                    <span className="block">{slide.fin || '—'}</span>
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        className="grid size-8 place-items-center rounded-lg text-muted hover:bg-ribbon hover:text-primary"
                        aria-label={`Voir ${slide.titre}`}
                        onClick={() => openView(slide)}
                      >
                        <Eye className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className="grid size-8 place-items-center rounded-lg text-muted hover:bg-ribbon hover:text-primary"
                        aria-label={`Modifier ${slide.titre}`}
                        onClick={() => openEdit(slide)}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className="grid size-8 place-items-center rounded-lg text-muted hover:bg-rose-50 hover:text-rose-700"
                        aria-label={`Supprimer ${slide.titre}`}
                        onClick={() => setDeleteId(slide.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-xs text-muted">
                    Aucune slide. Clique sur « Ajouter une slide ».
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2.5">
          <p className="text-[11px] text-muted">
            Page {currentPage} / {pageCount} · {sorted.length} slide
            {sorted.length > 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn btn-xs h-8 min-h-8 gap-1 rounded-lg border border-line bg-white text-[11px] disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" />
              Préc.
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={[
                    'grid size-8 place-items-center rounded-lg text-[11px] font-semibold',
                    pageNumber === currentPage
                      ? 'bg-primary text-white'
                      : 'border border-line bg-white text-heading hover:bg-ribbon',
                  ].join(' ')}
                >
                  {pageNumber}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="btn btn-xs h-8 min-h-8 gap-1 rounded-lg border border-line bg-white text-[11px] disabled:opacity-40"
            >
              Suiv.
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 xl:grid-cols-[1.35fr_1fr_0.9fr]">
        <section className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Eye className="size-3.5 text-primary" aria-hidden />
              <h2 className="text-xs font-semibold text-heading">
                Aperçu du carousel
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Temps réel
            </span>
          </div>

          {previewSlide ? (
            <div className="relative aspect-[16/9] bg-ribbon">
              <img
                src={previewSlide.image}
                alt=""
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/35 to-transparent" />
              {previewSlide.display.showPrix && previewSlide.prix != null ? (
                <span className="absolute top-3 right-3 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-primary shadow-sm">
                  {formatFcfa(previewSlide.prix)}
                </span>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                {previewSlide.display.showTitre ? (
                  <p className="text-sm font-semibold leading-snug sm:text-base">
                    {previewSlide.titre}
                  </p>
                ) : null}
                {previewSlide.display.showDescription ? (
                  <p className="mt-1 max-w-md text-[11px] text-white/85 sm:text-xs">
                    {previewSlide.sousTitre}
                  </p>
                ) : null}
                {previewSlide.display.showBouton && previewSlide.ctaLabel ? (
                  <span className="mt-3 inline-flex h-8 items-center rounded-lg bg-gold px-3 text-[11px] font-semibold text-heading">
                    {previewSlide.ctaLabel}
                  </span>
                ) : null}
              </div>

              {activeSlides.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="absolute top-1/2 left-2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-primary shadow"
                    aria-label="Slide précédente"
                    onClick={() =>
                      setPreviewIndex(
                        (index) =>
                          (index - 1 + activeSlides.length) % activeSlides.length,
                      )
                    }
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-primary shadow"
                    aria-label="Slide suivante"
                    onClick={() =>
                      setPreviewIndex((index) => (index + 1) % activeSlides.length)
                    }
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </>
              ) : null}

              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {activeSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Aller à la slide ${index + 1}`}
                    onClick={() => setPreviewIndex(index)}
                    className={[
                      'h-1.5 rounded-full transition',
                      index === previewIndex
                        ? 'w-5 bg-primary'
                        : 'w-1.5 bg-white/70',
                    ].join(' ')}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="p-6 text-center text-xs text-muted">
              Aucune slide active à prévisualiser.
            </p>
          )}

          {activeSlides.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto border-t border-line px-3 py-2.5">
              {activeSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setPreviewIndex(index)}
                  className={[
                    'relative h-12 w-16 shrink-0 overflow-hidden rounded-md ring-2 transition',
                    index === previewIndex
                      ? 'ring-primary'
                      : 'ring-transparent opacity-80 hover:opacity-100',
                  ].join(' ')}
                >
                  <img src={slide.image} alt="" className="size-full object-cover" />
                  <span className="absolute right-0.5 bottom-0.5 rounded bg-primary/90 px-1 text-[9px] font-semibold text-white">
                    {slide.ordre}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-line bg-white p-3 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers3 className="size-3.5 text-primary" aria-hidden />
              <div>
                <h2 className="text-xs font-semibold text-heading">
                  Bannières secondaires
                </h2>
                <p className="text-[10px] text-muted">Aperçu mock</p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-xs h-7 min-h-7 gap-1 rounded-lg text-[10px]"
              disabled
              title="Bientôt"
            >
              <Plus className="size-3" />
              Ajouter
            </button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
            {ADMIN_BANNERS.map((banner) => (
              <article
                key={banner.id}
                className="relative overflow-hidden rounded-lg border border-line"
              >
                <img
                  src={banner.image}
                  alt=""
                  className="aspect-[16/9] w-full object-cover sm:aspect-[4/3] xl:aspect-[16/8]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/75 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2 text-white">
                  <p className="text-[11px] font-semibold">{banner.titre}</p>
                  <p className="text-[10px] text-white/85">{banner.sousTitre}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Clock3 className="size-3.5 text-primary" aria-hidden />
              <h2 className="text-xs font-semibold text-heading">Activité récente</h2>
            </div>
            <button
              type="button"
              className="text-[10px] font-semibold text-primary hover:underline"
            >
              Voir tout
            </button>
          </div>

          <ul className="relative px-3 py-3">
            <span
              className="absolute top-5 bottom-5 left-[27px] w-px bg-line"
              aria-hidden
            />
            {ADMIN_ACTIVITY.map((item) => {
              const meta =
                item.kind === 'edit'
                  ? {
                      Icon: Pencil,
                      tone: 'bg-primary/10 text-primary',
                      label: 'Modification',
                    }
                  : item.kind === 'add'
                    ? {
                        Icon: Plus,
                        tone: 'bg-emerald-50 text-emerald-700',
                        label: 'Ajout',
                      }
                    : item.kind === 'disable'
                      ? {
                          Icon: EyeOff,
                          tone: 'bg-amber-50 text-amber-800',
                          label: 'Désactivation',
                        }
                      : {
                          Icon: ArrowDownUp,
                          tone: 'bg-sky-50 text-sky-800',
                          label: 'Réorganisation',
                        }
              const Icon = meta.Icon
              return (
                <li key={item.id} className="relative flex gap-3 pb-3.5 last:pb-0">
                  <span
                    className={[
                      'relative z-[1] grid size-8 shrink-0 place-items-center rounded-full border border-white shadow-sm',
                      meta.tone,
                    ].join(' ')}
                  >
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 rounded-lg border border-line/80 bg-[#faf7f5] px-2.5 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                          {meta.label}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-heading">
                          {item.title}
                        </p>
                        <p className="truncate text-[11px] text-muted">
                          « {item.detail} »
                        </p>
                      </div>
                      <time className="shrink-0 text-[10px] tabular-nums text-muted">
                        {item.when}
                      </time>
                    </div>
                    <p className="mt-1.5 text-[10px] text-muted">
                      Par <span className="font-medium text-heading">{item.actor}</span>
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[70] overflow-hidden overscroll-none bg-primary/45 p-2 backdrop-blur-sm sm:p-3 lg:p-4"
          onWheel={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="slide-modal-title"
            className="mx-auto grid h-full max-h-[100dvh] w-full max-w-[1400px] overflow-hidden rounded-2xl border border-line bg-white shadow-2xl lg:grid-cols-2"
          >
            <div className="relative hidden min-h-0 bg-ribbon lg:block">
              {form.image ? (
                <>
                  <img
                    src={form.image}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/25 to-transparent" />
                  {form.display.showPrix && form.prix != null ? (
                    <span className="absolute top-4 right-4 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-semibold tabular-nums text-primary shadow-sm">
                      {formatFcfa(form.prix)}
                    </span>
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    {form.display.showTitre ? (
                      <p className="text-xl font-semibold leading-snug">
                        {form.titre || 'Titre de la slide'}
                      </p>
                    ) : null}
                    {form.display.showDescription ? (
                      <p className="mt-1.5 max-w-lg text-sm text-white/85">
                        {form.sousTitre || 'Description'}
                      </p>
                    ) : null}
                    {form.display.showBouton && form.ctaLabel ? (
                      <span className="mt-3 inline-flex h-9 items-center rounded-lg bg-gold px-3.5 text-xs font-semibold text-heading">
                        {form.ctaLabel}
                      </span>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="grid h-full place-items-center gap-2 text-xs text-muted">
                  <ImagePlus className="size-8 text-primary/50" />
                  Aperçu image
                </div>
              )}
            </div>

            <form
              onSubmit={onSave}
              className="flex min-h-0 flex-col overflow-hidden"
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3">
                <div>
                  <h2
                    id="slide-modal-title"
                    className="text-sm font-semibold text-heading"
                  >
                    {modalTitle}
                  </h2>
                  <p className="text-[10px] text-muted">
                    Infos complètes + choix d’affichage (mobile)
                  </p>
                </div>
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-lg text-muted hover:bg-ribbon hover:text-primary"
                  aria-label="Fermer"
                  onClick={closeModal}
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 lg:overflow-visible">
                {modalMode !== 'view' ? (
                  <div className="mb-2 grid grid-cols-[1fr_72px] gap-2 lg:hidden">
                    <label className="flex min-h-[64px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line bg-[#faf7f5] px-2 text-center">
                      <ImagePlus className="size-4 text-primary" aria-hidden />
                      <span className="mt-1 text-[10px] text-muted">Image (mock)</span>
                      <input type="file" accept="image/*" className="sr-only" disabled />
                    </label>
                    {form.image ? (
                      <img
                        src={form.image}
                        alt=""
                        className="h-16 w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="rounded-lg bg-ribbon" />
                    )}
                  </div>
                ) : null}

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  <label className="block sm:col-span-2 xl:col-span-3">
                    <span className="mb-0.5 block text-[11px] font-medium text-heading">
                      Titre
                    </span>
                    <input
                      required
                      disabled={readOnly}
                      value={form.titre}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, titre: e.target.value }))
                      }
                      className={fieldClass}
                    />
                  </label>
                  <label className="block sm:col-span-2 xl:col-span-3">
                    <span className="mb-0.5 block text-[11px] font-medium text-heading">
                      Description
                    </span>
                    <textarea
                      disabled={readOnly}
                      rows={2}
                      value={form.sousTitre}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, sousTitre: e.target.value }))
                      }
                      className="w-full rounded-lg border border-line bg-[#faf7f5] px-2.5 py-1.5 text-xs text-heading outline-none transition placeholder:text-muted focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-default disabled:opacity-80"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] font-medium text-heading">
                      Texte du bouton
                    </span>
                    <input
                      disabled={readOnly}
                      value={form.ctaLabel}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, ctaLabel: e.target.value }))
                      }
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] font-medium text-heading">
                      Lien (destination du bouton)
                    </span>
                    <select
                      disabled={readOnly}
                      value={
                        SLIDE_LINK_OPTIONS.some((o) => o.value === form.ctaHref)
                          ? form.ctaHref
                          : SLIDE_LINK_OPTIONS[0]?.value
                      }
                      onChange={(e) =>
                        setForm((f) => ({ ...f, ctaHref: e.target.value }))
                      }
                      className={fieldClass}
                    >
                      {SLIDE_LINK_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="mt-0.5 block text-[10px] text-muted">
                      Page ouverte quand on clique sur le bouton
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] font-medium text-heading">
                      Prix (FCFA)
                    </span>
                    <input
                      type="number"
                      min={0}
                      disabled={readOnly}
                      value={form.prix ?? ''}
                      placeholder="Optionnel"
                      onChange={(e) => {
                        const raw = e.target.value
                        setForm((f) => ({
                          ...f,
                          prix: raw === '' ? null : Number(raw) || 0,
                        }))
                      }}
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] font-medium text-heading">
                      Ordre
                    </span>
                    <input
                      type="number"
                      min={1}
                      disabled={readOnly}
                      value={form.ordre}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          ordre: Number(e.target.value) || 1,
                        }))
                      }
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] font-medium text-heading">
                      Début
                    </span>
                    <input
                      type="date"
                      disabled={readOnly}
                      value={form.debut}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, debut: e.target.value }))
                      }
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] font-medium text-heading">
                      Fin
                    </span>
                    <input
                      type="date"
                      disabled={readOnly}
                      value={form.fin}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, fin: e.target.value }))
                      }
                      className={fieldClass}
                    />
                  </label>
                  <div className="flex items-end gap-2 pb-1">
                    <button
                      type="button"
                      role="switch"
                      disabled={readOnly}
                      aria-checked={form.active}
                      onClick={() =>
                        !readOnly && setForm((f) => ({ ...f, active: !f.active }))
                      }
                      className={[
                        'relative h-5 w-9 rounded-full transition disabled:opacity-60',
                        form.active ? 'bg-primary' : 'bg-line',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition',
                          form.active ? 'translate-x-4' : '',
                        ].join(' ')}
                      />
                    </button>
                    <span className="text-[11px] text-muted">
                      {form.active ? 'Visible' : 'Masquée'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-line bg-[#faf7f5] p-2.5">
                  <p className="mb-1.5 text-[11px] font-semibold text-heading">
                    Afficher sur la slide
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                    {(
                      [
                        ['showTitre', 'Titre'],
                        ['showDescription', 'Description'],
                        ['showPrix', 'Prix'],
                        ['showBouton', 'Bouton'],
                      ] as const
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-2 py-1.5 text-[11px] text-heading"
                      >
                        <input
                          type="checkbox"
                          disabled={readOnly}
                          checked={form.display[key]}
                          onChange={(e) => toggleDisplay(key, e.target.checked)}
                          className="checkbox checkbox-xs checkbox-primary rounded"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {savedHint ? (
                  <p className="mt-2 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] text-emerald-800">
                    {savedHint}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 justify-end gap-2 border-t border-line bg-white px-4 py-3">
                {modalMode === 'view' ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm h-9 min-h-9 rounded-lg border border-line bg-white text-xs"
                      onClick={closeModal}
                    >
                      Fermer
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm h-9 min-h-9 rounded-lg text-xs"
                      onClick={() => setModalMode('edit')}
                    >
                      Modifier
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm h-9 min-h-9 rounded-lg border border-line bg-white text-xs"
                      onClick={closeModal}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm h-9 min-h-9 rounded-lg text-xs"
                    >
                      Enregistrer
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteId && deleteTarget ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Annuler"
            onClick={() => setDeleteId(null)}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="relative z-[1] w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-700">
                <Trash2 className="size-4" aria-hidden />
              </span>
              <div>
                <h2 id="delete-title" className="text-sm font-semibold text-heading">
                  Supprimer cette slide ?
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  « {deleteTarget.titre} » sera retirée du carousel. Cette action
                  est définitive (mock local pour l’instant).
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-sm h-9 min-h-9 rounded-lg border border-line bg-white text-xs"
                onClick={() => setDeleteId(null)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-sm h-9 min-h-9 rounded-lg border-0 bg-rose-700 text-xs text-white hover:bg-rose-800"
                onClick={confirmDelete}
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
