import { Link } from 'react-router-dom'
import { Construction } from 'lucide-react'

type Props = {
  title: string
  description?: string
}

export function AdminPlaceholderPage({
  title,
  description = 'Écran prévu dans la maquette — branché sur l’API dans une prochaine étape.',
}: Props) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <Construction className="mx-auto size-10 text-primary" aria-hidden />
      <h1 className="font-display mt-4 text-2xl font-semibold text-primary">{title}</h1>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link to="/admin" className="btn btn-sm rounded-xl border border-line bg-white">
          Tableau de bord
        </Link>
        <Link to="/admin/publicites" className="btn btn-primary btn-sm rounded-xl">
          Publicités & Carousel
        </Link>
      </div>
    </div>
  )
}
