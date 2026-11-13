import { Scissors, UserRound } from 'lucide-react'
import type { PublicAuthRole } from '@/lib/auth-role'

type AuthRoleToggleProps = {
  value: PublicAuthRole
  onChange: (role: PublicAuthRole) => void
  disabled?: boolean
}

const options: Array<{
  id: PublicAuthRole
  label: string
  icon: typeof UserRound
}> = [
  { id: 'client', label: 'Client', icon: UserRound },
  { id: 'styliste', label: 'Styliste', icon: Scissors },
]

export function AuthRoleToggle({
  value,
  onChange,
  disabled = false,
}: AuthRoleToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Type de compte"
      aria-disabled={disabled || undefined}
      className={[
        'grid grid-cols-2 gap-1.5 rounded-xl border border-line bg-white/90 p-1',
        disabled ? 'opacity-60' : '',
      ].join(' ')}
    >
      {options.map(({ id, label, icon: Icon }) => {
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => {
              if (!disabled) onChange(id)
            }}
            className={[
              'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition',
              disabled ? 'cursor-not-allowed' : '',
              active
                ? 'bg-primary text-white shadow-sm'
                : 'text-heading hover:bg-page',
            ].join(' ')}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        )
      })}
    </div>
  )
}
