import type { TFunction } from 'i18next'
import type { VinculoTipo } from '../../types'

export interface VinculoStyleDef {
  color: string
  dashed: boolean
}

/** Visual language for each vínculo tipo — feeds the graph lines, filter
 *  chips, legend, and the dot next to each vínculo in the detail panel. */
export const VINCULO_STYLES: Record<VinculoTipo, VinculoStyleDef> = {
  aliado: { color: 'var(--color-accent)', dashed: false },
  vinculo_sangue: { color: '#6a3d8c', dashed: false },
  amizade: { color: '#79c48f', dashed: false },
  inimizade: { color: '#e0707a', dashed: false },
  adversario: { color: '#c86b3c', dashed: false },
  romance: { color: '#e08fc0', dashed: false },
  familia: { color: '#d9a35b', dashed: false },
  conhecido: { color: '#9397ab', dashed: true },
}

export const VINCULO_TIPOS: VinculoTipo[] = [
  'aliado',
  'vinculo_sangue',
  'amizade',
  'inimizade',
  'adversario',
  'romance',
  'familia',
  'conhecido',
]

export function getVinculoTipoLabel(t: TFunction, tipo: VinculoTipo): string {
  return t(`vinculoTipo.${tipo}`, { ns: 'relacoes' })
}

export function vinculoStyle(tipo: VinculoTipo): VinculoStyleDef {
  return VINCULO_STYLES[tipo]
}
