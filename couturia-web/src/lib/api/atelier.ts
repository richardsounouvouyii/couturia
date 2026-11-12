import type { AuthProfile } from '@/lib/api/auth'
import { ApiError, apiRequest } from '@/lib/api/http'

export type AtelierPublic = {
  id: string
  owner_user_id: string
  nom: string
  description: string | null
  specialite: string
  ville: string
  quartier: string | null
  telephone_whatsapp: string | null
  logo_url: string | null
  couverture_url: string | null
  is_public: boolean
  created_at: string
}

export type AtelierCreateInput = {
  owner_user_id: string
  nom: string
  description?: string | null
  specialite: string
  ville: string
  quartier?: string | null
  telephone_whatsapp?: string | null
  logo_url?: string | null
  couverture_url?: string | null
  is_public?: boolean
}

const ATELIER_API_URL = (
  import.meta.env.VITE_ATELIER_API_URL as string | undefined
)?.replace(/\/$/, '')

function requireAtelierBaseUrl(): string {
  if (!ATELIER_API_URL) {
    throw new Error(
      'VITE_ATELIER_API_URL manquant. Copie .env.example vers .env (atelier :8002).',
    )
  }
  return ATELIER_API_URL
}

/** POST /api/ateliers → crée le profil atelier du styliste */
export function createAtelier(input: AtelierCreateInput): Promise<AtelierPublic> {
  return apiRequest<AtelierPublic>(requireAtelierBaseUrl(), '/api/ateliers', {
    method: 'POST',
    body: input,
  })
}

/** GET /api/ateliers/{id} */
export function fetchAtelier(atelierId: string): Promise<AtelierPublic> {
  return apiRequest<AtelierPublic>(
    requireAtelierBaseUrl(),
    `/api/ateliers/${atelierId}`,
  )
}

/** GET /api/ateliers/by-owner/{userId} — profil du styliste connecté */
export function fetchAtelierByOwner(ownerUserId: string): Promise<AtelierPublic> {
  return apiRequest<AtelierPublic>(
    requireAtelierBaseUrl(),
    `/api/ateliers/by-owner/${ownerUserId}`,
  )
}

/** Champs atelier à fusionner dans la session auth. */
export function atelierSessionExtras(atelier: AtelierPublic) {
  return {
    atelierId: atelier.id,
    atelierName: atelier.nom,
    phone: atelier.telephone_whatsapp ?? undefined,
    ville: atelier.ville,
    specialite: atelier.specialite,
  }
}

/** Pour un styliste : complète le profil avec l’atelier API (si trouvé). */
export async function enrichAuthWithAtelier(user: AuthProfile): Promise<AuthProfile> {
  if (user.role !== 'styliste' || !user.id) return user
  try {
    const atelier = await fetchAtelierByOwner(user.id)
    return { ...user, ...atelierSessionExtras(atelier) }
  } catch (err) {
    // 404 = pas encore d’atelier ; autre erreur = on garde la session telle quelle
    if (err instanceof ApiError && err.status === 404) return user
    return user
  }
}

/** GET /api/ateliers — liste publique (filtres optionnels) */
export function listAteliers(filters?: {
  ville?: string
  specialite?: string
}): Promise<AtelierPublic[]> {
  const params = new URLSearchParams()
  if (filters?.ville) params.set('ville', filters.ville)
  if (filters?.specialite) params.set('specialite', filters.specialite)
  const query = params.toString()
  return apiRequest<AtelierPublic[]>(
    requireAtelierBaseUrl(),
    `/api/ateliers${query ? `?${query}` : ''}`,
  )
}
