import { MOCK_CREATIONS, type MockCreation } from '@/lib/mock-data'

const STORAGE_KEY = 'couturia.stylist.creations.v1'
const DEMO_ATELIER_ID = 'a3'
const DEMO_ATELIER_NAME = 'Couture Fatou'

export type StylistCreationDraft = {
  id: string
  titre: string
  categorie: string
  ville: string
  prixIndicatif: number | null
  description: string
  image: string
  published: boolean
  updatedAt: string
}

function readAll(): StylistCreationDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedFromMock()
    const parsed = JSON.parse(raw) as StylistCreationDraft[]
    if (!Array.isArray(parsed)) return seedFromMock()
    return parsed
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
      prixIndicatif: c.prixIndicatif,
      description: `Création « ${c.titre} » proposée par ${c.atelier}.`,
      image: c.image,
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
    prixIndicatif: input.prixIndicatif,
    description: input.description,
    image: input.image,
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
    atelier: DEMO_ATELIER_NAME,
    categorie: draft.categorie,
    ville: draft.ville,
    prixIndicatif: draft.prixIndicatif,
    note: 4.8,
    avis: 12,
    image: draft.image,
  }
}

export const STYLIST_DEMO = {
  atelierId: DEMO_ATELIER_ID,
  atelierName: DEMO_ATELIER_NAME,
}
