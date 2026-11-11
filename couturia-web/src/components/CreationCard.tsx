import { House, MapPin, MessageCircle, RotateCw, Star } from 'lucide-react'
import { FavoriteButton } from '@/components/FavoriteButton'
import { TURN_360_MIN_FRAMES } from '@/components/CreationTurnViewer'
import type { MockCreation } from '@/lib/mock-data'
import { getAtelierById, getCreationImages } from '@/lib/mock-data'
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
  const phone = creation.telephoneWhatsapp || atelier?.telephoneWhatsapp || ''
  const is360 = getCreationImages(creation).length >= TURN_360_MIN_FRAMES
  const canWhatsApp = isWhatsAppAvailable(phone)
  const whatsappUrl = canWhatsApp
    ? buildWhatsAppUrl(
        phone,
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
        {is360 ? (
          <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-heading shadow-sm">
            <RotateCw className="size-3 text-primary" aria-hidden />
            360°
          </span>
        ) : null}
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
        <p className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted">
          <House className="size-3.5 shrink-0 text-primary" aria-hidden />
          <span className="truncate font-medium text-heading">{creation.atelier}</span>
          <span className="shrink-0 text-line" aria-hidden>
            ·
          </span>
          <MapPin className="size-3 shrink-0 text-primary" aria-hidden />
          <span className="truncate">{creation.ville}</span>
        </p>
        <div className="flex items-center justify-between gap-1.5 pt-0.5 text-xs">
          {creation.ratingsDemo ? (
            <span className="min-w-0 truncate rounded-full bg-ribbon px-2 py-0.5 text-[10px] font-semibold text-primary">
              Nouveau · démo
            </span>
          ) : (
            <span className="inline-flex min-w-0 items-center gap-1 text-heading/80">
              <Star className="size-3.5 shrink-0 fill-gold text-gold" aria-hidden />
              <span className="truncate">
                {creation.note.toFixed(1).replace('.', ',')} ({creation.avis})
              </span>
            </span>
          )}
          {creation.prixIndicatif != null && (
            <span className="shrink-0 font-semibold tabular-nums text-primary">
              {formatFcfa(creation.prixIndicatif)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
