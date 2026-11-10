import { useEffect, useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { APP_VERSION, SEEN_VERSION_KEY, WHATS_NEW } from '@/lib/release'

export function WhatsNewModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(SEEN_VERSION_KEY)
    if (seen !== APP_VERSION) {
      setOpen(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-primary/35 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
        className="w-full max-w-md rounded-2xl border border-line bg-card p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                Mise à jour {APP_VERSION}
              </p>
              <h2
                id="whats-new-title"
                className="font-display mt-1 text-xl font-semibold text-primary"
              >
                Quoi de neuf
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-square btn-sm text-muted"
            aria-label="Fermer"
            onClick={dismiss}
          >
            <X className="size-4" />
          </button>
        </div>

        <ul className="mt-5 space-y-3">
          {WHATS_NEW.map((item) => (
            <li
              key={item.title}
              className="rounded-xl border border-line/80 bg-page px-3.5 py-3"
            >
              <p className="text-sm font-semibold text-heading">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="btn btn-primary mt-5 w-full rounded-xl"
          onClick={dismiss}
        >
          C&apos;est compris
        </button>
      </div>
    </div>
  )
}
