import { MOCK_CREATIONS, type MockCreation } from '@/lib/mock-data'

const STORAGE_KEY = 'couturia.stylist.creations.v1'
const DEMO_ATELIER_ID = 'a3'
const DEMO_ATELIER_NAME = 'Couture Fatou'

export const PHOTO_ANGLES = [
  { id: 'face', label: 'Face' },
  { id: 'dos', label: 'Dos' },
  { id: 'cote', label: 'Côté' },
  { id: 'detail', label: 'Détail' },
  { id: 'autre', label: 'Autre' },
] as const

export type PhotoAngle = (typeof PHOTO_ANGLES)[number]['id']

export type StylistPhoto = {
  src: string
  angle: PhotoAngle
}

export type StylistCreationDraft = {
  id: string
  titre: string
  categorie: string
  ville: string
  atelier: string
  prixIndicatif: number | null
  description: string
  /** Photos avec angle optionnel — la 1re sert de couverture. */
  photos: StylistPhoto[]
  /** Miroir des src (compat visionneuse / catalogue). */
  images: string[]
  /** WhatsApp du styliste (inscription). */
  telephoneWhatsapp?: string
  published: boolean
  updatedAt: string
}

function parseAngle(value: unknown): PhotoAngle {
  const ids = PHOTO_ANGLES.map((item) => item.id)
  return ids.includes(value as PhotoAngle) ? (value as PhotoAngle) : 'autre'
}

function normalizePhotos(
  item: Partial<StylistCreationDraft> & { image?: string },
): StylistPhoto[] {
  if (Array.isArray(item.photos)) {
    return item.photos
      .map((photo) => {
        if (!photo || typeof photo !== 'object') return null
        const src = typeof photo.src === 'string' ? photo.src : ''
        if (!src) return null
        return { src, angle: parseAngle(photo.angle) }
      })
      .filter((photo): photo is StylistPhoto => photo != null)
  }

  const legacy = Array.isArray(item.images)
    ? item.images.filter((src): src is string => typeof src === 'string' && src.length > 0)
    : typeof item.image === 'string' && item.image.length > 0
      ? [item.image]
      : []

  return legacy.map((src) => ({ src, angle: 'autre' as const }))
}

function normalize(
  item: Partial<StylistCreationDraft> & { image?: string },
): StylistCreationDraft | null {
  const photos = normalizePhotos(item)
  const images = photos.map((photo) => photo.src)
  if (
    typeof item.id !== 'string' ||
    typeof item.titre !== 'string' ||
    typeof item.categorie !== 'string' ||
    typeof item.ville !== 'string' ||
    photos.length === 0
  ) {
    return null
  }
  return {
    id: item.id,
    titre: item.titre,
    categorie: item.categorie,
    ville: item.ville,
    atelier:
      typeof item.atelier === 'string' && item.atelier.trim()
        ? item.atelier
        : DEMO_ATELIER_NAME,
    prixIndicatif:
      typeof item.prixIndicatif === 'number' || item.prixIndicatif === null
        ? item.prixIndicatif
        : null,
    description: typeof item.description === 'string' ? item.description : '',
    photos,
    images,
    telephoneWhatsapp:
      typeof item.telephoneWhatsapp === 'string' && item.telephoneWhatsapp.trim()
        ? item.telephoneWhatsapp.trim()
        : undefined,
    published: Boolean(item.published),
    updatedAt:
      typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
  }
}

function readAll(): StylistCreationDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedFromMock()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return seedFromMock()
    const items = parsed
      .map((item) =>
        normalize(item as Partial<StylistCreationDraft> & { image?: string }),
      )
      .filter((item): item is StylistCreationDraft => item != null)
    return items.length > 0 ? items : seedFromMock()
  } catch {
    return seedFromMock()
  }
}

function seedFromMock(): StylistCreationDraft[] {
  const seeded = MOCK_CREATIONS.filter((c) => c.atelierId === DEMO_ATELIER_ID).map(
    (c) => ({
      id: c.id,
      titre: c.titre,
      categorie: c.categorie,
      ville: c.ville,
      atelier: c.atelier,
      prixIndicatif: c.prixIndicatif,
      description: `Création « ${c.titre} » proposée par ${c.atelier}.`,
      photos: [{ src: c.image, angle: 'face' as const }],
      images: [c.image],
      published: true,
      updatedAt: new Date().toISOString(),
    }),
  )
  persistStylistCreations(seeded)
  return seeded
}

