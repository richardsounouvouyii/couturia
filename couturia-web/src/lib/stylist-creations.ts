import { MOCK_CREATIONS, type MockCreation } from '@/lib/mock-data'

const STORAGE_KEY = 'couturia.stylist.creations.v1'
const DEMO_ATELIER_ID = 'a3'
const DEMO_ATELIER_NAME = 'Couture Fatou'

export type StylistCreationDraft = {
  id: string
  titre: string
  categorie: string
  ville: string
  atelier: string
  prixIndicatif: number | null
  description: string
  /** Photos (angles) — la 1re sert de couverture. */
  images: string[]
  published: boolean
  updatedAt: string
}

function normalizeImages(item: Partial<StylistCreationDraft> & { image?: string }) {
  if (Array.isArray(item.images)) {
    return item.images.filter((src): src is string => typeof src === 'string' && src.length > 0)
  }
  if (typeof item.image === 'string' && item.image.length > 0) {
    return [item.image]
  }
  return []
}

function normalize(
  item: Partial<StylistCreationDraft> & { image?: string },
): StylistCreationDraft | null {
  const images = normalizeImages(item)
  if (
    typeof item.id !== 'string' ||
    typeof item.titre !== 'string' ||
    typeof item.categorie !== 'string' ||
    typeof item.ville !== 'string' ||
    images.length === 0
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
    images,
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
      images: [c.image],
      published: true,
      updatedAt: new Date().toISOString(),
    }),
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
  return seeded
}

function writeAll(items: StylistCreationDraft[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function listStylistCreations() {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getStylistCreation(id: string) {
  return readAll().find((item) => item.id === id)
}

export function saveStylistCreation(
  input: Omit<StylistCreationDraft, 'id' | 'updatedAt'> & { id?: string },
) {
  const items = readAll()
  const now = new Date().toISOString()
  if (input.id) {
    const next = items.map((item) =>
      item.id === input.id ? { ...item, ...input, id: input.id, updatedAt: now } : item,
    )
    writeAll(next)
    return next.find((item) => item.id === input.id)!
  }

  const created: StylistCreationDraft = {
    id: `sc-${Date.now()}`,
    titre: input.titre,
    categorie: input.categorie,
    ville: input.ville,
    atelier: input.atelier,
    prixIndicatif: input.prixIndicatif,
    description: input.description,
    images: input.images,
    published: input.published,
    updatedAt: now,
  }
  writeAll([created, ...items])
  return created
}

export function deleteStylistCreation(id: string) {
  writeAll(readAll().filter((item) => item.id !== id))
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
    note: 4.8,
    avis: 12,
    image: draft.images[0] ?? '',
  }
}

export const STYLIST_DEMO = {
  atelierId: DEMO_ATELIER_ID,
  atelierName: DEMO_ATELIER_NAME,
}

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
        const maxSide = 1100
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
        resolve(canvas.toDataURL('image/jpeg', 0.72))
      }
      img.onerror = () => reject(new Error('Image invalide'))
      img.src = src
    }
    reader.readAsDataURL(file)
  })
}
