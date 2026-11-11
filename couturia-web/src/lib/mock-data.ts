import accessoires from '@/assets/images/accessoires.jpg'
import atelierCover from '@/assets/images/atelier.jpg'
import creation1 from '@/assets/images/creation-1.jpg'
import creation2 from '@/assets/images/creation-2.jpg'
import creation3 from '@/assets/images/creation-3.jpg'
import creation4 from '@/assets/images/creation-4.jpg'
import creation5 from '@/assets/images/creation-5.jpg'
import heroImage from '@/assets/images/hero.jpg'

/** Données fictives — front only, à remplacer par l'API. */
export type MockCreation = {
  id: string
  titre: string
  atelierId: string
  atelier: string
  categorie: string
  ville: string
  prixIndicatif: number | null
  note: number
  avis: number
  image: string
  /** Angles / galerie (si absent, on retombe sur `image`). */
  images?: string[]
  /** Libellés d’angle alignés sur `images` (face, dos, côté…). */
  photoAngles?: Array<'face' | 'dos' | 'cote' | 'detail' | 'autre'>
  /** Description libre (créations styliste). */
  description?: string
  /** WhatsApp prioritaire (ex. numéro saisi à l’inscription styliste). */
  telephoneWhatsapp?: string
  /** Pour tri « Récentes » (ISO). */
  updatedAt?: string
  /** Notes/avis fictifs (créations styliste démo). */
  ratingsDemo?: boolean
}

export type MockAtelier = {
  id: string
  nom: string
  specialite: string
  specialites: string[]
  description: string
  ville: string
  quartier: string
  telephoneWhatsapp: string
  horaires: string
  creationsCount: number
  note: number
  avis: number
  verifie: boolean
  coverImage: string
  gallery: string[]
}

export const MOCK_CATEGORIES = [
  { id: 'tous', label: 'Tous', icon: 'Sparkles' },
  { id: 'robes', label: 'Robes', icon: 'Shirt' },
  { id: 'ensembles', label: 'Ensembles', icon: 'Layers' },
  { id: 'mariage', label: 'Mariage', icon: 'Heart' },
  { id: 'enfant', label: 'Enfant', icon: 'Baby' },
  { id: 'accessoires', label: 'Accessoires', icon: 'Gem' },
] as const

export const MOCK_ATELIERS: MockAtelier[] = [
  {
    id: 'a1',
    nom: 'Atelier Zaria',
    specialite: 'Robes & accessoires',
    specialites: ['Robes', 'Accessoires', 'Soirée'],
    description:
      'Créations élégantes et accessoires raffinés pour occasions spéciales. Sur mesure et finitions soignées.',
    ville: 'Cotonou',
    quartier: 'Haie Vive',
    telephoneWhatsapp: '+22990000001',
    horaires: 'Lun–Sam · 9h–18h',
    creationsCount: 24,
    note: 4.9,
    avis: 214,
    verifie: true,
    coverImage: accessoires,
    gallery: [accessoires, creation5, creation1],
  },
  {
    id: 'a2',
    nom: 'Maison Kéba',
    specialite: 'Ensembles homme',
    specialites: ['Ensembles', 'Costume', 'Traditionnel'],
    description:
      'Tenues masculines modernes et traditionnelles. Coupe précise, tissus sélectionnés.',
    ville: 'Porto-Novo',
    quartier: 'Ouando',
    telephoneWhatsapp: '+22990000002',
    horaires: 'Lun–Ven · 8h30–17h30',
    creationsCount: 18,
    note: 4.8,
    avis: 96,
    verifie: true,
    coverImage: creation2,
    gallery: [creation2, heroImage, atelierCover],
  },
  {
    id: 'a3',
    nom: 'Couture Fatou',
    specialite: 'Traditionnel & wax',
    specialites: ['Wax', 'Robes', 'Traditionnel'],
    description:
      'Spécialiste du wax et des robes traditionnelles. Pièces uniques inspirées du patrimoine.',
    ville: 'Cotonou',
    quartier: 'Akpakpa',
    telephoneWhatsapp: '+22990000003',
    horaires: 'Mar–Sam · 9h–19h',
    creationsCount: 31,
    note: 4.9,
    avis: 128,
    verifie: true,
    coverImage: creation1,
    gallery: [creation1, creation5, atelierCover],
  },
  {
    id: 'a4',
    nom: 'Petit Atelier',
    specialite: 'Mode enfant',
    specialites: ['Enfant', 'Baptême', 'Fête'],
    description:
      'Tenues confortables et festives pour enfants. Couleurs vives, tissus doux.',
    ville: 'Parakou',
    quartier: 'Zongo',
    telephoneWhatsapp: '',
    horaires: 'Lun–Sam · 10h–17h',
    creationsCount: 12,
    note: 4.7,
    avis: 54,
    verifie: false,
    coverImage: creation3,
    gallery: [creation3, creation1, accessoires],
  },
  {
    id: 'a5',
    nom: 'Studio Mariage',
    specialite: 'Mariage & cérémonie',
    specialites: ['Mariage', 'Cérémonie', 'Retouches'],
    description:
      'Robes de mariée et tenues de cérémonie sur mesure. Accompagnement personnalisé.',
    ville: 'Cotonou',
    quartier: 'Cadjehoun',
    telephoneWhatsapp: '+22990000005',
    horaires: 'Sur rendez-vous · Lun–Sam',
    creationsCount: 20,
    note: 5,
    avis: 67,
    verifie: true,
    coverImage: creation4,
    gallery: [creation4, creation1, heroImage],
  },
  {
    id: 'a6',
    nom: 'Atelier Aïcha',
    specialite: 'Sur mesure & atelier',
    specialites: ['Sur mesure', 'Retouches', 'Quotidien'],
    description:
      'Confection sur mesure, essayages et retouches. Un atelier de confiance au quotidien.',
    ville: 'Abomey-Calavi',
    quartier: 'Godomey',
    telephoneWhatsapp: '+22990000006',
    horaires: 'Lun–Sam · 8h–18h',
    creationsCount: 15,
    note: 4.8,
    avis: 89,
    verifie: true,
    coverImage: atelierCover,
    gallery: [atelierCover, heroImage, creation2],
  },
]

