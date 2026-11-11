import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { CreationTurnViewer } from '@/components/CreationTurnViewer'

type CreationGalleryModalProps = {
  open: boolean
  onClose: () => void
  images: string[]
  labels?: string[]
  title: string
  initialIndex?: number
  onIndexChange?: (index: number) => void
}

/** Galerie plein écran : rotation, zoom, miniatures. */
export function CreationGalleryModal({
  open,
  onClose,
  images,
  labels,
  title,
  initialIndex = 0,
  onIndexChange,
}: CreationGalleryModalProps) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    if (open) setIndex(initialIndex)
  }, [open, initialIndex])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  function selectIndex(next: number) {
    setIndex(next)
    onIndexChange?.(next)
  }

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex flex-col bg-[#14060c]/96 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Galerie — ${title}`}
    >
      <header className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-6 sm:py-3">
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold text-white sm:text-xl">
            {title}
          </p>
          <p className="text-[11px] text-white/70 sm:text-xs">
            Galerie · {images.length} photo{images.length > 1 ? 's' : ''} ·{' '}
            {labels?.[index]?.trim()
              ? `${labels[index]} · ${index + 1}/${images.length}`
              : `${index + 1}/${images.length}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-heading shadow-md sm:size-11"
          aria-label="Fermer la galerie"
        >
          <X className="size-4 sm:size-5" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 sm:px-6 sm:pb-5">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center">
          <CreationTurnViewer
            images={images}
            labels={labels}
            alt={title}
            activeIndex={index}
            onActiveIndexChange={selectIndex}
            immersive
            aspectClass="aspect-[3/4]"
          />
        </div>

        {images.length > 1 ? (
          <ul className="mx-auto mt-4 flex w-full max-w-5xl gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((src, i) => {
              const active = i === index
              const label = labels?.[i]?.trim()
              return (
                <li key={`${i}-${src.slice(0, 24)}`} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => selectIndex(i)}
                    aria-label={label ? label : `Photo ${i + 1}`}
                    aria-current={active ? 'true' : undefined}
                    className={[
                      'block overflow-hidden rounded-xl border-2 transition',
                      active
                        ? 'border-white ring-2 ring-white/30'
                        : 'border-white/25 opacity-80 hover:opacity-100',
                    ].join(' ')}
                  >
                    <img
                      src={src}
                      alt=""
                      className="size-[4.25rem] object-cover sm:size-24"
                      loading="lazy"
                    />
                  </button>
                  {label ? (
                    <span className="pointer-events-none absolute inset-x-1 bottom-1 truncate rounded bg-black/65 px-1 py-0.5 text-center text-[9px] font-semibold text-white">
                      {label}
                    </span>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
