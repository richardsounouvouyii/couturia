export function facebookShareUrl(pageUrl: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`
}

export function whatsappShareUrl(pageUrl: string, title: string) {
  const text = `Regarde cette création sur Couturia : « ${title} »\n${pageUrl}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export async function nativeShare(data: { title: string; text: string; url: string }) {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    await navigator.share(data)
    return true
  }
  return false
}
