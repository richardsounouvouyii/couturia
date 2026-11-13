import { ArrowRight, BadgeCheck, MapPin, MessageCircle, Star } from 'lucide-react'
import type { MockAtelier } from '@/lib/mock-data'
import {
  absoluteUrl,
  atelierWhatsAppMessage,
  buildWhatsAppUrl,
  isWhatsAppAvailable,
} from '@/lib/whatsapp'

type Props = {
  atelier: MockAtelier
}

export function AtelierCard({ atelier }: Props) {
  const canWhatsApp = isWhatsAppAvailable(atelier.telephoneWhatsapp)
  const whatsappUrl = canWhatsApp
    ? buildWhatsAppUrl(
        atelier.telephoneWhatsapp,
        atelierWhatsAppMessage(atelier.nom, absoluteUrl(`/ateliers/${atelier.id}`)),
      )
    : null

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
      <div className="relative aspect-[16/10] overflow-hidden bg-ribbon">
        <img
          src={atelier.coverImage}
          alt={`Atelier ${atelier.nom}`}
          className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/35 via-transparent to-transparent opacity-80" />
        {atelier.verifie && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-primary shadow-sm">
            <BadgeCheck className="size-3.5 text-gold" aria-hidden />
            Vérifié
          </span>
        )}
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#25D366] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={`Contacter ${atelier.nom} sur WhatsApp`}
          >
            <MessageCircle className="size-3.5" aria-hidden />
            WhatsApp
          </a>
        ) : (
          <span className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-muted shadow-sm">
            WhatsApp indisponible
          </span>
        )}
        <span className="absolute right-3 bottom-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-heading shadow-sm">
          {atelier.creationsCount} créations
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <div>
          <h3 className="font-display text-lg font-semibold text-heading group-hover:text-primary">
            {atelier.nom}
          </h3>
          <p className="mt-1 text-sm font-medium text-primary/90">{atelier.specialite}</p>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted sm:text-sm">
          {atelier.description}
        </p>

        <p className="inline-flex items-center gap-1.5 text-xs text-muted">
          <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden />
          {atelier.quartier}, {atelier.ville}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line/80 pt-3">
          {atelier.avis > 0 ? (
            <span className="inline-flex items-center gap-1 text-sm text-heading/85">
              <Star className="size-3.5 fill-gold text-gold" aria-hidden />
              {atelier.note.toFixed(1).replace('.', ',')}
              <span className="text-muted">({atelier.avis})</span>
            </span>
          ) : (
            <span className="rounded-full bg-ribbon px-2 py-0.5 text-[10px] font-semibold text-primary">
              Nouveau
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            Voir le profil
            <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  )
}
