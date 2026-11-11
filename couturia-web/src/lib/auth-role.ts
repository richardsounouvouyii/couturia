export type AuthRole = 'client' | 'styliste'

export function parseAuthRole(value: string | null): AuthRole {
  return value === 'styliste' ? 'styliste' : 'client'
}
