import { registerSW } from 'virtual:pwa-register'

const SUPPRESS_KEY = 'couturia.pwa.updateSuppressUntil'

type Listener = (needsRefresh: boolean) => void

let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined
let needsRefresh = false
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((listener) => listener(needsRefresh))
}

function isSuppressed() {
  const until = Number(sessionStorage.getItem(SUPPRESS_KEY) || 0)
  return Number.isFinite(until) && Date.now() < until
}

export function subscribePwaUpdate(listener: Listener) {
  listeners.add(listener)
  listener(needsRefresh)
  return () => {
    listeners.delete(listener)
  }
}

/** Applique la nouvelle version puis recharge la page. */
export async function applyPwaUpdate() {
  // Empêche le toast de réapparaître juste après le reload.
  sessionStorage.setItem(SUPPRESS_KEY, String(Date.now() + 20_000))
  needsRefresh = false
  emit()

  try {
    if (updateSW) {
      await updateSW(true)
    }
  } catch {
    // ignore — on force le reload quand même
  }

  // Garantit la disparition du popup même si le SW ne déclenche pas le reload.
  window.location.reload()
}

export function registerPwa() {
  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      if (isSuppressed()) {
        // On vient d'actualiser : activer le worker sans réafficher le toast.
        void updateSW?.(true)
        return
      }
      needsRefresh = true
      emit()
    },
    onOfflineReady() {
      needsRefresh = false
      emit()
    },
  })
}
