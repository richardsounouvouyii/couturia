export function buildWhatsAppUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function creationWhatsAppMessage(titre: string, pageUrl: string) {
  return `Bonjour, je suis intéressé(e) par « ${titre} » vue sur Couturia.\n${pageUrl}`
}

export function atelierWhatsAppMessage(nom: string, pageUrl: string) {
  return `Bonjour ${nom}, je vous contacte via Couturia pour une confection.\n${pageUrl}`
}

export function absoluteUrl(path: string) {
  if (typeof window === 'undefined') return path
  return `${window.location.origin}${path}`
}
