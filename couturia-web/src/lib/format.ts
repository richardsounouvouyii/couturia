/** Formate un montant en FCFA comme sur la maquette : « 85 000 F CFA ». */
export function formatFcfa(amount: number): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount)
  return `${formatted} F CFA`
}
