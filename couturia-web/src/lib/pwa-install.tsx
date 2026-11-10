import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  APP_VERSION,
  INSTALL_DISMISS_UNTIL_KEY,
  SEEN_VERSION_KEY,
} from '@/lib/release'

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISS_DAYS = 2
const INSTALL_HINT_VERSION_KEY = 'couturia.pwa.installHintVersion'

type PwaInstallContextValue = {
  canNativeInstall: boolean
  isStandalone: boolean
  isIos: boolean
  bannerVisible: boolean
  showIosGuide: boolean
  showManualGuide: boolean
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
  const raw = localStorage.getItem(INSTALL_DISMISS_UNTIL_KEY)
  if (!raw) return false
  const until = Number(raw)
  if (!Number.isFinite(until)) return false
  return Date.now() < until
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [bannerVisible, setBannerVisible] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const [showManualGuide, setShowManualGuide] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    setIsStandalone(detectStandalone())
    setIsIos(detectIos())
    localStorage.removeItem('couturia.pwa.installDismissed')

    // Nouvelle version déployée → on réautorise la bannière d'installation.
    const hintVersion = localStorage.getItem(INSTALL_HINT_VERSION_KEY)
    if (hintVersion !== APP_VERSION) {
      localStorage.removeItem(INSTALL_DISMISS_UNTIL_KEY)
      localStorage.setItem(INSTALL_HINT_VERSION_KEY, APP_VERSION)
    }
  }, [])

  useEffect(() => {
    if (isStandalone) return

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
      setShowManualGuide(false)
      if (!isDismissedTemporarily()) {
        setShowIosGuide(false)
        setBannerVisible(true)
      }
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    const timer = window.setTimeout(() => {
      if (isDismissedTemporarily()) return
      if (detectStandalone()) return

      if (detectIos()) {
        setShowIosGuide(true)
        setShowManualGuide(false)
        setBannerVisible(true)
        return
      }

      // Android/desktop : si pas d'event natif, on affiche le guide manuel.
      setDeferred((current) => {
        if (!current) {
          queueMicrotask(() => {
            setShowIosGuide(false)
            setShowManualGuide(true)
            setBannerVisible(true)
          })
        }
        return current
      })
    }, 4000)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
    }
  }, [isStandalone])

  const dismissBanner = useCallback(() => {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000
    localStorage.setItem(INSTALL_DISMISS_UNTIL_KEY, String(until))
    localStorage.removeItem('couturia.pwa.installDismissed')
    setBannerVisible(false)
  }, [])

  const openBanner = useCallback(() => {
    if (isStandalone) return
    const ios = detectIos()
    setShowIosGuide(ios && !deferred)
    setShowManualGuide(!ios && !deferred)
    setBannerVisible(true)
  }, [deferred, isStandalone])

  const openInstall = useCallback(async () => {
    if (detectIos() && !deferred) {
      setShowIosGuide(true)
      setShowManualGuide(false)
      setBannerVisible(true)
      return false
    }

    if (!deferred) {
      setShowIosGuide(false)
      setShowManualGuide(true)
      setBannerVisible(true)
      return false
    }

    await deferred.prompt()
    const choice = await deferred.userChoice
    setDeferred(null)
    setBannerVisible(false)
    if (choice.outcome === 'dismissed') {
      dismissBanner()
    } else {
      // Installé : on considère la version vue aussi.
      localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION)
    }
    return choice.outcome === 'accepted'
  }, [deferred, dismissBanner])

  const value = useMemo(
    () => ({
      canNativeInstall: Boolean(deferred),
      isStandalone,
      isIos,
      bannerVisible,
      showIosGuide,
      showManualGuide,
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
      showManualGuide,
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
