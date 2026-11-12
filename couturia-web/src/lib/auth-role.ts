/** Rôles alignés sur auth-service (UserRole). */
export type AuthRole = 'client' | 'styliste' | 'admin' | 'super_admin'

export type PublicAuthRole = 'client' | 'styliste'

export function parseAuthRole(value: string | null): PublicAuthRole {
  return value === 'styliste' ? 'styliste' : 'client'
}

export function isStylistRole(role: AuthRole | null | undefined): boolean {
  return role === 'styliste'
}

export function isStaffRole(role: AuthRole | null | undefined): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function isSuperAdminRole(role: AuthRole | null | undefined): boolean {
  return role === 'super_admin'
}
