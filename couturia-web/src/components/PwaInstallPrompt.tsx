import { Download, Share, X } from 'lucide-react'
import { usePwaInstall } from '@/lib/pwa-install'

export function PwaInstallPrompt() {
  const {
    bannerVisible,
    showIosGuide,
    showManualGuide,
    dismissBanner,
    openInstall,
    canNativeInstall,
    isInstalled,
  } = usePwaInstall()

  if (isInstalled || !bannerVisible) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[4.5rem] z-[70] px-3 lg:bottom-6 lg:px-6">
      <div className="pointer-events-auto mx-auto flex max-w-lg items-start gap-3 rounded-2xl border border-line bg-card p-4 shadow-xl">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          {showIosGuide ? <Share className="size-5" /> : <Download className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold text-primary">
            Installer Couturia
          </p>
          {showIosGuide ? (
            <p className="mt-1 text-sm text-muted">
              Sur iPhone (Safari) : Partager → Sur l&apos;écran d&apos;accueil.
            </p>
          ) : showManualGuide ? (
            <p className="mt-1 text-sm text-muted">
              Sur Chrome : menu ⋮ → « Installer l&apos;application » ou « Ajouter à
              l&apos;écran d&apos;accueil ». Vous pouvez aussi le faire via le menu ☰
              Couturia.
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted">
              Ajoutez l&apos;icône sur votre téléphone pour un accès rapide, comme une
              application.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {canNativeInstall ? (
              <button
                type="button"
                onClick={() => void openInstall()}
                className="btn btn-primary btn-sm rounded-xl"
              >
                Installer
              </button>
            ) : null}
            <button
              type="button"
              onClick={dismissBanner}
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
          onClick={dismissBanner}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
