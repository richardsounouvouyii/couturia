import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  Scissors,
  Search,
  Shirt,
  Star,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import {
  ADMIN_STYLISTE_FEED,
  ADMIN_STYLISTE_KPIS,
  ADMIN_STYLISTES,
  type AdminKpi,
  type AdminStyliste,
  type AdminStylisteStatus,
} from '@/lib/admin-mock'
import { listUsers, updateUser } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/http'
import { enrichStylistesWithAteliers } from '@/lib/admin-users'
import { useAuthSession } from '@/lib/auth-session'

const PAGE_SIZE = 6

type ModalMode = 'view' | 'edit' | 'create'

const KPI_ICONS = {
  total: Scissors,
  actifs: UserCheck,
  attente: UserPlus,
  suspendus: UserMinus,
} as const

const STATUS_LABEL: Record<AdminStylisteStatus, string> = {
  verifie: 'Vérifié',
  actif: 'Actif',
  en_attente: 'En attente',
  suspendu: 'Suspendu',
}

const STATUS_CLASS: Record<AdminStylisteStatus, string> = {
  verifie: 'bg-emerald-100 text-emerald-800',
  actif: 'bg-lime-100 text-lime-800',
  en_attente: 'bg-amber-100 text-amber-900',
  suspendu: 'bg-rose-100 text-rose-800',
}

type SortKey = 'recent' | 'creations' | 'nom' | 'inscrit'

type StylisteForm = {
  nom: string
  email: string
  atelierNom: string
  specialite: string
  ville: string
  quartier: string
  whatsapp: string
  statut: AdminStylisteStatus
  isPublic: boolean
  notes: string
}

const emptyForm: StylisteForm = {
  nom: '',
  email: '',
  atelierNom: '',
  specialite: '',
  ville: 'Cotonou',
  quartier: '',
  whatsapp: '',
  statut: 'en_attente',
  isPublic: false,
  notes: '',
}

