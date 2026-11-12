import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, KeyRound, Mail, Save, UserRound } from 'lucide-react'
import { DocumentMeta } from '@/components/DocumentMeta'
import { useAuthSession } from '@/lib/auth-session'

const fieldClass =
  'h-11 w-full rounded-xl border border-line bg-page px-3 text-sm text-heading outline-none transition placeholder:text-muted focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30'

export function SettingsPage() {
  const { user, isAuthenticated, isStylist, updateProfile } = useAuthSession()
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [atelierName, setAtelierName] = useState(user?.atelierName ?? '')
  const [profileMessage, setProfileMessage] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [resetEmail, setResetEmail] = useState(user?.email ?? '')
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setFullName(user.fullName)
    setEmail(user.email)
    setPhone(user.phone ?? '')
    setAtelierName(user.atelierName ?? '')
    setResetEmail(user.email)
  }, [user])

  function onSaveProfile(event: FormEvent) {
    event.preventDefault()
    updateProfile({
      fullName,
      email,
      phone,
      atelierName: isStylist ? atelierName : undefined,
    })
    setProfileMessage('Profil enregistré sur cet appareil.')
  }

  function onChangePassword(event: FormEvent) {
    event.preventDefault()
    setPasswordError(null)
    setPasswordMessage(null)

    if (newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('La confirmation ne correspond pas.')
      return
    }
    if (!currentPassword.trim()) {
      setPasswordError('Indiquez votre mot de passe actuel.')
      return
    }

    // Démo locale — sera branché sur auth-service plus tard
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordMessage('Mot de passe mis à jour (démo locale).')
  }

  function onForgotPassword(event: FormEvent) {
    event.preventDefault()
    const target = resetEmail.trim()
    if (!target) return
    setResetMessage(
      `Si un compte existe pour ${target}, un lien de réinitialisation sera envoyé (bientôt via l’API).`,
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-page">
        <DocumentMeta title="Mot de passe oublié" path="/parametres" noIndex />
        <div className="mx-auto max-w-md px-4 pt-3 pb-10 sm:pt-5">
          <Link
            to="/connexion"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            <ArrowLeft className="size-4" />
            Retour à la connexion
          </Link>
          <h1 className="font-display mt-2 text-2xl font-semibold text-primary">
            Mot de passe oublié
          </h1>
          <p className="mt-1 text-sm text-muted">
            Indiquez votre e-mail pour recevoir un lien de réinitialisation.
          </p>
          <form
            onSubmit={onForgotPassword}
            className="mt-5 space-y-3.5 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5"
          >
            <label className="block w-full">
              <span className="mb-1.5 block text-sm font-medium text-heading">E-mail</span>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className={fieldClass}
              />
            </label>
            {resetMessage ? (
              <p className="rounded-xl bg-ribbon px-3 py-2 text-sm text-primary">{resetMessage}</p>
            ) : null}
            <button type="submit" className="btn btn-primary h-11 min-h-11 w-full rounded-xl">
              Envoyer le lien
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-muted">
            Déjà un compte ?{' '}
            <Link to="/connexion" className="font-medium text-primary">
              Connexion
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-page">
      <DocumentMeta title="Paramètres" path="/parametres" noIndex />

      <div className="mx-auto max-w-2xl px-4 pt-3 pb-10 sm:pt-5 lg:px-8">
        <Link
          to={isStylist ? '/espace-styliste' : '/'}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          <ArrowLeft className="size-4" />
          Retour
        </Link>

        <h1 className="font-display mt-2 text-2xl font-semibold text-primary sm:text-3xl">
          Paramètres
        </h1>
        <p className="mt-1 text-sm text-muted">
          Gérez votre profil et votre mot de passe.
        </p>

        <section className="mt-5 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
              <UserRound className="size-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-base font-semibold text-heading">Profil</h2>
              <p className="text-xs text-muted">
                Compte {isStylist ? 'styliste' : 'client'}
              </p>
            </div>
          </div>

          <form onSubmit={onSaveProfile} className="space-y-3.5">
            <label className="block w-full">
              <span className="mb-1.5 block text-sm font-medium text-heading">Nom complet</span>
              <input
                required
                minLength={2}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block w-full">
              <span className="mb-1.5 block text-sm font-medium text-heading">E-mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block w-full">
              <span className="mb-1.5 block text-sm font-medium text-heading">Téléphone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex. +229 90 00 00 00"
                className={fieldClass}
              />
            </label>
            {isStylist ? (
              <label className="block w-full">
                <span className="mb-1.5 block text-sm font-medium text-heading">
                  Nom de l’atelier
                </span>
                <input
                  value={atelierName}
                  onChange={(e) => setAtelierName(e.target.value)}
                  placeholder="Ex. Couture Fatou"
                  className={fieldClass}
                />
              </label>
            ) : null}

            {profileMessage ? (
              <p className="rounded-xl bg-ribbon px-3 py-2 text-sm text-primary">
                {profileMessage}
              </p>
            ) : null}

            <button type="submit" className="btn btn-primary h-11 min-h-11 w-full rounded-xl gap-2">
              <Save className="size-4" aria-hidden />
              Enregistrer le profil
            </button>
          </form>
        </section>

        <section className="mt-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
              <KeyRound className="size-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-base font-semibold text-heading">Mot de passe</h2>
              <p className="text-xs text-muted">Modifier le mot de passe du compte</p>
            </div>
          </div>

          <form onSubmit={onChangePassword} className="space-y-3.5">
            <label className="block w-full">
              <span className="mb-1.5 block text-sm font-medium text-heading">
                Mot de passe actuel
              </span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block w-full">
              <span className="mb-1.5 block text-sm font-medium text-heading">
                Nouveau mot de passe
              </span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block w-full">
              <span className="mb-1.5 block text-sm font-medium text-heading">Confirmation</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={fieldClass}
              />
            </label>

            {passwordError ? <p className="text-sm text-primary">{passwordError}</p> : null}
            {passwordMessage ? (
              <p className="rounded-xl bg-ribbon px-3 py-2 text-sm text-primary">
                {passwordMessage}
              </p>
            ) : null}

            <button type="submit" className="btn btn-primary h-11 min-h-11 w-full rounded-xl">
              Changer le mot de passe
            </button>
          </form>
        </section>

        <section className="mt-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
              <Mail className="size-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-base font-semibold text-heading">Mot de passe oublié</h2>
              <p className="text-xs text-muted">Recevoir un lien de réinitialisation</p>
            </div>
          </div>

          <form onSubmit={onForgotPassword} className="space-y-3.5">
            <label className="block w-full">
              <span className="mb-1.5 block text-sm font-medium text-heading">E-mail du compte</span>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className={fieldClass}
              />
            </label>

            {resetMessage ? (
              <p className="rounded-xl bg-ribbon px-3 py-2 text-sm text-primary">{resetMessage}</p>
            ) : null}

            <button
              type="submit"
              className="btn h-11 min-h-11 w-full rounded-xl border border-primary/20 bg-white text-primary hover:bg-primary/5"
            >
              Envoyer le lien
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
