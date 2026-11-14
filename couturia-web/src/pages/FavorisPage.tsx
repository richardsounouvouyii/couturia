import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Loader2 } from 'lucide-react'
import { CreationCard } from '@/components/CreationCard'
import { DocumentMeta } from '@/components/DocumentMeta'
import { resolvePublicCreationByIdAsync } from '@/lib/catalogue'
import { useFavorites } from '@/lib/favorites'
import type { MockCreation } from '@/lib/mock-data'

export function FavorisPage() {
  const { ids } = useFavorites()
  const [favorites, setFavorites] = useState<MockCreation[]>([])
  const [loading, setLoading] = useState(ids.length > 0)
  const [missingCount, setMissingCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (ids.length === 0) {
        setFavorites([])
        setMissingCount(0)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const resolved = await Promise.all(
          ids.map(async (id) => ({
            id,
            creation: await resolvePublicCreationByIdAsync(id),
          })),
        )
        if (cancelled) return

        const items = resolved
          .map((row) => row.creation)
          .filter((item): item is MockCreation => item != null)
        setFavorites(items)
        setMissingCount(resolved.length - items.length)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [ids])

  return (
    <div className="bg-page">
      <DocumentMeta
        title="Favoris"
        description="Vos créations enregistrées sur Couturia."
        path="/favoris"
        noIndex
      />
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Sélection
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-primary sm:text-4xl">
            Mes favoris
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            Vos pièces enregistrées sur cet appareil. Aucun compte requis.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-white px-6 py-16 text-sm text-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Chargement de vos favoris…
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
            <Heart className="mx-auto size-8 text-gold" aria-hidden />
            <p className="font-display mt-3 text-xl font-semibold text-primary">
              Aucun favori pour le moment
            </p>
            <p className="mt-2 text-sm text-muted">
              {missingCount > 0
                ? `${missingCount} favori${missingCount > 1 ? 's' : ''} enregistré${missingCount > 1 ? 's' : ''} mais introuvable${missingCount > 1 ? 's' : ''} dans le catalogue.`
                : 'Touchez le cœur sur une création pour l’enregistrer ici.'}
            </p>
            <Link to="/catalogue" className="btn btn-primary btn-sm mt-6 rounded-xl">
              Explorer les créations
            </Link>
          </div>
        ) : (
          <>
            {missingCount > 0 ? (
              <p className="mb-3 text-xs text-muted">
                {missingCount} favori{missingCount > 1 ? 's' : ''} introuvable
                {missingCount > 1 ? 's' : ''} (création retirée ou indisponible).
              </p>
            ) : null}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
              {favorites.map((creation) => (
                <Link
                  key={creation.id}
                  to={`/catalogue/${creation.id}`}
                  className="block transition hover:-translate-y-0.5"
                >
                  <CreationCard creation={creation} />
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
