import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { applyPwaUpdate, subscribePwaUpdate } from '@/lib/pwa'

export function PwaUpdateToast() {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return subscribePwaUpdate((needsRefresh) => {
      setVisible(needsRefresh)
      if (!needsRefresh) setLoading(false)
    })
  }, [])

  async function onRefresh() {
    if (loading) return
    setLoading(true)
    setVisible(false)
    await applyPwaUpdate()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 top-20 z-[70] flex justify-center px-4">
      <div className="flex max-w-md flex-col gap-2 rounded-2xl border border-line bg-card px-4 py-3 shadow-lg sm:flex-row sm:items-center">
        <p className="text-sm text-heading">
          Une nouvelle version de Couturia est prête. Actualisez pour voir les nouveautés.
        </p>
        <button
          type="button"
          className="btn btn-primary btn-sm shrink-0 gap-1.5 rounded-xl"
          disabled={loading}
          onClick={() => void onRefresh()}
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Chargement…' : 'Actualiser'}
        </button>
      </div>
    </div>
  )
}
