import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  MapPin,
  MessageCircle,
  Sparkles,
  Star,
} from 'lucide-react'
import { CreationCard } from '@/components/CreationCard'
import { getAtelierById, getCreationsByAtelier } from '@/lib/mock-data'
import {
  absoluteUrl,
  atelierWhatsAppMessage,
  buildWhatsAppUrl,
} from '@/lib/whatsapp'

export function AtelierDetailPage() {
  const { id } = useParams()
  const atelier = id ? getAtelierById(id) : undefined
  const creations = id ? getCreationsByAtelier(id) : []

  if (!atelier) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-primary">
          Atelier introuvable
        </h1>
        <p className="mt-2 text-sm text-muted">
          Ce profil n&apos;existe pas ou n&apos;est plus public.
        </p>
        <Link to="/ateliers" className="btn btn-primary btn-sm mt-6 rounded-xl">
          Retour à l&apos;annuaire
        </Link>
      </div>
    )
  }

  const pageUrl = absoluteUrl(`/ateliers/${atelier.id}`)
  const whatsappUrl = buildWhatsAppUrl(
    atelier.telephoneWhatsapp,
    atelierWhatsAppMessage(atelier.nom, pageUrl),
  )

  return (
    <div className="bg-page">
      <div className="relative h-48 overflow-hidden bg-ribbon sm:h-64 lg:h-72">
        <img
          src={atelier.coverImage}
          alt=""
          className="size-full object-cover"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative -mt-16 rounded-2xl border border-line bg-white p-5 shadow-md sm:-mt-20 sm:p-8">
          <Link
            to="/ateliers"
            className="btn btn-ghost btn-sm mb-4 gap-2 px-0 text-primary hover:bg-transparent"
          >
            <ArrowLeft className="size-4" />
            Retour aux stylistes
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-semibold text-primary">
                  {atelier.nom}
                </h1>
                {atelier.verifie && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-ribbon px-2.5 py-1 text-xs font-semibold text-primary">
                    <BadgeCheck className="size-3.5 text-gold" aria-hidden />
                    Vérifié
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-primary/90 sm:text-base">
                {atelier.specialite}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-primary" aria-hidden />
                  {atelier.quartier}, {atelier.ville}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-4 text-primary" aria-hidden />
                  {atelier.horaires}
                </span>
                <span className="inline-flex items-center gap-1.5 text-heading">
                  <Star className="size-4 fill-gold text-gold" aria-hidden />
                  {atelier.note.toFixed(1).replace('.', ',')} ({atelier.avis} avis)
                </span>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn rounded-xl border-0 bg-[#25D366] text-white hover:bg-[#1ebe57] sm:w-fit"
            >
              <MessageCircle className="size-4" />
              Contacter sur WhatsApp
            </a>
          </div>

          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
            {atelier.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {atelier.specialites.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-page px-3 py-1 text-xs font-medium text-heading"
              >
                <Sparkles className="size-3 text-gold" aria-hidden />
                {item}
              </span>
            ))}
          </div>
        </div>

        <section className="py-8 lg:py-10">
          <h2 className="font-display text-2xl font-semibold text-primary">
            Photos de l&apos;atelier
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {atelier.gallery.map((image, index) => (
              <div
                key={`${atelier.id}-gallery-${index}`}
                className="aspect-[4/3] overflow-hidden rounded-xl bg-ribbon"
              >
                <img
                  src={image}
                  alt={`Photo ${index + 1} de ${atelier.nom}`}
                  className="size-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="pb-10 lg:pb-12">
          <div className="mb-6 flex items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold text-primary">
              Créations de l&apos;atelier
            </h2>
            <p className="text-sm text-muted">{creations.length} pièce(s)</p>
          </div>

          {creations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center text-sm text-muted">
              Aucune création publiée pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {creations.map((creation) => (
                <Link key={creation.id} to={`/catalogue/${creation.id}`}>
                  <CreationCard creation={creation} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
