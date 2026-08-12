import type { VinculoTipo } from '../../types'

export interface VinculoStyleDef {
  label: string
  color: string
  dashed: boolean
}

/** Visual language for each vínculo tipo — feeds the graph lines, filter
 *  chips, legend, and the dot next to each vínculo in the detail panel. */
export const VINCULO_STYLES: Record<VinculoTipo, VinculoStyleDef> = {
  aliado: { label: 'Aliado', color: 'var(--color-accent)', dashed: false },
  amizade: { label: 'Amizade', color: '#79c48f', dashed: false },
  inimizade: { label: 'Inimizade', color: '#e0707a', dashed: false },
  romance: { label: 'Romance', color: '#e08fc0', dashed: false },
  familia: { label: 'Família', color: '#d9a35b', dashed: false },
  conhecido: { label: 'Conhecido', color: '#9397ab', dashed: true },
}

export const VINCULO_TIPOS: VinculoTipo[] = [
  'aliado',
  'amizade',
  'inimizade',
  'romance',
  'familia',
  'conhecido',
]

export function vinculoStyle(tipo: VinculoTipo): VinculoStyleDef {
  return VINCULO_STYLES[tipo]
}
