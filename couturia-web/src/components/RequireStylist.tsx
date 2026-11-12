import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { LockKeyhole } from 'lucide-react'
import { useAuthSession } from '@/lib/auth-session'

/** Protège les routes espace styliste (rôle + session). */
export function RequireStylist({ children }: { children: ReactNode }) {
  const { isAuthenticated, isStylist, isBootstrapping } = useAuthSession()
  const location = useLocation()

  // Évite une redirection login pendant le GET /me au démarrage
  if (isBootstrapping) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-sm text-muted">Vérification de la session…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/connexion?role=styliste`}
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (!isStylist) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <LockKeyhole className="mx-auto size-8 text-primary" aria-hidden />
        <h1 className="font-display mt-4 text-2xl font-semibold text-primary">
          Espace réservé aux stylistes
        </h1>
        <p className="mt-2 text-sm text-muted">
          Connectez-vous avec un compte styliste pour gérer votre vitrine.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            to="/connexion?role=styliste"
            className="btn btn-primary rounded-xl"
          >
            Connexion styliste
          </Link>
          <Link
            to="/inscription?role=styliste"
            className="btn rounded-xl border border-line bg-white"
          >
            Devenir styliste
          </Link>
        </div>
      </div>
    )
  }

  return children
}
