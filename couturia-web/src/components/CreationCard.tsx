import { House, MessageCircle, Star } from 'lucide-react'
import { FavoriteButton } from '@/components/FavoriteButton'
import type { MockCreation } from '@/lib/mock-data'
import { getAtelierById } from '@/lib/mock-data'
import { formatFcfa } from '@/lib/format'
import {
  absoluteUrl,
  buildWhatsAppUrl,
  creationWhatsAppMessage,
  isWhatsAppAvailable,
} from '@/lib/whatsapp'

type Props = {
  creation: MockCreation
}

export function CreationCard({ creation }: Props) {
  const atelier = getAtelierById(creation.atelierId)
  const canWhatsApp = atelier ? isWhatsAppAvailable(atelier.telephoneWhatsapp) : false
  const whatsappUrl =
    atelier && canWhatsApp
      ? buildWhatsAppUrl(
          atelier.telephoneWhatsapp,
          creationWhatsAppMessage(
            creation.titre,
            absoluteUrl(`/catalogue/${creation.id}`),
          ),
        )
      : null

  return (
    <article className="group flex min-w-0 flex-col gap-2.5">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ribbon">
        <img
          src={creation.image}
          alt={creation.titre}
          className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <FavoriteButton
          creationId={creation.id}
          className="absolute top-2.5 right-2.5 z-10"
        />
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="absolute bottom-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-[#25D366] px-2 py-1 text-[10px] font-semibold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={`Contacter ${creation.atelier} sur WhatsApp`}
          >
            <MessageCircle className="size-3" aria-hidden />
            WhatsApp
          </a>
        ) : (
          <span className="absolute bottom-2.5 left-2.5 z-10 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-muted shadow-sm">
            WhatsApp indisponible
          </span>
        )}
      </div>

      <div className="space-y-1 px-0.5">
        <h3 className="font-display text-[15px] font-semibold leading-snug text-heading line-clamp-2">
          {creation.titre}
        </h3>
        <p className="inline-flex items-center gap-1.5 text-xs text-muted">
          <House className="size-3.5 text-primary" aria-hidden />
          {creation.atelier}
        </p>
        <div className="flex items-center justify-between gap-2 pt-0.5 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1 text-heading/80">
            <Star className="size-3.5 fill-gold text-gold" aria-hidden />
            {creation.note.toFixed(1).replace('.', ',')} ({creation.avis})
          </span>
          {creation.prixIndicatif != null && (
            <span className="shrink-0 font-semibold text-primary">
              {formatFcfa(creation.prixIndicatif)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
