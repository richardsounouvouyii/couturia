import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  LogIn,
  Mail,
  Pencil,
  Plus,
  Search,
  ShieldOff,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UserRoundPlus,
  X,
} from 'lucide-react'
import {
  ADMIN_CLIENT_FEED,
  ADMIN_CLIENT_KPIS,
  ADMIN_CLIENTS,
  type AdminClient,
  type AdminClientStatus,
  type AdminKpi,
} from '@/lib/admin-mock'
import { listUsers, updateUser } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/http'
import { mapApiUserToAdminClient } from '@/lib/admin-users'
import { useAuthSession } from '@/lib/auth-session'

const PAGE_SIZE = 8

type ModalMode = 'view' | 'edit' | 'create'

const KPI_ICONS = {
  total: Users,
  nouveaux: UserPlus,
  actifs: UserCheck,
  suspendus: UserMinus,
} as const

const STATUS_LABEL: Record<AdminClientStatus, string> = {
  actif: 'Actif',
  suspendu: 'Suspendu',
}

const STATUS_CLASS: Record<AdminClientStatus, string> = {
  actif: 'bg-emerald-100 text-emerald-800',
  suspendu: 'bg-rose-100 text-rose-800',
}

const FEED_ICON = {
  signup: UserRoundPlus,
  login: LogIn,
  suspend: ShieldOff,
  reactivate: ShieldCheck,
} as const

type SortKey = 'recent' | 'nom' | 'inscrit'

type ClientForm = {
  nom: string
  email: string
  password: string
  statut: AdminClientStatus
  notes: string
}

