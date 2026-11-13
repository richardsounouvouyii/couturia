import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  ClipboardList,
  FolderTree,
  Home,
  Image,
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
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, ready: true },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { to: '/admin/stylistes', label: 'Couturières & Stylistes', icon: Scissors },
  { to: '/admin/clients', label: 'Clients', icon: UserRound },
  { to: '/admin/creations', label: 'Créations', icon: Shirt },
  { to: '/admin/categories', label: 'Catégories', icon: FolderTree },
  { to: '/admin/commandes', label: 'Commandes', icon: ShoppingBag },
  { to: '/admin/demandes', label: 'Demandes', icon: ClipboardList },
  { to: '/admin/avis', label: 'Avis & Signalements', icon: MessageSquareWarning },
  {
    to: '/admin/publicites',
    label: 'Publicités & Carousel',
    icon: Megaphone,
    ready: true,
  },
  { to: '/admin/pages-accueil', label: "Pages d'accueil", icon: LayoutTemplate },
  { to: '/admin/messages', label: 'Messages / Notifications', icon: Bell },
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings },
]

export const ADMIN_HOME_ICON = Home
