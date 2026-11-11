import { NavLink } from 'react-router-dom'
import { Heart, Home, LayoutGrid, Shirt, Store } from 'lucide-react'
import { useAuthSession } from '@/lib/auth-session'
import { useFavorites } from '@/lib/favorites'

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}

export function MobileBottomNav() {
  const { count } = useFavorites()
  const { isStylist } = useAuthSession()

  const items = isStylist
    ? ([
        { to: '/', label: 'Accueil', icon: Home, end: true },
        { to: '/catalogue', label: 'Créations', icon: Shirt },
        { to: '/ateliers', label: 'Stylistes', icon: Store },
        { to: '/espace-styliste', label: 'Ma vitrine', icon: LayoutGrid },
      ] as const)
    : ([
        { to: '/', label: 'Accueil', icon: Home, end: true },
        { to: '/catalogue', label: 'Créations', icon: Shirt },
        { to: '/ateliers', label: 'Stylistes', icon: Store },
        { to: '/favoris', label: 'Favoris', icon: Heart },
      ] as const)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur-md lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-4 px-2 py-2">
        {items.map(({ to, label, icon: Icon, ...rest }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={'end' in rest ? rest.end : undefined}
              onClick={scrollToTop}
              className={({ isActive }) =>
                [
                  'relative flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium transition',
                  isActive ? 'text-primary' : 'text-muted',
                ].join(' ')
              }
            >
              <span className="relative">
                <Icon className="size-5" aria-hidden />
                {!isStylist && to === '/favoris' && count > 0 ? (
                  <span className="absolute -top-1.5 -right-2 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-semibold text-white">
                    {count}
                  </span>
                ) : null}
              </span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
