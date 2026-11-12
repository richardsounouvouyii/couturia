import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Download, Heart, LogOut, Menu, Search, Settings, X } from 'lucide-react'
import logo from '@/assets/images/logo.png'
import { SearchOverlay } from '@/components/SearchOverlay'
import { useAuthSession } from '@/lib/auth-session'
import { useFavorites } from '@/lib/favorites'
import { usePwaInstall } from '@/lib/pwa-install'

const MENU_ANIM_MS = 220

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'px-3 py-2 text-sm font-medium transition-colors relative',
    isActive
      ? 'text-primary after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary'
      : 'text-heading/80 hover:text-primary',
  ].join(' ')

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3.5 text-[15px] font-medium transition-colors',
    isActive ? 'bg-primary/10 text-primary' : 'text-heading hover:bg-page',
  ].join(' ')

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuClosing, setMenuClosing] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const menuId = useId()
  const panelRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const closeTimerRef = useRef<number | null>(null)
  const location = useLocation()
  const { count } = useFavorites()
  const { isAuthenticated, isStylist, user, signOut } = useAuthSession()
  const { canNativeInstall, isInstalled, openInstall, openBanner } = usePwaInstall()

  function clearCloseTimer() {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  function openMenu() {
    clearCloseTimer()
    setMenuClosing(false)
    setMenuVisible(true)
    setMenuOpen(true)
  }

  function closeMenu() {
    if (!menuVisible || menuClosing) return
    setMenuOpen(false)
    setMenuClosing(true)
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => {
      setMenuVisible(false)
      setMenuClosing(false)
      closeTimerRef.current = null
    }, MENU_ANIM_MS)
  }

  function toggleMenu() {
    if (menuOpen) closeMenu()
    else openMenu()
  }

  useEffect(() => {
    clearCloseTimer()
    setMenuOpen(false)
    setMenuVisible(false)
    setMenuClosing(false)
    setSearchOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!menuVisible || menuClosing) {
      document.body.style.overflow = ''
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuVisible, menuClosing])

  useEffect(() => () => clearCloseTimer(), [])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-nav">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center" onClick={closeMenu}>
            <img
              src={logo}
              alt="Couturia"
              className="h-11 w-auto object-contain lg:h-12"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink to="/" end className={navLinkClass}>
              Accueil
            </NavLink>
            <NavLink to="/catalogue" className={navLinkClass}>
              Créations
            </NavLink>
            <NavLink to="/ateliers" className={navLinkClass}>
              Stylistes
            </NavLink>
            <NavLink to="/favoris" className={navLinkClass}>
              Favoris
            </NavLink>
            {isStylist ? (
              <NavLink to="/espace-styliste" className={navLinkClass}>
                Ma vitrine
              </NavLink>
            ) : null}
            <a href="/#a-propos" className={navLinkClass({ isActive: false })}>
              À propos
            </a>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-square text-heading"
              aria-label="Rechercher"
              onClick={() => {
                closeMenu()
                setSearchOpen(true)
              }}
            >
              <Search className="size-5" />
            </button>

            <Link
              to="/favoris"
              className="btn btn-ghost btn-square relative text-heading"
              aria-label="Favoris"
            >
              <Heart className="size-5" />
              {count > 0 ? (
                <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                  {count}
                </span>
              ) : null}
            </Link>

            {isAuthenticated ? (
              <>
                <span className="hidden max-w-[9rem] truncate text-sm font-medium text-heading sm:inline">
                  {user?.atelierName || user?.fullName}
                </span>
                <Link
                  to="/parametres"
                  className="btn btn-ghost btn-square hidden text-heading sm:inline-flex"
                  aria-label="Paramètres"
                >
                  <Settings className="size-5" />
                </Link>
                <button
                  type="button"
                  className="btn btn-sm hidden border border-primary/20 bg-white text-primary hover:bg-primary/5 sm:inline-flex"
                  onClick={() => signOut()}
                >
                  <LogOut className="size-3.5" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/connexion"
                  className="btn btn-sm hidden border border-primary/20 bg-white text-primary hover:bg-primary/5 sm:inline-flex"
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="btn btn-primary btn-sm hidden sm:inline-flex"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}

            <button
              ref={buttonRef}
              type="button"
              className="btn btn-ghost btn-square text-heading lg:hidden"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={toggleMenu}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {menuVisible ? (
        <div className="fixed inset-0 z-[60] lg:hidden" role="presentation">
          <button
            type="button"
            className={[
              'absolute inset-0 bg-black/35',
              menuClosing ? 'animate-menu-fade-out' : 'animate-menu-fade-in',
            ].join(' ')}
            aria-label="Fermer le menu"
            onClick={closeMenu}
          />
          <aside
            id={menuId}
            ref={panelRef}
            className={[
              'absolute top-3 right-3 flex w-[min(20rem,88vw)] flex-col rounded-2xl border border-line bg-card shadow-[0_12px_40px_rgba(46,3,20,0.16)]',
              menuClosing ? 'animate-slide-out-right' : 'animate-slide-in-right',
            ].join(' ')}
            aria-label="Menu de navigation"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
              <p className="text-sm font-semibold text-primary">Menu</p>
              <button
                type="button"
                className="btn btn-ghost btn-square btn-sm text-heading"
                aria-label="Fermer le menu"
                onClick={closeMenu}
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-2.5 py-3">
              <NavLink to="/" end className={mobileLinkClass} onClick={closeMenu}>
                Accueil
              </NavLink>
              <NavLink to="/catalogue" className={mobileLinkClass} onClick={closeMenu}>
                Créations
              </NavLink>
              <NavLink to="/ateliers" className={mobileLinkClass} onClick={closeMenu}>
                Stylistes
              </NavLink>
              <NavLink to="/favoris" className={mobileLinkClass} onClick={closeMenu}>
                Favoris {count > 0 ? `(${count})` : ''}
              </NavLink>
              {isStylist ? (
                <NavLink
                  to="/espace-styliste"
                  className={mobileLinkClass}
                  onClick={closeMenu}
                >
                  Ma vitrine
                </NavLink>
              ) : null}
              <a
                href="/#a-propos"
                className={mobileLinkClass({ isActive: false })}
                onClick={closeMenu}
              >
                À propos
              </a>
              <div className="my-1.5 border-t border-line" />
              <NavLink
                to={isAuthenticated ? '/parametres' : '/connexion?next=/parametres'}
                className={mobileLinkClass}
                onClick={closeMenu}
              >
                <Settings className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 flex-1">Paramètres</span>
              </NavLink>
              {!isInstalled ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 text-left text-[15px] font-medium text-heading hover:bg-page"
                  onClick={() => {
                    closeMenu()
                    if (canNativeInstall) {
                      void openInstall()
                    } else {
                      openBanner()
                    }
                  }}
                >
                  <Download className="size-4 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0 flex-1">Installer l&apos;application</span>
                </button>
              ) : null}
              {isAuthenticated ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 text-left text-[15px] font-medium text-heading hover:bg-page"
                  onClick={() => {
                    closeMenu()
                    signOut()
                  }}
                >
                  <LogOut className="size-4 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0 flex-1">Déconnexion</span>
                </button>
              ) : (
                <>
                  <NavLink to="/connexion" className={mobileLinkClass} onClick={closeMenu}>
                    Connexion
                  </NavLink>
                  <NavLink to="/inscription" className={mobileLinkClass} onClick={closeMenu}>
                    S&apos;inscrire
                  </NavLink>
                  <NavLink
                    to="/inscription?role=styliste"
                    className={mobileLinkClass}
                    onClick={closeMenu}
                  >
                    Devenir styliste
                  </NavLink>
                </>
              )}
            </nav>
          </aside>
        </div>
      ) : null}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
