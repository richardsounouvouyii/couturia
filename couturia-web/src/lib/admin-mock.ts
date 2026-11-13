import accessoires from '@/assets/images/accessoires.jpg'
import atelier from '@/assets/images/atelier.jpg'
import creation1 from '@/assets/images/creation-1.jpg'
import creation2 from '@/assets/images/creation-2.jpg'
import creation3 from '@/assets/images/creation-3.jpg'
import creation4 from '@/assets/images/creation-4.jpg'
import creation5 from '@/assets/images/creation-5.jpg'
import hero from '@/assets/images/hero.jpg'

/** Données mock pour le front admin (API plus tard). */

/** Champs visibles sur la slide (utile mobile : tout ne tient pas). */
export type AdminSlideDisplay = {
  showTitre: boolean
  showDescription: boolean
  showPrix: boolean
  showBouton: boolean
}

export type AdminSlide = {
  id: string
  titre: string
  sousTitre: string
  ctaLabel: string
  ctaHref: string
  /** Prix indicatif affiché sur la slide (optionnel). */
  prix: number | null
  image: string
  ordre: number
  active: boolean
  debut: string
  fin: string
  display: AdminSlideDisplay
}

export const DEFAULT_SLIDE_DISPLAY: AdminSlideDisplay = {
  showTitre: true,
  showDescription: true,
  showPrix: true,
  showBouton: true,
}

/** Destinations utiles pour une slide publique (pas login / favoris). */
export const SLIDE_LINK_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '/catalogue', label: 'Créations' },
  { value: '/catalogue?categorie=robes', label: 'Créations · Robes' },
  { value: '/catalogue?categorie=mariage', label: 'Créations · Mariage' },
  { value: '/catalogue?categorie=ensembles', label: 'Créations · Ensembles' },
  { value: '/catalogue?categorie=enfant', label: 'Créations · Enfant' },
  { value: '/catalogue?categorie=accessoires', label: 'Créations · Accessoires' },
  { value: '/ateliers', label: 'Stylistes' },
  { value: '/inscription?role=styliste', label: 'Devenir styliste' },
]

export type AdminBanner = {
  id: string
  titre: string
  sousTitre: string
  image: string
}

export type AdminActivityKind = 'edit' | 'add' | 'disable' | 'reorder'

export type AdminActivity = {
  id: string
  kind: AdminActivityKind
  title: string
  detail: string
  actor: string
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
    id: 'stylistes',
    label: 'Stylistes',
    value: '1 256',
    delta: '+12,7%',
    positive: true,
  },
  {
    id: 'creations',
    label: 'Créations',
    value: '8 934',
    delta: '+6,1%',
    positive: true,
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    value: '12 846',
    delta: '+8,4%',
    positive: true,
  },
  {
    id: 'slides',
    label: 'Slides actives',
    value: '4',
    delta: 'sur 5',
    positive: true,
  },
]

