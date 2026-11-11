import { MOCK_CREATIONS, type MockCreation } from '@/lib/mock-data'
import {
  getStylistCreation,
  listStylistCreations,
  stylistDraftToMock,
} from '@/lib/stylist-creations'

/**
 * Source unique des créations publiques :
 * mock + créations styliste publiées (ids `sc-*`).
 */
export function listPublicCreations(): MockCreation[] {
  const stylistPublished = listStylistCreations()
    .filter((item) => item.published && item.id.startsWith('sc-'))
    .map(stylistDraftToMock)

  const byId = new Map<string, MockCreation>()
  for (const item of MOCK_CREATIONS) byId.set(item.id, item)
  // Les nouvelles pièces styliste passent devant
  for (const item of stylistPublished) byId.set(item.id, item)

  return Array.from(byId.values()).sort((a, b) => {
    const aStylist = a.id.startsWith('sc-') ? 1 : 0
    const bStylist = b.id.startsWith('sc-') ? 1 : 0
    if (aStylist !== bStylist) return bStylist - aStylist
    return a.titre.localeCompare(b.titre, 'fr')
  })
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

export function listPublicCreationsByAtelier(atelierId: string): MockCreation[] {
  return listPublicCreations().filter((item) => item.atelierId === atelierId)
}

export function getCreationContactPhone(creation: MockCreation): string {
  if (creation.telephoneWhatsapp?.trim()) return creation.telephoneWhatsapp.trim()
  return ''
}