export const MOCK_CREATIONS: MockCreation[] = [
  {
    id: 'c1',
    titre: 'Robe traditionnelle Amina',
    atelierId: 'a3',
    atelier: 'Couture Fatou',
    categorie: 'Robes',
    ville: 'Cotonou',
    prixIndicatif: 85000,
    note: 4.9,
    avis: 128,
    image: creation1,
    images: [creation1, heroImage, creation4, atelierCover],
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'c2',
    titre: 'Ensemble homme Prestige',
    atelierId: 'a2',
    atelier: 'Maison Kéba',
    categorie: 'Ensembles',
    ville: 'Porto-Novo',
    prixIndicatif: 65000,
    note: 4.8,
    avis: 96,
    image: creation2,
    images: [creation2, heroImage, atelierCover, creation1],
    updatedAt: '2026-02-20T10:00:00.000Z',
  },
  {
    id: 'c3',
    titre: 'Robe enfant Soleil',
    atelierId: 'a4',
    atelier: 'Petit Atelier',
    categorie: 'Enfant',
    ville: 'Parakou',
    prixIndicatif: 18000,
    note: 4.7,
    avis: 54,
    image: creation3,
    images: [creation3, creation1, heroImage],
    updatedAt: '2026-02-10T10:00:00.000Z',
  },
  {
    id: 'c4',
    titre: 'Robe de mariée Céleste',
    atelierId: 'a5',
    atelier: 'Studio Mariage',
    categorie: 'Mariage',
    ville: 'Cotonou',
    prixIndicatif: 180000,
    note: 5,
    avis: 67,
    image: creation4,
    images: [creation4, creation1, heroImage, creation5],
    updatedAt: '2026-01-28T10:00:00.000Z',
  },
  {
    id: 'c5',
    titre: 'Parure Accessoires Luxe',
    atelierId: 'a1',
    atelier: 'Atelier Zaria',
    categorie: 'Accessoires',
    ville: 'Cotonou',
    prixIndicatif: 45000,
    note: 4.9,
    avis: 214,
    image: creation5,
    images: [creation5, accessoires, creation4],
    updatedAt: '2026-01-15T10:00:00.000Z',
  },
]

export const MOCK_FEATURES = [
  {
    title: 'Créations authentiques',
    description: 'Des pièces uniques, signées par des talents passionnés',
    icon: 'Shirt',
  },
  {
    title: 'Confection sur mesure',
    description: 'Des vêtements adaptés à vos envies et à vos mesures',
    icon: 'Ruler',
  },
  {
    title: 'Artisans vérifiés',
    description: 'Des couturières, couturiers et stylistes de confiance',
    icon: 'ShieldCheck',
  },
  {
    title: 'Contact WhatsApp',
    description: 'Échangez directement avec l’atelier pour votre confection',
    icon: 'MessageCircle',
  },
] as const

export const MOCK_STATS = [
  { value: '+ 2 500', label: 'Stylistes et couturiers actifs' },
  { value: '+ 18 000', label: 'Créations publiées' },
  { value: '+ 120', label: 'Ateliers à découvrir' },
  { value: '4,9/5', label: 'Note de satisfaction globale' },
] as const

export const CREATION_VILLES = [
  ...Array.from(new Set(MOCK_CREATIONS.map((c) => c.ville))),
]

export const ATELIER_VILLES = [
  ...Array.from(new Set(MOCK_ATELIERS.map((a) => a.ville))),
]

export function getAtelierById(id: string) {
  return MOCK_ATELIERS.find((atelier) => atelier.id === id)
}

export function getCreationsByAtelier(atelierId: string) {
  return MOCK_CREATIONS.filter((creation) => creation.atelierId === atelierId)
}

export function getCreationById(id: string) {
  return MOCK_CREATIONS.find((creation) => creation.id === id)
}

/** Photos de la création (angles), avec repli sur la couverture. */
export function getCreationImages(creation: MockCreation) {
  if (creation.images && creation.images.length > 0) return creation.images
  return [creation.image]
}

const ANGLE_LABELS: Record<NonNullable<MockCreation['photoAngles']>[number], string> = {
  face: 'Face',
  dos: 'Dos',
  cote: 'Côté',
  detail: 'Détail',
  autre: 'Autre',
}

/** Libellés d’angle alignés sur les photos (vide si non renseignés). */
export function getCreationPhotoLabels(creation: MockCreation) {
  const images = getCreationImages(creation)
  if (!creation.photoAngles?.length) return images.map(() => '')
  return images.map((_, index) => {
    const angle = creation.photoAngles?.[index]
    return angle ? ANGLE_LABELS[angle] : ''
  })
}
