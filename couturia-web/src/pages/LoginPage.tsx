import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import { AuthRoleToggle } from '@/components/AuthRoleToggle'
import { DocumentMeta } from '@/components/DocumentMeta'
import { enrichAuthWithAtelier } from '@/lib/api/atelier'
import { loginUser, toAuthUser } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/http'
import { parseAuthRole, type PublicAuthRole } from '@/lib/auth-role'
import { useAuthSession } from '@/lib/auth-session'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signOut, user: sessionUser } = useAuthSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const role = parseAuthRole(searchParams.get('role'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function setRole(next: PublicAuthRole) {
    if (loading) return
    setSearchParams(next === 'client' ? {} : { role: next }, { replace: true })
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (loading) return
    setError(null)
    setLoading(true)
    // Figé au clic : on ignore un éventuel changement de rôle pendant l’appel.
    const selectedRole = role
    try {
      const result = await loginUser({
        email: email.trim(),
        password,
      })
      // Le vrai rôle est celui du compte en base (pas le bouton Client/Styliste).
      const user = await enrichAuthWithAtelier(toAuthUser(result.user))

      // Styliste choisi à l’écran mais compte non styliste → refus sans divulguer le rôle
      if (selectedRole === 'styliste' && user.role !== 'styliste') {
        signOut()
        setError('Identifiants incorrects.')
        return
      }

      // signIn écrase la session précédente (token + rôle)
      signIn(user, result.access_token)
      navigate(user.role === 'styliste' ? '/espace-styliste' : '/catalogue')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 408
            ? 'Le serveur met trop de temps à répondre. Réessaie dans un instant.'
            : err.message,
        )
      } else {
        setError('Impossible de joindre le serveur. Réessaie dans un instant.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isStylist = role === 'styliste'

  const fieldClass =
    'input input-bordered input-sm h-10 w-full rounded-xl border-line bg-page focus:border-primary focus:outline-none'
  const labelClass = 'label-text mb-1 text-xs font-medium text-heading'

  return (
    <div className="bg-page px-4 pt-3 pb-8 sm:pt-5 lg:pb-12">
      <DocumentMeta
        title={isStylist ? 'Connexion styliste' : 'Connexion'}
        description={
          isStylist
            ? 'Connectez-vous pour gérer votre vitrine Couturia.'
            : 'Connectez-vous pour parcourir les créations. Les favoris restent sur cet appareil.'
        }
        path={`/connexion${isStylist ? '?role=styliste' : ''}`}
        noIndex
      />

      <div className="mx-auto w-full max-w-md">
        <h1 className="font-display text-center text-xl font-semibold text-primary sm:text-2xl">
          {isStylist ? 'Connexion styliste' : 'Connexion'}
        </h1>

        <div className="mt-3">
          <AuthRoleToggle value={role} onChange={setRole} disabled={loading} />
          {sessionUser ? (
            <p className="mt-2 rounded-xl bg-ribbon/80 px-3 py-2 text-center text-xs text-heading">
              Déjà connecté ·{' '}
              <button
                type="button"
                className="font-semibold text-primary underline"
                disabled={loading}
                onClick={() => signOut()}
              >
                Déconnexion
              </button>
            </p>
          ) : null}
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-3 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5"
        >
          <label className="form-control w-full">
            <span className={labelClass}>E-mail</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className={fieldClass}
            />
          </label>

          <label className="form-control mt-2.5 w-full">
            <span className={labelClass}>Mot de passe</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="current-password"
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${fieldClass} pr-11`}
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted disabled:opacity-50"
                disabled={loading}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </label>

          {error ? (
            <p className="mt-2.5 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="btn btn-primary btn-sm mt-4 h-10 w-full gap-2 rounded-xl disabled:cursor-wait disabled:opacity-90"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <LogIn className="size-4" aria-hidden />
            )}
            {loading ? 'Connexion en cours…' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Pas encore de compte ?{' '}
          <Link
            to={isStylist ? '/inscription?role=styliste' : '/inscription'}
            className="font-semibold text-primary hover:underline"
          >
            {isStylist ? 'Devenir styliste' : 'Créer un compte'}
          </Link>
        </p>
      </div>
    </div>
  )
}
