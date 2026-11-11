import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { AuthRole } from '@/lib/auth-role'

const STORAGE_KEY = 'couturia.auth.v1'

export type AuthUser = {
  role: AuthRole
  fullName: string
  email: string
  atelierName?: string
  phone?: string
}

type AuthSessionContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isStylist: boolean
  isClient: boolean
  signIn: (user: AuthUser) => void
  signOut: () => void
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AuthUser>
    if (
      (parsed.role !== 'client' && parsed.role !== 'styliste') ||
      typeof parsed.fullName !== 'string' ||
      typeof parsed.email !== 'string'
    ) {
      return null
    }
    return {
      role: parsed.role,
      fullName: parsed.fullName,
      email: parsed.email,
      atelierName:
        typeof parsed.atelierName === 'string' ? parsed.atelierName : undefined,
      phone: typeof parsed.phone === 'string' ? parsed.phone : undefined,
    }
  } catch {
    return null
  }
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    typeof window === 'undefined' ? null : readStoredUser(),
  )

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const signIn = useCallback((next: AuthUser) => {
    const previous = readStoredUser()
    const merged: AuthUser = {
      ...next,
      atelierName: next.atelierName || previous?.atelierName,
      phone: next.phone || (previous?.email === next.email ? previous.phone : undefined),
      fullName:
        next.fullName ||
        (previous?.email === next.email ? previous.fullName : next.fullName),
    }
    setUser(merged)
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isStylist: user?.role === 'styliste',
      isClient: user?.role === 'client',
      signIn,
      signOut,
    }),
    [user, signIn, signOut],
  )

  return (
    <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
  )
}

export function useAuthSession() {
  const ctx = useContext(AuthSessionContext)
  if (!ctx) {
    throw new Error('useAuthSession must be used within AuthSessionProvider')
  }
  return ctx
}
