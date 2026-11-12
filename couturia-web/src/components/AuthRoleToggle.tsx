import { Scissors, UserRound } from 'lucide-react'
import type { PublicAuthRole } from '@/lib/auth-role'

type AuthRoleToggleProps = {
  value: PublicAuthRole
  onChange: (role: PublicAuthRole) => void
}

const options: Array<{
  id: PublicAuthRole
  label: string
  icon: typeof UserRound
}> = [
  { id: 'client', label: 'Client', icon: UserRound },
  { id: 'styliste', label: 'Styliste', icon: Scissors },
]

export function AuthRoleToggle({ value, onChange }: AuthRoleToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Type de compte"
      className="grid grid-cols-2 gap-1.5 rounded-xl border border-line bg-white/90 p-1"
    >
      {options.map(({ id, label, icon: Icon }) => {
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={[
              'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition',
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
