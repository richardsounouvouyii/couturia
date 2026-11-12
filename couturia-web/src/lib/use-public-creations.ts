import { useEffect, useState } from 'react'
import {
  listPublicCreations,
  listPublicCreationsMerged,
  resolvePublicCreationById,
  resolvePublicCreationByIdAsync,
} from '@/lib/catalogue'
import type { MockCreation } from '@/lib/mock-data'

/** Catalogue public : sync immédiat puis enrichissement API. */
export function usePublicCreations() {
  const [items, setItems] = useState<MockCreation[]>(() => listPublicCreations())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void listPublicCreationsMerged()
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { items, loading }
}

/** Détail d’une création (mock / local / UUID API). */
export function usePublicCreation(id: string | undefined) {
  const [creation, setCreation] = useState<MockCreation | undefined>(() =>
    id ? resolvePublicCreationById(id) : undefined,
  )
  const [loading, setLoading] = useState(Boolean(id))

  useEffect(() => {
    if (!id) {
      setCreation(undefined)
      setLoading(false)
      return
    }

    let cancelled = false
    setCreation(resolvePublicCreationById(id))
    setLoading(true)

    void resolvePublicCreationByIdAsync(id)
      .then((data) => {
        if (!cancelled) setCreation(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return { creation, loading }
}