export const ADMIN_SLIDES: AdminSlide[] = [
  {
    id: 's1',
    titre: 'Nouvelle collection wax',
    sousTitre:
      'Découvrez les pièces des ateliers partenaires, inspirées du patrimoine et pensées pour le quotidien comme pour les occasions spéciales',
    ctaLabel: 'Voir les créations',
    ctaHref: '/catalogue',
    prix: 45000,
    image: creation1,
    ordre: 1,
    active: true,
    debut: '2026-11-01',
    fin: '2026-12-31',
    display: {
      showTitre: true,
      showDescription: true,
      showPrix: true,
      showBouton: true,
    },
  },
  {
    id: 's2',
    titre: 'Stylistes près de chez vous',
    sousTitre: 'Contactez-les directement sur WhatsApp',
    ctaLabel: 'Trouver un styliste',
    ctaHref: '/ateliers',
    prix: null,
    image: atelier,
    ordre: 2,
    active: true,
    debut: '2026-10-15',
    fin: '2026-12-15',
    // Exemple mobile : pas de description pour garder l’image lisible
    display: {
      showTitre: true,
      showDescription: false,
      showPrix: false,
      showBouton: true,
    },
  },
  {
    id: 's3',
    titre: 'Sur mesure & mariage',
    sousTitre: 'Des robes uniques pour vos grands jours',
    ctaLabel: 'Explorer',
    ctaHref: '/catalogue?categorie=mariage',
    prix: 120000,
    image: creation5,
    ordre: 3,
    active: true,
    debut: '2026-09-01',
    fin: '2027-01-31',
    display: {
      showTitre: true,
      showDescription: true,
      showPrix: true,
      showBouton: true,
    },
  },
  {
    id: 's4',
    titre: 'Devenez styliste Couturia',
    sousTitre: 'Publiez votre vitrine et gagnez en visibilité',
    ctaLabel: 'Créer ma vitrine',
    ctaHref: '/inscription?role=styliste',
    prix: null,
    image: hero,
    ordre: 4,
    active: true,
    debut: '2026-08-01',
    fin: '2026-12-31',
    display: { ...DEFAULT_SLIDE_DISPLAY, showPrix: false },
  },
  {
    id: 's5',
    titre: 'Promo fin d’année',
    sousTitre: 'Bientôt disponible',
    ctaLabel: 'En savoir plus',
    ctaHref: '/',
    prix: 25000,
    image: creation3,
    ordre: 5,
    active: false,
    debut: '2026-12-01',
    fin: '2026-12-31',
    display: { ...DEFAULT_SLIDE_DISPLAY },
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
    kind: 'edit',
    title: 'Slide modifiée',
    detail: 'Nouvelle collection wax',
    actor: 'Admin Couturia',
    when: 'Il y a 12 min',
  },
  {
    id: 'a2',
    kind: 'add',
    title: 'Bannière ajoutée',
    detail: 'Devenir styliste',
    actor: 'Admin Couturia',
    when: 'Il y a 1 h',
  },
  {
    id: 'a3',
    kind: 'disable',
    title: 'Slide désactivée',
    detail: 'Promo fin d’année',
    actor: 'Admin Couturia',
    when: 'Hier · 18:42',
  },
  {
    id: 'a4',
    kind: 'reorder',
    title: 'Ordre mis à jour',
    detail: 'Carousel principal',
    actor: 'Admin Couturia',
    when: 'Hier · 09:15',
  },
]

/** ——— Clients (gestion admin) ——— */
/** Aligné sur l’inscription publique : nom, e-mail (+ mdp), rôle client. */

export type AdminClientStatus = 'actif' | 'suspendu'

export type AdminClient = {
  id: string
  code: string
  nom: string
  email: string
  inscritLe: string
  statut: AdminClientStatus
  notes: string
  avatar: string
}

export type AdminFeedItem = {
  id: string
  text: string
  when: string
  kind?: 'signup' | 'login' | 'suspend' | 'reactivate' | 'atelier'
}

/** @deprecated alias — préférer AdminFeedItem */
export type AdminClientFeedItem = AdminFeedItem

export const ADMIN_CLIENT_KPIS: AdminKpi[] = [
  {
    id: 'total',
    label: 'Clients total',
    value: '12 846',
    delta: '+8,4%',
    positive: true,
  },
  {
    id: 'nouveaux',
    label: 'Nouveaux ce mois',
    value: '1 256',
    delta: '+12,7%',
    positive: true,
  },
  {
    id: 'actifs',
    label: 'Clients actifs',
    value: '11 902',
    delta: '+6,1%',
    positive: true,
  },
  {
    id: 'suspendus',
    label: 'Clients suspendus',
    value: '94',
    delta: '+2,3%',
    positive: false,
  },
]

export const ADMIN_CLIENT_FEED: AdminClientFeedItem[] = [
  {
    id: 'f1',
    kind: 'signup',
    text: 'Fatouma Sanni a créé un compte client',
    when: 'Il y a 8 min',
  },
  {
    id: 'f2',
    kind: 'login',
    text: 'Jeanine Ahouansou s’est connectée',
    when: 'Il y a 22 min',
  },
  {
    id: 'f3',
    kind: 'reactivate',
    text: 'Compte de Brice Dossou réactivé',
    when: 'Il y a 1 h',
  },
  {
    id: 'f4',
    kind: 'suspend',
    text: 'Compte de Koffi Mensah suspendu',
    when: 'Hier · 16:05',
  },
]

