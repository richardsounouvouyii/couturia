import { useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Baby,
  Gem,
  Heart,
  Layers,
  Search,
  Shirt,
  Sparkles,
  X,
} from 'lucide-react'
import { CreationCard } from '@/components/CreationCard'
import { CREATION_VILLES, MOCK_CATEGORIES, MOCK_CREATIONS } from '@/lib/mock-data'

const iconMap = {
  Sparkles,
  Shirt,
  Layers,
  Heart,
  Baby,
  Gem,
} as const

type SortKey = 'recent' | 'prix-asc' | 'prix-desc' | 'note'

function categoryIdFromLabel(label: string): string {
  const found = MOCK_CATEGORIES.find(
    (c) => c.label.toLowerCase() === label.toLowerCase() || c.id === label.toLowerCase(),
  )
  return found?.id ?? 'tous'
}

export function CreationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = categoryIdFromLabel(searchParams.get('categorie') ?? 'tous')

  const [category, setCategory] = useState(initialCategory)
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [ville, setVille] = useState(searchParams.get('ville') ?? 'Toutes')
  const [sort, setSort] = useState<SortKey>('recent')

  const filtered = useMemo(() => {
    let items = [...MOCK_CREATIONS]

    if (category !== 'tous') {
      items = items.filter((item) => item.categorie.toLowerCase() === category)
    }

    if (ville !== 'Toutes') {
      items = items.filter((item) => item.ville === ville)
    }

    const q = query.trim().toLowerCase()
    if (q) {
      items = items.filter(
        (item) =>
          item.titre.toLowerCase().includes(q) ||
          item.atelier.toLowerCase().includes(q) ||
          item.categorie.toLowerCase().includes(q) ||
          item.ville.toLowerCase().includes(q),
      )
    }

    items.sort((a, b) => {
      switch (sort) {
        case 'prix-asc':
          return (a.prixIndicatif ?? 0) - (b.prixIndicatif ?? 0)
        case 'prix-desc':
          return (b.prixIndicatif ?? 0) - (a.prixIndicatif ?? 0)
        case 'note':
          return b.note - a.note
        default:
          return 0
      }
    })

    return items
  }, [category, query, ville, sort])

  const hasFilters =
    category !== 'tous' || ville !== 'Toutes' || query.trim() !== '' || sort !== 'recent'

  function syncParams(nextCategory: string, nextQuery: string, nextVille: string) {
    const next = new URLSearchParams()
    if (nextCategory !== 'tous') next.set('categorie', nextCategory)
    if (nextQuery.trim()) next.set('q', nextQuery.trim())
    if (nextVille !== 'Toutes') next.set('ville', nextVille)
    setSearchParams(next, { replace: true })
  }

  function selectCategory(id: string) {
    setCategory(id)
    syncParams(id, query, ville)
  }

  function selectVille(nextVille: string) {
    setVille(nextVille)
    syncParams(category, query, nextVille)
  }

  function onSearchSubmit(event: FormEvent) {
    event.preventDefault()
    syncParams(category, query, ville)
  }

  function resetFilters() {
    setCategory('tous')
    setQuery('')
    setVille('Toutes')
    setSort('recent')
    setSearchParams({}, { replace: true })
  }

  return (
    <div className="bg-page">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-5 pb-4 lg:px-8 lg:pt-8 lg:pb-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold text-primary sm:text-3xl">
                Créations
              </h1>
              <p className="mt-1 text-sm text-muted">
                Contactez les ateliers directement sur WhatsApp
              </p>
            </div>
            <p className="shrink-0 pb-0.5 text-sm text-muted">
              <span className="font-semibold text-primary">{filtered.length}</span>
              <span className="hidden sm:inline">
                {' '}
                pièce{filtered.length > 1 ? 's' : ''}
              </span>
            </p>
          </div>

          <form onSubmit={onSearchSubmit} className="mt-4">
            <label className="relative block">
              <span className="sr-only">Rechercher une création</span>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Création, atelier, ville…"
                className="h-11 w-full rounded-xl border border-line bg-page py-2 pr-12 pl-10 text-sm text-heading outline-none transition placeholder:text-muted focus:border-primary"
              />
              <button
                type="submit"
                className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-lg bg-primary text-white"
                aria-label="Lancer la recherche"
              >
                <Search className="size-3.5" />
              </button>
            </label>
          </form>
        </div>

        <div className="border-t border-line/70 bg-page/60">
          <div className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
            <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {MOCK_CATEGORIES.map((item) => {
                const Icon = iconMap[item.icon]
                const active = category === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectCategory(item.id)}
                    className={[
                      'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition',
                      active
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-line bg-white text-heading hover:border-primary/35',
                    ].join(' ')}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {item.label}
                  </button>
                )
              })}
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {['Toutes', ...CREATION_VILLES].map((v) => {
                  const active = ville === v
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => selectVille(v)}
                      className={[
                        'inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-xs font-medium transition',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted hover:bg-white hover:text-heading',
                      ].join(' ')}
                    >
                      {v === 'Toutes' ? 'Toutes villes' : v}
                    </button>
                  )
                })}
              </div>

              <select
                className="h-7 shrink-0 rounded-full border border-line bg-white px-2.5 text-xs text-heading outline-none"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Trier"
              >
                <option value="recent">Récentes</option>
                <option value="note">Notes</option>
                <option value="prix-asc">Prix ↑</option>
                <option value="prix-desc">Prix ↓</option>
              </select>

              {hasFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="grid size-7 shrink-0 place-items-center rounded-full border border-line bg-white text-muted hover:text-primary"
                  aria-label="Réinitialiser les filtres"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-7">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
            <p className="font-display text-xl font-semibold text-primary">
              Aucune création trouvée
            </p>
            <p className="mt-2 text-sm text-muted">
              Modifiez vos filtres ou réinitialisez la recherche.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm mt-6 gap-2 rounded-xl"
              onClick={resetFilters}
            >
              <X className="size-4" />
              Réinitialiser
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
            {filtered.map((creation) => (
              <Link
                key={creation.id}
                to={`/catalogue/${creation.id}`}
                className="block transition hover:-translate-y-0.5"
              >
                <CreationCard creation={creation} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
