import { Link } from 'react-router-dom'
import { ArrowRight, Megaphone, Scissors, Shirt, UserRound } from 'lucide-react'
import { ADMIN_ACTIVITY, ADMIN_KPIS } from '@/lib/admin-mock'

const shortcuts = [
  {
    to: '/admin/publicites',
    label: 'Publicités',
    description: 'Slides de l’accueil',
    icon: Megaphone,
  },
  {
    to: '/admin/clients',
    label: 'Clients',
    description: 'Comptes et activité',
    icon: UserRound,
  },
  {
    to: '/admin/stylistes',
    label: 'Stylistes',
    description: 'Ateliers et vitrines',
    icon: Scissors,
  },
  {
    to: '/admin/creations',
    label: 'Créations',
    description: 'Modérer le catalogue (bientôt)',
    icon: Shirt,
  },
]

export function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-primary sm:text-xl">Accueil admin</h1>
        <p className="mt-0.5 text-xs text-muted">
          Vue d’ensemble — chiffres mock pour le front.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ADMIN_KPIS.map((kpi) => (
          <article
            key={kpi.id}
            className="rounded-xl border border-line bg-white px-2.5 py-2 shadow-sm"
          >
            <p className="truncate text-[10px] font-medium text-muted">{kpi.label}</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-heading">
              {kpi.value}
            </p>
            <p
              className={[
                'mt-0.5 text-[10px] font-semibold',
                kpi.positive ? 'text-emerald-700' : 'text-rose-700',
              ].join(' ')}
            >
              {kpi.delta}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-line bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-heading">Raccourcis</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {shortcuts.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group flex items-start gap-3 rounded-xl border border-line bg-[#faf7f5] p-3 transition hover:border-primary/35 hover:bg-white"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-ribbon text-primary">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-heading">
                        {item.label}
                      </span>
                      <ArrowRight className="size-3.5 text-primary opacity-0 transition group-hover:opacity-100" />
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {item.description}
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white shadow-sm">
          <div className="border-b border-line px-3 py-2.5">
            <h2 className="text-xs font-semibold text-heading">Activité récente</h2>
          </div>
          <ul className="divide-y divide-line/80">
            {ADMIN_ACTIVITY.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-heading">{item.title}</p>
                  <p className="truncate text-[11px] text-muted">« {item.detail} »</p>
                  <p className="mt-0.5 text-[10px] text-muted">Par {item.actor}</p>
                </div>
                <time className="shrink-0 text-[10px] tabular-nums text-muted">
                  {item.when}
                </time>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
