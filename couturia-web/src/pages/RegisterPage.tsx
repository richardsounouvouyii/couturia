import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Scissors } from 'lucide-react'
import logo from '@/assets/images/logo.png'

export function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [atelierName, setAtelierName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    setMessage(
      'Inscription styliste prête côté front. L’API auth-service sera branchée ensuite.',
    )
  }

  return (
    <div className="bg-page px-4 py-10 lg:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <img src={logo} alt="Couturia" className="mx-auto h-14 w-auto object-contain" />
          <h1 className="font-display mt-5 text-3xl font-semibold text-primary">
            Devenir styliste
          </h1>
          <p className="mt-2 text-sm text-muted">
            Créez votre vitrine Couturia. Les clients vous contactent ensuite sur WhatsApp,
            sans compte obligatoire.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8"
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
              placeholder="Aïcha Mensah"
              className="input input-bordered w-full rounded-xl border-line bg-page focus:border-primary focus:outline-none"
            />
          </label>

          <label className="form-control mt-4 w-full">
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

          <label className="form-control mt-4 w-full">
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

          <label className="form-control mt-4 w-full">
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

          {message && (
            <p className="mt-4 rounded-xl bg-ribbon px-3 py-2 text-sm text-primary">
              {message}
            </p>
          )}

          <button type="submit" className="btn btn-primary mt-6 w-full gap-2 rounded-xl">
            <Scissors className="size-4" />
            Créer ma vitrine
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Déjà styliste ?{' '}
          <Link to="/connexion" className="font-semibold text-primary hover:underline">
            Accéder à mon espace
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-muted">
          Vous êtes client ? Parcourez les créations et contactez directement sur WhatsApp.
        </p>
      </div>
    </div>
  )
}
