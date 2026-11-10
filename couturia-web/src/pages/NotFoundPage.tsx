import { Link } from 'react-router-dom'
import { Home, Shirt, Store } from 'lucide-react'
import { DocumentMeta } from '@/components/DocumentMeta'

export function NotFoundPage() {
  return (
    <div className="bg-page">
      <DocumentMeta
        title="Page introuvable"
        description="Cette page n’existe pas sur Couturia."
        path="/404"
        noIndex
      />
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
          Erreur 404
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold text-primary sm:text-4xl">
          Page introuvable
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Le lien est peut-être incorrect, ou la page a été déplacée. Revenez à
          l&apos;accueil ou explorez les créations.
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Link to="/" className="btn btn-primary rounded-xl gap-2">
            <Home className="size-4" aria-hidden />
            Accueil
          </Link>
          <Link
            to="/catalogue"
            className="btn rounded-xl border-2 border-gold bg-transparent text-heading hover:bg-gold/10 gap-2"
          >
            <Shirt className="size-4" aria-hidden />
            Créations
          </Link>
          <Link
            to="/ateliers"
            className="btn rounded-xl border border-line bg-white text-heading gap-2"
          >
            <Store className="size-4" aria-hidden />
            Stylistes
          </Link>
        </div>
      </div>
    </div>
  )
}
