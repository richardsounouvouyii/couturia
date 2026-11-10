import { registerSW } from 'virtual:pwa-register'

type UpdateCallback = (reloadPage: () => void) => void

let notifyUpdate: UpdateCallback | null = null

export function onPwaUpdateAvailable(callback: UpdateCallback) {
  notifyUpdate = callback
}

export function registerPwa() {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      notifyUpdate?.(() => {
        void updateSW(true)
      })
    },
    onOfflineReady() {
      // Prêt hors-ligne : pas de toast obligatoire pour la V1.
    },
  })

  return updateSW
}
