import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { CreationCard } from '@/components/CreationCard'
import { DocumentMeta } from '@/components/DocumentMeta'
import { resolvePublicCreationById } from '@/lib/catalogue'
import { useFavorites } from '@/lib/favorites'
import type { MockCreation } from '@/lib/mock-data'

export function FavorisPage() {
  const { ids } = useFavorites()
  const favorites = ids
    .map((id) => resolvePublicCreationById(id))
    .filter((item): item is MockCreation => item != null)

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
        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
            <Heart className="mx-auto size-8 text-gold" aria-hidden />
            <p className="font-display mt-3 text-xl font-semibold text-primary">
              Aucun favori pour le moment
            </p>
            <p className="mt-2 text-sm text-muted">
              Touchez le cœur sur une création pour l&apos;enregistrer ici.
            </p>
            <Link to="/catalogue" className="btn btn-primary btn-sm mt-6 rounded-xl">
              Explorer les créations
            </Link>
          </div>
        ) : (
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
        )}
      </section>
    </div>
  )
}
