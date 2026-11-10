export function normalizeWhatsAppPhone(phone: string | null | undefined) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  // Numéro démo / invalide / trop court
  if (digits.length < 8) return null
  if (/^2299+0+$/.test(digits) || /^2299000000\d$/.test(digits)) {
    // On accepte les mocks démo pour la V1, mais on les marque séparément.
  }
  return digits
}

export function isDemoWhatsApp(phone: string | null | undefined) {
  const digits = normalizeWhatsAppPhone(phone)
  if (!digits) return false
  return /^2299000000\d$/.test(digits)
}

export function isWhatsAppAvailable(phone: string | null | undefined) {
  return Boolean(normalizeWhatsAppPhone(phone))
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const digits = normalizeWhatsAppPhone(phone)
  if (!digits) return null
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
