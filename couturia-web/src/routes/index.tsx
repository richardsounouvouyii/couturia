import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AtelierDetailPage } from '@/pages/AtelierDetailPage'
import { AteliersPage } from '@/pages/AteliersPage'
import { CreationDetailPage } from '@/pages/CreationDetailPage'
import { CreationsPage } from '@/pages/CreationsPage'
import { FavorisPage } from '@/pages/FavorisPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'

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
        <Route path="connexion" element={<LoginPage />} />
        <Route path="inscription" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
