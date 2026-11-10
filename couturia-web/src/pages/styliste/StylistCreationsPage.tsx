import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { DocumentMeta } from '@/components/DocumentMeta'
import { formatFcfa } from '@/lib/format'
import {
  deleteStylistCreation,
  listStylistCreations,
} from '@/lib/stylist-creations'
import { useMemo, useState } from 'react'

export function StylistCreationsPage() {
  const [tick, setTick] = useState(0)
  const creations = useMemo(() => listStylistCreations(), [tick])

  return (
    <div className="bg-page">
      <DocumentMeta
        title="Mes créations"
        description="Gérez les créations de votre vitrine styliste."
        path="/espace-styliste/creations"
        noIndex
      />

      <section className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-end sm:justify-between lg:px-8">
          <div>
            <h1 className="font-display text-2xl font-semibold text-primary sm:text-3xl">
              Mes créations
            </h1>
            <p className="mt-1 text-sm text-muted">
              {creations.length} pièce{creations.length > 1 ? 's' : ''} · sauvegarde locale
            </p>
          </div>
          <Link
            to="/espace-styliste/creations/nouvelle"
            className="btn btn-primary rounded-xl gap-2"
          >
            <Plus className="size-4" aria-hidden />
            Nouvelle création
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        {creations.length === 0 ? (
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
            {creations.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-3 sm:flex-row sm:items-center sm:p-4"
              >
                <img
                  src={item.image}
                  alt=""
                  className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-20"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold text-heading">
                      {item.titre}
                    </h2>
                    <span
                      className={[
                        'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                        item.published
                          ? 'bg-primary/10 text-primary'
                          : 'bg-base-200 text-muted',
                      ].join(' ')}
                    >
                      {item.published ? 'Publiée' : 'Brouillon'}
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
                  <Link
                    to={`/espace-styliste/creations/${item.id}/modifier`}
                    className="btn btn-sm rounded-xl border border-line bg-page gap-1.5"
                  >
                    <Pencil className="size-3.5" aria-hidden />
                    Modifier
                  </Link>
                  <button
                    type="button"
                    className="btn btn-sm rounded-xl border border-line bg-white text-primary gap-1.5"
                    onClick={() => {
                      if (confirm(`Supprimer « ${item.titre} » ?`)) {
                        deleteStylistCreation(item.id)
                        setTick((v) => v + 1)
                      }
                    }}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
