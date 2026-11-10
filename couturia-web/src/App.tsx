import { BrowserRouter } from 'react-router-dom'
import { FavoritesProvider } from '@/lib/favorites'
import { PwaInstallProvider } from '@/lib/pwa-install'
import { AppRoutes } from '@/routes'

export default function App() {
  return (
    <BrowserRouter>
      <FavoritesProvider>
        <PwaInstallProvider>
          <AppRoutes />
        </PwaInstallProvider>
      </FavoritesProvider>
    </BrowserRouter>
  )
}
