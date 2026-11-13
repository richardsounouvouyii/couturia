import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Scissors, UserRound } from 'lucide-react'
import { AuthRoleToggle } from '@/components/AuthRoleToggle'
import { DocumentMeta } from '@/components/DocumentMeta'
import { createAtelier } from '@/lib/api/atelier'
import { registerUser, toApiRole, toAuthUser } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/http'
import { parseAuthRole, type PublicAuthRole } from '@/lib/auth-role'
import { useAuthSession } from '@/lib/auth-session'

export function RegisterPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const role = parseAuthRole(searchParams.get('role'))

  const [fullName, setFullName] = useState('')
  const [atelierName, setAtelierName] = useState('')
  const [specialite, setSpecialite] = useState('')
  const [ville, setVille] = useState('')
  const [phone, setPhone] = useState('')
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
    try {
      // 1) Compte auth
      const result = await registerUser({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        role: toApiRole(role),
      })

      let extras:
        | {
            atelierId?: string
            atelierName?: string
            phone?: string
            ville?: string
            specialite?: string
          }
        | undefined

      // 2) Si styliste → créer aussi le profil atelier
      if (role === 'styliste') {
        const atelier = await createAtelier({
          owner_user_id: result.user.id,
          nom: atelierName.trim(),
          specialite: specialite.trim(),
          ville: ville.trim(),
          telephone_whatsapp: phone.trim(),
        })
        extras = {
          atelierId: atelier.id,
          atelierName: atelier.nom,
          phone: atelier.telephone_whatsapp ?? phone.trim(),
          ville: atelier.ville,
          specialite: atelier.specialite,
        }
      }

      const user = toAuthUser(result.user, extras)
      signIn(user, result.access_token)
      navigate(user.role === 'styliste' ? '/espace-styliste' : '/catalogue')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(
          'Inscription impossible. Vérifie auth (:8001) et atelier (:8002).',
        )
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
        title={isStylist ? 'Devenir styliste' : 'Créer un compte'}
        description={
          isStylist
            ? 'Créez votre vitrine Couturia et recevez vos clients sur WhatsApp.'
            : 'Inscrivez-vous pour parcourir les créations. Les favoris restent sur cet appareil.'
        }
        path={`/inscription${isStylist ? '?role=styliste' : ''}`}
        noIndex
      />

      <div className="mx-auto w-full max-w-md">
        <h1 className="font-display text-center text-xl font-semibold text-primary sm:text-2xl">
          {isStylist ? 'Devenir styliste' : 'Créer un compte'}
        </h1>

        <div className="mt-3">
          <AuthRoleToggle value={role} onChange={setRole} disabled={loading} />
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-3 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5"
        >
          <label className="form-control w-full">
            <span className={labelClass}>Nom complet</span>
            <input
              type="text"
              required
              minLength={2}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isStylist ? 'Aïcha Mensah' : 'Koffi Adjo'}
              className={fieldClass}
            />
          </label>

          {isStylist ? (
            <>
              <label className="form-control mt-2.5 w-full">
                <span className={labelClass}>Nom de l&apos;atelier</span>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={atelierName}
                  onChange={(e) => setAtelierName(e.target.value)}
                  placeholder="Atelier Aïcha"
                  className={fieldClass}
                />
              </label>

              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                <label className="form-control w-full">
                  <span className={labelClass}>Spécialité</span>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={specialite}
                    onChange={(e) => setSpecialite(e.target.value)}
                    placeholder="Robes & wax"
                    className={fieldClass}
                  />
                </label>
                <label className="form-control w-full">
                  <span className={labelClass}>Ville</span>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    placeholder="Cotonou"
                    className={fieldClass}
                  />
                </label>
              </div>

              <label className="form-control mt-2.5 w-full">
                <span className={labelClass}>WhatsApp</span>
                <input
                  type="tel"
                  required
                  inputMode="tel"
                  minLength={8}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+229 01 00 00 00 00"
                  className={fieldClass}
                />
              </label>
            </>
          ) : null}

          <label className="form-control mt-2.5 w-full">
            <span className={labelClass}>E-mail</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                className={`${fieldClass} pr-11`}
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
            ) : isStylist ? (
              <Scissors className="size-4" aria-hidden />
            ) : (
              <UserRound className="size-4" aria-hidden />
            )}
            {loading
              ? 'Création en cours…'
              : isStylist
                ? 'Créer ma vitrine'
                : 'Créer mon compte'}
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
