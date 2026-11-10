import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Download, Heart, Menu, Search, X } from 'lucide-react'
import logo from '@/assets/images/logo.png'
import { SearchOverlay } from '@/components/SearchOverlay'
import { useFavorites } from '@/lib/favorites'
import { usePwaInstall } from '@/lib/pwa-install'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'px-3 py-2 text-sm font-medium transition-colors relative',
    isActive
      ? 'text-primary after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary'
      : 'text-heading/80 hover:text-primary',
  ].join(' ')

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
    isActive ? 'bg-primary/10 text-primary' : 'text-heading hover:bg-page',
  ].join(' ')

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const menuId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const { count } = useFavorites()
  const { canNativeInstall, isStandalone, openInstall, openBanner } = usePwaInstall()

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!menuOpen) return

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return
      }
      setMenuOpen(false)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-page/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center" onClick={() => setMenuOpen(false)}>
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
                setMenuOpen(false)
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
            <Link
              to="/inscription"
              className="btn btn-primary btn-sm hidden sm:inline-flex"
            >
              Devenir styliste
            </Link>
            <button
              ref={buttonRef}
              type="button"
              className="btn btn-ghost btn-square text-heading lg:hidden"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div
            id={menuId}
            ref={panelRef}
            className="border-t border-line bg-card lg:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              <NavLink to="/" end className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
                Accueil
              </NavLink>
              <NavLink
                to="/catalogue"
                className={mobileLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                Créations
              </NavLink>
              <NavLink
                to="/ateliers"
                className={mobileLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                Stylistes
              </NavLink>
              <NavLink
                to="/favoris"
                className={mobileLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                Favoris {count > 0 ? `(${count})` : ''}
              </NavLink>
              <a
                href="/#a-propos"
                className={mobileLinkClass({ isActive: false })}
                onClick={() => setMenuOpen(false)}
              >
                À propos
              </a>
              <div className="my-1 border-t border-line" />
              {!isStandalone ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-heading hover:bg-page"
                  onClick={() => {
                    setMenuOpen(false)
                    if (canNativeInstall) {
                      void openInstall()
                    } else {
                      openBanner()
                    }
                  }}
                >
                  <Download className="size-4 text-primary" aria-hidden />
                  Installer l&apos;application
                </button>
              ) : null}
              <NavLink
                to="/inscription"
                className={mobileLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                Devenir styliste
              </NavLink>
              <NavLink
                to="/connexion"
                className={mobileLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                Espace styliste
              </NavLink>
            </nav>
          </div>
        ) : null}
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
