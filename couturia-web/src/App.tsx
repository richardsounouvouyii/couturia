import { BrowserRouter } from 'react-router-dom'
import { AuthSessionProvider } from '@/lib/auth-session'
import { FavoritesProvider } from '@/lib/favorites'
import { PwaInstallProvider } from '@/lib/pwa-install'
import { AppRoutes } from '@/routes'

export default function App() {
  return (
    <BrowserRouter>
      <AuthSessionProvider>
        <FavoritesProvider>
          <PwaInstallProvider>
            <AppRoutes />
          </PwaInstallProvider>
        </FavoritesProvider>
      </AuthSessionProvider>
    </BrowserRouter>
  )
}
