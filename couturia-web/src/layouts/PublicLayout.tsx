import { Outlet } from 'react-router-dom'
import { CoutureWallpaper } from '@/components/CoutureWallpaper'
import { Footer } from '@/components/Footer'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { Navbar } from '@/components/Navbar'
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt'
import { PwaUpdateToast } from '@/components/PwaUpdateToast'
import { ScrollToTop } from '@/components/ScrollToTop'
import { WhatsNewModal } from '@/components/WhatsNewModal'

export function PublicLayout() {
  return (
    <>
      <CoutureWallpaper />
      <div className="relative z-[1] flex min-h-screen flex-col bg-transparent text-heading">
        <ScrollToTop />
        <Navbar />
        <main className="flex-1 bg-transparent">
          <Outlet />
        </main>
        <Footer />
        <MobileBottomNav />
        <PwaInstallPrompt />
        <PwaUpdateToast />
        <WhatsNewModal />
      </div>
    </>
  )
}
