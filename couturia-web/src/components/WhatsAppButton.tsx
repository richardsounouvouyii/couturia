import { MessageCircle } from 'lucide-react'
import {
  buildWhatsAppUrl,
  isDemoWhatsApp,
  isWhatsAppAvailable,
} from '@/lib/whatsapp'

type Props = {
  phone: string | null | undefined
  message: string
  label?: string
  className?: string
  size?: 'sm' | 'md'
}

export function WhatsAppButton({
  phone,
  message,
  label = 'Contacter sur WhatsApp',
  className = '',
  size = 'md',
}: Props) {
  const available = isWhatsAppAvailable(phone)
  const url = available && phone ? buildWhatsAppUrl(phone, message) : null
  const demo = isDemoWhatsApp(phone)

  if (!available || !url) {
    return (
      <div
        className={[
          'rounded-xl border border-dashed border-line bg-page px-4 py-3 text-sm text-muted',
          className,
        ].join(' ')}
        role="status"
      >
        WhatsApp indisponible pour cet atelier pour le moment. Revenez plus tard ou
        explorez d&apos;autres stylistes.
      </div>
    )
  }

  return (
    <div className={className}>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={[
          'btn border-0 bg-[#25D366] text-white hover:bg-[#1ebe57]',
          size === 'sm' ? 'btn-sm rounded-full' : 'rounded-xl',
        ].join(' ')}
        aria-label={label}
      >
        <MessageCircle className="size-4" aria-hidden />
        {label}
      </a>
      {demo ? (
        <p className="mt-2 text-xs text-muted">
          Numéro de démonstration — remplacez-le par le vrai WhatsApp de l&apos;atelier.
        </p>
      ) : null}
    </div>
  )
}
