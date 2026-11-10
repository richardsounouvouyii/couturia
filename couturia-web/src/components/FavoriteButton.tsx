import { Heart } from 'lucide-react'
import { useFavorites } from '@/lib/favorites'

type Props = {
  creationId: string
  className?: string
  size?: 'sm' | 'md'
}

export function FavoriteButton({ creationId, className = '', size = 'sm' }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const active = isFavorite(creationId)

  return (
    <button
      type="button"
      className={[
        'grid place-items-center rounded-full border shadow-sm transition',
        size === 'sm' ? 'size-8' : 'size-10',
        active
          ? 'border-primary bg-primary text-white'
          : 'border-primary/25 bg-white text-primary hover:bg-primary hover:text-white',
        className,
      ].join(' ')}
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleFavorite(creationId)
      }}
    >
      <Heart
        className={size === 'sm' ? 'size-3.5' : 'size-4'}
        fill={active ? 'currentColor' : 'none'}
      />
    </button>
  )
}
