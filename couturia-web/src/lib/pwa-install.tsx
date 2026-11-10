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
/** Marqueur local quand l'utilisateur a installé l'app (même s'il ouvre encore le site dans le navigateur). */
export const INSTALLED_KEY = 'couturia.pwa.installed'

type PwaInstallContextValue = {
  canNativeInstall: boolean
  isInstalled: boolean
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
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    ('standalone' in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

function readInstalledFlag() {
  return localStorage.getItem(INSTALLED_KEY) === '1'
}

function markInstalled() {
  localStorage.setItem(INSTALLED_KEY, '1')
  localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION)
  localStorage.removeItem(INSTALL_DISMISS_UNTIL_KEY)
}

function clearInstalledFlag() {
  localStorage.removeItem(INSTALLED_KEY)
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
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    const standalone = detectStandalone()
    setIsStandalone(standalone)
    setIsIos(detectIos())
    setIsInstalled(standalone || readInstalledFlag())
    localStorage.removeItem('couturia.pwa.installDismissed')

    // Nouvelle version : on peut reproposer l'install seulement si pas déjà installé.
    const hintVersion = localStorage.getItem(INSTALL_HINT_VERSION_KEY)
    if (hintVersion !== APP_VERSION) {
      localStorage.setItem(INSTALL_HINT_VERSION_KEY, APP_VERSION)
      if (!standalone && !readInstalledFlag()) {
        localStorage.removeItem(INSTALL_DISMISS_UNTIL_KEY)
      }
    }

    const onAppInstalled = () => {
      markInstalled()
      setIsInstalled(true)
      setIsStandalone(detectStandalone())
      setDeferred(null)
      setBannerVisible(false)
    }

    window.addEventListener('appinstalled', onAppInstalled)
    return () => window.removeEventListener('appinstalled', onAppInstalled)
  }, [])

  useEffect(() => {
    if (isInstalled || isStandalone) {
      setBannerVisible(false)
      return
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      // Le navigateur propose l'install → l'app n'est plus considérée installée.
      clearInstalledFlag()
      setIsInstalled(false)
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
      if (detectStandalone() || readInstalledFlag()) return

      if (detectIos()) {
        setShowIosGuide(true)
        setShowManualGuide(false)
        setBannerVisible(true)
        return
      }

      setDeferred((current) => {
        if (!current) {
          queueMicrotask(() => {
            if (detectStandalone() || readInstalledFlag()) return
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
  }, [isInstalled, isStandalone])

  const dismissBanner = useCallback(() => {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000
    localStorage.setItem(INSTALL_DISMISS_UNTIL_KEY, String(until))
    localStorage.removeItem('couturia.pwa.installDismissed')
    setBannerVisible(false)
  }, [])

  const openBanner = useCallback(() => {
    if (isInstalled || isStandalone) return
    const ios = detectIos()
    setShowIosGuide(ios && !deferred)
    setShowManualGuide(!ios && !deferred)
    setBannerVisible(true)
  }, [deferred, isInstalled, isStandalone])

  const openInstall = useCallback(async () => {
    if (isInstalled || isStandalone) return true

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
      return false
    }

    markInstalled()
    setIsInstalled(true)
    return true
  }, [deferred, dismissBanner, isInstalled, isStandalone])

  const value = useMemo(
    () => ({
      canNativeInstall: Boolean(deferred),
      isInstalled: isInstalled || isStandalone,
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
      isInstalled,
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
