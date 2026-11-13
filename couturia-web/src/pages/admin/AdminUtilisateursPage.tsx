import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  UserMinus,
  Users,
} from 'lucide-react'
import {
  listUsers,
  updateUser,
  type ApiUser,
  type ApiUserRole,
} from '@/lib/api/auth'
import { ApiError } from '@/lib/api/http'
import { useAuthSession } from '@/lib/auth-session'

const PAGE_SIZE = 10

const ROLE_OPTIONS: { value: ApiUserRole; label: string }[] = [
  { value: 'client', label: 'Client' },
  { value: 'styliste', label: 'Styliste' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super admin' },
]

const ROLE_LABEL: Record<ApiUserRole, string> = {
  client: 'Client',
  styliste: 'Styliste',
  admin: 'Admin',
  super_admin: 'Super admin',
}

const ROLE_CLASS: Record<ApiUserRole, string> = {
  client: 'bg-sky-100 text-sky-900',
  styliste: 'bg-violet-100 text-violet-900',
  admin: 'bg-amber-100 text-amber-900',
  super_admin: 'bg-rose-100 text-rose-900',
}

type RoleFilter = 'tous' | ApiUserRole
type StatusFilter = 'tous' | 'actif' | 'suspendu'

function formatInscrit(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

export function AdminUtilisateursPage() {
  const { token, isStaff, user: me } = useAuthSession()
  const liveMode = Boolean(token && isStaff)

  const [users, setUsers] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(liveMode)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedHint, setSavedHint] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('tous')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('tous')
  const [page, setPage] = useState(1)

  const [confirm, setConfirm] = useState<{
    user: ApiUser
    nextRole: ApiUserRole
  } | null>(null)

  async function reload() {
    if (!token || !isStaff) {
      setUsers([])
      setLoading(false)
      setLoadError('Connecte-toi en admin pour charger les utilisateurs.')
      return
    }
    setLoading(true)
    setLoadError(null)
    try {
      const res = await listUsers(token, { limit: 200 })
      setUsers(res.items)
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de charger les utilisateurs.',
      )
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- session only
  }, [token, isStaff])

  const kpis = useMemo(() => {
    const total = users.length
    const clients = users.filter((u) => u.role === 'client').length
    const stylistes = users.filter((u) => u.role === 'styliste').length
    const staff = users.filter(
      (u) => u.role === 'admin' || u.role === 'super_admin',
    ).length
    const actifs = users.filter((u) => u.is_active).length
    return [
      { id: 'total', label: 'Comptes', value: String(total), icon: Users },
      { id: 'clients', label: 'Clients', value: String(clients), icon: UserCheck },
      {
        id: 'stylistes',
        label: 'Stylistes',
        value: String(stylistes),
        icon: Shield,
      },
      {
        id: 'staff',
        label: 'Staff',
        value: String(staff),
        icon: ShieldCheck,
      },
      {
        id: 'actifs',
        label: 'Actifs',
        value: String(actifs),
        icon: UserMinus,
      },
    ]
  }, [users])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter !== 'tous' && u.role !== roleFilter) return false
      if (statusFilter === 'actif' && !u.is_active) return false
      if (statusFilter === 'suspendu' && u.is_active) return false
      if (!q) return true
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        ROLE_LABEL[u.role].toLowerCase().includes(q)
      )
    })
  }, [users, query, roleFilter, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  useEffect(() => {
    setPage(1)
  }, [query, roleFilter, statusFilter])

  useEffect(() => {
    if (!confirm) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [confirm])

  function flash(message: string) {
    setSavedHint(message)
    window.setTimeout(() => setSavedHint(null), 2800)
  }

  function requestRoleChange(user: ApiUser, nextRole: ApiUserRole) {
    if (nextRole === user.role) return
    if (me?.id === user.id) {
      flash('Tu ne peux pas modifier ton propre rôle.')
      return
    }
    setConfirm({ user, nextRole })
  }

  async function applyRoleChange() {
    if (!confirm || !token) return
    const { user, nextRole } = confirm
    setSavingId(user.id)
    try {
      const updated = await updateUser(token, user.id, { role: nextRole })
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      setConfirm(null)
      flash(`${updated.full_name} → ${ROLE_LABEL[updated.role]}`)
    } catch (err) {
      flash(
        err instanceof ApiError
          ? err.message
          : 'Échec du changement de rôle.',
      )
    } finally {
      setSavingId(null)
    }
  }

  async function toggleActive(user: ApiUser) {
    if (!token) return
    if (me?.id === user.id && user.is_active) {
      flash('Tu ne peux pas désactiver ton propre compte.')
      return
    }
    setSavingId(user.id)
    try {
      const updated = await updateUser(token, user.id, {
        is_active: !user.is_active,
      })
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      flash(
        updated.is_active
          ? `${updated.full_name} réactivé`
          : `${updated.full_name} suspendu`,
      )
    } catch (err) {
      flash(
        err instanceof ApiError ? err.message : 'Échec de la mise à jour.',
      )
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="sticky top-12 z-20 -mx-3 flex flex-wrap items-center justify-between gap-2 border-b border-line/70 bg-[#f6f1ee]/95 px-3 py-2 backdrop-blur lg:-mx-5 lg:px-5">
        <div>
          <h1 className="font-display text-lg font-semibold text-heading">
            Utilisateurs
          </h1>
          <p className="text-[11px] text-muted">
            Tous les comptes — rôles et statut en direct
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {savedHint ? (
            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-800">
              {savedHint}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void reload()}
            disabled={loading}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-[11px] font-semibold text-heading hover:border-primary/30 disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Actualiser
          </button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.id}
              className="flex items-start justify-between gap-2 rounded-xl border border-line bg-white px-3 py-2.5 shadow-sm"
            >
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
                  {kpi.label}
                </p>
                <p className="mt-0.5 font-display text-xl font-semibold tabular-nums text-heading">
                  {kpi.value}
                </p>
              </div>
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ribbon text-primary">
                <Icon className="size-4" />
              </span>
            </div>
          )
        })}
      </div>

      {loadError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-800">
          {loadError}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-900">
          <span>
            Données live auth-service — {users.length} compte
            {users.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-line px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-heading">
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          </p>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 sm:max-w-[820px]">
            <label className="relative min-w-[160px] flex-1 sm:max-w-[220px]">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nom, e-mail…"
                className="h-8 w-full rounded-lg border border-line bg-[#faf7f5] pr-2 pl-8 text-xs text-heading outline-none focus:border-primary/40"
              />
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
              className="h-8 rounded-lg border border-line bg-white px-2 text-[11px] text-heading outline-none focus:border-primary/40"
            >
              <option value="tous">Tous les rôles</option>
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="h-8 rounded-lg border border-line bg-white px-2 text-[11px] text-heading outline-none focus:border-primary/40"
            >
              <option value="tous">Tous les statuts</option>
              <option value="actif">Actifs</option>
              <option value="suspendu">Suspendus</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 px-3 py-10 text-xs text-muted">
            <Loader2 className="size-4 animate-spin" />
            Chargement des utilisateurs…
          </div>
        ) : pageItems.length === 0 ? (
          <div className="px-3 py-10 text-center text-xs text-muted">
            Aucun utilisateur pour ces filtres.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-[#faf7f5] text-[10px] font-semibold tracking-wide text-muted uppercase">
                  <th className="px-3 py-2.5 font-semibold">Utilisateur</th>
                  <th className="px-3 py-2.5 font-semibold">Rôle</th>
                  <th className="px-3 py-2.5 font-semibold">Statut</th>
                  <th className="px-3 py-2.5 font-semibold">Inscrit</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((user) => {
                  const isMe = me?.id === user.id
                  const busy = savingId === user.id
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-line/80 last:border-0 hover:bg-[#faf7f5]/70"
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ribbon text-[10px] font-bold text-primary">
                            {initials(user.full_name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-heading">
                              {user.full_name}
                              {isMe ? (
                                <span className="ml-1.5 text-[10px] font-medium text-muted">
                                  (toi)
                                </span>
                              ) : null}
                            </p>
                            <p className="truncate text-[11px] text-muted">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_CLASS[user.role]}`}
                          >
                            {ROLE_LABEL[user.role]}
                          </span>
                          <select
                            value={user.role}
                            disabled={busy || isMe}
                            onChange={(e) =>
                              requestRoleChange(
                                user,
                                e.target.value as ApiUserRole,
                              )
                            }
                            className="h-8 min-w-[128px] rounded-lg border border-line bg-white px-2 text-[11px] font-semibold text-heading outline-none focus:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                            title={
                              isMe
                                ? 'Tu ne peux pas modifier ton propre rôle'
                                : 'Changer le rôle'
                            }
                          >
                            {ROLE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={
                            user.is_active
                              ? 'inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800'
                              : 'inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800'
                          }
                        >
                          {user.is_active ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-muted">
                        {formatInscrit(user.created_at)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          disabled={busy || (isMe && user.is_active)}
                          onClick={() => void toggleActive(user)}
                          className="inline-flex h-8 items-center rounded-lg border border-line bg-white px-2.5 text-[11px] font-semibold text-heading hover:border-primary/35 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : user.is_active ? (
                            'Suspendre'
                          ) : (
                            'Réactiver'
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2.5">
          <p className="text-[11px] text-muted">
            Page {currentPage} / {pageCount}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="grid size-8 place-items-center rounded-lg border border-line bg-white text-heading disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="grid size-8 place-items-center rounded-lg border border-line bg-white text-heading disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {confirm ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-confirm-title"
            className="w-full max-w-md rounded-2xl border border-line bg-white p-4 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-800">
                <Shield className="size-5" />
              </span>
              <div>
                <h2
                  id="role-confirm-title"
                  className="font-display text-base font-semibold text-heading"
                >
                  Changer le rôle ?
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  <span className="font-semibold text-heading">
                    {confirm.user.full_name}
                  </span>{' '}
                  ({confirm.user.email}) passera de{' '}
                  <span className="font-semibold text-heading">
                    {ROLE_LABEL[confirm.user.role]}
                  </span>{' '}
                  à{' '}
                  <span className="font-semibold text-heading">
                    {ROLE_LABEL[confirm.nextRole]}
                  </span>
                  . L’accès back-office / espace styliste changera au prochain
                  login.
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="h-9 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-heading"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={savingId === confirm.user.id}
                onClick={() => void applyRoleChange()}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white disabled:opacity-60"
              >
                {savingId === confirm.user.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : null}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
