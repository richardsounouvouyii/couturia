import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  MapPin,
  MessageCircle,
  Star,
} from 'lucide-react'
import { CreationCard } from '@/components/CreationCard'
import { CreationGalleryModal } from '@/components/CreationGalleryModal'
import { DocumentMeta } from '@/components/DocumentMeta'
import { listPublicCreationsByAtelierMerged } from '@/lib/catalogue'
import { formatPhoneDisplay } from '@/lib/format'
import { getAtelierById, type MockCreation } from '@/lib/mock-data'
import {
  absoluteUrl,
  atelierWhatsAppMessage,
  buildWhatsAppUrl,
  isWhatsAppAvailable,
} from '@/lib/whatsapp'

export function AtelierDetailPage() {
  const { id } = useParams()
  const atelier = id ? getAtelierById(id) : undefined
  const [creations, setCreations] = useState<MockCreation[]>([])
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  useEffect(() => {
    if (!id) {
      setCreations([])
      return
    }
    let cancelled = false
    void listPublicCreationsByAtelierMerged(id).then((items) => {
      if (!cancelled) setCreations(items)
    })
    return () => {
      cancelled = true
    }
  }, [id])

  if (!atelier) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <DocumentMeta title="Atelier introuvable" noIndex />
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
  const message = atelierWhatsAppMessage(atelier.nom, pageUrl)
  const canWhatsApp = isWhatsAppAvailable(atelier.telephoneWhatsapp)
  const whatsappUrl =
    canWhatsApp && atelier.telephoneWhatsapp
      ? buildWhatsAppUrl(atelier.telephoneWhatsapp, message)
      : null

  return (
    <div className="bg-page">
      <DocumentMeta
        title={atelier.nom}
        description={`${atelier.nom} — ${atelier.specialite} à ${atelier.quartier}, ${atelier.ville}. ${atelier.description}`}
        image={atelier.coverImage}
        path={`/ateliers/${atelier.id}`}
      />

      <div className="relative h-48 overflow-hidden sm:h-60 lg:h-72">
        <img
          src={atelier.coverImage}
          alt=""
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 sm:px-8 sm:pb-5">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                {atelier.nom}
              </h1>
              {atelier.verifie ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  <BadgeCheck className="size-3.5 text-gold" aria-hidden />
                  Vérifié
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-white/90">{atelier.specialite}</p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-white/80">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {atelier.quartier}, {atelier.ville}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-6 lg:px-8 lg:pb-10">
        <Link
          to="/ateliers"
          className="btn btn-ghost btn-sm mt-3 gap-2 px-0 text-primary hover:bg-transparent"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Retour aux stylistes
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5 text-primary" aria-hidden />
            {atelier.horaires}
          </span>
          <span className="inline-flex items-center gap-1.5 text-heading">
            <Star className="size-3.5 fill-gold text-gold" aria-hidden />
            {atelier.note.toFixed(1).replace('.', ',')}
            <span className="text-muted">({atelier.avis})</span>
          </span>
        </div>

        {atelier.description ? (
          <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-muted sm:text-sm">
            {atelier.description}
          </p>
        ) : null}

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="btn mt-4 h-11 min-h-11 w-full rounded-xl border-0 bg-[#25D366] text-white hover:bg-[#1ebe57] sm:w-auto"
          >
            <MessageCircle className="size-4" aria-hidden />
            WhatsApp · {formatPhoneDisplay(atelier.telephoneWhatsapp)}
          </a>
        ) : (
          <p className="mt-4 text-sm text-muted">WhatsApp indisponible pour cet atelier.</p>
        )}

        <section className="mt-7">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-primary">
              Créations
            </h2>
            <p className="text-xs text-muted">
              {creations.length} pièce{creations.length > 1 ? 's' : ''}
            </p>
          </div>

          {creations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white/70 px-4 py-8 text-center text-sm text-muted">
              Aucune création publiée pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
              {creations.map((creation) => (
                <Link key={creation.id} to={`/catalogue/${creation.id}`}>
                  <CreationCard creation={creation} hideAtelier />
                </Link>
              ))}
            </div>
          )}
        </section>

        {atelier.gallery.length > 0 ? (
          <section className="mt-7">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-primary">
                Photos
              </h2>
              <p className="text-xs text-muted">Touchez pour agrandir</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {atelier.gallery.map((image, index) => (
                <button
                  key={`${atelier.id}-gallery-${index}`}
                  type="button"
                  onClick={() => {
                    setGalleryIndex(index)
                    setGalleryOpen(true)
                  }}
                  className="aspect-[4/3] overflow-hidden rounded-xl bg-ribbon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label={`Voir la photo ${index + 1} de ${atelier.nom}`}
                >
                  <img
                    src={image}
                    alt={`Photo ${index + 1} de ${atelier.nom}`}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <CreationGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={atelier.gallery}
        title={`Photos — ${atelier.nom}`}
        initialIndex={galleryIndex}
        onIndexChange={setGalleryIndex}
      />
    </div>
  )
}
