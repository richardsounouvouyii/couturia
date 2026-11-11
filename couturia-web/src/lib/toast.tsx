import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type ToastKind = 'favorite-add' | 'favorite-remove'

type ToastItem = {
  id: number
  kind: ToastKind
}

type ToastContextValue = {
  showToast: (kind: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DURATION_MS = 2800

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null)
  const timerRef = useRef<number | null>(null)
  const idRef = useRef(0)

  const showToast = useCallback((kind: ToastKind) => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
    }
    idRef.current += 1
    const id = idRef.current
    setToast({ id, kind })
    timerRef.current = window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current))
      timerRef.current = null
    }, DURATION_MS)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <FavoritesToast key={toast.id} kind={toast.kind} /> : null}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}

function FavoritesToast({ kind }: { kind: ToastKind }) {
  const added = kind === 'favorite-add'

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4 sm:top-5"
    >
      <div className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-white shadow-lg shadow-primary/10">
        <div className="flex items-center gap-3 px-3.5 py-3">
          <span
            className={[
              'grid size-9 shrink-0 place-items-center rounded-full',
              added ? 'bg-[#e6f6ef]' : 'bg-[#f8e8ef]',
            ].join(' ')}
          >
            {added ? (
              <svg
                viewBox="0 0 24 24"
                className="size-4 fill-[#1f7a57] text-[#1f7a57]"
                aria-hidden
              >
                <path d="M12 21s-6.7-4.35-9.33-7.4C.55 11.2.8 7.9 3.2 6.05 5.05 4.6 7.7 4.9 9.2 6.55L12 9.7l2.8-3.15c1.5-1.65 4.15-1.95 6 0.5 2.4 1.85 2.65 5.15.53 7.55C18.7 16.65 12 21 12 21z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="size-4 fill-none stroke-[#700d39]"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20.8 5.6a5.1 5.1 0 0 0-7.2 0L12 7.2l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2l1.6 1.6L12 21l7.2-7.2 1.6-1.6a5.1 5.1 0 0 0 0-7.2z" />
              </svg>
            )}
          </span>
          <p className="text-sm font-medium text-heading">
            {added ? 'Ajouté aux favoris.' : 'Retiré des favoris.'}
          </p>
        </div>
        <div className="h-1 bg-line/70">
          <div
            className={[
              'h-full origin-left',
              added ? 'bg-[#1f7a57]' : 'bg-[#c2185b]',
            ].join(' ')}
            style={{ animation: `toast-progress ${DURATION_MS}ms linear forwards` }}
          />
        </div>
      </div>
    </div>
  )
}
