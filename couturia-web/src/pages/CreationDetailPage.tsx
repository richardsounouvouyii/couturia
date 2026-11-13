import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  House,
  Images,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Star,
} from 'lucide-react'
import { CreationGalleryModal } from '@/components/CreationGalleryModal'
import {
  CreationTurnViewer,
  TURN_360_MIN_FRAMES,
} from '@/components/CreationTurnViewer'
import { DocumentMeta } from '@/components/DocumentMeta'
import { FavoriteButton } from '@/components/FavoriteButton'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { formatFcfa, formatPhoneDisplay } from '@/lib/format'
import { getCreationImages, getCreationPhotoLabels } from '@/lib/mock-data'
import { facebookShareUrl, nativeShare, whatsappShareUrl } from '@/lib/share'
import { usePublicCreation } from '@/lib/use-public-creations'
import { absoluteUrl, creationWhatsAppMessage } from '@/lib/whatsapp'

export function CreationDetailPage() {
  const { id } = useParams()
  const { creation, loading } = usePublicCreation(id)
  const images = creation ? getCreationImages(creation) : []
  const photoLabels = creation ? getCreationPhotoLabels(creation) : []
  const contactPhone = creation?.telephoneWhatsapp?.trim() || undefined
  const [activeIndex, setActiveIndex] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)

  useEffect(() => {
    setActiveIndex(0)
    setGalleryOpen(false)
  }, [creation?.id])

  if (loading && !creation) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <DocumentMeta title="Création" noIndex />
        <p className="text-sm text-muted">Chargement…</p>
      </div>
    )
  }

  if (!creation) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <DocumentMeta title="Création introuvable" noIndex />
        <h1 className="font-display text-2xl font-semibold text-primary">
          Création introuvable
        </h1>
        <p className="mt-2 text-sm text-muted">
          Cette pièce n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <Link to="/catalogue" className="btn btn-primary btn-sm mt-6 rounded-xl">
          Retour aux créations
        </Link>
      </div>
    )
  }

  const pageUrl = absoluteUrl(`/catalogue/${creation.id}`)
  const message = creationWhatsAppMessage(creation.titre, pageUrl, {
    atelier: creation.atelier,
    ville: creation.ville,
    prixIndicatif: creation.prixIndicatif,
  })
  const shareTitle = creation.titre

  async function onNativeShare() {
    const shared = await nativeShare({
      title: shareTitle,
      text: `Découvre « ${shareTitle} » sur Couturia`,
      url: pageUrl,
    })
    if (!shared) {
      window.open(whatsappShareUrl(pageUrl, shareTitle), '_blank', 'noreferrer')
    }
  }

  return (
    <div className="bg-page">
      <DocumentMeta
        title={creation.titre}
        description={`${creation.titre} par ${creation.atelier} à ${creation.ville}. Contactez l’atelier sur WhatsApp via Couturia.`}
        image={creation.image}
        path={`/catalogue/${creation.id}`}
      />

      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:px-8 lg:py-10">
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          <ArrowLeft className="size-4" />
          Retour aux créations
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="relative">
            <CreationTurnViewer
              images={images}
              labels={photoLabels}
              alt={creation.titre}
              activeIndex={activeIndex}
              onActiveIndexChange={setActiveIndex}
            />
            <FavoriteButton
              creationId={creation.id}
              size="md"
              className="absolute top-3 right-3 z-20"
            />

            {images.length > 0 ? (
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="absolute top-3 left-3 z-20 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-heading shadow-sm sm:left-auto sm:right-14 sm:gap-1.5 sm:px-3 sm:py-2 sm:text-xs"
                aria-label="Voir toute la galerie"
              >
                <Images className="size-3.5 text-primary" aria-hidden />
                {images.length >= TURN_360_MIN_FRAMES ? 'Tour 360°' : 'Galerie'}
                {images.length > 1 ? (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">
                    {images.length}
                  </span>
                ) : null}
              </button>
            ) : null}

            {images.length > 1 ? (
              <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((src, index) => {
                  const active = index === activeIndex
                  const label = photoLabels[index]?.trim()
                  return (
                    <li key={`${index}-${src.slice(0, 32)}`} className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        aria-label={label ? `Voir ${label}` : `Voir l’angle ${index + 1}`}
                        aria-current={active ? 'true' : undefined}
                        className={[
                          'block overflow-hidden rounded-xl border-2 transition',
                          active
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-line opacity-90 hover:opacity-100',
                        ].join(' ')}
                      >
                        <img
                          src={src}
                          alt=""
                          className="size-[4.5rem] object-cover sm:size-24"
                          loading="lazy"
                        />
                      </button>
                      {label ? (
                        <span className="pointer-events-none absolute inset-x-1 bottom-1 truncate rounded bg-black/60 px-1 py-0.5 text-center text-[9px] font-semibold text-white">
                          {label}
                        </span>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold sm:text-xs sm:tracking-[0.18em]">
              {creation.categorie}
            </p>
            <h1 className="font-display mt-1.5 text-2xl font-semibold leading-tight text-primary sm:mt-2 sm:text-4xl">
              {creation.titre}
            </h1>

            <div className="mt-3 space-y-1.5 text-xs text-muted sm:mt-4 sm:text-sm">
              <p className="inline-flex flex-wrap items-center gap-1.5">
                <House className="size-3.5 shrink-0 text-primary sm:size-4" aria-hidden />
                <span className="text-heading/70">Atelier</span>
                <span className="font-semibold text-heading">{creation.atelier}</span>
              </p>
              <p className="inline-flex flex-wrap items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0 text-primary sm:size-4" aria-hidden />
                <span className="text-heading/70">Ville</span>
                <span className="font-medium text-heading">{creation.ville}</span>
              </p>
              {contactPhone ? (
                <p className="inline-flex flex-wrap items-center gap-1.5">
                  <Phone className="size-3.5 shrink-0 text-primary sm:size-4" aria-hidden />
                  <span className="text-heading/70">Téléphone</span>
                  <a
                    href={`tel:${contactPhone.replace(/\s/g, '')}`}
                    className="font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    {formatPhoneDisplay(contactPhone)}
                  </a>
                </p>
              ) : null}
              {creation.ratingsDemo ? (
                <span className="inline-flex rounded-full bg-ribbon px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Nouvelle publication · démo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-heading">
                  <Star className="size-3.5 fill-gold text-gold sm:size-4" aria-hidden />
                  {creation.note.toFixed(1).replace('.', ',')} ({creation.avis} avis)
                </span>
              )}
            </div>

            {creation.prixIndicatif != null && (
              <p className="mt-4 font-display text-xl font-semibold text-primary sm:mt-6 sm:text-2xl">
                {formatFcfa(creation.prixIndicatif)}
                <span className="ml-2 text-xs font-sans font-normal text-muted sm:text-sm">
                  prix indicatif
                </span>
              </p>
            )}

            <p className="mt-4 text-[13px] leading-relaxed text-muted sm:mt-6 sm:text-base">
              {creation.description?.trim()
                ? creation.description
                : `Pièce présentée par ${creation.atelier}. Contactez l'atelier sur WhatsApp pour discuter de vos mesures, du délai et du prix. Aucun compte requis.`}
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-start sm:gap-3">
              <WhatsAppButton phone={contactPhone} message={message} />
              <Link
                to={`/ateliers/${creation.atelierId}`}
                className="btn h-10 min-h-10 rounded-xl border-2 border-gold bg-transparent text-sm text-heading hover:bg-gold/10 sm:h-12 sm:min-h-12"
              >
                Voir l&apos;atelier
              </Link>
            </div>

            <div className="mt-5 rounded-2xl border border-line bg-white p-3.5 sm:mt-6 sm:p-4">
              <p className="text-xs font-semibold text-heading sm:text-sm">
                Partager cette création
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={whatsappShareUrl(pageUrl, creation.titre)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm rounded-xl border-0 bg-[#25D366] text-white hover:bg-[#1ebe57]"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp
                </a>
                <a
                  href={facebookShareUrl(pageUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm rounded-xl border-0 bg-[#1877F2] text-white hover:bg-[#166fe5]"
                >
                  <span className="text-sm font-bold leading-none">f</span>
                  Facebook
                </a>
                <button
                  type="button"
                  onClick={() => void onNativeShare()}
                  className="btn btn-sm rounded-xl border border-line bg-page text-heading"
                >
                  <Share2 className="size-4" />
                  Autre
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreationGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={images}
        labels={photoLabels}
        title={creation.titre}
        initialIndex={activeIndex}
        onIndexChange={setActiveIndex}
      />
    </div>
  )
}
