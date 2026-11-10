import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, House, MapPin, MessageCircle, Share2, Star } from 'lucide-react'
import { DocumentMeta } from '@/components/DocumentMeta'
import { FavoriteButton } from '@/components/FavoriteButton'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { formatFcfa } from '@/lib/format'
import { getAtelierById, MOCK_CREATIONS } from '@/lib/mock-data'
import { facebookShareUrl, nativeShare, whatsappShareUrl } from '@/lib/share'
import { absoluteUrl, creationWhatsAppMessage } from '@/lib/whatsapp'

export function CreationDetailPage() {
  const { id } = useParams()
  const creation = MOCK_CREATIONS.find((item) => item.id === id)
  const atelier = creation ? getAtelierById(creation.atelierId) : undefined

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
  const message = creationWhatsAppMessage(creation.titre, pageUrl)
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

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
        <Link
          to="/catalogue"
          className="btn btn-ghost btn-sm mb-6 gap-2 px-0 text-primary hover:bg-transparent"
        >
          <ArrowLeft className="size-4" />
          Retour aux créations
        </Link>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative overflow-hidden rounded-2xl bg-ribbon shadow-sm ring-1 ring-line">
            <img
              src={creation.image}
              alt={creation.titre}
              className="aspect-[3/4] w-full object-cover"
            />
            <FavoriteButton
              creationId={creation.id}
              size="md"
              className="absolute top-4 right-4"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              {creation.categorie}
            </p>
            <h1 className="font-display mt-2 text-3xl font-semibold text-primary sm:text-4xl">
              {creation.titre}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <House className="size-4 text-primary" aria-hidden />
                {creation.atelier}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 text-primary" aria-hidden />
                {creation.ville}
              </span>
              <span className="inline-flex items-center gap-1.5 text-heading">
                <Star className="size-4 fill-gold text-gold" aria-hidden />
                {creation.note.toFixed(1).replace('.', ',')} ({creation.avis} avis)
              </span>
            </div>

            {creation.prixIndicatif != null && (
              <p className="mt-6 font-display text-2xl font-semibold text-primary">
                {formatFcfa(creation.prixIndicatif)}
                <span className="ml-2 text-sm font-sans font-normal text-muted">
                  prix indicatif
                </span>
              </p>
            )}

            <p className="mt-6 text-sm leading-relaxed text-muted sm:text-base">
              Pièce présentée par {creation.atelier}. Contactez l&apos;atelier sur WhatsApp
              pour discuter de vos mesures, du délai et du prix. Aucun compte requis.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
              <WhatsAppButton phone={atelier?.telephoneWhatsapp} message={message} />
              <Link
                to={`/ateliers/${creation.atelierId}`}
                className="btn rounded-xl border-2 border-gold bg-transparent text-heading hover:bg-gold/10"
              >
                Voir l&apos;atelier
              </Link>
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-white p-4">
              <p className="text-sm font-semibold text-heading">Partager cette création</p>
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
    </div>
  )
}
