import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Store, X } from 'lucide-react'
import { MOCK_ATELIERS, MOCK_CREATIONS } from '@/lib/mock-data'

type Props = {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setQuery('')
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return {
        creations: MOCK_CREATIONS.slice(0, 4),
        ateliers: MOCK_ATELIERS.slice(0, 3),
      }
    }

    return {
      creations: MOCK_CREATIONS.filter(
        (item) =>
          item.titre.toLowerCase().includes(q) ||
          item.atelier.toLowerCase().includes(q) ||
          item.ville.toLowerCase().includes(q) ||
          item.categorie.toLowerCase().includes(q),
      ).slice(0, 6),
      ateliers: MOCK_ATELIERS.filter(
        (item) =>
          item.nom.toLowerCase().includes(q) ||
          item.specialite.toLowerCase().includes(q) ||
          item.ville.toLowerCase().includes(q) ||
          item.quartier.toLowerCase().includes(q),
      ).slice(0, 4),
    }
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] bg-primary/40 backdrop-blur-sm">
      <div className="mx-auto flex min-h-full max-w-2xl flex-col px-4 py-6 sm:py-10">
        <div className="rounded-2xl border border-line bg-card shadow-xl">
          <div className="flex items-center gap-2 border-b border-line px-3 py-3">
            <Search className="size-5 shrink-0 text-muted" aria-hidden />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une création, un atelier, une ville…"
              className="w-full bg-transparent text-sm text-heading outline-none placeholder:text-muted"
            />
            <button
              type="button"
              className="btn btn-ghost btn-square btn-sm"
              aria-label="Fermer la recherche"
              onClick={onClose}
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-3">
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Créations
            </p>
            {results.creations.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted">Aucune création trouvée.</p>
            ) : (
              <ul className="space-y-1">
                {results.creations.map((creation) => (
                  <li key={creation.id}>
                    <Link
                      to={`/catalogue/${creation.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-page"
                    >
                      <img
                        src={creation.image}
                        alt=""
                        className="size-12 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-heading">
                          {creation.titre}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {creation.atelier} · {creation.ville}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-4 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Stylistes
            </p>
            {results.ateliers.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted">Aucun atelier trouvé.</p>
            ) : (
              <ul className="space-y-1">
                {results.ateliers.map((atelier) => (
                  <li key={atelier.id}>
                    <Link
                      to={`/ateliers/${atelier.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-page"
                    >
                      <span className="grid size-12 place-items-center rounded-lg bg-ribbon text-primary">
                        <Store className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-heading">
                          {atelier.nom}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {atelier.specialite} · {atelier.ville}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {query.trim() ? (
              <div className="mt-4 grid gap-2 border-t border-line pt-3 sm:grid-cols-2">
                <Link
                  to={`/catalogue?q=${encodeURIComponent(query.trim())}`}
                  onClick={onClose}
                  className="btn btn-sm rounded-xl btn-primary"
                >
                  Voir toutes les créations
                </Link>
                <Link
                  to={`/ateliers?q=${encodeURIComponent(query.trim())}`}
                  onClick={onClose}
                  className="btn btn-sm rounded-xl border border-line bg-white"
                >
                  Voir tous les stylistes
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
