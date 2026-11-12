import { ApiError, apiRequest } from '@/lib/api/http'

export type CreationStatus = 'brouillon' | 'publiee' | 'masquee'

export type CategoryPublic = {
  id: string
  slug: string
  nom: string
  created_at: string
}

export type CreationPublic = {
  id: string
  atelier_id: string
  category_id: string
  titre: string
  description: string | null
  prix_indicatif: number | null
  devise: string
  image_url: string | null
  images: string[]
  ville: string | null
  status: CreationStatus
  is_public: boolean
  created_at: string
  category?: CategoryPublic | null
}

export type CreationCreateInput = {
  atelier_id: string
  category_id: string
  titre: string
  description?: string | null
  prix_indicatif?: number | null
  devise?: string
  image_url?: string | null
  images?: string[]
  ville?: string | null
  status?: CreationStatus
  is_public?: boolean
}

const CATALOGUE_API_URL = (
  import.meta.env.VITE_CATALOGUE_API_URL as string | undefined
)?.replace(/\/$/, '')

function requireCatalogueBaseUrl(): string {
  if (!CATALOGUE_API_URL) {
    throw new Error(
      'VITE_CATALOGUE_API_URL manquant. Copie .env.example vers .env (catalogue :8003).',
    )
  }
  return CATALOGUE_API_URL
}

/** GET /api/categories */
export function listCategories(): Promise<CategoryPublic[]> {
  return apiRequest<CategoryPublic[]>(requireCatalogueBaseUrl(), '/api/categories')
}

/** POST /api/categories */
export function createCategory(input: {
  slug: string
  nom: string
}): Promise<CategoryPublic> {
  return apiRequest<CategoryPublic>(requireCatalogueBaseUrl(), '/api/categories', {
    method: 'POST',
    body: input,
  })
}

/** GET /api/creations */
export function listCreations(filters?: {
  category_id?: string
  atelier_id?: string
  ville?: string
  q?: string
}): Promise<CreationPublic[]> {
  const params = new URLSearchParams()
  if (filters?.category_id) params.set('category_id', filters.category_id)
  if (filters?.atelier_id) params.set('atelier_id', filters.atelier_id)
  if (filters?.ville) params.set('ville', filters.ville)
  if (filters?.q) params.set('q', filters.q)
  const query = params.toString()
  return apiRequest<CreationPublic[]>(
    requireCatalogueBaseUrl(),
    `/api/creations${query ? `?${query}` : ''}`,
  )
}

/** GET /api/creations/{id} */
export function fetchCreation(creationId: string): Promise<CreationPublic> {
  return apiRequest<CreationPublic>(
    requireCatalogueBaseUrl(),
    `/api/creations/${creationId}`,
  )
}

/** POST /api/creations */
export function createCreation(
  input: CreationCreateInput,
): Promise<CreationPublic> {
  return apiRequest<CreationPublic>(requireCatalogueBaseUrl(), '/api/creations', {
    method: 'POST',
    body: input,
  })
}

/** Retrouve une catégorie par slug, ou la crée si absente. */
export async function ensureCategory(input: {
  slug: string
  nom: string
}): Promise<CategoryPublic> {
  const existing = await listCategories()
  const found = existing.find((item) => item.slug === input.slug)
  if (found) return found
  try {
    return await createCategory(input)
  } catch {
    // Course possible : recharger la liste
    const again = await listCategories()
    const retry = again.find((item) => item.slug === input.slug)
    if (retry) return retry
    throw new Error(`Catégorie « ${input.nom} » introuvable.`)
  }
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, payload] = dataUrl.split(',')
  const mime = /data:(.*?);/.exec(header)?.[1] || 'image/jpeg'
  const binary = atob(payload)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

/** POST /api/media/upload (multipart) → URLs publiques (ordre conservé). */
export async function uploadCreationImages(sources: string[]): Promise<string[]> {
  if (sources.length === 0) {
    throw new Error('Aucune image à envoyer.')
  }

  const alreadyRemote = sources.map(
    (src) => src.startsWith('http://') || src.startsWith('https://'),
  )
  const toUploadIndexes = sources
    .map((src, index) => ({ src, index }))
    .filter((item) => !alreadyRemote[item.index])

  if (toUploadIndexes.length === 0) {
    return sources
  }

  const form = new FormData()
  toUploadIndexes.forEach(({ src }, uploadIndex) => {
    const blob = dataUrlToBlob(src)
    const ext =
      blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg'
    form.append('files', blob, `photo-${uploadIndex}.${ext}`)
  })

  const response = await fetch(`${requireCatalogueBaseUrl()}/api/media/upload`, {
    method: 'POST',
    body: form,
  })

  if (!response.ok) {
    let message = `Erreur ${response.status}`
    try {
      const data = (await response.json()) as { detail?: string }
      if (typeof data.detail === 'string') message = data.detail
    } catch {
      // ignore
    }
    throw new ApiError(response.status, message)
  }

  const data = (await response.json()) as { urls: string[] }
  if (data.urls.length !== toUploadIndexes.length) {
    throw new Error('Réponse upload incomplète.')
  }

  const result = [...sources]
  toUploadIndexes.forEach((item, uploadIndex) => {
    result[item.index] = data.urls[uploadIndex]
  })
  return result
}