const emptyForm: ClientForm = {
  nom: '',
  email: '',
  password: '',
  statut: 'actif',
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

function buildClientKpis(items: AdminClient[]): AdminKpi[] {
  const total = items.length
  const actifs = items.filter((c) => c.statut === 'actif').length
  const suspendus = items.filter((c) => c.statut === 'suspendu').length
  const month = new Date().toISOString().slice(0, 7)
  const nouveaux = items.filter((c) => c.inscritLe.startsWith(month)).length
  return [
    {
      id: 'total',
      label: 'Clients total',
      value: String(total),
      delta: 'API live',
      positive: true,
    },
    {
      id: 'nouveaux',
      label: 'Nouveaux ce mois',
      value: String(nouveaux),
      delta: month,
      positive: true,
    },
    {
      id: 'actifs',
      label: 'Clients actifs',
      value: String(actifs),
      delta: `${total ? Math.round((actifs / total) * 100) : 0}%`,
      positive: true,
    },
    {
      id: 'suspendus',
      label: 'Clients suspendus',
      value: String(suspendus),
      delta: suspendus > 0 ? 'à traiter' : 'ok',
      positive: suspendus === 0,
    },
  ]
}

export function AdminClientsPage() {
  const { token, isStaff } = useAuthSession()
  const liveMode = Boolean(token && isStaff)

  const [clients, setClients] = useState<AdminClient[]>(
    liveMode ? [] : ADMIN_CLIENTS,
  )
  const [loading, setLoading] = useState(liveMode)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'tous' | AdminClientStatus>(
    'tous',
  )
  const [sortKey, setSortKey] = useState<SortKey>('recent')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [savedHint, setSavedHint] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('view')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ClientForm>(emptyForm)
  const [preview, setPreview] = useState<AdminClient | null>(null)

  const kpis = liveMode ? buildClientKpis(clients) : ADMIN_CLIENT_KPIS

  async function reloadClients() {
    if (!token || !isStaff) {
      setClients(ADMIN_CLIENTS)
      setLoading(false)
      setLoadError(null)
      return
    }
    setLoading(true)
    setLoadError(null)
    try {
      const res = await listUsers(token, { role: 'client', limit: 200 })
      setClients(res.items.map(mapApiUserToAdminClient))
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Impossible de charger les clients.'
      setLoadError(message)
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reloadClients()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on session change
  }, [token, isStaff])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = clients.filter((c) => {
      if (statusFilter !== 'tous' && c.statut !== statusFilter) return false
      if (!q) return true
      return (
        c.nom.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
      )
    })

    list = [...list].sort((a, b) => {
      if (sortKey === 'nom') return a.nom.localeCompare(b.nom, 'fr')
      if (sortKey === 'inscrit') return b.inscritLe.localeCompare(a.inscritLe)
      return 0
    })
    return list
  }, [clients, query, sortKey, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  useEffect(() => {
    setPage(1)
  }, [query, statusFilter, sortKey])

  useEffect(() => {
    if (!modalOpen) return
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
  }, [modalOpen])

  function openCreate() {
    setModalMode('create')
    setEditingId(null)
    setPreview(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function fillForm(client: AdminClient) {
    setForm({
      nom: client.nom,
      email: client.email,
      password: '',
      statut: client.statut,
      notes: client.notes,
    })
  }

  function openView(client: AdminClient) {
    setModalMode('view')
    setEditingId(client.id)
    setPreview(client)
    fillForm(client)
    setModalOpen(true)
  }

  function openEdit(client: AdminClient) {
    setModalMode('edit')
    setEditingId(client.id)
    setPreview(client)
    fillForm(client)
    setModalOpen(true)
  }

  function closeModal() {
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
    const ids = pageItems.map((c) => c.id)
    const allSelected = ids.every((id) => selectedIds.has(id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) ids.forEach((id) => next.delete(id))
      else ids.forEach((id) => next.add(id))
      return next
    })
  }

  async function setStatut(id: string, statut: AdminClientStatus) {
    if (liveMode && token) {
      try {
        await updateUser(token, id, { is_active: statut === 'actif' })
      } catch (err) {
        setSavedHint(
          err instanceof ApiError
            ? err.message
            : 'Mise à jour du statut impossible.',
        )
        return
      }
    }
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, statut } : c)),
    )
    if (preview?.id === id) {
      setPreview((p) => (p ? { ...p, statut } : p))
      setForm((f) => ({ ...f, statut }))
    }
    setSavedHint(
      statut === 'suspendu'
        ? liveMode
          ? 'Client suspendu.'
          : 'Client suspendu (mock).'
        : liveMode
          ? 'Client réactivé.'
          : 'Client réactivé (mock).',
    )
  }

  function onSave(e: FormEvent) {
    e.preventDefault()
    if (modalMode === 'view') return
    const nom = form.nom.trim()
    const email = form.email.trim()
    if (!nom || !email) return

    if (liveMode) {
      if (modalMode === 'edit' && editingId) {
        void setStatut(editingId, form.statut).then(() => {
          setClients((prev) =>
            prev.map((c) =>
              c.id === editingId
                ? { ...c, notes: form.notes.trim(), statut: form.statut }
                : c,
            ),
          )
          setModalOpen(false)
          setSavedHint('Statut synchronisé avec l’API.')
        })
        return
      }
      setSavedHint(
        'Création client : utilisez /inscription (rôle client). L’admin liste ensuite les comptes.',
      )
      setModalOpen(false)
      return
    }

    if (modalMode === 'create' && form.password.trim().length < 8) {
      setSavedHint('Mot de passe : 8 caractères minimum.')
      return
    }

    if (modalMode === 'edit' && editingId) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                nom,
                email,
                statut: form.statut,
                notes: form.notes.trim(),
              }
            : c,
        ),
      )
      setSavedHint('Client mis à jour (mock).')
    } else {
      const id = `c-${Date.now()}`
      const created: AdminClient = {
        id,
        code: `CLI-${Math.floor(10000 + Math.random() * 89999)}`,
        nom,
        email,
        inscritLe: new Date().toISOString().slice(0, 10),
        statut: form.statut,
        notes: form.notes.trim(),
        avatar: ADMIN_CLIENTS[0]?.avatar ?? '',
      }
      setClients((prev) => [created, ...prev])
      setSavedHint('Client ajouté (mock).')
    }
    setModalOpen(false)
  }

  const fieldClass =
    'h-8 w-full rounded-lg border border-line bg-[#faf7f5] px-2.5 text-xs text-heading outline-none transition placeholder:text-muted focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-default disabled:opacity-80'

  const selectClass =
    'h-8 rounded-lg border border-line bg-white px-2.5 text-[11px] text-heading outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/25'

  const modalTitle =
    modalMode === 'create'
      ? 'Ajouter un client'
      : modalMode === 'edit'
        ? 'Modifier le client'
        : 'Fiche client'

  const displayClient =
    preview ??
    (editingId ? clients.find((c) => c.id === editingId) : null) ??
    null

  return (
    <div className="space-y-4">
      <div className="sticky top-12 z-20 -mx-3 flex flex-wrap items-center justify-between gap-2 border-b border-line/70 bg-[#f6f1ee]/95 px-3 py-2 backdrop-blur lg:-mx-5 lg:px-5">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-primary sm:text-lg">
            Gestion des clients
          </h1>
          <p className="hidden text-[11px] text-muted sm:block">
            {liveMode
              ? 'Données live depuis auth-service.'
              : 'Aperçu mock — connectez-vous en admin pour l’API.'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {liveMode ? (
            <button
              type="button"
              onClick={() => void reloadClients()}
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
            title={
              liveMode
                ? 'Création admin API plus tard — utilisez /inscription'
                : undefined
            }
          >
            <Plus className="size-3.5" aria-hidden />
            Ajouter un client
          </button>
        </div>
      </div>

      {!liveMode ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-950">
          Mode aperçu (mock). Pour un test réel : connectez-vous avec{' '}
          <Link to="/connexion" className="font-semibold underline">
            admin@couturia.com
          </Link>{' '}
          / <span className="font-mono">admincouturia1</span> puis revenez ici.
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
          Chargement des clients…
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-line px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xs font-semibold text-heading">
            Clients ({filtered.length})
          </h2>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 sm:max-w-[640px]">
            <label className="relative min-w-[180px] flex-1">
              <span className="sr-only">Rechercher un client</span>
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher (nom, e-mail…)"
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
              <option value="actif">Actif</option>
              <option value="suspendu">Suspendu</option>
            </select>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className={selectClass}
              aria-label="Trier"
            >
              <option value="recent">Plus récents</option>
              <option value="nom">Nom A → Z</option>
              <option value="inscrit">Date d’inscription</option>
            </select>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] table-fixed text-left text-xs">
            <colgroup>
              <col className="w-[36px]" />
              <col className="w-[28%]" />
              <col />
              <col className="w-[120px]" />
              <col className="w-[100px]" />
              <col className="w-[90px]" />
            </colgroup>
            <thead className="bg-[#faf7f5] text-[10px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={
                      pageItems.length > 0 &&
                      pageItems.every((c) => selectedIds.has(c.id))
                    }
                    onChange={toggleSelectAllPage}
                    aria-label="Tout sélectionner"
                    className="size-3.5 accent-primary"
                  />
                </th>
                <th className="px-2 py-2.5 font-semibold">Client</th>
                <th className="px-2 py-2.5 font-semibold">E-mail</th>
                <th className="px-2 py-2.5 font-semibold">Inscription</th>
                <th className="px-2 py-2.5 font-semibold">Statut</th>
                <th className="px-3 py-2.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((client) => (
                <tr
                  key={client.id}
                  className="border-t border-line/80 transition hover:bg-[#faf7f5]"
                >
                  <td className="px-3 py-2 align-middle">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(client.id)}
                      onChange={() => toggleSelect(client.id)}
                      aria-label={`Sélectionner ${client.nom}`}
                      className="size-3.5 accent-primary"
                    />
                  </td>
                  <td className="min-w-0 px-2 py-2 align-middle">
                    <div className="flex items-center gap-2">
                      <img
                        src={client.avatar}
                        alt=""
                        className="size-8 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-heading">
                          {client.nom}
                        </p>
                        <p className="truncate text-[10px] text-muted">
                          #{client.code}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="min-w-0 px-2 py-2 align-middle">
                    <p className="truncate text-[11px] text-heading">
                      {client.email}
                    </p>
                  </td>
                  <td className="px-2 py-2 align-middle text-[11px] tabular-nums text-muted">
                    {formatInscrit(client.inscritLe)}
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <span
                      className={[
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        STATUS_CLASS[client.statut],
                      ].join(' ')}
                    >
                      {STATUS_LABEL[client.statut]}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="grid size-7 place-items-center rounded-md border border-line bg-white text-heading hover:text-primary"
                        aria-label={`Voir ${client.nom}`}
                        onClick={() => openView(client)}
                      >
                        <Eye className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className="grid size-7 place-items-center rounded-md border border-line bg-white text-heading hover:text-primary"
                        aria-label={`Modifier ${client.nom}`}
                        onClick={() => openEdit(client)}
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
                    colSpan={6}
                    className="px-3 py-8 text-center text-[11px] text-muted"
                  >
                    Aucun client ne correspond aux filtres.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2.5">
          <p className="text-[11px] text-muted">
            {filtered.length} client{filtered.length > 1 ? 's' : ''} · page{' '}
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
        <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Activity className="size-3.5 text-primary" aria-hidden />
            <h2 className="text-xs font-semibold text-heading">
              Activité des comptes
            </h2>
          </div>
          <p className="text-[10px] text-muted">
            Inscriptions, connexions, suspensions
          </p>
        </div>
        <ul className="divide-y divide-line/80">
          {ADMIN_CLIENT_FEED.map((item) => {
            const Icon =
              (item.kind && FEED_ICON[item.kind as keyof typeof FEED_ICON]) ||
              Activity
            return (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-ribbon text-primary">
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <p className="text-[11px] leading-snug text-heading">
                    {item.text}
                  </p>
                </div>
                <time className="shrink-0 text-[10px] tabular-nums text-muted">
                  {item.when}
                </time>
              </li>
            )
          })}
        </ul>
      </section>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[70] overflow-hidden overscroll-none bg-primary/45 p-2 backdrop-blur-sm sm:p-3 lg:p-4"
          onWheel={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-modal-title"
            className="mx-auto flex h-full max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
          >
            <form
              onSubmit={onSave}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3">
                <div>
                  <h2
                    id="client-modal-title"
                    className="text-sm font-semibold text-heading"
                  >
                    {modalTitle}
                  </h2>
                  <p className="text-[10px] text-muted">
                    Champs d’inscription publique + statut admin
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

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
                {displayClient ? (
                  <div className="flex items-center gap-2.5 rounded-xl border border-line bg-[#faf7f5] p-2.5">
                    <img
                      src={displayClient.avatar}
                      alt=""
                      className="size-11 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-heading">
                        {form.nom || displayClient.nom}
                      </p>
                      <p className="text-[11px] text-muted">
                        #{displayClient.code} · inscrit le{' '}
                        {formatInscrit(displayClient.inscritLe)}
                      </p>
                    </div>
                    <span
                      className={[
                        'ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        STATUS_CLASS[form.statut],
                      ].join(' ')}
                    >
                      {STATUS_LABEL[form.statut]}
                    </span>
                  </div>
                ) : null}

                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">
                    Nom complet
                  </span>
                  <input
                    className={fieldClass}
                    value={form.nom}
                    disabled={modalMode === 'view'}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nom: e.target.value }))
                    }
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">
                    E-mail
                  </span>
                  <input
                    type="email"
                    className={fieldClass}
                    value={form.email}
                    disabled={modalMode === 'view'}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                  />
                </label>

                {modalMode === 'create' ? (
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">
                      Mot de passe
                    </span>
                    <input
                      type="password"
                      className={fieldClass}
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                      placeholder="8 caractères minimum"
                      minLength={8}
                      required
                    />
                  </label>
                ) : null}

                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">
                    Statut
                  </span>
                  <select
                    className={fieldClass}
                    value={form.statut}
                    disabled={modalMode === 'view'}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        statut: e.target.value as AdminClientStatus,
                      }))
                    }
                  >
                    <option value="actif">Actif</option>
                    <option value="suspendu">Suspendu</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">
                    Notes admin
                  </span>
                  <textarea
                    rows={3}
                    className="w-full resize-none rounded-lg border border-line bg-[#faf7f5] px-2.5 py-2 text-xs text-heading outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 disabled:opacity-80"
                    value={form.notes}
                    disabled={modalMode === 'view'}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    placeholder="Notes internes…"
                  />
                </label>

                {displayClient && modalMode === 'view' ? (
                  <div className="rounded-xl border border-line bg-[#faf7f5] p-3 text-[11px] text-muted">
                    <p className="flex items-center gap-1.5">
                      <Mail className="size-3 text-primary" aria-hidden />
                      {displayClient.email}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-line bg-white px-4 py-3">
                {modalMode === 'view' && editingId ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm h-9 min-h-9 rounded-lg border border-rose-200 bg-white text-xs text-rose-700"
                      onClick={() => setStatut(editingId, 'suspendu')}
                      disabled={form.statut === 'suspendu'}
                    >
                      Suspendre
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm h-9 min-h-9 rounded-lg border border-emerald-200 bg-white text-xs text-emerald-700"
                      onClick={() => setStatut(editingId, 'actif')}
                      disabled={form.statut !== 'suspendu'}
                    >
                      Réactiver
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
    </div>
  )
}
