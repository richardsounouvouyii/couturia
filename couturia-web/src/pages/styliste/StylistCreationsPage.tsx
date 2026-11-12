import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { DocumentMeta } from '@/components/DocumentMeta'
import {
  CREATION_IMAGE_PLACEHOLDER,
  listAtelierCreationsMerged,
} from '@/lib/catalogue'
import { formatFcfa } from '@/lib/format'
import { useAuthSession } from '@/lib/auth-session'
import type { MockCreation } from '@/lib/mock-data'
import { deleteStylistCreation, listStylistCreations } from '@/lib/stylist-creations'

export function StylistCreationsPage() {
  const { user } = useAuthSession()
  const [creations, setCreations] = useState<MockCreation[]>([])
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function load() {
      if (user?.atelierId) {
        const items = await listAtelierCreationsMerged(user.atelierId)
        if (!cancelled) setCreations(items)
      } else {
        if (!cancelled) {
          setCreations(
            listStylistCreations()
              .filter((item) => item.published)
              .map((item) => ({
                id: item.id,
                titre: item.titre,
                atelierId: 'local',
                atelier: item.atelier,
                categorie: item.categorie,
                ville: item.ville,
                prixIndicatif: item.prixIndicatif,
                note: 0,
                avis: 0,
                image: item.images[0] || CREATION_IMAGE_PLACEHOLDER,
                images: item.images,
                description: item.description,
                telephoneWhatsapp: item.telephoneWhatsapp,
                updatedAt: item.updatedAt,
                ratingsDemo: true,
              })),
          )
        }
      }
      if (!cancelled) setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [user?.atelierId, tick])

  return (
    <div className="bg-page">
      <DocumentMeta
        title="Mes créations"
        description="Gérez les créations de votre vitrine styliste."
        path="/espace-styliste/creations"
        noIndex
      />

      <section className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-end sm:justify-between lg:px-8 lg:py-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-primary sm:text-3xl">
              Mes créations
            </h1>
            <p className="mt-1 text-sm text-muted">
              {loading
                ? 'Chargement…'
                : `${creations.length} pièce${creations.length > 1 ? 's' : ''} · catalogue + local`}
            </p>
          </div>
          <Link
            to="/espace-styliste/creations/nouvelle"
            className="btn btn-primary h-11 min-h-11 w-full rounded-xl gap-2 sm:w-auto"
          >
            <Plus className="size-4" aria-hidden />
            Nouvelle création
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        {loading ? (
          <p className="text-sm text-muted">Chargement…</p>
        ) : creations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
            <p className="font-display text-xl font-semibold text-primary">
              Aucune création
            </p>
            <p className="mt-2 text-sm text-muted">Publiez votre première pièce.</p>
            <Link
              to="/espace-styliste/creations/nouvelle"
              className="btn btn-primary btn-sm mt-6 rounded-xl"
            >
              Ajouter une création
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {creations.map((item) => {
              const localId = listStylistCreations().find(
                (draft) => draft.catalogueId === item.id || draft.id === item.id,
              )?.id
              const canEdit = Boolean(localId)

              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-3 sm:flex-row sm:items-center sm:p-4"
                >
                  <img
                    src={item.image || CREATION_IMAGE_PLACEHOLDER}
                    alt=""
                    className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-20"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg font-semibold text-heading">
                        {item.titre}
                      </h2>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        {item.id.startsWith('sc-') ? 'Locale' : 'Catalogue'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {item.categorie} · {item.ville}
                      {item.prixIndicatif != null
                        ? ` · ${formatFcfa(item.prixIndicatif)}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {canEdit && localId ? (
                      <>
                        <Link
                          to={`/espace-styliste/creations/${localId}/modifier`}
                          className="btn btn-sm rounded-xl border border-line bg-page gap-1.5"
                        >
                          <Pencil className="size-3.5" aria-hidden />
                          Modifier
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm rounded-xl border border-line bg-white text-primary gap-1.5"
                          onClick={() => {
                            if (confirm(`Supprimer « ${item.titre} » de cet appareil ?`)) {
                              deleteStylistCreation(localId)
                              setTick((v) => v + 1)
                            }
                          }}
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                          Supprimer
                        </button>
                      </>
                    ) : (
                      <Link
                        to={`/catalogue/${item.id}`}
                        className="btn btn-sm rounded-xl border border-line bg-page"
                      >
                        Voir
                      </Link>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
