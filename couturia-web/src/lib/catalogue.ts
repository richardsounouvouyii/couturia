import {
  fetchCreation,
  listCreations,
  type CreationPublic,
} from '@/lib/api/catalogue'
import { fetchAtelier, listAteliers } from '@/lib/api/atelier'
import { MOCK_CREATIONS, type MockCreation } from '@/lib/mock-data'
import {
  getStylistCreation,
  listStylistCreations,
  stylistDraftToMock,
} from '@/lib/stylist-creations'

/** Image de secours quand l’API n’a pas encore de photo serveur. */
export const CREATION_IMAGE_PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
      <rect width="600" height="800" fill="#f7eef2"/>
      <text x="300" y="390" text-anchor="middle" fill="#700D39" font-family="Georgia, serif" font-size="36">Couturia</text>
      <text x="300" y="430" text-anchor="middle" fill="#8a6a75" font-family="sans-serif" font-size="16">Photo à venir</text>
    </svg>`,
  )

function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  )
}

function recentScore(id: string, updatedAt?: string) {
  const fromDate = Date.parse(updatedAt ?? '') || 0
  const fromId = id.startsWith('sc-') ? Number(id.slice(3)) || 0 : 0
  return Math.max(fromDate, fromId)
}

function sortCreations(items: MockCreation[]): MockCreation[] {
  return [...items].sort((a, b) => {
    const diff = recentScore(b.id, b.updatedAt) - recentScore(a.id, a.updatedAt)
    if (diff !== 0) return diff
    const aStylist = a.id.startsWith('sc-') || a.ratingsDemo || isUuid(a.id) ? 1 : 0
    const bStylist = b.id.startsWith('sc-') || b.ratingsDemo || isUuid(b.id) ? 1 : 0
    if (aStylist !== bStylist) return bStylist - aStylist
    return a.titre.localeCompare(b.titre, 'fr')
  })
}

/** Convertit une création API vers le format UI existant. */
export function apiCreationToMock(
  item: CreationPublic,
  extras?: {
    atelierName?: string
    phone?: string
    localImages?: string[]
  },
): MockCreation {
  const apiImages =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : item.image_url
        ? [item.image_url]
        : []
  // Priorité aux URLs serveur (visibles par tous)
  const images =
    apiImages.length > 0
      ? apiImages
      : extras?.localImages && extras.localImages.length > 0
        ? extras.localImages
        : [CREATION_IMAGE_PLACEHOLDER]

  return {
    id: item.id,
    titre: item.titre,
    atelierId: item.atelier_id,
    atelier: extras?.atelierName || 'Atelier',
    categorie: item.category?.nom || 'Création',
    ville: item.ville || '',
    prixIndicatif: item.prix_indicatif,
    note: 0,
    avis: 0,
    image: images[0],
    images,
    description: item.description ?? undefined,
    telephoneWhatsapp: extras?.phone,
    updatedAt: item.created_at,
    ratingsDemo: true,
  }
}

/**
 * Source sync (même appareil) :
 * mock + créations styliste locales publiées.
 */
export function listPublicCreations(): MockCreation[] {
  const stylistPublished = listStylistCreations()
    .filter((item) => item.published && item.id.startsWith('sc-'))
    .map(stylistDraftToMock)

  const byId = new Map<string, MockCreation>()
  for (const item of MOCK_CREATIONS) byId.set(item.id, item)
  for (const item of stylistPublished) byId.set(item.id, item)
  return sortCreations(Array.from(byId.values()))
}

/**
 * Source complète : API catalogue + mocks + photos locales si dispo.
 */
export async function listPublicCreationsMerged(): Promise<MockCreation[]> {
  const local = listStylistCreations()
  const localByCatalogueId = new Map(
    local
      .filter((item) => item.catalogueId)
      .map((item) => [item.catalogueId!, item]),
  )

  let apiItems: CreationPublic[] = []
  try {
    apiItems = await listCreations()
  } catch {
    apiItems = []
  }

  let atelierNameById = new Map<string, string>()
  let atelierPhoneById = new Map<string, string>()
  try {
    const ateliers = await listAteliers()
    atelierNameById = new Map(ateliers.map((a) => [a.id, a.nom]))
    atelierPhoneById = new Map(
      ateliers
        .filter((a) => a.telephone_whatsapp)
        .map((a) => [a.id, a.telephone_whatsapp!]),
    )
  } catch {
    // annuaire ateliers indispo : on garde les noms locaux / défaut
  }

  const byId = new Map<string, MockCreation>()
  for (const item of MOCK_CREATIONS) byId.set(item.id, item)

  for (const item of apiItems) {
    const draft = localByCatalogueId.get(item.id)
    byId.set(
      item.id,
      apiCreationToMock(item, {
        atelierName: draft?.atelier || atelierNameById.get(item.atelier_id),
        phone:
          draft?.telephoneWhatsapp || atelierPhoneById.get(item.atelier_id) || undefined,
        localImages: draft?.images,
      }),
    )
  }

  // Pièces locales pas encore (ou plus) vues via API
  for (const draft of local.filter((item) => item.published)) {
    if (draft.catalogueId && byId.has(draft.catalogueId)) continue
    byId.set(draft.id, stylistDraftToMock(draft))
  }

  return sortCreations(Array.from(byId.values()))
}

export function resolvePublicCreationById(id: string): MockCreation | undefined {
  if (id.startsWith('sc-')) {
    const draft = getStylistCreation(id)
    return draft?.published ? stylistDraftToMock(draft) : undefined
  }
  const fromMock = MOCK_CREATIONS.find((item) => item.id === id)
  if (fromMock) return fromMock
  const draft = getStylistCreation(id)
  return draft?.published ? stylistDraftToMock(draft) : undefined
}

export async function resolvePublicCreationByIdAsync(
  id: string,
): Promise<MockCreation | undefined> {
  const sync = resolvePublicCreationById(id)
  if (sync) return sync

  if (!isUuid(id)) return undefined

  try {
    const item = await fetchCreation(id)
    const local = listStylistCreations().find((draft) => draft.catalogueId === id)
    let atelierName: string | undefined
    let phone: string | undefined
    try {
      const atelier = await fetchAtelier(item.atelier_id)
      atelierName = atelier.nom
      phone = atelier.telephone_whatsapp ?? undefined
    } catch {
      // ignore
    }
    return apiCreationToMock(item, {
      atelierName: local?.atelier || atelierName,
      phone: local?.telephoneWhatsapp || phone,
      localImages: local?.images,
    })
  } catch {
    return undefined
  }
}

export function listPublicCreationsByAtelier(atelierId: string): MockCreation[] {
  return listPublicCreations().filter((item) => item.atelierId === atelierId)
}

export async function listPublicCreationsByAtelierMerged(
  atelierId: string,
): Promise<MockCreation[]> {
  const all = await listPublicCreationsMerged()
  return all.filter((item) => item.atelierId === atelierId)
}

/** Créations API d’un atelier styliste (+ photos locales si présentes). */
export async function listAtelierCreationsMerged(
  atelierId: string,
): Promise<MockCreation[]> {
  const local = listStylistCreations()
  const localByCatalogueId = new Map(
    local
      .filter((item) => item.catalogueId)
      .map((item) => [item.catalogueId!, item]),
  )

  let apiItems: CreationPublic[] = []
  try {
    apiItems = await listCreations({ atelier_id: atelierId })
  } catch {
    apiItems = []
  }

  const fromApi = apiItems.map((item) => {
    const draft = localByCatalogueId.get(item.id)
    return apiCreationToMock(item, {
      atelierName: draft?.atelier,
      phone: draft?.telephoneWhatsapp,
      localImages: draft?.images,
    })
  })

  const apiIds = new Set(fromApi.map((item) => item.id))
  const localOnly = local
    .filter((draft) => draft.published)
    .filter((draft) => !draft.catalogueId || !apiIds.has(draft.catalogueId))
    .map(stylistDraftToMock)

  return sortCreations([...fromApi, ...localOnly])
}

export function getCreationContactPhone(creation: MockCreation): string {
  if (creation.telephoneWhatsapp?.trim()) return creation.telephoneWhatsapp.trim()
  return ''
}
