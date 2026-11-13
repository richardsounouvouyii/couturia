import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuthSession } from '@/lib/auth-session'

/**
 * Protège /admin.
 * En développement : aperçu front autorisé sans compte staff (bannière dans le layout).
 */
export function RequireStaff({ children }: { children: ReactNode }) {
  const { isAuthenticated, isStaff, isBootstrapping } = useAuthSession()
  const location = useLocation()
  const allowDevPreview = import.meta.env.DEV

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1ee] px-4">
        <p className="text-sm text-muted">Vérification de la session…</p>
      </div>
    )
  }

  if (allowDevPreview) {
    return children
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/connexion" replace state={{ from: location.pathname }} />
    )
  }

  if (!isStaff) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
        <ShieldAlert className="size-10 text-primary" aria-hidden />
        <h1 className="font-display mt-4 text-2xl font-semibold text-primary">
          Accès réservé à l’équipe Couturia
        </h1>
        <p className="mt-2 text-sm text-muted">
          Ce tableau de bord est réservé aux comptes admin.
        </p>
        <Link to="/" className="btn btn-primary mt-6 rounded-xl">
          Retour à l’accueil
        </Link>
      </div>
    )
  }

  return children
}
