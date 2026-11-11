/** Formate un montant : « 85 000 F ». */
export function formatFcfa(amount: number): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount)
  return `${formatted} F`
}

/** Affiche un numéro lisible (ex. +229 90 00 00 01). */
export function formatPhoneDisplay(phone: string): string {
  const trimmed = phone.trim()
  if (!trimmed) return ''
  const digits = trimmed.replace(/[^\d+]/g, '')
  if (digits.startsWith('+229') && digits.length >= 12) {
    const local = digits.slice(4)
    return `+229 ${local.replace(/(\d{2})(?=\d)/g, '$1 ').trim()}`
  }
  if (/^\d{8,10}$/.test(digits)) {
    return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
  }
  return trimmed
}
