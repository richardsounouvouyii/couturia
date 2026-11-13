import type { AuthProfile } from '@/lib/api/auth'
import { ApiError, apiRequest } from '@/lib/api/http'
import type { MockAtelier } from '@/lib/mock-data'

const ATELIER_COVER_PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <rect width="800" height="500" fill="#700D39"/>
      <text x="400" y="250" text-anchor="middle" fill="#f7eef2" font-family="Georgia, serif" font-size="36">Couturia</text>
    </svg>`,
  )

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
    // Ne bloque pas le login si Fly est froid : on continue sans atelierId.
    const atelier = await Promise.race([
      fetchAtelierByOwner(user.id),
      new Promise<never>((_, reject) => {
        window.setTimeout(
          () => reject(new ApiError(408, 'atelier-timeout')),
          8_000,
        )
      }),
    ])
    return { ...user, ...atelierSessionExtras(atelier) }
  } catch (err) {
    // 404 = pas encore d’atelier ; timeout / autre = on garde la session telle quelle
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

/** Convertit un atelier API vers le format carte / détail UI. */
export function atelierPublicToCard(
  atelier: AtelierPublic,
  extras?: { creationsCount?: number; coverImage?: string | null },
): MockAtelier {
  const cover =
    extras?.coverImage ||
    atelier.couverture_url ||
    atelier.logo_url ||
    ATELIER_COVER_PLACEHOLDER

  return {
    id: atelier.id,
    nom: atelier.nom,
    specialite: atelier.specialite,
    specialites: [atelier.specialite],
    description: atelier.description?.trim() || '',
    ville: atelier.ville,
    quartier: atelier.quartier?.trim() || atelier.ville,
    telephoneWhatsapp: atelier.telephone_whatsapp?.trim() || '',
    horaires: 'Sur rendez-vous',
    creationsCount: extras?.creationsCount ?? 0,
    note: 0,
    avis: 0,
    verifie: false,
    coverImage: cover,
    gallery: cover && cover !== ATELIER_COVER_PLACEHOLDER ? [cover] : [],
  }
}
