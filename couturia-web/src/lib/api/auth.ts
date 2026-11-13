import { apiRequest } from '@/lib/api/http'
import type { AuthRole, PublicAuthRole } from '@/lib/auth-role'

/** Rôles API = auth-service UserRole (mêmes libellés que le front). */
export type ApiUserRole = 'client' | 'styliste' | 'admin' | 'super_admin'

export type ApiUser = {
  id: string
  email: string
  full_name: string
  role: ApiUserRole
  is_active: boolean
  created_at: string
}

export type AuthProfile = {
  id: string
  role: AuthRole
  fullName: string
  email: string
  atelierId?: string
  atelierName?: string
  phone?: string
  ville?: string
  specialite?: string
}

/** Inscription publique : client | styliste uniquement. */
export function toApiRole(role: PublicAuthRole): 'client' | 'styliste' {
  return role === 'styliste' ? 'styliste' : 'client'
}

export function fromApiRole(role: string): AuthRole {
  if (role === 'styliste' || role === 'professionnel') return 'styliste'
  if (role === 'admin') return 'admin'
  if (role === 'super_admin') return 'super_admin'
  return 'client'
}

/** Convertit la réponse API en profil session front. */
export function toAuthUser(
  user: ApiUser,
  extras?: {
    atelierId?: string
    atelierName?: string
    phone?: string
    ville?: string
    specialite?: string
  },
): AuthProfile {
  return {
    id: user.id,
    role: fromApiRole(user.role),
    fullName: user.full_name,
    email: user.email,
    atelierId: extras?.atelierId,
    atelierName: extras?.atelierName,
    phone: extras?.phone,
    ville: extras?.ville,
    specialite: extras?.specialite,
  }
}

export type TokenResponse = {
  access_token: string
  token_type: string
  user: ApiUser
}

const AUTH_API_URL = (import.meta.env.VITE_AUTH_API_URL as string | undefined)?.replace(
  /\/$/,
  '',
)

function requireAuthBaseUrl(): string {
  if (!AUTH_API_URL) {
    throw new Error(
      'VITE_AUTH_API_URL manquant. Copie .env.example vers .env (auth :8001).',
    )
  }
  return AUTH_API_URL
}

/** POST /api/auth/register → JWT + user */
export function registerUser(input: {
  email: string
  password: string
  full_name: string
  role: 'client' | 'styliste'
}): Promise<TokenResponse> {
  return apiRequest<TokenResponse>(requireAuthBaseUrl(), '/api/auth/register', {
    method: 'POST',
    body: input,
  })
}

/** POST /api/auth/login → JWT + user */
export function loginUser(input: {
  email: string
  password: string
}): Promise<TokenResponse> {
  return apiRequest<TokenResponse>(requireAuthBaseUrl(), '/api/auth/login', {
    method: 'POST',
    body: input,
  })
}

/** GET /api/auth/me → profil (nécessite le token) */
export function fetchMe(token: string): Promise<ApiUser> {
  return apiRequest<ApiUser>(requireAuthBaseUrl(), '/api/auth/me', {
    token,
  })
}

export type UserListResponse = {
  items: ApiUser[]
  total: number
}

/** GET /api/auth/users — réservé staff (JWT admin / super_admin). */
export function listUsers(
  token: string,
  filters?: {
    role?: ApiUserRole
    q?: string
    is_active?: boolean
    limit?: number
  },
): Promise<UserListResponse> {
  const params = new URLSearchParams()
  if (filters?.role) params.set('role', filters.role)
  if (filters?.q?.trim()) params.set('q', filters.q.trim())
  if (typeof filters?.is_active === 'boolean') {
    params.set('is_active', String(filters.is_active))
  }
  if (filters?.limit) params.set('limit', String(filters.limit))
  const qs = params.toString()
  return apiRequest<UserListResponse>(
    requireAuthBaseUrl(),
    `/api/auth/users${qs ? `?${qs}` : ''}`,
    { token },
  )
}

/** PATCH /api/auth/users/:id — activer / suspendre / changer rôle (staff). */
export function updateUser(
  token: string,
  userId: string,
  patch: { is_active?: boolean; role?: ApiUserRole },
): Promise<ApiUser> {
  return apiRequest<ApiUser>(
    requireAuthBaseUrl(),
    `/api/auth/users/${userId}`,
    { method: 'PATCH', token, body: patch },
  )
}
