/** Bandeau transparent : auth locale sans vérification serveur. */
export function DemoAuthBanner() {
  return (
    <div
      role="status"
      className="rounded-xl border border-gold/40 bg-gold/10 px-3 py-2.5 text-left text-xs leading-relaxed text-heading"
    >
      <span className="font-semibold text-primary">Mode démonstration.</span>{' '}
      Connexion locale sans vérification e-mail / mot de passe. L’API auth arrivera
      ensuite.
    </div>
  )
}
