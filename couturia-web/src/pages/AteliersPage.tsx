import { useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BadgeCheck, Search, Sparkles, X } from 'lucide-react'
import { AtelierCard } from '@/components/AtelierCard'
import { DocumentMeta } from '@/components/DocumentMeta'
import { ATELIER_VILLES, MOCK_ATELIERS } from '@/lib/mock-data'

const SPECIALITES = [
  'Toutes',
  ...Array.from(new Set(MOCK_ATELIERS.map((a) => a.specialite))),
]

type SortKey = 'note' | 'creations' | 'nom'

export function AteliersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [ville, setVille] = useState(searchParams.get('ville') ?? 'Toutes')
  const [specialite, setSpecialite] = useState(searchParams.get('specialite') ?? 'Toutes')
  const [verifiesOnly, setVerifiesOnly] = useState(searchParams.get('verifie') === '1')
  const [sort, setSort] = useState<SortKey>(
    (searchParams.get('tri') as SortKey) || 'note',
  )

  const filtered = useMemo(() => {
    let items = [...MOCK_ATELIERS]

    if (ville !== 'Toutes') items = items.filter((item) => item.ville === ville)
    if (specialite !== 'Toutes') {
      items = items.filter((item) => item.specialite === specialite)
    }
    if (verifiesOnly) items = items.filter((item) => item.verifie)

    const q = query.trim().toLowerCase()
    if (q) {
      items = items.filter(
        (item) =>
          item.nom.toLowerCase().includes(q) ||
          item.specialite.toLowerCase().includes(q) ||
          item.quartier.toLowerCase().includes(q) ||
          item.ville.toLowerCase().includes(q),
      )
    }

    items.sort((a, b) => {
      switch (sort) {
        case 'creations':
          return b.creationsCount - a.creationsCount
        case 'nom':
          return a.nom.localeCompare(b.nom, 'fr')
        case 'note':
        default:
          return b.note - a.note || b.avis - a.avis
      }
    })

    return items
  }, [query, ville, specialite, verifiesOnly, sort])

  const hasFilters =
    query.trim() !== '' ||
    ville !== 'Toutes' ||
    specialite !== 'Toutes' ||
    verifiesOnly ||
    sort !== 'note'

  function syncParams(next: {
    q?: string
    ville?: string
    specialite?: string
    verifie?: boolean
    tri?: SortKey
  }) {
    const params = new URLSearchParams()
    const q = next.q ?? query
    const v = next.ville ?? ville
    const s = next.specialite ?? specialite
    const ver = next.verifie ?? verifiesOnly
    const tri = next.tri ?? sort

    if (q.trim()) params.set('q', q.trim())
    if (v !== 'Toutes') params.set('ville', v)
    if (s !== 'Toutes') params.set('specialite', s)
    if (ver) params.set('verifie', '1')
    if (tri !== 'note') params.set('tri', tri)
    setSearchParams(params, { replace: true })
  }

  function onSearchSubmit(event: FormEvent) {
    event.preventDefault()
    syncParams({ q: query })
  }

  function resetFilters() {
    setQuery('')
    setVille('Toutes')
    setSpecialite('Toutes')
    setVerifiesOnly(false)
    setSort('note')
    setSearchParams({}, { replace: true })
  }

  return (
    <div className="bg-page">
      <DocumentMeta
        title="Stylistes"
        description="Trouvez des couturières et stylistes au Bénin. Filtrez par ville et spécialité, puis contactez-les sur WhatsApp."
        path={`/ateliers${searchParams.toString() ? `?${searchParams}` : ''}`}
      />

      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 pt-5 pb-4 lg:px-8 lg:pt-8 lg:pb-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold text-primary sm:text-3xl">
                Stylistes
              </h1>
              <p className="mt-1 text-sm text-muted">
                Filtrez par ville et contactez directement sur WhatsApp
              </p>
            </div>
            <p className="shrink-0 pb-0.5 text-sm text-muted">
              <span className="font-semibold text-primary">{filtered.length}</span>
              <span className="hidden sm:inline">
                {' '}
                atelier{filtered.length > 1 ? 's' : ''}
              </span>
            </p>
          </div>

          <form onSubmit={onSearchSubmit} className="mt-4">
            <label className="relative block">
              <span className="sr-only">Rechercher un atelier</span>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nom, spécialité, quartier, ville…"
                className="h-11 w-full rounded-xl border border-line bg-white/90 py-2 pr-12 pl-10 text-sm text-heading outline-none transition placeholder:text-muted focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
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

        <div className="border-t border-line/70 bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
            <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SPECIALITES.map((item) => {
                const active = specialite === item
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSpecialite(item)
                      syncParams({ specialite: item })
                    }}
                    className={[
                      'inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                      active
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-line bg-white text-heading hover:border-primary/35',
                    ].join(' ')}
                  >
                    {item === 'Toutes' ? 'Toutes spécialités' : item}
                  </button>
                )
              })}
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {['Toutes', ...ATELIER_VILLES].map((v) => {
                  const active = ville === v
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        setVille(v)
                        syncParams({ ville: v })
                      }}
                      className={[
                        'inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
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

              <button
                type="button"
                onClick={() => {
                  const next = !verifiesOnly
                  setVerifiesOnly(next)
                  syncParams({ verifie: next })
                }}
                className={[
                  'inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  verifiesOnly
                    ? 'bg-primary text-white'
                    : 'border border-line bg-white text-heading',
                ].join(' ')}
                aria-pressed={verifiesOnly}
              >
                <BadgeCheck className="size-3.5" aria-hidden />
                Vérifiés
              </button>

              <select
                className="h-7 shrink-0 rounded-full border border-line bg-white px-2.5 text-xs text-heading outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                value={sort}
                aria-label="Trier les ateliers"
                onChange={(e) => {
                  const tri = e.target.value as SortKey
                  setSort(tri)
                  syncParams({ tri })
                }}
              >
                <option value="note">Notes</option>
                <option value="creations">Créations</option>
                <option value="nom">A → Z</option>
              </select>

              {hasFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="grid size-7 shrink-0 place-items-center rounded-full border border-line bg-white text-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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
            <Sparkles className="mx-auto size-8 text-gold" aria-hidden />
            <p className="font-display mt-3 text-xl font-semibold text-primary">
              Aucun atelier trouvé
            </p>
            <p className="mt-2 text-sm text-muted">
              Essayez une autre ville, spécialité ou réinitialisez les filtres.
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((atelier) => (
              <Link key={atelier.id} to={`/ateliers/${atelier.id}`} className="h-full">
                <AtelierCard atelier={atelier} />
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 overflow-hidden rounded-2xl bg-primary p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e8d5b5]">
              Vous êtes styliste ?
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold">
              Créez votre vitrine sur Couturia
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/80">
              Publiez vos créations et soyez contactés directement sur WhatsApp.
            </p>
          </div>
          <Link
            to="/inscription?role=styliste"
            className="btn mt-5 border-0 bg-gold text-heading hover:bg-[#e8d5b5] sm:mt-0"
          >
            Devenir styliste
          </Link>
        </div>
      </section>
    </div>
  )
}
