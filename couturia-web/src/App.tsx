import { BrowserRouter } from 'react-router-dom'
import { FavoritesProvider } from '@/lib/favorites'
import { AppRoutes } from '@/routes'

export default function App() {
  return (
    <BrowserRouter>
      <FavoritesProvider>
        <AppRoutes />
      </FavoritesProvider>
    </BrowserRouter>
  )
}
