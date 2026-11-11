import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from 'react'
import { Maximize2, RotateCcw, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react'

/** À partir de ce nombre de photos, on active le mode tour 360°. */
export const TURN_360_MIN_FRAMES = 8

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

function wrapIndex(index: number, count: number) {
  if (count <= 0) return 0
  return ((index % count) + count) % count
}

function pixelsPerFrame(count: number, stageWidth: number) {
  if (count < 2) return 48
  // Un tour complet ≈ largeur de la scène (ou 280px mini)
  const track = Math.max(280, stageWidth || 320)
  return Math.max(10, track / count)
}

/**
 * Visionneuse multi-angles / tour 360° :
 * - glisser horizontalement pour tourner (boucle continue)
 * - inertie au relâchement
 * - pinch / molette / boutons pour zoomer
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
    lastX: number
    lastT: number
    velocity: number
  } | null>(null)
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null)
  const inertiaRef = useRef<number | null>(null)
  const indexRef = useRef(0)

  const count = images.length
  const is360 = count >= TURN_360_MIN_FRAMES
  const rawIndex = controlled ? activeIndex : internalIndex
  const safeIndex = wrapIndex(rawIndex ?? 0, count)
  const current = images[safeIndex] ?? ''
  indexRef.current = safeIndex

  const degree = count > 0 ? Math.round((safeIndex / count) * 360) % 360 : 0
  const currentLabel = useMemo(() => {
    const custom = labels?.[safeIndex]?.trim()
    if (custom && custom.toLowerCase() !== 'autre') return custom
    if (is360) return `${degree}°`
    return custom || null
  }, [degree, is360, labels, safeIndex])

  const setIndex = useCallback(
    (next: number | ((currentValue: number) => number)) => {
      const resolved = typeof next === 'function' ? next(indexRef.current) : next
      const normalized = wrapIndex(resolved, count)
      if (!controlled) setInternalIndex(normalized)
      onActiveIndexChange?.(normalized)
      indexRef.current = normalized
    },
    [controlled, count, onActiveIndexChange],
  )

  function clampZoom(value: number) {
    return Math.min(3, Math.max(1, Number(value.toFixed(2))))
  }

  function stopInertia() {
    if (inertiaRef.current != null) {
      cancelAnimationFrame(inertiaRef.current)
      inertiaRef.current = null
    }
  }

  function resetView() {
    stopInertia()
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setIndex(0)
  }

  // Précharge les images voisines pour un tour fluide
  useEffect(() => {
    if (count < 2) return
    const neighbors = [
      images[wrapIndex(safeIndex - 1, count)],
      images[wrapIndex(safeIndex + 1, count)],
      images[wrapIndex(safeIndex + 2, count)],
    ]
    for (const src of neighbors) {
      if (!src) continue
      const img = new Image()
      img.src = src
    }
  }, [count, images, safeIndex])

  useEffect(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    stopInertia()
  }, [images])

  useEffect(() => {
    if (count === 0) {
      if (!controlled) setInternalIndex(0)
      return
    }
    if ((rawIndex ?? 0) >= count) {
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
      // En mode 360, molette horizontale / shift = tourner ; sinon zoom
      if (count > 1 && (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey)) {
        const delta = event.deltaX !== 0 ? event.deltaX : event.deltaY
        const step = delta > 0 ? 1 : -1
        setIndex((i) => i + step)
        return
      }
      const direction = event.deltaY > 0 ? -0.18 : 0.18
      setZoom((z) => {
        const next = clampZoom(z + direction)
        if (next === 1) setOffset({ x: 0, y: 0 })
        return next
      })
    }
    node.addEventListener('wheel', onWheelNative, { passive: false })
    return () => node.removeEventListener('wheel', onWheelNative)
  }, [count, current, fullscreen, setIndex])

  useEffect(() => () => stopInertia(), [])

  function startInertia(velocityFramesPerMs: number) {
    stopInertia()
    if (count < 2 || Math.abs(velocityFramesPerMs) < 0.002) return

    let velocity = velocityFramesPerMs
    let acc = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min(32, now - last)
      last = now
      acc += velocity * dt
      const steps = Math.trunc(acc)
      if (steps !== 0) {
        acc -= steps
        setIndex((i) => i + steps)
      }
      velocity *= 0.94
      if (Math.abs(velocity) < 0.0015) {
        inertiaRef.current = null
        return
      }
      inertiaRef.current = requestAnimationFrame(tick)
    }
    inertiaRef.current = requestAnimationFrame(tick)
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch' && event.isPrimary === false) return
    stopInertia()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
    const now = performance.now()
    dragRef.current = {
      mode: zoom > 1 ? 'pan' : 'turn',
      startX: event.clientX,
      startY: event.clientY,
      startIndex: safeIndex,
      originX: offset.x,
      originY: offset.y,
      lastX: event.clientX,
      lastT: now,
      velocity: 0,
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag) return

    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    const now = performance.now()
    const dt = Math.max(1, now - drag.lastT)
    const frameDelta = (event.clientX - drag.lastX) / dt
    drag.lastX = event.clientX
    drag.lastT = now

    if (drag.mode === 'pan' || zoom > 1) {
      setOffset({
        x: drag.originX + dx,
        y: drag.originY + dy,
      })
      return
    }

    if (count < 2) return
    const width = stageRef.current?.clientWidth ?? 320
    const ppf = pixelsPerFrame(count, width)
    // Glisser à droite → tourner dans le sens horaire (index++)
    const step = Math.round(-dx / ppf)
    drag.velocity = -frameDelta / ppf
    if (step === 0 && Math.abs(dx) < ppf * 0.35) return
    setIndex(drag.startIndex + step)
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    const drag = dragRef.current
    dragRef.current = null
    setDragging(false)
    if (drag?.mode === 'turn' && zoom === 1 && count >= 2) {
      startInertia(drag.velocity)
    }
  }

  function onTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
    if (event.touches.length !== 2) return
    stopInertia()
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
  const showSideButtons = count > 1 && count < TURN_360_MIN_FRAMES && zoom === 1

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
            'mx-auto',
            tall
              ? 'max-h-full max-w-full object-contain'
              : 'size-full object-cover',
            zoom > 1 ? 'transition-transform duration-75 ease-out' : '',
          ].join(' ')}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        />
      </div>

      {count > 1 ? (
        <div className="pointer-events-none absolute top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/50 px-2.5 py-1.5">
          {is360 ? (
            <>
              <RotateCw className="size-3 text-white/90" aria-hidden />
              <span className="text-[10px] font-semibold tracking-wide text-white">
                Tour 360° · {degree}°
              </span>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
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
          )}
        </div>
      ) : null}

      {is360 ? (
        <div className="pointer-events-none absolute top-12 left-1/2 z-10 h-1 w-[min(70%,14rem)] -translate-x-1/2 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white/90 transition-[width] duration-75"
            style={{ width: `${((safeIndex + 1) / count) * 100}%` }}
          />
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-2.5 pt-6 pb-2.5 sm:px-3 sm:pt-8 sm:pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold text-white sm:text-[11px]">
              {count > 1
                ? is360
                  ? `Glissez pour tourner · ${safeIndex + 1}/${count}`
                  : currentLabel
                    ? `${currentLabel} · ${safeIndex + 1}/${count}`
                    : `Tourner · ${safeIndex + 1}/${count}`
                : currentLabel || 'Ajoutez d’autres angles'}
            </p>
            <p className="hidden text-[10px] text-white/75 sm:block">
              {zoom > 1
                ? 'Déplacez pour explorer · pincez pour zoomer'
                : is360
                  ? 'Faites le tour du vêtement · molette / boutons pour zoomer'
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

      {showSideButtons ? (
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
