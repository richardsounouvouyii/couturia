import { Link } from 'react-router-dom'
import { Images, MessageCircle, Plus, Scissors } from 'lucide-react'
import { DocumentMeta } from '@/components/DocumentMeta'
import { listStylistCreations, STYLIST_DEMO } from '@/lib/stylist-creations'

export function EspaceStylistePage() {
  const creations = listStylistCreations()
  const published = creations.filter((c) => c.published).length

  return (
    <div className="bg-page">
      <DocumentMeta
        title="Espace styliste"
        description="Gérez votre vitrine Couturia : publiez et modifiez vos créations."
        path="/espace-styliste"
        noIndex
      />

      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
            Espace styliste · démo
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold text-primary sm:text-3xl">
            {STYLIST_DEMO.atelierName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Prototype front : publiez et modifiez vos créations (sauvegardées sur cet
            appareil). L&apos;API arrivera ensuite.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link to="/espace-styliste/creations/nouvelle" className="btn btn-primary rounded-xl gap-2">
              <Plus className="size-4" aria-hidden />
              Nouvelle création
            </Link>
            <Link
              to="/espace-styliste/creations"
              className="btn rounded-xl border border-line bg-white text-heading gap-2"
            >
              <Images className="size-4" aria-hidden />
              Mes créations
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-3 lg:px-8">
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Créations</p>
          <p className="font-display mt-2 text-3xl font-semibold text-primary">
            {creations.length}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Publiées</p>
          <p className="font-display mt-2 text-3xl font-semibold text-primary">{published}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Contact</p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-heading">
            <MessageCircle className="size-4 text-[#25D366]" aria-hidden />
            WhatsApp vitrine
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 lg:px-8">
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2 text-primary">
            <Scissors className="size-5" aria-hidden />
            <h2 className="font-display text-xl font-semibold">Prochaine étape</h2>
          </div>
          <p className="mt-2 text-sm text-muted">
            Connectez auth-service pour sécuriser cet espace, puis catalogue-service pour
            publier réellement vos pièces.
          </p>
        </div>
      </section>
    </div>
  )
}
