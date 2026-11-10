import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISS_UNTIL_KEY = 'couturia.pwa.installDismissUntil'
const DISMISS_DAYS = 3

type PwaInstallContextValue = {
  canInstall: boolean
  isStandalone: boolean
  isIos: boolean
  bannerVisible: boolean
  showIosGuide: boolean
  dismissBanner: () => void
  openInstall: () => Promise<boolean>
  openBanner: () => void
}

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null)

function detectIos() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function detectStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

function isDismissedTemporarily() {
  const raw = localStorage.getItem(DISMISS_UNTIL_KEY)
  if (!raw) return false
  const until = Number(raw)
  if (!Number.isFinite(until)) return false
  return Date.now() < until
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [bannerVisible, setBannerVisible] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    setIsStandalone(detectStandalone())
    setIsIos(detectIos())
    // Ancienne clé « Plus tard » permanente → on la retire pour permettre
    // de réafficher / réinstaller via le menu.
    localStorage.removeItem('couturia.pwa.installDismissed')
  }, [])

  useEffect(() => {
    if (isStandalone) return

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
      if (!isDismissedTemporarily()) {
        setShowIosGuide(false)
        setBannerVisible(true)
      }
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    if (detectIos() && !isDismissedTemporarily()) {
      const timer = window.setTimeout(() => {
        setShowIosGuide(true)
        setBannerVisible(true)
      }, 2500)
      return () => {
        window.clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
    }
  }, [isStandalone])

  const dismissBanner = useCallback(() => {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000
    localStorage.setItem(DISMISS_UNTIL_KEY, String(until))
    // Nettoyage de l'ancienne clé permanente
    localStorage.removeItem('couturia.pwa.installDismissed')
    setBannerVisible(false)
  }, [])

  const openBanner = useCallback(() => {
    if (isStandalone) return
    setShowIosGuide(detectIos() && !deferred)
    setBannerVisible(true)
  }, [deferred, isStandalone])

  const openInstall = useCallback(async () => {
    if (detectIos() && !deferred) {
      setShowIosGuide(true)
      setBannerVisible(true)
      return false
    }

    if (!deferred) {
      setBannerVisible(true)
      return false
    }

    await deferred.prompt()
    const choice = await deferred.userChoice
    setDeferred(null)
    setBannerVisible(false)
    if (choice.outcome === 'dismissed') {
      dismissBanner()
    }
    return choice.outcome === 'accepted'
  }, [deferred, dismissBanner])

  const value = useMemo(
    () => ({
      canInstall: Boolean(deferred) || isIos,
      isStandalone,
      isIos,
      bannerVisible,
      showIosGuide,
      dismissBanner,
      openInstall,
      openBanner,
    }),
    [
      deferred,
      isIos,
      isStandalone,
      bannerVisible,
      showIosGuide,
      dismissBanner,
      openInstall,
      openBanner,
    ],
  )

  return (
    <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>
  )
}

export function usePwaInstall() {
  const ctx = useContext(PwaInstallContext)
  if (!ctx) {
    throw new Error('usePwaInstall must be used within PwaInstallProvider')
  }
  return ctx
}