function formatInscrit(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function buildStylisteKpis(items: AdminStyliste[]): AdminKpi[] {
  const total = items.length
  const publics = items.filter((s) => s.isPublic).length
  const attente = items.filter((s) => s.statut === 'en_attente').length
  const suspendus = items.filter((s) => s.statut === 'suspendu').length
  return [
    {
      id: 'total',
      label: 'Stylistes total',
      value: String(total),
      delta: 'API live',
      positive: true,
    },
    {
      id: 'actifs',
      label: 'Ateliers publics',
      value: String(publics),
      delta: `${total ? Math.round((publics / total) * 100) : 0}%`,
      positive: true,
    },
    {
      id: 'attente',
      label: 'Sans vitrine / attente',
      value: String(attente),
      delta: attente > 0 ? 'à suivre' : 'ok',
      positive: attente === 0,
    },
    {
      id: 'suspendus',
      label: 'Suspendus',
      value: String(suspendus),
      delta: suspendus > 0 ? 'à traiter' : 'ok',
      positive: suspendus === 0,
    },
  ]
}

export function AdminStylistesPage() {
  const { token, isStaff } = useAuthSession()
  const liveMode = Boolean(token && isStaff)

  const [stylistes, setStylistes] = useState<AdminStyliste[]>(
    liveMode ? [] : ADMIN_STYLISTES,
  )
  const [loading, setLoading] = useState(liveMode)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'tous' | AdminStylisteStatus
  >('tous')
  const [villeFilter, setVilleFilter] = useState('Toutes les villes')
  const [sortKey, setSortKey] = useState<SortKey>('recent')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [savedHint, setSavedHint] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('view')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<StylisteForm>(emptyForm)
  const [preview, setPreview] = useState<AdminStyliste | null>(null)
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false)

  const kpis = liveMode ? buildStylisteKpis(stylistes) : ADMIN_STYLISTE_KPIS
  const villesOptions = useMemo(
    () => [
      'Toutes les villes',
      ...Array.from(new Set(stylistes.map((s) => s.ville)))
        .filter((v) => v && v !== '—')
        .sort(),
    ],
    [stylistes],
  )

  async function reloadStylistes() {
    if (!token || !isStaff) {
      setStylistes(ADMIN_STYLISTES)
      setLoading(false)
      setLoadError(null)
      return
    }
    setLoading(true)
    setLoadError(null)
    try {
      const res = await listUsers(token, { role: 'styliste', limit: 200 })
      const rows = await enrichStylistesWithAteliers(res.items)
      setStylistes(rows)
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de charger les stylistes.',
      )
      setStylistes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reloadStylistes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isStaff])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = stylistes.filter((s) => {
      if (statusFilter !== 'tous' && s.statut !== statusFilter) return false
      if (villeFilter !== 'Toutes les villes' && s.ville !== villeFilter)
        return false
      if (!q) return true
      return (
        s.nom.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.atelierNom.toLowerCase().includes(q) ||
        s.specialite.toLowerCase().includes(q) ||
        s.ville.toLowerCase().includes(q) ||
        s.whatsapp.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
      )
    })

    list = [...list].sort((a, b) => {
      if (sortKey === 'nom') return a.nom.localeCompare(b.nom, 'fr')
      if (sortKey === 'creations') return b.creations - a.creations
      if (sortKey === 'inscrit') return b.inscritLe.localeCompare(a.inscritLe)
      return 0
    })
    return list
  }, [query, sortKey, statusFilter, stylistes, villeFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  useEffect(() => {
    setPage(1)
  }, [query, statusFilter, villeFilter, sortKey])

  useEffect(() => {
    if (!modalOpen && !confirmSaveOpen) return
    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const scrollbarGap =
      window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`
    }
    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
    }
  }, [modalOpen, confirmSaveOpen])

  function openCreate() {
    setModalMode('create')
    setEditingId(null)
    setPreview(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function fillForm(s: AdminStyliste) {
    setForm({
      nom: s.nom,
      email: s.email,
      atelierNom: s.atelierNom,
      specialite: s.specialite,
      ville: s.ville,
      quartier: s.quartier,
      whatsapp: s.whatsapp,
      statut: s.statut,
      isPublic: s.isPublic,
      notes: s.notes,
    })
  }

  function openView(s: AdminStyliste) {
    setModalMode('view')
    setEditingId(s.id)
    setPreview(s)
    fillForm(s)
    setModalOpen(true)
  }

  function openEdit(s: AdminStyliste) {
    setModalMode('edit')
    setEditingId(s.id)
    setPreview(s)
    fillForm(s)
    setModalOpen(true)
  }

  function closeModal() {
    setConfirmSaveOpen(false)
    setModalOpen(false)
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAllPage() {
    const ids = pageItems.map((s) => s.id)
    const allSelected = ids.every((id) => selectedIds.has(id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) ids.forEach((id) => next.delete(id))
      else ids.forEach((id) => next.add(id))
      return next
    })
  }

  async function setStatut(id: string, statut: AdminStylisteStatus) {
    if (liveMode && token) {
      try {
        await updateUser(token, id, { is_active: statut !== 'suspendu' })
      } catch (err) {
        setSavedHint(
          err instanceof ApiError
            ? err.message
            : 'Mise à jour du statut impossible.',
        )
        return
      }
    }
    setStylistes((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              statut,
              isPublic: statut === 'suspendu' ? false : s.isPublic,
            }
          : s,
      ),
    )
    if (preview?.id === id) {
      setPreview((p) =>
        p
          ? {
              ...p,
              statut,
              isPublic: statut === 'suspendu' ? false : p.isPublic,
            }
          : p,
      )
      setForm((f) => ({
        ...f,
        statut,
        isPublic: statut === 'suspendu' ? false : f.isPublic,
      }))
    }
    setSavedHint(
      statut === 'suspendu'
        ? liveMode
          ? 'Styliste suspendu.'
          : 'Styliste suspendu (mock).'
        : statut === 'verifie'
          ? liveMode
            ? 'Styliste vérifié (compte actif).'
            : 'Styliste vérifié (mock).'
          : liveMode
            ? 'Statut mis à jour.'
            : 'Statut mis à jour (mock).',
    )
  }

  function onSave(e: FormEvent) {
    e.preventDefault()
    if (modalMode === 'view') return
    const nom = form.nom.trim()
    const atelierNom = form.atelierNom.trim()
    if (!nom || !atelierNom) return

    // Modification : demander confirmation avant d’enregistrer
    if (modalMode === 'edit' && editingId) {
      setConfirmSaveOpen(true)
      return
    }

    const id = `st-${Date.now()}`
    const created: AdminStyliste = {
      id,
      code: `STY-${Math.floor(1000 + Math.random() * 8999)}`,
      nom,
      email: form.email.trim(),
      atelierNom,
      specialite: form.specialite.trim() || 'À préciser',
      ville: form.ville.trim() || 'Cotonou',
      quartier: form.quartier.trim(),
      whatsapp: form.whatsapp.trim(),
      creations: 0,
      vues: 0,
      noteMoyenne: null,
      derniereActivite: "Aujourd'hui",
      inscritLe: new Date().toISOString().slice(0, 10),
      statut: form.statut,
      isPublic: form.isPublic,
      notes: form.notes.trim(),
      avatar: ADMIN_STYLISTES[0]?.avatar ?? '',
      couverture: ADMIN_STYLISTES[0]?.couverture ?? '',
    }
    setStylistes((prev) => [created, ...prev])
    setEditingId(id)
    setPreview(created)
    setModalMode('edit')
    setSavedHint('Styliste ajouté (mock).')
    setModalOpen(false)
  }

  function confirmSaveEdit() {
    if (!editingId) return
    const nom = form.nom.trim()
    const atelierNom = form.atelierNom.trim()
    if (!nom || !atelierNom) return

    setStylistes((prev) =>
      prev.map((s) =>
        s.id === editingId
          ? {
              ...s,
              nom,
              email: form.email.trim(),
              atelierNom,
              specialite: form.specialite.trim(),
              ville: form.ville.trim(),
              quartier: form.quartier.trim(),
              whatsapp: form.whatsapp.trim(),
              statut: form.statut,
              isPublic: form.isPublic,
              notes: form.notes.trim(),
            }
          : s,
      ),
    )
    setPreview((p) =>
      p && p.id === editingId
        ? {
            ...p,
            nom,
            email: form.email.trim(),
            atelierNom,
            specialite: form.specialite.trim(),
            ville: form.ville.trim(),
            quartier: form.quartier.trim(),
            whatsapp: form.whatsapp.trim(),
            statut: form.statut,
            isPublic: form.isPublic,
            notes: form.notes.trim(),
          }
        : p,
    )
    setConfirmSaveOpen(false)
    setModalOpen(false)
    setSavedHint('Styliste mis à jour (mock).')
  }

  const confirmTargetName =
    form.nom.trim() || preview?.nom || 'ce styliste'
  const confirmAtelierName =
    form.atelierNom.trim() || preview?.atelierNom || ''

  const fieldClass =
    'h-8 w-full rounded-lg border border-line bg-[#faf7f5] px-2.5 text-xs text-heading outline-none transition placeholder:text-muted focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-default disabled:opacity-80'

  const selectClass =
    'h-8 rounded-lg border border-line bg-white px-2.5 text-[11px] text-heading outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/25'

  const modalTitle =
    modalMode === 'create'
      ? 'Ajouter un styliste'
      : modalMode === 'edit'
        ? 'Modifier le styliste'
        : 'Fiche styliste'

  const display =
    preview ??
    (editingId ? stylistes.find((s) => s.id === editingId) : null) ??
    null

  return (
    <div className="space-y-4">
      <div className="sticky top-12 z-20 -mx-3 flex flex-wrap items-center justify-between gap-2 border-b border-line/70 bg-[#f6f1ee]/95 px-3 py-2 backdrop-blur lg:-mx-5 lg:px-5">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-primary sm:text-lg">
            Couturières & stylistes
          </h1>
          <p className="hidden text-[11px] text-muted sm:block">
            {liveMode
              ? 'Comptes stylistes + ateliers (API).'
              : 'Aperçu mock — connectez-vous en admin pour l’API.'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {liveMode ? (
            <button
              type="button"
              onClick={() => void reloadStylistes()}
              className="btn btn-sm h-9 min-h-9 rounded-xl border border-line bg-white px-3 text-xs"
              disabled={loading}
            >
              Actualiser
            </button>
          ) : null}
          <button
            type="button"
            onClick={openCreate}
            className="btn btn-primary btn-sm h-9 min-h-9 shrink-0 gap-1.5 rounded-xl px-3 text-xs shadow-md"
          >
            <Plus className="size-3.5" aria-hidden />
            Ajouter un styliste
          </button>
        </div>
      </div>

      {!liveMode ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-950">
          Mode aperçu (mock). Test réel :{' '}
          <Link to="/connexion" className="font-semibold underline">
            admin@couturia.com
          </Link>{' '}
          / <span className="font-mono">admincouturia1</span>
        </div>
      ) : null}

      {loadError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-900">
          {loadError}
        </div>
      ) : null}

      {savedHint ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-900">
          <span>{savedHint}</span>
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => setSavedHint(null)}
          >
            OK
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = KPI_ICONS[kpi.id as keyof typeof KPI_ICONS] ?? Users
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
                  {loading ? '…' : kpi.value}
                </p>
                <p
                  className={[
                    'mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-semibold',
                    kpi.positive ? 'text-emerald-700' : 'text-rose-700',
                  ].join(' ')}
                >
                  {kpi.positive ? (
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

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-4 text-xs text-muted">
          <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
          Chargement des stylistes…
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-line px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xs font-semibold text-heading">
            Stylistes ({filtered.length})
          </h2>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 sm:max-w-[760px]">
            <label className="relative min-w-[180px] flex-1">
              <span className="sr-only">Rechercher un styliste</span>
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher (nom, atelier, spécialité, ville…)"
                className="h-8 w-full rounded-lg border border-line bg-[#faf7f5] py-1.5 pr-3 pl-8 text-xs text-heading outline-none placeholder:text-muted focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
              className={selectClass}
              aria-label="Filtrer par statut"
            >
              <option value="tous">Tous les statuts</option>
              <option value="verifie">Vérifié</option>
              <option value="actif">Actif</option>
              <option value="en_attente">En attente</option>
              <option value="suspendu">Suspendu</option>
            </select>
            <select
              value={villeFilter}
              onChange={(e) => setVilleFilter(e.target.value)}
              className={selectClass}
              aria-label="Filtrer par ville"
            >
              {villesOptions.map((ville) => (
                <option key={ville} value={ville}>
                  {ville}
                </option>
              ))}
            </select>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className={selectClass}
              aria-label="Trier"
            >
              <option value="recent">Plus récents</option>
              <option value="creations">Plus de créations</option>
              <option value="nom">Nom A → Z</option>
              <option value="inscrit">Date d’inscription</option>
            </select>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed text-left text-xs">
            <colgroup>
              <col className="w-[36px]" />
              <col className="w-[18%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[11%]" />
              <col className="w-[70px]" />
              <col className="w-[88px]" />
              <col className="w-[88px]" />
              <col className="w-[90px]" />
            </colgroup>
            <thead className="bg-[#faf7f5] text-[10px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={
                      pageItems.length > 0 &&
                      pageItems.every((s) => selectedIds.has(s.id))
                    }
                    onChange={toggleSelectAllPage}
                    aria-label="Tout sélectionner"
                    className="size-3.5 accent-primary"
                  />
                </th>
                <th className="px-2 py-2.5 font-semibold">Styliste</th>
                <th className="px-2 py-2.5 font-semibold">Atelier</th>
                <th className="px-2 py-2.5 font-semibold">Spécialité</th>
                <th className="px-2 py-2.5 font-semibold">Ville</th>
                <th className="px-2 py-2.5 font-semibold">Créat.</th>
                <th className="px-2 py-2.5 font-semibold">Vitrine</th>
                <th className="px-2 py-2.5 font-semibold">Statut</th>
                <th className="px-3 py-2.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-line/80 transition hover:bg-[#faf7f5]"
                >
                  <td className="px-3 py-2 align-middle">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s.id)}
                      onChange={() => toggleSelect(s.id)}
                      aria-label={`Sélectionner ${s.nom}`}
                      className="size-3.5 accent-primary"
                    />
                  </td>
                  <td className="min-w-0 px-2 py-2 align-middle">
                    <div className="flex items-center gap-2">
                      <img
                        src={s.avatar}
                        alt=""
                        className="size-8 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-heading">
                          {s.nom}
                        </p>
                        <p className="truncate text-[10px] text-muted">
                          #{s.code}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="min-w-0 px-2 py-2 align-middle">
                    <p className="truncate text-[11px] font-medium text-heading">
                      {s.atelierNom}
                    </p>
                    <p className="truncate text-[10px] text-muted">
                      {s.whatsapp}
                    </p>
                  </td>
                  <td className="min-w-0 px-2 py-2 align-middle text-[11px] text-heading">
                    <span className="truncate block">{s.specialite}</span>
                  </td>
                  <td className="px-2 py-2 align-middle text-[11px] text-heading">
                    {s.ville}
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#faf7f5] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-heading">
                      <Shirt className="size-3 text-primary" aria-hidden />
                      {s.creations}
                    </span>
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <span
                      className={[
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        s.isPublic
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-[#faf7f5] text-muted',
                      ].join(' ')}
                    >
                      {s.isPublic ? (
                        <Eye className="size-3" aria-hidden />
                      ) : (
                        <EyeOff className="size-3" aria-hidden />
                      )}
                      {s.isPublic ? 'Public' : 'Privé'}
                    </span>
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <span
                      className={[
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        STATUS_CLASS[s.statut],
                      ].join(' ')}
                    >
                      {STATUS_LABEL[s.statut]}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="grid size-7 place-items-center rounded-md border border-line bg-white text-heading hover:text-primary"
                        aria-label={`Voir ${s.nom}`}
                        onClick={() => openView(s)}
                      >
                        <Eye className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className="grid size-7 place-items-center rounded-md border border-line bg-white text-heading hover:text-primary"
                        aria-label={`Modifier ${s.nom}`}
                        onClick={() => openEdit(s)}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-8 text-center text-[11px] text-muted"
                  >
                    Aucun styliste ne correspond aux filtres.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2.5">
          <p className="text-[11px] text-muted">
            {filtered.length} styliste{filtered.length > 1 ? 's' : ''} · page{' '}
            {currentPage}/{pageCount}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn btn-xs h-8 min-h-8 gap-1 rounded-lg border border-line bg-white text-[11px] disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" aria-hidden />
              Préc.
            </button>
            <button
              type="button"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="btn btn-xs h-8 min-h-8 gap-1 rounded-lg border border-line bg-white text-[11px] disabled:opacity-40"
            >
              Suiv.
              <ChevronRight className="size-3.5" aria-hidden />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
          <Activity className="size-3.5 text-primary" aria-hidden />
          <h2 className="text-xs font-semibold text-heading">
            Activité récente des stylistes
          </h2>
        </div>
        <ul className="divide-y divide-line/80">
          {ADMIN_STYLISTE_FEED.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 px-3 py-2.5"
            >
              <p className="min-w-0 text-[11px] leading-snug text-heading">
                {item.text}
              </p>
              <time className="shrink-0 text-[10px] tabular-nums text-muted">
                {item.when}
              </time>
            </li>
          ))}
        </ul>
      </section>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[70] overflow-hidden overscroll-none bg-primary/45 p-1 backdrop-blur-sm sm:p-2 lg:p-3"
          onWheel={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="styliste-modal-title"
            className="mx-auto grid h-full max-h-[100dvh] w-full max-w-[1400px] overflow-hidden rounded-2xl border border-line bg-white shadow-2xl lg:grid-cols-2"
          >
            <div className="relative hidden min-h-0 bg-ribbon lg:block">
              {display ? (
                <>
                  <img
                    src={display.couverture}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white xl:p-8">
                    <img
                      src={display.avatar}
                      alt=""
                      className="mb-3 size-16 rounded-2xl object-cover ring-2 ring-white/40"
                    />
                    <p className="text-2xl font-semibold">
                      {form.atelierNom || display.atelierNom}
                    </p>
                    <p className="mt-1 text-sm text-white/80">
                      {form.nom || display.nom} · #{display.code}
                    </p>
                    <div className="mt-5 grid grid-cols-3 gap-2.5">
                      <div className="rounded-xl bg-white/10 px-2 py-2.5 text-center backdrop-blur-sm">
                        <Shirt className="mx-auto size-4" />
                        <p className="mt-1 text-base font-semibold tabular-nums">
                          {display.creations}
                        </p>
                        <p className="text-[10px] text-white/70">Créations</p>
                      </div>
                      <div className="rounded-xl bg-white/10 px-2 py-2.5 text-center backdrop-blur-sm">
                        <Eye className="mx-auto size-4" />
                        <p className="mt-1 text-base font-semibold tabular-nums">
                          {display.vues}
                        </p>
                        <p className="text-[10px] text-white/70">Vues</p>
                      </div>
                      <div className="rounded-xl bg-white/10 px-2 py-2.5 text-center backdrop-blur-sm">
                        <Star className="mx-auto size-4" />
                        <p className="mt-1 text-base font-semibold tabular-nums">
                          {display.noteMoyenne != null
                            ? display.noteMoyenne.toFixed(1)
                            : '—'}
                        </p>
                        <p className="text-[10px] text-white/70">Note</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid h-full place-items-center gap-2 text-sm text-muted">
                  <Scissors className="size-8 text-primary/50" />
                  Nouveau styliste
                </div>
              )}
            </div>

            <form
              onSubmit={onSave}
              className="flex min-h-0 flex-col overflow-hidden"
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3 xl:px-5">
                <div>
                  <h2
                    id="styliste-modal-title"
                    className="text-sm font-semibold text-heading sm:text-base"
                  >
                    {modalTitle}
                  </h2>
                  <p className="text-[10px] text-muted sm:text-[11px]">
                    Compte + atelier (comme l’inscription publique)
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

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 xl:overflow-visible xl:px-5 xl:py-4">
                {modalMode === 'view' && display ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-line bg-[#faf7f5] p-3 sm:col-span-2">
                      <div className="flex items-start gap-3">
                        <img
                          src={display.avatar}
                          alt=""
                          className="size-12 rounded-xl object-cover lg:hidden"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-heading">
                            {display.atelierNom}
                          </p>
                          <p className="text-[11px] text-muted">
                            {display.nom} · #{display.code}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span
                              className={[
                                'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                STATUS_CLASS[display.statut],
                              ].join(' ')}
                            >
                              {STATUS_LABEL[display.statut]}
                            </span>
                            <span
                              className={[
                                'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                display.isPublic
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-white text-muted ring-1 ring-line',
                              ].join(' ')}
                            >
                              {display.isPublic
                                ? 'Vitrine publique'
                                : 'Vitrine privée'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {[
                      { label: 'Nom complet', value: display.nom },
                      { label: 'E-mail', value: display.email, icon: Mail },
                      { label: 'Atelier', value: display.atelierNom },
                      { label: 'Spécialité', value: display.specialite },
                      {
                        label: 'WhatsApp',
                        value: display.whatsapp,
                        icon: MessageCircle,
                      },
                      {
                        label: 'Localisation',
                        value: `${display.ville}${display.quartier ? ` · ${display.quartier}` : ''}`,
                        icon: MapPin,
                      },
                      {
                        label: 'Inscription',
                        value: formatInscrit(display.inscritLe),
                      },
                      {
                        label: 'Dernière activité',
                        value: display.derniereActivite,
                      },
                    ].map((row) => {
                      const Icon = row.icon
                      return (
                        <div
                          key={row.label}
                          className="rounded-xl border border-line bg-white px-3 py-2.5"
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                            {row.label}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-heading">
                            {Icon ? (
                              <Icon
                                className="size-3.5 shrink-0 text-primary"
                                aria-hidden
                              />
                            ) : null}
                            <span className="min-w-0 break-words">
                              {row.value || '—'}
                            </span>
                          </p>
                        </div>
                      )
                    })}

                    <div className="rounded-xl border border-line bg-[#faf7f5] px-3 py-2.5 sm:col-span-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                        Notes admin
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-heading">
                        {display.notes.trim() || 'Aucune note.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                    <label className="block sm:col-span-2 xl:col-span-3">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">
                        Nom complet
                      </span>
                      <input
                        className={fieldClass}
                        value={form.nom}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, nom: e.target.value }))
                        }
                        required
                      />
                    </label>
                    <label className="block sm:col-span-2 xl:col-span-3">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">
                        E-mail
                      </span>
                      <input
                        type="email"
                        className={fieldClass}
                        value={form.email}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, email: e.target.value }))
                        }
                        required
                      />
                    </label>
                    <label className="block sm:col-span-2 xl:col-span-3">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">
                        Nom de l’atelier
                      </span>
                      <input
                        className={fieldClass}
                        value={form.atelierNom}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            atelierNom: e.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">
                        Spécialité
                      </span>
                      <input
                        className={fieldClass}
                        value={form.specialite}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            specialite: e.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">
                        WhatsApp
                      </span>
                      <input
                        className={fieldClass}
                        value={form.whatsapp}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, whatsapp: e.target.value }))
                        }
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">
                        Ville
                      </span>
                      <input
                        className={fieldClass}
                        value={form.ville}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, ville: e.target.value }))
                        }
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">
                        Quartier
                      </span>
                      <input
                        className={fieldClass}
                        value={form.quartier}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, quartier: e.target.value }))
                        }
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">
                        Statut
                      </span>
                      <select
                        className={fieldClass}
                        value={form.statut}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            statut: e.target.value as AdminStylisteStatus,
                          }))
                        }
                      >
                        <option value="verifie">Vérifié</option>
                        <option value="actif">Actif</option>
                        <option value="en_attente">En attente</option>
                        <option value="suspendu">Suspendu</option>
                      </select>
                    </label>
                    <label className="flex items-end gap-2 pb-1">
                      <input
                        type="checkbox"
                        className="size-3.5 accent-primary"
                        checked={form.isPublic}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            isPublic: e.target.checked,
                          }))
                        }
                      />
                      <span className="text-[11px] font-medium text-heading">
                        Vitrine publique
                      </span>
                    </label>
                    <label className="block sm:col-span-2 xl:col-span-3">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">
                        Notes admin
                      </span>
                      <textarea
                        rows={3}
                        className="w-full resize-none rounded-lg border border-line bg-[#faf7f5] px-2.5 py-2 text-xs text-heading outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
                        value={form.notes}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, notes: e.target.value }))
                        }
                        placeholder="Notes internes…"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-line bg-white px-4 py-3 xl:px-5">
                {modalMode === 'view' && editingId ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm h-9 min-h-9 rounded-lg border border-amber-200 bg-white text-xs text-amber-900"
                      onClick={() => void setStatut(editingId, 'verifie')}
                      disabled={form.statut === 'verifie'}
                    >
                      Vérifier
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm h-9 min-h-9 rounded-lg border border-rose-200 bg-white text-xs text-rose-700"
                      onClick={() => void setStatut(editingId, 'suspendu')}
                      disabled={form.statut === 'suspendu'}
                    >
                      Suspendre
                    </button>
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

      {confirmSaveOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Annuler"
            onClick={() => setConfirmSaveOpen(false)}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-save-title"
            className="relative z-[1] w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-800">
                <AlertTriangle className="size-4" aria-hidden />
              </span>
              <div>
                <h2
                  id="confirm-save-title"
                  className="text-sm font-semibold text-heading"
                >
                  Confirmer la modification ?
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Vous allez modifier les informations de{' '}
                  <span className="font-semibold text-heading">
                    {confirmTargetName}
                  </span>
                  {confirmAtelierName ? (
                    <>
                      {' '}
                      ({confirmAtelierName})
                    </>
                  ) : null}
                  . Continuer ?
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-sm h-9 min-h-9 rounded-lg border border-line bg-white text-xs"
                onClick={() => setConfirmSaveOpen(false)}
              >
                Non, annuler
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm h-9 min-h-9 rounded-lg text-xs"
                onClick={confirmSaveEdit}
              >
                Oui, enregistrer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
