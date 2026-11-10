import { useMemo } from 'react'
import { Ruler, Scissors, Shirt, Sparkles } from 'lucide-react'

const ICONS = [Scissors, Ruler, Shirt, Sparkles] as const

/** Pseudo-aléatoire stable (même rendu à chaque mount). */
function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/** Fond type WhatsApp : icônes couture en désordre, sans animation. */
export function CoutureWallpaper() {
  const items = useMemo(() => {
    const count = 72
    const list = []
    for (let i = 0; i < count; i += 1) {
      const a = hash(i + 1)
      const b = hash(i + 41)
      const c = hash(i + 97)
      const d = hash(i + 173)
      const Icon = ICONS[i % ICONS.length]
      list.push({
        key: i,
        Icon,
        left: a * 100,
        top: b * 100,
        size: 14 + c * 18,
        rotate: d * 360 - 180,
        opacity: 0.55 + hash(i + 211) * 0.45,
      })
    }
    return list
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ backgroundColor: '#fcf8f5' }}
    >
      <div className="absolute inset-0" style={{ opacity: 0.07 }}>
        {items.map(({ key, Icon, left, top, size, rotate, opacity }) => (
          <Icon
            key={key}
            strokeWidth={1.4}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              color: '#700D39',
              opacity,
              transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
