import { Link } from 'react-router-dom'
import { ArrowRight, Megaphone, Scissors, Shirt, Users } from 'lucide-react'
import { ADMIN_ACTIVITY, ADMIN_KPIS } from '@/lib/admin-mock'

const shortcuts = [
  {
    to: '/admin/publicites',
    label: 'Publicités & Carousel',
    description: 'Gérer les slides de l’accueil',
    icon: Megaphone,
  },
  {
    to: '/admin/stylistes',
    label: 'Stylistes',
    description: 'Modérer les ateliers (bientôt)',
    icon: Scissors,
  },
  {
    to: '/admin/creations',
    label: 'Créations',
    description: 'Modérer le catalogue (bientôt)',
    icon: Shirt,
  },
  {
    to: '/admin/utilisateurs',
    label: 'Utilisateurs',
    description: 'Comptes plateforme (bientôt)',
    icon: Users,
  },
]

export function AdminDashboardPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary">
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm text-muted">
          Vue d’ensemble Couturia — chiffres mock pour le front.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {ADMIN_KPIS.map((kpi) => (
          <article
            key={kpi.id}
            className="rounded-2xl border border-line bg-white p-3.5 shadow-sm"
          >
            <p className="text-[11px] font-medium text-muted">{kpi.label}</p>
            <p className="mt-1.5 text-xl font-semibold tabular-nums text-heading">
              {kpi.value}
            </p>
            <p
              className={[
                'mt-1 text-[11px] font-semibold',
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

        <section className="rounded-2xl border border-line bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-heading">Activité récente</h2>
          <ul className="mt-3 space-y-3">
            {ADMIN_ACTIVITY.map((item) => (
              <li
                key={item.id}
                className="border-b border-line/70 pb-3 last:border-0 last:pb-0"
              >
                <p className="text-sm text-heading">{item.message}</p>
                <p className="mt-0.5 text-[11px] text-muted">{item.when}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
