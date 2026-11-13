import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  LayoutTemplate,
  Megaphone,
  MessageSquareWarning,
  Scissors,
  Settings,
  Shirt,
  ShoppingBag,
  Users,
  UserRound,
} from 'lucide-react'

export type AdminNavItem = {
  to: string
  label: string
  icon: LucideIcon
  /** true = écran complet prêt ; false = stub « bientôt » */
  ready?: boolean
}

export const ADMIN_NAV: AdminNavItem[] = [
  { to: '/admin', label: 'Accueil', icon: LayoutDashboard, ready: true },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users, ready: true },
  { to: '/admin/stylistes', label: 'Stylistes', icon: Scissors, ready: true },
  { to: '/admin/clients', label: 'Clients', icon: UserRound, ready: true },
  { to: '/admin/creations', label: 'Créations', icon: Shirt },
  { to: '/admin/categories', label: 'Catégories', icon: FolderTree },
  { to: '/admin/commandes', label: 'Commandes', icon: ShoppingBag },
  { to: '/admin/demandes', label: 'Demandes', icon: ClipboardList },
  { to: '/admin/avis', label: 'Avis', icon: MessageSquareWarning },
  {
    to: '/admin/publicites',
    label: 'Publicités',
    icon: Megaphone,
    ready: true,
  },
  { to: '/admin/pages-accueil', label: 'Pages', icon: LayoutTemplate },
  { to: '/admin/messages', label: 'Messages', icon: Bell },
  { to: '/admin/parametres', label: 'Réglages', icon: Settings },
]
