import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { onPwaUpdateAvailable } from '@/lib/pwa'

export function PwaUpdateToast() {
  const [reloadPage, setReloadPage] = useState<(() => void) | null>(null)

  useEffect(() => {
    onPwaUpdateAvailable((reload) => {
      setReloadPage(() => reload)
    })
  }, [])

  if (!reloadPage) return null

  return (
    <div className="fixed inset-x-0 top-20 z-[70] flex justify-center px-4">
      <div className="flex max-w-md items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3 shadow-lg">
        <p className="text-sm text-heading">Une nouvelle version de Couturia est prête.</p>
        <button
          type="button"
          className="btn btn-primary btn-sm gap-1.5 rounded-xl"
          onClick={() => reloadPage()}
        >
          <RefreshCw className="size-3.5" />
          Actualiser
        </button>
      </div>
    </div>
  )
}
