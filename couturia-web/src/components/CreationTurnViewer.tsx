import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Maximize2, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react'

type CreationTurnViewerProps = {
  images: string[]
  alt: string
  className?: string
}

/**
 * Visionneuse multi-angles : glisser pour « tourner », boutons pour zoomer.
 * Effet 360° à partir des photos (pas un vrai modèle 3D).
 */
export function CreationTurnViewer({ images, alt, className = '' }: CreationTurnViewerProps) {
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const dragRef = useRef<{ x: number; startIndex: number } | null>(null)

  const count = images.length
  const safeIndex = count > 0 ? ((index % count) + count) % count : 0
  const current = images[safeIndex] ?? ''

  useEffect(() => {
    setIndex(0)
    setZoom(1)
  }, [images])

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fullscreen])

  const nudge = useCallback(
    (delta: number) => {
      if (count < 2) return
      setIndex((currentIndex) => currentIndex + delta)
    },
    [count],
  )

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (count < 2 || zoom > 1) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { x: event.clientX, startIndex: safeIndex }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current || count < 2 || zoom > 1) return
    const dx = event.clientX - dragRef.current.x
    const step = Math.round(dx / 36)
    if (step === 0) return
    setIndex(dragRef.current.startIndex - step)
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragRef.current = null
  }

  function zoomIn() {
    setZoom((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))))
  }

  function zoomOut() {
    setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))
  }

  function resetView() {
    setZoom(1)
    setIndex(0)
  }

  if (count === 0) {
    return (
      <div
        className={[
          'grid aspect-[4/3] place-items-center rounded-2xl border border-dashed border-line bg-page text-sm text-muted',
          className,
        ].join(' ')}
      >
        Aucune photo
      </div>
    )
  }

  const stage = (
    <div
      className={[
        'relative overflow-hidden rounded-2xl border border-line bg-ribbon',
        fullscreen ? 'h-full max-h-[min(80vh,720px)] w-full max-w-4xl border-0' : '',
        className,
      ].join(' ')}
    >
      <div
        className={[
          'relative touch-pan-y select-none',
          fullscreen ? 'flex h-full items-center justify-center' : 'aspect-[4/3]',
          count > 1 && zoom === 1 ? 'cursor-ew-resize' : 'cursor-default',
        ].join(' ')}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          src={current}
          alt={`${alt} — angle ${safeIndex + 1}/${count}`}
          draggable={false}
          className={[
            'mx-auto transition-transform duration-150',
            fullscreen ? 'max-h-full max-w-full object-contain' : 'size-full object-cover',
          ].join(' ')}
          style={{ transform: `scale(${zoom})` }}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/55 to-transparent px-3 py-2.5">
        <p className="text-[11px] font-medium text-white/95">
          {count > 1
            ? `Glissez pour tourner · ${safeIndex + 1}/${count}`
            : '1 photo · ajoutez d’autres angles'}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="grid size-8 place-items-center rounded-full bg-white/95 text-heading"
            onClick={zoomOut}
            aria-label="Zoom arrière"
          >
            <ZoomOut className="size-4" />
          </button>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-full bg-white/95 text-heading"
            onClick={zoomIn}
            aria-label="Zoom avant"
          >
            <ZoomIn className="size-4" />
          </button>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-full bg-white/95 text-heading"
            onClick={resetView}
            aria-label="Réinitialiser la vue"
          >
            <RotateCcw className="size-4" />
          </button>
          {!fullscreen ? (
            <button
              type="button"
              className="grid size-8 place-items-center rounded-full bg-white/95 text-heading"
              onClick={() => setFullscreen(true)}
              aria-label="Plein écran"
            >
              <Maximize2 className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      {count > 1 ? (
        <div className="absolute top-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-2 py-1">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Angle ${i + 1}`}
              onClick={() => setIndex(i)}
              className={[
                'size-1.5 rounded-full transition',
                i === safeIndex ? 'bg-white' : 'bg-white/45',
              ].join(' ')}
            />
          ))}
        </div>
      ) : null}

      {count > 1 ? (
        <>
          <button
            type="button"
            className="absolute top-1/2 left-2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-lg font-semibold text-heading shadow-sm"
            onClick={() => nudge(-1)}
            aria-label="Angle précédent"
          >
            ‹
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-lg font-semibold text-heading shadow-sm"
            onClick={() => nudge(1)}
            aria-label="Angle suivant"
          >
            ›
          </button>
        </>
      ) : null}
    </div>
  )

  return (
    <>
      {fullscreen ? null : stage}
      {fullscreen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-3 sm:p-8">
          <button
            type="button"
            className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-white text-heading"
            onClick={() => setFullscreen(false)}
            aria-label="Fermer"
          >
            <X className="size-5" />
          </button>
          {stage}
        </div>
      ) : null}
    </>
  )
}
