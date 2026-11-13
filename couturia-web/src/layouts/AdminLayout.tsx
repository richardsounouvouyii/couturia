import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell,
  LogOut,
  Menu,
  Plus,
  Search,
  X,
} from 'lucide-react'
import { DocumentMeta } from '@/components/DocumentMeta'
import { useAuthSession } from '@/lib/auth-session'
import { ADMIN_NAV } from '@/lib/admin-nav'
import logo from '@/assets/images/logo.png'

export function AdminLayout() {
  const { user, isStaff, signOut } = useAuthSession()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const previewMode = import.meta.env.DEV && !isStaff

  function onLogout() {
    signOut()
    navigate('/connexion')
  }

  const displayName = user?.fullName?.trim() || 'Admin Couturia'

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
      isActive
        ? 'bg-white/15 text-white shadow-sm'
        : 'text-white/75 hover:bg-white/10 hover:text-white',
    ].join(' ')

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4">
        <img src={logo} alt="" className="size-9 rounded-lg bg-white object-contain p-0.5" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Couturia</p>
          <p className="truncate text-[11px] text-white/65">Administration</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3" aria-label="Navigation admin">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={navLinkClass}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-4" aria-hidden />
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f6f1ee] text-heading">
      <DocumentMeta title="Administration" path="/admin" noIndex />

      {previewMode ? (
        <div className="bg-amber-100 px-4 py-2 text-center text-xs font-medium text-amber-950">
          Aperçu front admin (dev) — l’API staff arrivera ensuite. En prod, réservé aux comptes
          admin.
        </div>
      ) : null}

      {/* Mobile overlay */}
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-primary/40 backdrop-blur-sm lg:hidden"
          aria-label="Fermer le menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-[260px] bg-primary-dark transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {sidebar}
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-line/80 bg-[#f6f1ee]/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
            <button
              type="button"
              className="grid size-10 place-items-center rounded-xl border border-line bg-white text-primary lg:hidden"
              aria-label="Ouvrir le menu"
              onClick={() => setMobileOpen(true)}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Rechercher</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                placeholder="Rechercher…"
                className="h-10 w-full rounded-xl border border-line bg-white py-2 pr-3 pl-10 text-sm text-heading outline-none placeholder:text-muted focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
              />
            </label>

            <Link
              to="/admin/creations"
              className="btn btn-primary hidden h-10 min-h-10 gap-1.5 rounded-xl px-3 text-sm sm:inline-flex"
            >
              <Plus className="size-4" aria-hidden />
              Nouvelle création
            </Link>

            <button
              type="button"
              className="relative grid size-10 place-items-center rounded-xl border border-line bg-white text-heading"
              aria-label="Notifications"
            >
              <Bell className="size-4" aria-hidden />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
            </button>

            <div className="hidden items-center gap-2 rounded-xl border border-line bg-white px-2.5 py-1.5 sm:flex">
              <span className="grid size-8 place-items-center rounded-full bg-ribbon text-xs font-semibold text-primary">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
              <span className="max-w-[120px] truncate text-xs font-semibold text-heading">
                {displayName}
              </span>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 lg:px-6 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