export const ADMIN_CLIENTS: AdminClient[] = [
  {
    id: 'c1',
    code: 'CLI-10458',
    nom: 'Aicha Koudjo',
    email: 'aicha.koudjo@email.com',
    inscritLe: '2025-12-14',
    statut: 'actif',
    notes: 'Compte actif, parcours catalogue régulier.',
    avatar: creation1,
  },
  {
    id: 'c2',
    code: 'CLI-10412',
    nom: 'Jeanine Ahouansou',
    email: 'jeanine.a@email.com',
    inscritLe: '2026-02-03',
    statut: 'actif',
    notes: '',
    avatar: creation2,
  },
  {
    id: 'c3',
    code: 'CLI-10390',
    nom: 'Brice Dossou',
    email: 'brice.dossou@email.com',
    inscritLe: '2026-06-18',
    statut: 'actif',
    notes: '',
    avatar: atelier,
  },
  {
    id: 'c4',
    code: 'CLI-10355',
    nom: 'Fatouma Sanni',
    email: 'fatouma.sanni@email.com',
    inscritLe: '2026-10-02',
    statut: 'actif',
    notes: 'Nouveau compte.',
    avatar: creation3,
  },
  {
    id: 'c5',
    code: 'CLI-10288',
    nom: 'Koffi Mensah',
    email: 'koffi.mensah@email.com',
    inscritLe: '2026-08-21',
    statut: 'suspendu',
    notes: 'Compte suspendu suite à signalements.',
    avatar: creation4,
  },
  {
    id: 'c6',
    code: 'CLI-10241',
    nom: 'Mariama Toko',
    email: 'mariama.toko@email.com',
    inscritLe: '2025-05-09',
    statut: 'actif',
    notes: '',
    avatar: creation5,
  },
  {
    id: 'c7',
    code: 'CLI-10197',
    nom: 'Serge Agossou',
    email: 'serge.agossou@email.com',
    inscritLe: '2026-01-27',
    statut: 'actif',
    notes: '',
    avatar: hero,
  },
  {
    id: 'c8',
    code: 'CLI-10150',
    nom: 'Grace Hounsou',
    email: 'grace.hounsou@email.com',
    inscritLe: '2025-11-01',
    statut: 'actif',
    notes: '',
    avatar: accessoires,
  },
]

/** ——— Stylistes / ateliers (gestion admin) ——— */

export type AdminStylisteStatus = 'verifie' | 'actif' | 'en_attente' | 'suspendu'

export type AdminStyliste = {
  id: string
  code: string
  /** Nom complet du compte */
  nom: string
  email: string
  /** Nom de l’atelier vitrine */
  atelierNom: string
  specialite: string
  ville: string
  quartier: string
  whatsapp: string
  creations: number
  vues: number
  noteMoyenne: number | null
  derniereActivite: string
  inscritLe: string
  statut: AdminStylisteStatus
  isPublic: boolean
  notes: string
  avatar: string
  couverture: string
}

export const ADMIN_STYLISTE_KPIS: AdminKpi[] = [
  {
    id: 'total',
    label: 'Stylistes total',
    value: '1 256',
    delta: '+12,7%',
    positive: true,
  },
  {
    id: 'actifs',
    label: 'Ateliers publics',
    value: '1 102',
    delta: '+6,1%',
    positive: true,
  },
  {
    id: 'attente',
    label: 'En attente',
    value: '48',
    delta: '+4',
    positive: false,
  },
  {
    id: 'suspendus',
    label: 'Suspendus',
    value: '31',
    delta: '-2',
    positive: true,
  },
]

export const ADMIN_STYLISTE_FEED: AdminFeedItem[] = [
  {
    id: 'sf1',
    kind: 'atelier',
    text: 'Atelier Aïcha a publié une nouvelle création',
    when: 'Il y a 15 min',
  },
  {
    id: 'sf2',
    kind: 'atelier',
    text: 'Maison Wax Porto a mis à jour son WhatsApp',
    when: 'Il y a 1 h',
  },
  {
    id: 'sf3',
    kind: 'atelier',
    text: 'Studio Bohicon attend une validation admin',
    when: 'Hier · 17:20',
  },
  {
    id: 'sf4',
    kind: 'atelier',
    text: 'Couture Calavi a passé sa vitrine en public',
    when: 'Hier · 09:40',
  },
]

