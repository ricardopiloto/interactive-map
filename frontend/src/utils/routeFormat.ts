/** Presentation-only route metrics (spec 106). Internal calc stays in miles. */

export type UnidadeDistancia = 'mi' | 'km'

const MI_TO_KM = 1.609344

/** Travel day length by pace (matches backend ritmo). */
export function horasPorDia(ritmo: 'normal' | 'intenso'): number {
  return ritmo === 'intenso' ? 8 : 6
}

/** Days + whole hours only; round remainder hours. */
export function formatTempoHumanizado(
  tempoHoras: number,
  horasDia: number,
  labels: { day: string; days: string; hour: string },
): string {
  const hDia = horasDia > 0 ? horasDia : 6
  let total = Number.isFinite(tempoHoras) ? Math.max(0, tempoHoras) : 0
  let dias = Math.floor(total / hDia + 1e-9)
  let resto = total - dias * hDia
  let horas = Math.round(resto)
  if (horas >= hDia) {
    dias += 1
    horas = 0
  }
  const parts: string[] = []
  if (dias > 0) {
    parts.push(`${dias} ${dias === 1 ? labels.day : labels.days}`)
  }
  if (horas > 0 || dias === 0) {
    parts.push(`${horas} ${labels.hour}`)
  }
  return parts.join(' · ')
}

export function formatDistancia(
  distanciaMilhas: number,
  unidade: UnidadeDistancia,
): { value: number; unit: UnidadeDistancia; text: string } {
  const raw = unidade === 'km' ? distanciaMilhas * MI_TO_KM : distanciaMilhas
  const value = Math.round(raw)
  return { value, unit: unidade, text: `${value} ${unidade}` }
}

/** Round bp for display; always with unit. */
export function formatBp(n: number): string {
  if (!Number.isFinite(n)) return '0 bp'
  const rounded = Math.abs(n - Math.round(n)) < 1e-6 ? Math.round(n) : Math.round(n * 10) / 10
  return `${rounded} bp`
}
