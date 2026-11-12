import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Images, MapPin, MessageCircle, Plus } from 'lucide-react'
import { DocumentMeta } from '@/components/DocumentMeta'
import { listAtelierCreationsMerged } from '@/lib/catalogue'
import { useAuthSession } from '@/lib/auth-session'
import type { MockCreation } from '@/lib/mock-data'
import { CREATION_IMAGE_PLACEHOLDER } from '@/lib/catalogue'

export function EspaceStylistePage() {
  const { user } = useAuthSession()
  const [creations, setCreations] = useState<MockCreation[]>([])
  const [loading, setLoading] = useState(Boolean(user?.atelierId))

  const atelierName = user?.atelierName || user?.fullName || 'Mon atelier'
  const phone = user?.phone
  const ville = user?.ville
  const specialite = user?.specialite
  const published = creations.length

  useEffect(() => {
    if (!user?.atelierId) {
      setCreations([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    void listAtelierCreationsMerged(user.atelierId)
      .then((items) => {
        if (!cancelled) setCreations(items)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user?.atelierId])

  return (
    <div className="bg-page">
      <DocumentMeta
        title="Espace styliste"
        description="Gérez votre vitrine Couturia : publiez et modifiez vos créations."
        path="/espace-styliste"
        noIndex
      />

      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
          <h1 className="font-display text-2xl font-semibold text-primary sm:text-3xl">
            {atelierName}
          </h1>
          {user?.fullName && user.fullName !== atelierName ? (
            <p className="mt-1 text-sm text-muted">{user.fullName}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            {specialite ? <span>{specialite}</span> : null}
            {specialite && ville ? <span aria-hidden>·</span> : null}
            {ville ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                {ville}
              </span>
            ) : null}
            {phone ? (
              <>
                {(specialite || ville) && <span aria-hidden>·</span>}
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="size-3.5 shrink-0 text-[#25D366]" aria-hidden />
                  {phone}
                </span>
              </>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              to="/espace-styliste/creations/nouvelle"
              className="btn btn-primary h-11 min-h-11 rounded-xl gap-2"
            >
              <Plus className="size-4" aria-hidden />
              Nouvelle création
            </Link>
            <Link
              to="/espace-styliste/creations"
              className="btn h-11 min-h-11 rounded-xl border border-line bg-white text-heading gap-2"
            >
              <Images className="size-4" aria-hidden />
              Mes créations
              {creations.length > 0 ? (
                <span className="rounded-md bg-page px-1.5 py-0.5 text-xs font-semibold text-primary">
                  {creations.length}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-6 lg:px-8">
        {loading ? (
          <p className="text-center text-sm text-muted">Chargement de vos créations…</p>
        ) : creations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white/70 px-5 py-10 text-center">
            <p className="font-display text-lg font-semibold text-primary">
              Aucune création pour l’instant
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Ajoutez votre première pièce pour commencer votre vitrine.
            </p>
            <Link
              to="/espace-styliste/creations/nouvelle"
              className="btn btn-primary mt-5 rounded-xl gap-2"
            >
              <Plus className="size-4" aria-hidden />
              Publier une création
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-primary">
                Vos créations
              </h2>
              <p className="text-sm text-muted">
                {published} publiée{published > 1 ? 's' : ''}
              </p>
            </div>
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
              {creations.slice(0, 5).map((item) => (
                <li key={item.id}>
                  <Link
                    to={
                      item.id.startsWith('sc-')
                        ? `/espace-styliste/creations/${item.id}/modifier`
                        : `/catalogue/${item.id}`
                    }
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-page"
                  >
                    <img
                      src={item.image || CREATION_IMAGE_PLACEHOLDER}
                      alt=""
                      className="size-14 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-heading">{item.titre}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {item.categorie}
                        {' · '}
                        {item.id.startsWith('sc-') ? 'Locale' : 'Catalogue'}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {creations.length > 5 ? (
              <Link
                to="/espace-styliste/creations"
                className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Voir toutes ({creations.length})
              </Link>
            ) : null}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted">
          Vos publications sont sur le catalogue : visibles par les autres avec leurs photos.
        </p>
      </section>
    </div>
  )
}
