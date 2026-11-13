import creation1 from '@/assets/images/creation-1.jpg'
import { fetchAtelierByOwner, type AtelierPublic } from '@/lib/api/atelier'
import type { ApiUser } from '@/lib/api/auth'
import type { AdminClient, AdminStyliste } from '@/lib/admin-mock'

const DEFAULT_AVATAR = creation1

function shortCode(prefix: string, id: string): string {
  return `${prefix}-${id.replace(/-/g, '').slice(0, 5).toUpperCase()}`
}

function isoDay(value: string): string {
  return value.slice(0, 10)
}

/** Mappe un user auth → ligne admin clients. */
export function mapApiUserToAdminClient(user: ApiUser): AdminClient {
  return {
    id: user.id,
    code: shortCode('CLI', user.id),
    nom: user.full_name,
    email: user.email,
    inscritLe: isoDay(user.created_at),
    statut: user.is_active ? 'actif' : 'suspendu',
    notes: '',
    avatar: DEFAULT_AVATAR,
  }
}

/** Mappe user styliste + atelier optionnel → ligne admin stylistes. */
export function mapApiUserToAdminStyliste(
  user: ApiUser,
  atelier: AtelierPublic | null,
): AdminStyliste {
  return {
    id: user.id,
    code: shortCode('STY', user.id),
    nom: user.full_name,
    email: user.email,
    atelierNom: atelier?.nom ?? 'Atelier non créé',
    specialite: atelier?.specialite ?? '—',
    ville: atelier?.ville ?? '—',
    quartier: atelier?.quartier ?? '',
    whatsapp: atelier?.telephone_whatsapp ?? '',
    creations: 0,
    vues: 0,
    noteMoyenne: null,
    derniereActivite: '—',
    inscritLe: isoDay(user.created_at),
    statut: user.is_active
      ? atelier?.is_public
        ? 'actif'
        : 'en_attente'
      : 'suspendu',
    isPublic: atelier?.is_public ?? false,
    notes: '',
    avatar: atelier?.logo_url || DEFAULT_AVATAR,
    couverture: atelier?.couverture_url || DEFAULT_AVATAR,
  }
}

/** Enrichit une liste de stylistes avec leurs ateliers (best-effort). */
export async function enrichStylistesWithAteliers(
  users: ApiUser[],
): Promise<AdminStyliste[]> {
  const rows = await Promise.all(
    users.map(async (user) => {
      try {
        const atelier = await fetchAtelierByOwner(user.id)
        return mapApiUserToAdminStyliste(user, atelier)
      } catch {
        return mapApiUserToAdminStyliste(user, null)
      }
    }),
  )
  return rows
}
