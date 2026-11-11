import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Baby,
  ChevronRight,
  Gem,
  Heart,
  Layers,
  MessageCircle,
  Ruler,
  Scissors,
  ShieldCheck,
  Shirt,
  Sparkles,
} from 'lucide-react'
import { CreationCard } from '@/components/CreationCard'
import { DocumentMeta } from '@/components/DocumentMeta'
import atelierImage from '@/assets/images/atelier.jpg'
import heroImage from '@/assets/images/hero.jpg'
import { listPublicCreations } from '@/lib/catalogue'
import { MOCK_CATEGORIES, MOCK_FEATURES, MOCK_STATS } from '@/lib/mock-data'

const MOBILE_QUICK_CATEGORIES = [
  { id: 'robes', label: 'Robes', icon: 'Shirt' },
  { id: 'ensembles', label: 'Ensembles', icon: 'Layers' },
  { id: 'mariage', label: 'Mariage', icon: 'Heart' },
  { id: 'plus', label: 'Plus', icon: 'Sparkles' },
] as const

const iconMap = {
  Shirt,
  Ruler,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  Layers,
  Heart,
  Baby,
  Gem,
  Scissors,
} as const

export function HomePage() {
  const [activeCategory, setActiveCategory] = useState('tous')

  const publicCreations = listPublicCreations()
  const filteredCreations =
    activeCategory === 'tous'
      ? publicCreations
      : publicCreations.filter(
          (item) => item.categorie.toLowerCase() === activeCategory,
        )

  return (
    <div>
      <DocumentMeta
        title="Couturia"
        description="Vitrine des couturières et stylistes au Bénin. Découvrez des créations et contactez les ateliers sur WhatsApp."
        path="/"
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-page">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 pt-6 pb-6 lg:grid-cols-2 lg:gap-6 lg:px-8 lg:pt-12 lg:pb-8">
          {/* Image d'abord sur mobile */}
          <div className="animate-fade-in relative order-1 lg:order-2">
            <svg
              className="pointer-events-none absolute -left-10 top-1/2 z-10 hidden h-[120%] w-24 -translate-y-1/2 text-gold lg:block"
              viewBox="0 0 80 400"
              fill="none"
              aria-hidden
            >
              <path
                d="M70 0C20 80 20 160 40 200C60 240 60 320 10 400"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.55"
              />
            </svg>

            <div className="relative overflow-hidden rounded-[1.5rem] bg-ribbon shadow-[0_20px_50px_-20px_rgba(112,13,57,0.35)] ring-1 ring-line/80 lg:rounded-[1.75rem]">
              <img
                src={heroImage}
                alt="Couturière souriante devant sa machine à coudre Couturia"
                className="aspect-[16/11] w-full object-cover object-left lg:aspect-auto lg:h-auto lg:object-contain"
              />
            </div>
          </div>

          <div className="order-2 z-10 lg:order-1">
            <p className="animate-fade-up text-[11px] font-semibold uppercase tracking-[0.24em] text-gold sm:text-xs">
              Mode · Couture · Création · Sur mesure
            </p>
            <h1 className="animate-fade-up delay-100 font-display mt-3 text-[1.7rem] font-semibold leading-[1.2] text-primary sm:text-4xl lg:mt-4 lg:text-[2.75rem] lg:leading-[1.15]">
              <span className="lg:hidden">
                Découvrez des créations uniques près de chez vous
              </span>
              <span className="hidden lg:inline">
                Couturia, la vitrine des couturières et stylistes
              </span>
            </h1>
            <p className="animate-fade-up delay-200 mt-3 max-w-md text-sm leading-relaxed text-muted lg:mt-4 sm:text-[15px]">
              <span className="lg:hidden">
                Explorez les pièces des ateliers et contactez-les directement sur
                WhatsApp.
              </span>
              <span className="hidden lg:inline">
                Exposez vos créations, gagnez en visibilité et faites-vous
                contacter facilement sur WhatsApp.
              </span>
            </p>
            <div className="animate-fade-up delay-300 mt-5 grid grid-cols-1 gap-3 sm:flex sm:flex-row sm:items-center lg:mt-7">
              <Link
                to="/catalogue"
                className="btn btn-primary h-11 min-h-11 gap-2 rounded-xl px-5 shadow-md"
              >
                <Shirt className="size-4" aria-hidden />
                Explorer les créations
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                to="/inscription?role=styliste"
                className="btn h-11 min-h-11 gap-2 rounded-xl border-2 border-gold bg-transparent text-heading hover:bg-gold/10"
              >
                <Scissors className="size-4 text-gold" aria-hidden />
                Devenir styliste
              </Link>
            </div>
          </div>
        </div>

        {/* Ruban avantages — desktop / tablette */}
        <div className="relative hidden border-t border-line/70 bg-surface sm:block">
          <div className="mx-auto grid max-w-7xl gap-0 px-2 sm:grid-cols-2 lg:grid-cols-4 lg:px-4">
            {MOCK_FEATURES.map((feature, index) => {
              const Icon = iconMap[feature.icon]
              return (
                <div
                  key={feature.title}
                  className={[
                    'flex items-start gap-3 px-4 py-5',
                    index < MOCK_FEATURES.length - 1
                      ? 'lg:border-r lg:border-line/80'
                      : '',
                  ].join(' ')}
                >
                  <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full border border-gold/50 text-gold">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-primary">{feature.title}</h2>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Catégories rapides — mobile */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:hidden">
        <div className="grid grid-cols-4 gap-3">
          {MOBILE_QUICK_CATEGORIES.map((category) => {
            const Icon = iconMap[category.icon]
            const to =
              category.id === 'plus'
                ? '/catalogue'
                : `/catalogue?categorie=${category.id}`
            return (
              <Link
                key={category.id}
                to={to}
                className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white px-2 py-3 text-center shadow-sm"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-ribbon text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-[11px] font-medium text-heading">{category.label}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Créations */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 lg:mb-6">
          <h2 className="font-display text-2xl font-semibold text-primary sm:text-3xl">
            <span className="lg:hidden">Créations récentes</span>
            <span className="hidden lg:inline">Explorez les créations</span>
          </h2>
          <Link to="/catalogue" className="btn btn-ghost btn-sm gap-1 text-primary">
            Voir tout
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <div className="mb-6 hidden gap-2 overflow-x-auto pb-1 sm:flex">
          {MOCK_CATEGORIES.map((category) => {
            const Icon = iconMap[category.icon]
            const active = activeCategory === category.id
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={[
                  'btn btn-sm h-9 min-h-9 shrink-0 gap-1.5 rounded-full px-4',
                  active
                    ? 'btn-primary border-primary'
                    : 'border border-line bg-white text-heading hover:border-primary/40',
                ].join(' ')}
              >
                <Icon className="size-3.5" aria-hidden />
                {category.label}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
          {filteredCreations.map((creation) => (
            <Link
              key={creation.id}
              to={`/catalogue/${creation.id}`}
              className="block transition hover:-translate-y-0.5"
            >
              <CreationCard creation={creation} />
            </Link>
          ))}
        </div>
      </section>

      {/* Bannière rejoindre — mobile / tablette */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:hidden">
        <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-white shadow-lg">
          <div className="relative z-10 max-w-[65%]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-soft">
              Stylistes & couturières
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold">
              Rejoignez Couturia
            </h2>
            <p className="mt-2 text-sm text-white/85">
              Exposez vos créations et développez votre clientèle.
            </p>
            <Link
              to="/espace-styliste"
              className="btn mt-5 border-0 bg-gold text-heading hover:bg-gold-soft"
            >
              Espace styliste
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <img
            src={atelierImage}
            alt=""
            className="pointer-events-none absolute right-[-10%] bottom-0 h-[90%] w-auto object-cover opacity-40"
            aria-hidden
          />
        </div>
      </section>

      <section id="a-propos" className="bg-[#700d39] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-12">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e8d5b5]/90 lg:text-left">
            À propos · chiffres illustratifs
          </p>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {MOCK_STATS.map((stat) => (
              <div key={stat.label} className="text-center lg:text-left">
                <p
                  className="font-display text-3xl font-semibold sm:text-4xl"
                  style={{ color: '#e8d5b5' }}
                >
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-white/85">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
