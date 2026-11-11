import { Link } from 'react-router-dom'
import logo from '@/assets/images/logo.png'

export function Footer() {
  return (
    <footer className="mt-auto bg-[#4a0826] text-white pb-6 lg:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <aside className="space-y-4">
          <div className="inline-flex rounded-xl bg-white px-3 py-2 shadow-sm">
            <img src={logo} alt="Couturia" className="h-12 w-auto object-contain" />
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-white/85">
            La vitrine des couturières et stylistes. Découvrez leurs créations et
            contactez-les directement sur WhatsApp.
          </p>
        </aside>

        <nav className="flex flex-col gap-2.5 text-sm">
          <p className="mb-1 text-sm font-semibold uppercase tracking-[0.16em] text-[#e8d5b5]">
            Découvrir
          </p>
          <Link to="/catalogue" className="text-white/90 transition hover:text-white">
            Créations
          </Link>
          <Link to="/ateliers" className="text-white/90 transition hover:text-white">
            Stylistes
          </Link>
          <Link to="/favoris" className="text-white/90 transition hover:text-white">
            Favoris
          </Link>
          <a href="/#a-propos" className="text-white/90 transition hover:text-white">
            À propos
          </a>
        </nav>

        <nav className="flex flex-col gap-2.5 text-sm">
          <p className="mb-1 text-sm font-semibold uppercase tracking-[0.16em] text-[#e8d5b5]">
            Stylistes
          </p>
          <Link to="/espace-styliste" className="text-white/90 transition hover:text-white">
            Espace styliste
          </Link>
          <Link
            to="/inscription?role=styliste"
            className="text-white/90 transition hover:text-white"
          >
            Devenir styliste
          </Link>
          <Link to="/connexion" className="text-white/90 transition hover:text-white">
            Connexion
          </Link>
        </nav>

        <div className="flex flex-col gap-2.5 text-sm">
          <p className="mb-1 text-sm font-semibold uppercase tracking-[0.16em] text-[#e8d5b5]">
            Infos
          </p>
          <p className="text-white/90">Devise d&apos;affichage : FCFA (XOF)</p>
          <p className="text-white/90">Lancement : Bénin</p>
          <p className="text-white/90">Contact client : WhatsApp</p>
        </div>
      </div>

      <div className="border-t border-white/15 bg-[#3a061d] px-4 py-4 text-center text-xs text-white/65">
        © {new Date().getFullYear()} Couturia. Tous droits réservés.
      </div>
    </footer>
  )
}
