import { useEffect } from 'react'

type Props = {
  title: string
  description?: string
  image?: string
  path?: string
  noIndex?: boolean
}

const SITE = 'Couturia'
const DEFAULT_DESCRIPTION =
  'Vitrine des couturières et stylistes au Bénin. Découvrez des créations et contactez les ateliers sur WhatsApp.'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

export function DocumentMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  path,
  noIndex = false,
}: Props) {
  useEffect(() => {
    const fullTitle = title === SITE ? SITE : `${title} · ${SITE}`
    const url = path ? `${window.location.origin}${path}` : window.location.href
    const ogImage = image?.startsWith('http')
      ? image
      : `${window.location.origin}${image ?? '/icons/icon-512.png'}`

    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow')

    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', SITE)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:locale', 'fr_FR')

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', ogImage)

    upsertLink('canonical', url)
  }, [title, description, image, path, noIndex])

  return null
}
