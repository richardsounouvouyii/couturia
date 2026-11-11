import { Route, Routes } from 'react-router-dom'
import { RequireStylist } from '@/components/RequireStylist'
import { PublicLayout } from '@/layouts/PublicLayout'
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
