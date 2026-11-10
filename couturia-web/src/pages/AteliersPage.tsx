import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BadgeCheck, Search, Sparkles, X } from 'lucide-react'
import { AtelierCard } from '@/components/AtelierCard'
import { MOCK_ATELIERS } from '@/lib/mock-data'

const VILLES = ['Toutes', ...Array.from(new Set(MOCK_ATELIERS.map((a) => a.ville)))]

const SPECIALITES = [
  'Toutes',
  ...Array.from(new Set(MOCK_ATELIERS.map((a) => a.specialite))),
]

type SortKey = 'note' | 'creations' | 'nom'

export function AteliersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [ville, setVille] = useState(searchParams.get('ville') ?? 'Toutes')
  const [specialite, setSpecialite] = useState('Toutes')
  const [verifiesOnly, setVerifiesOnly] = useState(false)
  const [sort, setSort] = useState<SortKey>('note')

  const filtered = useMemo(() => {
    let items = [...MOCK_ATELIERS]

    if (ville !== 'Toutes') {
      items = items.filter((item) => item.ville === ville)
    }

    if (specialite !== 'Toutes') {
      items = items.filter((item) => item.specialite === specialite)
    }

    if (verifiesOnly) {
      items = items.filter((item) => item.verifie)
    }

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

  const hasActiveFilters =
    query.trim() !== '' ||
    ville !== 'Toutes' ||
    specialite !== 'Toutes' ||
    verifiesOnly ||
    sort !== 'note'

  function resetFilters() {
    setQuery('')
    setVille('Toutes')
    setSpecialite('Toutes')
    setVerifiesOnly(false)
    setSort('note')
    setSearchParams({}, { replace: true })
  }

  function syncParams(nextQuery: string, nextVille: string) {
    const next = new URLSearchParams()
    if (nextQuery.trim()) next.set('q', nextQuery.trim())
    if (nextVille !== 'Toutes') next.set('ville', nextVille)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="bg-page">
      <section className="relative overflow-hidden border-b border-line bg-white">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-gold/10 blur-2xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Stylistes
          </p>
          <h1 className="font-display mt-2 max-w-xl text-3xl font-semibold text-primary sm:text-4xl">
            Trouvez l&apos;atelier qui vous ressemble
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Parcourez les profils de couturières et stylistes, filtrez par ville ou
            spécialité, puis contactez-les pour une confection sur mesure.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Rechercher un atelier</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  syncParams(e.target.value, ville)
                }}
                placeholder="Nom, spécialité, quartier, ville…"
                className="input input-bordered h-12 w-full rounded-xl border-line bg-page pl-10 focus:border-primary focus:outline-none"
              />
            </label>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn h-12 min-h-12 rounded-xl border border-line bg-white text-heading"
              >
                <X className="size-4" />
                Réinitialiser
              </button>
            )}
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {SPECIALITES.map((item) => {
              const active = specialite === item
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSpecialite(item)}
                  className={[
                    'btn btn-sm h-9 min-h-9 shrink-0 rounded-full px-4',
                    active
                      ? 'btn-primary border-primary'
                      : 'border border-line bg-white text-heading hover:border-primary/40',
                  ].join(' ')}
                >
                  {item === 'Toutes' ? 'Toutes spécialités' : item}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {VILLES.map((v) => {
              const active = ville === v
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setVille(v)
                    syncParams(query, v)
                  }}
                  className={[
                    'btn btn-xs h-8 min-h-8 rounded-full px-3',
                    active
                      ? 'btn-primary'
                      : 'border border-line bg-page text-heading hover:border-primary/30',
                  ].join(' ')}
                >
                  {v === 'Toutes' ? 'Toutes villes' : v}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setVerifiesOnly((v) => !v)}
              className={[
                'btn btn-sm h-9 min-h-9 gap-1.5 rounded-full',
                verifiesOnly
                  ? 'btn-primary'
                  : 'border border-line bg-page text-heading',
              ].join(' ')}
            >
              <BadgeCheck className="size-3.5" />
              Vérifiés
            </button>

            <label className="flex items-center gap-2 text-sm text-muted">
              Trier
              <select
                className="select select-sm select-bordered rounded-lg border-line bg-page"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="note">Mieux notés</option>
                <option value="creations">Plus de créations</option>
                <option value="nom">Nom A → Z</option>
              </select>
            </label>

            <p className="text-sm text-muted">
              <span className="font-semibold text-primary">{filtered.length}</span> atelier
              {filtered.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

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
            to="/inscription"
            className="btn mt-5 border-0 bg-gold text-heading hover:bg-[#e8d5b5] sm:mt-0"
          >
            Devenir styliste
          </Link>
        </div>
      </section>
    </div>
  )
}
