import { Construction } from 'lucide-react'
import { Link } from 'react-router-dom'

type Props = {
  title: string
  description?: string
}

export function PlaceholderPage({ title, description }: Props) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <Construction className="size-10 mx-auto text-accent mb-4" aria-hidden />
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-3 text-base-content/70">
        {description ?? 'Page prévue dans le Sprint 1 / 2 — pas encore branchée à une API.'}
      </p>
      <Link to="/" className="btn btn-primary btn-sm mt-8">
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
