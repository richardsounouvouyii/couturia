import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { AuthRoleToggle } from '@/components/AuthRoleToggle'
import { DemoAuthBanner } from '@/components/DemoAuthBanner'
import { DocumentMeta } from '@/components/DocumentMeta'
import logo from '@/assets/images/logo.png'
import { parseAuthRole, type AuthRole } from '@/lib/auth-role'
import { useAuthSession } from '@/lib/auth-session'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const role = parseAuthRole(searchParams.get('role'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function setRole(next: AuthRole) {
    setSearchParams(next === 'client' ? {} : { role: next }, { replace: true })
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const localPart = email.split('@')[0] || 'Compte'
    signIn({
      role,
      fullName: localPart,
      email: email.trim(),
    })
    navigate(role === 'styliste' ? '/espace-styliste' : '/catalogue')
  }

  const isStylist = role === 'styliste'

  return (
    <div className="bg-page px-4 pt-4 pb-8 sm:pt-6 lg:pt-8 lg:pb-12">
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
        <div className="mb-4 text-center">
          <img src={logo} alt="Couturia" className="mx-auto h-11 w-auto object-contain sm:h-12" />
          <h1 className="font-display mt-3 text-2xl font-semibold text-primary sm:text-3xl">
            {isStylist ? 'Espace styliste' : 'Connexion'}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {isStylist
              ? 'Gérez votre vitrine et vos créations.'
              : 'Parcourez les œuvres des stylistes. Favoris enregistrés sur cet appareil.'}
          </p>
        </div>

        <AuthRoleToggle value={role} onChange={setRole} />

        <div className="mt-3">
          <DemoAuthBanner />
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-3 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6"
        >
          <label className="form-control w-full">
            <span className="label-text mb-1.5 text-sm font-medium text-heading">
              E-mail
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="input input-bordered w-full rounded-xl border-line bg-page focus:border-primary focus:outline-none"
            />
          </label>

          <label className="form-control mt-3.5 w-full">
            <span className="label-text mb-1.5 text-sm font-medium text-heading">
              Mot de passe
            </span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input input-bordered w-full rounded-xl border-line bg-page pr-12 focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </label>


          <button type="submit" className="btn btn-primary mt-5 w-full gap-2 rounded-xl">
            <LogIn className="size-4" />
            Se connecter
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