function writeAll(items: StylistCreationDraft[]) {
  const result = persistStylistCreations(items)
  if (!result.ok) {
    throw new Error(result.message)
  }
}

export function listStylistCreations() {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getStylistCreation(id: string) {
  return readAll().find((item) => item.id === id)
}

export function saveStylistCreation(
  input: Omit<StylistCreationDraft, 'id' | 'updatedAt'> & { id?: string },
): { ok: true; item: StylistCreationDraft } | { ok: false; message: string } {
  try {
    const items = readAll()
    const now = new Date().toISOString()
    if (input.id) {
      const photos = input.photos?.length
        ? input.photos
        : (input.images ?? []).map((src) => ({ src, angle: 'autre' as const }))
      const next = items.map((item) =>
        item.id === input.id
          ? {
              ...item,
              ...input,
              id: input.id,
              photos,
              images: photos.map((photo) => photo.src),
              updatedAt: now,
            }
          : item,
      )
      writeAll(next)
      return { ok: true, item: next.find((item) => item.id === input.id)! }
    }

    const photos = input.photos?.length
      ? input.photos
      : (input.images ?? []).map((src) => ({ src, angle: 'autre' as const }))
    const created: StylistCreationDraft = {
      id: `sc-${Date.now()}`,
      titre: input.titre,
      categorie: input.categorie,
      ville: input.ville,
      atelier: input.atelier,
      prixIndicatif: input.prixIndicatif,
      description: input.description,
      photos,
      images: photos.map((photo) => photo.src),
      telephoneWhatsapp: input.telephoneWhatsapp,
      published: input.published,
      updatedAt: now,
    }
    writeAll([created, ...items])
    return { ok: true, item: created }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Impossible d’enregistrer. Réessayez.',
    }
  }
}

export function deleteStylistCreation(id: string) {
  writeAll(readAll().filter((item) => item.id !== id))
}

export function photoAngleLabel(angle: PhotoAngle) {
  return PHOTO_ANGLES.find((item) => item.id === angle)?.label ?? 'Autre'
}

export function stylistDraftToMock(draft: StylistCreationDraft): MockCreation {
  return {
    id: draft.id,
    titre: draft.titre,
    atelierId: DEMO_ATELIER_ID,
    atelier: draft.atelier || DEMO_ATELIER_NAME,
    categorie: draft.categorie,
    ville: draft.ville,
    prixIndicatif: draft.prixIndicatif,
    note: 0,
    avis: 0,
    image: draft.images[0] ?? '',
    images: draft.images,
    photoAngles: draft.photos.map((photo) => photo.angle),
    description: draft.description,
    telephoneWhatsapp: draft.telephoneWhatsapp,
    updatedAt: draft.updatedAt,
    ratingsDemo: true,
  }
}

export function persistStylistCreations(items: StylistCreationDraft[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    return { ok: true as const }
  } catch (error) {
    const quota =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    return {
      ok: false as const,
      quota,
      message: quota
        ? 'Espace insuffisant sur cet appareil. Supprimez des photos ou des créations, puis réessayez.'
        : 'Impossible d’enregistrer. Réessayez.',
    }
  }
}

export function resolveCreationById(id: string): MockCreation | undefined {
  const draft = getStylistCreation(id)
  if (draft?.id.startsWith('sc-')) {
    return draft.published ? stylistDraftToMock(draft) : undefined
  }
  const fromMock = MOCK_CREATIONS.find((creation) => creation.id === id)
  if (fromMock) return fromMock
  return draft?.published ? stylistDraftToMock(draft) : undefined
}

export const STYLIST_DEMO = {
  atelierId: DEMO_ATELIER_ID,
  atelierName: DEMO_ATELIER_NAME,
}

/** Nombre max de photos pour un tour 360° (démo locale). */
export const MAX_CREATION_PHOTOS = 24

/** Compresse une image téléphone pour la démo locale (localStorage). */
export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Fichier image requis'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Lecture impossible'))
    reader.onload = () => {
      const src = String(reader.result || '')
      const img = new Image()
      img.onload = () => {
        // Plus compact pour permettre un vrai tour 360° (jusqu’à 24 photos)
        const maxSide = 900
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
        const width = Math.max(1, Math.round(img.width * scale))
        const height = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(src)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.62))
      }
      img.onerror = () => reject(new Error('Image invalide'))
      img.src = src
    }
    reader.readAsDataURL(file)
  })
}
