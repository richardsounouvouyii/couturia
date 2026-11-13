import { Route, Routes } from 'react-router-dom'
import { RequireStaff } from '@/components/RequireStaff'
import { RequireStylist } from '@/components/RequireStylist'
import { AdminLayout } from '@/layouts/AdminLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AdminCarouselPage } from '@/pages/admin/AdminCarouselPage'
import { AdminClientsPage } from '@/pages/admin/AdminClientsPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminPlaceholderPage } from '@/pages/admin/AdminPlaceholderPage'
import { AdminStylistesPage } from '@/pages/admin/AdminStylistesPage'
import { AdminUtilisateursPage } from '@/pages/admin/AdminUtilisateursPage'
import { AtelierDetailPage } from '@/pages/AtelierDetailPage'
import { AteliersPage } from '@/pages/AteliersPage'
import { CreationDetailPage } from '@/pages/CreationDetailPage'
import { CreationsPage } from '@/pages/CreationsPage'
import { FavorisPage } from '@/pages/FavorisPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { EspaceStylistePage } from '@/pages/styliste/EspaceStylistePage'
import { StylistCreationFormPage } from '@/pages/styliste/StylistCreationFormPage'
import { StylistCreationsPage } from '@/pages/styliste/StylistCreationsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <RequireStaff>
            <AdminLayout />
          </RequireStaff>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="publicites" element={<AdminCarouselPage />} />
        <Route path="utilisateurs" element={<AdminUtilisateursPage />} />
        <Route path="stylistes" element={<AdminStylistesPage />} />
        <Route path="clients" element={<AdminClientsPage />} />
        <Route
          path="creations"
          element={<AdminPlaceholderPage title="Créations" />}
        />
        <Route
          path="categories"
          element={<AdminPlaceholderPage title="Catégories" />}
        />
        <Route
          path="commandes"
          element={<AdminPlaceholderPage title="Commandes" />}
        />
        <Route
          path="demandes"
          element={<AdminPlaceholderPage title="Demandes" />}
        />
        <Route
          path="avis"
          element={<AdminPlaceholderPage title="Avis & Signalements" />}
        />
        <Route
          path="pages-accueil"
          element={<AdminPlaceholderPage title="Pages d'accueil" />}
        />
        <Route
          path="messages"
          element={<AdminPlaceholderPage title="Messages / Notifications" />}
        />
        <Route
          path="parametres"
          element={<AdminPlaceholderPage title="Paramètres" />}
        />
      </Route>

      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="catalogue" element={<CreationsPage />} />
        <Route path="catalogue/:id" element={<CreationDetailPage />} />
        <Route path="ateliers" element={<AteliersPage />} />
        <Route path="ateliers/:id" element={<AtelierDetailPage />} />
        <Route path="favoris" element={<FavorisPage />} />
        <Route
          path="espace-styliste"
          element={
            <RequireStylist>
              <EspaceStylistePage />
            </RequireStylist>
          }
        />
        <Route
          path="espace-styliste/creations"
          element={
            <RequireStylist>
              <StylistCreationsPage />
            </RequireStylist>
          }
        />
        <Route
          path="espace-styliste/creations/nouvelle"
          element={
            <RequireStylist>
              <StylistCreationFormPage />
            </RequireStylist>
          }
        />
        <Route
          path="espace-styliste/creations/:id/modifier"
          element={
            <RequireStylist>
              <StylistCreationFormPage />
            </RequireStylist>
          }
        />
        <Route path="connexion" element={<LoginPage />} />
        <Route path="inscription" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