export const ADMIN_STYLISTES: AdminStyliste[] = [
  {
    id: 'st1',
    code: 'STY-2041',
    nom: 'Aïcha Mensah',
    email: 'aicha.mensah@email.com',
    atelierNom: 'Atelier Aïcha',
    specialite: 'Robes & wax',
    ville: 'Cotonou',
    quartier: 'Haie Vive',
    whatsapp: '+229 97 11 22 33',
    creations: 24,
    vues: 1840,
    noteMoyenne: 4.8,
    derniereActivite: "Aujourd'hui à 11 h 10",
    inscritLe: '2025-09-12',
    statut: 'verifie',
    isPublic: true,
    notes: 'Très bonne vitrine, réponses WhatsApp rapides.',
    avatar: creation1,
    couverture: atelier,
  },
  {
    id: 'st2',
    code: 'STY-2033',
    nom: 'Pauline Toko',
    email: 'pauline.toko@email.com',
    atelierNom: 'Maison Wax Porto',
    specialite: 'Mariage',
    ville: 'Porto-Novo',
    quartier: 'Ouando',
    whatsapp: '+229 96 44 55 66',
    creations: 11,
    vues: 920,
    noteMoyenne: 4.5,
    derniereActivite: 'Hier à 19 h 02',
    inscritLe: '2026-01-20',
    statut: 'actif',
    isPublic: true,
    notes: 'Spécialisée mariage, photos à renforcer.',
    avatar: creation5,
    couverture: creation2,
  },
  {
    id: 'st3',
    code: 'STY-2018',
    nom: 'Serge Agbo',
    email: 'serge.agbo@email.com',
    atelierNom: 'Studio Bohicon',
    specialite: 'Ensembles homme',
    ville: 'Bohicon',
    quartier: 'Centre',
    whatsapp: '+229 61 22 33 44',
    creations: 3,
    vues: 210,
    noteMoyenne: null,
    derniereActivite: 'Il y a 2 jours',
    inscritLe: '2026-10-28',
    statut: 'en_attente',
    isPublic: false,
    notes: 'Dossier incomplet — logo manquant.',
    avatar: creation3,
    couverture: hero,
  },
  {
    id: 'st4',
    code: 'STY-2005',
    nom: 'Fatim Diallo',
    email: 'fatim.diallo@email.com',
    atelierNom: 'Couture Calavi',
    specialite: 'Enfant & accessoires',
    ville: 'Abomey-Calavi',
    quartier: 'Godomey',
    whatsapp: '+229 95 70 18 22',
    creations: 17,
    vues: 1310,
    noteMoyenne: 4.2,
    derniereActivite: "Aujourd'hui à 08 h 40",
    inscritLe: '2025-11-03',
    statut: 'actif',
    isPublic: true,
    notes: '',
    avatar: creation4,
    couverture: accessoires,
  },
  {
    id: 'st5',
    code: 'STY-1990',
    nom: 'Koffi Zinsou',
    email: 'koffi.zinsou@email.com',
    atelierNom: 'Zinsou Mode',
    specialite: 'Sur mesure',
    ville: 'Cotonou',
    quartier: 'Akpakpa',
    whatsapp: '+229 97 00 11 22',
    creations: 0,
    vues: 45,
    noteMoyenne: null,
    derniereActivite: 'Il y a 3 semaines',
    inscritLe: '2026-07-14',
    statut: 'suspendu',
    isPublic: false,
    notes: 'Suspendu suite à plaintes clients.',
    avatar: atelier,
    couverture: creation1,
  },
  {
    id: 'st6',
    code: 'STY-1977',
    nom: 'Grace Hounsou',
    email: 'grace.atelier@email.com',
    atelierNom: 'Grace Couture Ouidah',
    specialite: 'Wax contemporain',
    ville: 'Ouidah',
    quartier: 'Centre historique',
    whatsapp: '+229 66 88 99 00',
    creations: 31,
    vues: 2560,
    noteMoyenne: 4.9,
    derniereActivite: 'Hier à 12 h 15',
    inscritLe: '2025-04-18',
    statut: 'verifie',
    isPublic: true,
    notes: 'Ambassadrice locale — très recommandée.',
    avatar: hero,
    couverture: creation5,
  },
]
