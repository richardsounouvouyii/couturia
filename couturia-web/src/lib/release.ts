/** Incrémente à chaque mise à jour visible pour les utilisateurs. */
export const APP_VERSION = '1.2.0'

export const WHATS_NEW = [
  {
    title: 'Espace styliste',
    description: 'Publiez et modifiez vos créations depuis /espace-styliste (démo locale).',
  },
  {
    title: 'SEO et partage',
    description: 'Titres, descriptions et aperçus plus propres pour WhatsApp/Facebook.',
  },
  {
    title: 'Stylistes allégés',
    description: 'Filtres plus compacts, URL mémorisées, page 404 soignée.',
  },
] as const

export const SEEN_VERSION_KEY = 'couturia.app.seenVersion'
export const INSTALL_DISMISS_UNTIL_KEY = 'couturia.pwa.installDismissUntil'
