import { Scissors, UserRound } from 'lucide-react'
import type { AuthRole } from '@/lib/auth-role'

type AuthRoleToggleProps = {
  value: AuthRole
  onChange: (role: AuthRole) => void
}

const options: Array<{
  id: AuthRole
  label: string
  hint: string
  icon: typeof UserRound
}> = [
  {
    id: 'client',
    label: 'Client',
    hint: 'Parcourir & favoris',
    icon: UserRound,
  },
  {
    id: 'styliste',
    label: 'Styliste',
    hint: 'Gérer ma vitrine',
    icon: Scissors,
  },
]

export function AuthRoleToggle({ value, onChange }: AuthRoleToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Type de compte"
      className="grid grid-cols-2 gap-2 rounded-2xl border border-line bg-white/90 p-1.5"
    >
      {options.map(({ id, label, hint, icon: Icon }) => {
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={[
              'flex flex-col items-center gap-0.5 rounded-xl px-3 py-2.5 text-center transition',
              active
                ? 'bg-primary text-white shadow-sm'
                : 'text-heading hover:bg-page',
            ].join(' ')}
          >
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
              <Icon className="size-4" aria-hidden />
              {label}
            </span>
            <span
              className={[
                'text-[11px] leading-tight',
                active ? 'text-white/85' : 'text-muted',
              ].join(' ')}
            >
              {hint}
            </span>
          </button>
        )
      })}
    </div>
  )
}
