import { useEffect, useRef, useState } from 'react'

type HeroSlide = {
  src: string
  alt: string
}

type HeroCarouselProps = {
  slides: HeroSlide[]
  /** Intervalle entre chaque slide (ms). */
  intervalMs?: number
  className?: string
}

export function HeroCarousel({
  slides,
  intervalMs = 5200,
  className = '',
}: HeroCarouselProps) {
  const [index, setIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState<number | null>(null)
  const [sweeping, setSweeping] = useState(false)
  const sweepTimerRef = useRef<number | null>(null)
  const count = slides.length

  function goTo(next: number) {
    if (next === index || sweeping || count < 2) return
    setPrevIndex(index)
    setIndex(next)
    setSweeping(true)
    if (sweepTimerRef.current != null) window.clearTimeout(sweepTimerRef.current)
    sweepTimerRef.current = window.setTimeout(() => {
      setSweeping(false)
      setPrevIndex(null)
      sweepTimerRef.current = null
    }, 900)
  }

  useEffect(() => {
    if (count < 2) return
    const timer = window.setInterval(() => {
      goTo((index + 1) % count)
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [count, intervalMs, index, sweeping])

  useEffect(
    () => () => {
      if (sweepTimerRef.current != null) window.clearTimeout(sweepTimerRef.current)
    },
    [],
  )

  if (count === 0) return null

  return (
    <div
      className={[
        'relative overflow-hidden rounded-[1.5rem] bg-ribbon shadow-[0_20px_50px_-20px_rgba(112,13,57,0.35)] ring-1 ring-line/80 lg:rounded-[1.75rem]',
        className,
      ].join(' ')}
    >
      <div className="relative aspect-[16/11] w-full overflow-hidden">
        {/* Slide entrante */}
        <img
          src={slides[index]?.src}
          alt={slides[index]?.alt ?? ''}
          className="absolute inset-0 size-full object-cover"
          loading="eager"
        />

        {/* Slide sortante : balayage vers la gauche */}
        {sweeping && prevIndex != null ? (
          <img
            key={`sweep-${prevIndex}-${index}`}
            src={slides[prevIndex]?.src}
            alt=""
            aria-hidden
            className="absolute inset-0 z-[1] size-full object-cover animate-hero-wipe-out"
          />
        ) : null}
      </div>

      {count > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[2] flex justify-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Image ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              className={[
                'pointer-events-auto h-1.5 rounded-full transition-all duration-500',
                i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/80',
              ].join(' ')}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
