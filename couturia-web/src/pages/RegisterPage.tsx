import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Scissors, UserRound } from 'lucide-react'
import { AuthRoleToggle } from '@/components/AuthRoleToggle'
import { DocumentMeta } from '@/components/DocumentMeta'
import logo from '@/assets/images/logo.png'
import { parseAuthRole, type AuthRole } from '@/lib/auth-role'
import { useAuthSession } from '@/lib/auth-session'

export function RegisterPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const role = parseAuthRole(searchParams.get('role'))

  const [fullName, setFullName] = useState('')
  const [atelierName, setAtelierName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function setRole(next: AuthRole) {
    setSearchParams(next === 'client' ? {} : { role: next }, { replace: true })
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    signIn({
      role,
      fullName: fullName.trim(),
      email: email.trim(),
      atelierName: role === 'styliste' ? atelierName.trim() : undefined,
      phone: role === 'styliste' ? phone.trim() : undefined,
    })
    navigate(role === 'styliste' ? '/espace-styliste' : '/catalogue')
  }

  const isStylist = role === 'styliste'

  return (
    <div className="bg-page px-4 pt-4 pb-8 sm:pt-6 lg:pt-8 lg:pb-12">
      <DocumentMeta
        title={isStylist ? 'Devenir styliste' : 'Créer un compte'}
        description={
          isStylist
            ? 'Créez votre vitrine Couturia et recevez vos clients sur WhatsApp.'
            : 'Inscrivez-vous pour parcourir les créations et enregistrer vos favoris.'
        }
        path={`/inscription${isStylist ? '?role=styliste' : ''}`}
        noIndex
      />

      <div className="mx-auto w-full max-w-md">
        <div className="mb-4 text-center">
          <img src={logo} alt="Couturia" className="mx-auto h-11 w-auto object-contain sm:h-12" />
          <h1 className="font-display mt-3 text-2xl font-semibold text-primary sm:text-3xl">
            {isStylist ? 'Devenir styliste' : 'Créer un compte'}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {isStylist
              ? 'Publiez votre vitrine. Les clients vous contactent ensuite sur WhatsApp.'
              : 'Parcourez les œuvres des stylistes et gardez vos favoris sur votre compte.'}
          </p>
        </div>

        <AuthRoleToggle value={role} onChange={setRole} />

        <form
          onSubmit={onSubmit}
          className="mt-3 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6"
        >
          <label className="form-control w-full">
            <span className="label-text mb-1.5 text-sm font-medium text-heading">
              Nom complet
            </span>
            <input
              type="text"
              required
              minLength={2}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isStylist ? 'Aïcha Mensah' : 'Koffi Adjo'}
              className="input input-bordered w-full rounded-xl border-line bg-page focus:border-primary focus:outline-none"
            />
          </label>

          {isStylist ? (
            <>
              <label className="form-control mt-3.5 w-full">
                <span className="label-text mb-1.5 text-sm font-medium text-heading">
                  Nom de l&apos;atelier
                </span>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={atelierName}
                  onChange={(e) => setAtelierName(e.target.value)}
                  placeholder="Atelier Aïcha"
                  className="input input-bordered w-full rounded-xl border-line bg-page focus:border-primary focus:outline-none"
                />
              </label>

              <label className="form-control mt-3.5 w-full">
                <span className="label-text mb-1.5 text-sm font-medium text-heading">
                  Numéro WhatsApp
                </span>
                <input
                  type="tel"
                  required
                  inputMode="tel"
                  minLength={8}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+229 01 00 00 00 00"
                  className="input input-bordered w-full rounded-xl border-line bg-page focus:border-primary focus:outline-none"
                />
              </label>
            </>
          ) : null}

          <label className="form-control mt-3.5 w-full">
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
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
            {isStylist ? <Scissors className="size-4" /> : <UserRound className="size-4" />}
            {isStylist ? 'Créer ma vitrine' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Déjà un compte ?{' '}
          <Link
            to={isStylist ? '/connexion?role=styliste' : '/connexion'}
            className="font-semibold text-primary hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
