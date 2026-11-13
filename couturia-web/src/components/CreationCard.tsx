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
  /** Sur la page atelier : masque le nom d’atelier (déjà connu). */
  hideAtelier?: boolean
}

export function CreationCard({ creation, hideAtelier = false }: Props) {
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
          {
            atelier: creation.atelier,
            ville: creation.ville,
            prixIndicatif: creation.prixIndicatif,
          },
        ),
      )
    : null

  return (
    <article className="group flex min-w-0 flex-col gap-2">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ribbon">
        <img
          src={creation.image}
          alt={creation.titre}
          className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <FavoriteButton
          creationId={creation.id}
          className="absolute top-2 right-2 z-10"
        />
        {is360 ? (
          <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-heading shadow-sm">
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
            className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-[#25D366] px-2 py-1 text-[10px] font-semibold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={`Contacter ${creation.atelier} sur WhatsApp`}
          >
            <MessageCircle className="size-3" aria-hidden />
            WhatsApp
          </a>
        ) : null}
      </div>

      <div className="min-w-0 space-y-1 px-0.5">
        <h3 className="font-display text-sm font-semibold leading-snug text-heading line-clamp-2 break-words sm:text-[15px]">
          {creation.titre}
        </h3>

        {!hideAtelier ? (
          <p className="flex min-w-0 items-center gap-1 text-[11px] text-muted sm:text-xs">
            <House className="size-3 shrink-0 text-primary" aria-hidden />
            <span className="truncate font-medium text-heading">{creation.atelier}</span>
          </p>
        ) : null}

        <p className="flex min-w-0 items-center gap-1 text-[11px] text-muted sm:text-xs">
          <MapPin className="size-3 shrink-0 text-primary" aria-hidden />
          <span className="truncate">{creation.ville}</span>
        </p>

        <div className="flex min-w-0 flex-col gap-0.5 pt-0.5 text-[11px] sm:flex-row sm:items-center sm:justify-between sm:gap-1.5 sm:text-xs">
          {creation.ratingsDemo ? (
            <span className="w-fit max-w-full truncate rounded-full bg-ribbon px-2 py-0.5 text-[10px] font-semibold text-primary">
              Nouveau
            </span>
          ) : (
            <span className="inline-flex min-w-0 items-center gap-1 text-heading/80">
              <Star className="size-3 shrink-0 fill-gold text-gold" aria-hidden />
              <span className="truncate">
                {creation.note.toFixed(1).replace('.', ',')} ({creation.avis})
              </span>
            </span>
          )}
          {creation.prixIndicatif != null ? (
            <span className="font-semibold tabular-nums text-primary">
              {formatFcfa(creation.prixIndicatif)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  )
}
