import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from 'react'
import { Maximize2, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react'

type CreationTurnViewerProps = {
  images: string[]
  /** Libellés d’angle (Face, Dos…) alignés sur `images`. */
  labels?: string[]
  alt: string
  className?: string
  activeIndex?: number
  onActiveIndexChange?: (index: number) => void
  /** Mode galerie / lightbox : hauteur souple, image contenue. */
  immersive?: boolean
  /** Ratio hors mode immersif (défaut portrait produit). */
  aspectClass?: string
}

/**
 * Visionneuse multi-angles :
 * - glisser horizontalement pour changer d’angle
 * - pinch / molette / boutons pour zoomer
 * - déplacer l’image une fois zoomée
 */
export function CreationTurnViewer({
  images,
  labels,
  alt,
  className = '',
  activeIndex,
  onActiveIndexChange,
  immersive = false,
  aspectClass = 'aspect-[3/4]',
}: CreationTurnViewerProps) {
  const controlled = typeof activeIndex === 'number'
  const [internalIndex, setInternalIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [fullscreen, setFullscreen] = useState(false)
  const [dragging, setDragging] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    mode: 'turn' | 'pan'
    startX: number
    startY: number
    startIndex: number
    originX: number
    originY: number
  } | null>(null)
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null)

  const count = images.length
  const rawIndex = controlled ? activeIndex : internalIndex
  const safeIndex = count > 0 ? ((rawIndex % count) + count) % count : 0
  const current = images[safeIndex] ?? ''
  const currentLabel = labels?.[safeIndex]?.trim() || null

  const setIndex = useCallback(
    (next: number | ((currentValue: number) => number)) => {
      const resolved = typeof next === 'function' ? next(safeIndex) : next
      const normalized = count > 0 ? ((resolved % count) + count) % count : 0
      if (!controlled) setInternalIndex(normalized)
      onActiveIndexChange?.(normalized)
    },
    [controlled, count, onActiveIndexChange, safeIndex],
  )

  function clampZoom(value: number) {
    return Math.min(3, Math.max(1, Number(value.toFixed(2))))
  }

  function resetView() {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setIndex(0)
  }

  useEffect(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [images])

  useEffect(() => {
    if (count === 0) {
      if (!controlled) setInternalIndex(0)
      return
    }
    if (rawIndex >= count) {
      const last = count - 1
      if (!controlled) setInternalIndex(last)
      onActiveIndexChange?.(last)
    }
  }, [count, controlled, onActiveIndexChange, rawIndex])

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false)
      if (event.key === 'ArrowLeft') setIndex((i) => i - 1)
      if (event.key === 'ArrowRight') setIndex((i) => i + 1)
      if (event.key === '+' || event.key === '=') setZoom((z) => clampZoom(z + 0.25))
      if (event.key === '-') setZoom((z) => clampZoom(z - 0.25))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fullscreen, setIndex])

  useEffect(() => {
    const node = stageRef.current
    if (!node) return
    const onWheelNative = (event: WheelEvent) => {
      event.preventDefault()
      const direction = event.deltaY > 0 ? -0.18 : 0.18
      setZoom((z) => {
        const next = clampZoom(z + direction)
        if (next === 1) setOffset({ x: 0, y: 0 })
        return next
      })
    }
    node.addEventListener('wheel', onWheelNative, { passive: false })
    return () => node.removeEventListener('wheel', onWheelNative)
  }, [fullscreen, current])

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch' && event.isPrimary === false) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
    dragRef.current = {
      mode: zoom > 1 ? 'pan' : 'turn',
      startX: event.clientX,
      startY: event.clientY,
      startIndex: safeIndex,
      originX: offset.x,
      originY: offset.y,
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag) return

    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY

    if (drag.mode === 'pan' || zoom > 1) {
      setOffset({
        x: drag.originX + dx,
        y: drag.originY + dy,
      })
      return
    }

    if (count < 2) return
    // ~48px par angle → rotation plus nette au doigt / souris
    const step = Math.round(dx / 48)
    if (step === 0) return
    setIndex(drag.startIndex - step)
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragRef.current = null
    setDragging(false)
  }

  function onTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
    if (event.touches.length !== 2) return
    const [a, b] = [event.touches[0], event.touches[1]]
    const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
    pinchRef.current = { distance, zoom }
    dragRef.current = null
  }

  function onTouchMove(event: ReactTouchEvent<HTMLDivElement>) {
    if (event.touches.length !== 2 || !pinchRef.current) return
    event.preventDefault()
    const [a, b] = [event.touches[0], event.touches[1]]
    const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
    const ratio = distance / Math.max(1, pinchRef.current.distance)
    const next = clampZoom(pinchRef.current.zoom * ratio)
    setZoom(next)
    if (next === 1) setOffset({ x: 0, y: 0 })
  }

  function onTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
    if (event.touches.length < 2) pinchRef.current = null
  }

  function zoomBy(delta: number) {
    setZoom((z) => {
      const next = clampZoom(z + delta)
      if (next === 1) setOffset({ x: 0, y: 0 })
      return next
    })
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

  const tall = fullscreen || immersive

  const stage = (
    <div
      className={[
        'relative overflow-hidden rounded-2xl border border-line bg-[#1a0a10]',
        fullscreen ? 'h-full max-h-[min(82vh,760px)] w-full max-w-4xl border-0' : '',
        immersive ? 'min-h-[56vh] border-white/10 sm:min-h-[68vh]' : '',
        className,
      ].join(' ')}
    >
      <div
        ref={stageRef}
        className={[
          'relative touch-none select-none',
          tall
            ? 'flex h-full min-h-[56vh] items-center justify-center sm:min-h-[68vh]'
            : aspectClass,
          zoom > 1 ? 'cursor-grab' : count > 1 ? 'cursor-ew-resize' : 'cursor-default',
          dragging && zoom > 1 ? 'cursor-grabbing' : '',
        ].join(' ')}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={current}
          alt={
            currentLabel
              ? `${alt} — ${currentLabel}`
              : `${alt} — angle ${safeIndex + 1}/${count}`
          }
          draggable={false}
          className={[
            'mx-auto transition-transform duration-75 ease-out',
            tall
              ? 'max-h-full max-w-full object-contain'
              : 'size-full object-cover',
          ].join(' ')}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        />
      </div>

      {/* Piste d’angles */}
      {count > 1 ? (
        <div className="pointer-events-none absolute top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              className={[
                'h-1.5 rounded-full transition-all',
                i === safeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/45',
              ].join(' ')}
            />
          ))}
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-2.5 pt-6 pb-2.5 sm:px-3 sm:pt-8 sm:pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold text-white sm:text-[11px]">
              {count > 1
                ? currentLabel
                  ? `${currentLabel} · ${safeIndex + 1}/${count}`
                  : `Tourner · ${safeIndex + 1}/${count}`
                : currentLabel || 'Ajoutez d’autres angles'}
            </p>
            <p className="hidden text-[10px] text-white/75 sm:block">
              {zoom > 1
                ? 'Déplacez pour explorer · pincez pour zoomer'
                : 'Glissez ← → · molette / boutons pour zoomer'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              className="grid size-8 place-items-center rounded-full bg-white text-heading shadow-sm sm:size-9"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => zoomBy(-0.25)}
              aria-label="Zoom arrière"
            >
              <ZoomOut className="size-3.5 sm:size-4" />
            </button>
            <span className="min-w-8 text-center text-[10px] font-semibold text-white sm:min-w-10 sm:text-[11px]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              className="grid size-8 place-items-center rounded-full bg-white text-heading shadow-sm sm:size-9"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => zoomBy(0.25)}
              aria-label="Zoom avant"
            >
              <ZoomIn className="size-3.5 sm:size-4" />
            </button>
            <button
              type="button"
              className="grid size-8 place-items-center rounded-full bg-white text-heading shadow-sm sm:size-9"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={resetView}
              aria-label="Réinitialiser"
            >
              <RotateCcw className="size-3.5 sm:size-4" />
            </button>
            {!fullscreen ? (
              <button
                type="button"
                className="grid size-8 place-items-center rounded-full bg-white text-heading shadow-sm sm:size-9"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setFullscreen(true)}
                aria-label="Plein écran"
              >
                <Maximize2 className="size-3.5 sm:size-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {count > 1 && zoom === 1 ? (
        <>
          <button
            type="button"
            className="absolute top-1/2 left-2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white text-xl font-semibold text-heading shadow-md sm:size-11"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setIndex((i) => i - 1)}
            aria-label="Angle précédent"
          >
            ‹
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white text-xl font-semibold text-heading shadow-md sm:size-11"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setIndex((i) => i + 1)}
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-3 sm:p-8">
          <button
            type="button"
            className="absolute top-4 right-4 z-[81] grid size-11 place-items-center rounded-full bg-white text-heading shadow-md"
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
