import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { enrichAuthWithAtelier } from '@/lib/api/atelier'
import { fetchMe, toAuthUser, type AuthProfile } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/http'
import { isStaffRole, isStylistRole } from '@/lib/auth-role'

const STORAGE_KEY = 'couturia.auth.v2'

export type AuthUser = AuthProfile

type StoredSession = {
  token: string
  user: AuthUser
}

type AuthSessionContextValue = {
  user: AuthUser | null
  token: string | null
  /** true tant que /me n’a pas tranché au démarrage */
  isBootstrapping: boolean
  isAuthenticated: boolean
  isStylist: boolean
  isClient: boolean
  /** admin | super_admin — back-office futur */
  isStaff: boolean
  /** Après login/register réussis : profil + JWT */
  signIn: (user: AuthUser, accessToken: string) => void
  signOut: () => void
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') return false
  const u = value as Partial<AuthUser>
  const roles = ['client', 'styliste', 'admin', 'super_admin'] as const
  return (
    typeof u.id === 'string' &&
    typeof u.role === 'string' &&
    (roles as readonly string[]).includes(u.role) &&
    typeof u.fullName === 'string' &&
    typeof u.email === 'string'
  )
}

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredSession>
    if (typeof parsed.token !== 'string' || !parsed.token || !isAuthUser(parsed.user)) {
      return null
    }
    return {
      token: parsed.token,
      user: {
        id: parsed.user.id,
        role: parsed.user.role,
        fullName: parsed.user.fullName,
        email: parsed.user.email,
        atelierId:
          typeof parsed.user.atelierId === 'string' ? parsed.user.atelierId : undefined,
        atelierName:
          typeof parsed.user.atelierName === 'string'
            ? parsed.user.atelierName
            : undefined,
        phone: typeof parsed.user.phone === 'string' ? parsed.user.phone : undefined,
        ville: typeof parsed.user.ville === 'string' ? parsed.user.ville : undefined,
        specialite:
          typeof parsed.user.specialite === 'string'
            ? parsed.user.specialite
            : undefined,
      },
    }
  } catch {
    return null
  }
}

function writeStoredSession(session: StoredSession | null) {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
  // Ancienne clé démo (sans token)
  localStorage.removeItem('couturia.auth.v1')
}

function mergeProfile(next: AuthUser, previous: AuthUser | null): AuthUser {
  const sameUser = previous?.id === next.id || previous?.email === next.email
  return {
    ...next,
    id: next.id || previous?.id || '',
    atelierId: next.atelierId || (sameUser ? previous?.atelierId : undefined),
    atelierName: next.atelierName || (sameUser ? previous?.atelierName : undefined),
    phone: next.phone || (sameUser ? previous?.phone : undefined),
    ville: next.ville || (sameUser ? previous?.ville : undefined),
    specialite: next.specialite || (sameUser ? previous?.specialite : undefined),
    fullName: next.fullName || (sameUser ? previous?.fullName : next.fullName),
  }
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const initial = typeof window === 'undefined' ? null : readStoredSession()
  const [user, setUser] = useState<AuthUser | null>(initial?.user ?? null)
  const [token, setToken] = useState<string | null>(initial?.token ?? null)
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(initial?.token))

  // Au chargement : si un JWT existe, on vérifie avec GET /api/auth/me
  useEffect(() => {
    if (!token) {
      setIsBootstrapping(false)
      return
    }

    let cancelled = false

    async function refresh() {
      try {
        const me = await fetchMe(token!)
        if (cancelled) return
        const previous = readStoredSession()?.user ?? null
        const withAtelier = await enrichAuthWithAtelier(toAuthUser(me))
        if (cancelled) return
        const next = mergeProfile(withAtelier, previous)
        setUser(next)
        writeStoredSession({ token: token!, user: next })
      } catch (err) {
        if (cancelled) return
        // Token invalide / expiré / serveur down après une 401 → déconnexion
        const unauthorized = err instanceof ApiError && err.status === 401
        if (unauthorized) {
          setUser(null)
          setToken(null)
          writeStoredSession(null)
        }
        // Autre erreur réseau : on garde la session locale en attendant
      } finally {
        if (!cancelled) setIsBootstrapping(false)
      }
    }

    void refresh()
    return () => {
      cancelled = true
    }
  }, [token])

  const signIn = useCallback((next: AuthUser, accessToken: string) => {
    const previous = readStoredSession()?.user ?? null
    const merged = mergeProfile(next, previous)
    setUser(merged)
    setToken(accessToken)
    writeStoredSession({ token: accessToken, user: merged })
    setIsBootstrapping(false)
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    setToken(null)
    writeStoredSession(null)
    setIsBootstrapping(false)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isBootstrapping,
      isAuthenticated: Boolean(user && token),
      isStylist: isStylistRole(user?.role),
      isClient: user?.role === 'client',
      isStaff: isStaffRole(user?.role),
      signIn,
      signOut,
    }),
    [user, token, isBootstrapping, signIn, signOut],
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
