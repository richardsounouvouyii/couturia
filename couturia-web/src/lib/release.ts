/** Incrémente à chaque mise à jour visible pour les utilisateurs. */
export const APP_VERSION = '1.1.0'

export const WHATS_NEW = [
  {
    title: 'Installer Couturia',
    description:
      'Ajoutez l’app sur l’écran d’accueil depuis le menu ☰ → Installer l’application.',
  },
  {
    title: 'Favoris et recherche',
    description: 'Enregistrez vos pièces préférées et retrouvez-les rapidement.',
  },
  {
    title: 'Contact WhatsApp',
    description: 'Contactez directement les ateliers avec un message prérempli.',
  },
] as const

export const SEEN_VERSION_KEY = 'couturia.app.seenVersion'
export const INSTALL_DISMISS_UNTIL_KEY = 'couturia.pwa.installDismissUntil'
