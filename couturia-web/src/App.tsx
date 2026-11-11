import { BrowserRouter } from 'react-router-dom'
import { AuthSessionProvider } from '@/lib/auth-session'
import { FavoritesProvider } from '@/lib/favorites'
import { PwaInstallProvider } from '@/lib/pwa-install'
import { ToastProvider } from '@/lib/toast'
import { AppRoutes } from '@/routes'

export default function App() {
  return (
    <BrowserRouter>
      <AuthSessionProvider>
        <FavoritesProvider>
          <ToastProvider>
            <PwaInstallProvider>
              <AppRoutes />
            </PwaInstallProvider>
          </ToastProvider>
        </FavoritesProvider>
      </AuthSessionProvider>
    </BrowserRouter>
  )
}
