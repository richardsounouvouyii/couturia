import accessoires from '@/assets/images/accessoires.jpg'
import atelier from '@/assets/images/atelier.jpg'
import creation1 from '@/assets/images/creation-1.jpg'
import creation2 from '@/assets/images/creation-2.jpg'
import creation3 from '@/assets/images/creation-3.jpg'
import creation4 from '@/assets/images/creation-4.jpg'
import creation5 from '@/assets/images/creation-5.jpg'
import hero from '@/assets/images/hero.jpg'

/** Données mock pour le front admin (API plus tard). */

export type AdminSlide = {
  id: string
  titre: string
  sousTitre: string
  ctaLabel: string
  ctaHref: string
  image: string
  ordre: number
  active: boolean
  debut: string
  fin: string
}

export type AdminBanner = {
  id: string
  titre: string
  sousTitre: string
  image: string
}

export type AdminActivity = {
  id: string
  message: string
  when: string
}

export type AdminKpi = {
  id: string
  label: string
  value: string
  delta: string
  positive: boolean
}

export const ADMIN_KPIS: AdminKpi[] = [
  {
    id: 'users',
    label: 'Utilisateurs total',
    value: '12 846',
    delta: '+8,4%',
    positive: true,
  },
  {
    id: 'stylistes',
    label: 'Couturières & stylistes actives',
    value: '1 256',
    delta: '+12,7%',
    positive: true,
  },
  {
    id: 'creations',
    label: 'Créations publiées',
    value: '8 934',
    delta: '+6,1%',
    positive: true,
  },
  {
    id: 'commandes',
    label: 'Commandes en cours',
    value: '317',
    delta: '−2,3%',
    positive: false,
  },
  {
    id: 'slides',
    label: 'Slides actives',
    value: '4',
    delta: 'sur 5 slides',
    positive: true,
  },
]

export const ADMIN_SLIDES: AdminSlide[] = [
  {
    id: 's1',
    titre: 'Nouvelle collection wax',
    sousTitre: 'Découvrez les pièces des ateliers partenaires',
    ctaLabel: 'Voir les créations',
    ctaHref: '/catalogue',
    image: creation1,
    ordre: 1,
    active: true,
    debut: '2026-11-01',
    fin: '2026-12-31',
  },
  {
    id: 's2',
    titre: 'Stylistes près de chez vous',
    sousTitre: 'Contactez-les directement sur WhatsApp',
    ctaLabel: 'Trouver un styliste',
    ctaHref: '/ateliers',
    image: atelier,
    ordre: 2,
    active: true,
    debut: '2026-10-15',
    fin: '2026-12-15',
  },
  {
    id: 's3',
    titre: 'Sur mesure & mariage',
    sousTitre: 'Des robes uniques pour vos grands jours',
    ctaLabel: 'Explorer',
    ctaHref: '/catalogue?categorie=mariage',
    image: creation5,
    ordre: 3,
    active: true,
    debut: '2026-09-01',
    fin: '2027-01-31',
  },
  {
    id: 's4',
    titre: 'Devenez styliste Couturia',
    sousTitre: 'Publiez votre vitrine et gagnez en visibilité',
    ctaLabel: 'Créer ma vitrine',
    ctaHref: '/inscription?role=styliste',
    image: hero,
    ordre: 4,
    active: true,
    debut: '2026-08-01',
    fin: '2026-12-31',
  },
  {
    id: 's5',
    titre: 'Promo fin d’année',
    sousTitre: 'Bientôt disponible',
    ctaLabel: 'En savoir plus',
    ctaHref: '/',
    image: creation3,
    ordre: 5,
    active: false,
    debut: '2026-12-01',
    fin: '2026-12-31',
  },
]

export const ADMIN_BANNERS: AdminBanner[] = [
  {
    id: 'b1',
    titre: 'Tissus & matières',
    sousTitre: 'Inspiration matières locales',
    image: accessoires,
  },
  {
    id: 'b2',
    titre: 'Créations sur mesure',
    sousTitre: 'Demandez un devis atelier',
    image: creation2,
  },
  {
    id: 'b3',
    titre: 'Devenir styliste',
    sousTitre: 'Rejoignez la vitrine Couturia',
    image: creation4,
  },
]

export const ADMIN_ACTIVITY: AdminActivity[] = [
  {
    id: 'a1',
    message: 'Slide « Nouvelle collection wax » modifiée',
    when: 'Il y a 12 min',
  },
  {
    id: 'a2',
    message: 'Bannière secondaire « Devenir styliste » ajoutée',
    when: 'Il y a 1 h',
  },
  {
    id: 'a3',
    message: 'Slide « Promo fin d’année » désactivée',
    when: 'Hier · 18:42',
  },
  {
    id: 'a4',
    message: 'Ordre du carousel mis à jour',
    when: 'Hier · 09:15',
  },
]
