import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISS_KEY = 'couturia.pwa.installDismissed'

function isIos() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari iOS
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    if (localStorage.getItem(DISMISS_KEY) === '1') return

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
      setVisible(true)
      setIosHint(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    // Sur iOS, Chrome n'émet pas beforeinstallprompt : on propose le guide Share.
    if (isIos()) {
      const timer = window.setTimeout(() => {
        setIosHint(true)
        setVisible(true)
      }, 2500)
      return () => {
        window.clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    const choice = await deferred.userChoice
    setDeferred(null)
    setVisible(false)
    if (choice.outcome === 'dismissed') {
      localStorage.setItem(DISMISS_KEY, '1')
    }
  }

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[4.5rem] z-[70] px-3 lg:bottom-6 lg:px-6">
      <div className="pointer-events-auto mx-auto flex max-w-lg items-start gap-3 rounded-2xl border border-line bg-card p-4 shadow-xl">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          {iosHint ? <Share className="size-5" /> : <Download className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold text-primary">
            Installer Couturia
          </p>
          {iosHint ? (
            <p className="mt-1 text-sm text-muted">
              Sur iPhone : touchez <strong>Partager</strong>, puis{' '}
              <strong>Sur l&apos;écran d&apos;accueil</strong>.
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted">
              Ajoutez l&apos;icône sur votre téléphone pour un accès rapide, comme une
              application.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {!iosHint ? (
              <button
                type="button"
                onClick={() => void install()}
                className="btn btn-primary btn-sm rounded-xl"
              >
                Installer
              </button>
            ) : null}
            <button
              type="button"
              onClick={dismiss}
              className="btn btn-sm rounded-xl border border-line bg-white"
            >
              Plus tard
            </button>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-square btn-sm text-muted"
          aria-label="Fermer"
          onClick={dismiss}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
