import type { TFunction } from 'i18next'
import type { VinculoTipo } from '../../types'

export type VinculoFamily = 'afinidade' | 'laco' | 'hostil' | 'neutro'
export type VinculoPattern = 'solid' | 'dotted' | 'dashed' | 'double' | 'dashShort'

export interface VinculoStyleDef {
  family: VinculoFamily
  color: string
  width: number
  pattern: VinculoPattern
}

/** Visual language — 8 cores distintas por tipo + stroke styles (RFC UX-6 / spec 105).
 *  `family` continua marcando o agrupamento semântico (afinidade/laço/hostil/neutro),
 *  mas cada tipo tem sua própria cor — não reaproveita mais a cor da família.
 *  Vínculo de Sangue é hard-locked num vermelho-sangue (ver tokens.css), distinto do
 *  vermelho de Inimizade/Adversário. */
export const VINCULO_STYLES: Record<VinculoTipo, VinculoStyleDef> = {
  aliado: { family: 'afinidade', color: 'var(--vinculo-aliado)', width: 3, pattern: 'solid' },
  amizade: { family: 'afinidade', color: 'var(--vinculo-amizade)', width: 1.25, pattern: 'solid' },
  romance: { family: 'laco', color: 'var(--vinculo-romance)', width: 2, pattern: 'solid' },
  familia: { family: 'laco', color: 'var(--vinculo-familia)', width: 2, pattern: 'dotted' },
  vinculo_sangue: { family: 'laco', color: 'var(--vinculo-sangue)', width: 1.5, pattern: 'double' },
  inimizade: { family: 'hostil', color: 'var(--vinculo-inimizade)', width: 2, pattern: 'solid' },
  adversario: { family: 'hostil', color: 'var(--vinculo-adversario)', width: 2, pattern: 'dashed' },
  conhecido: { family: 'neutro', color: 'var(--vinculo-conhecido)', width: 1.5, pattern: 'dashShort' },
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

export function strokeDasharray(pattern: VinculoPattern): string | undefined {
  switch (pattern) {
    case 'dotted':
      return '1.5 3.5'
    case 'dashed':
      return '7 5'
    case 'dashShort':
      return '3 2.5'
    default:
      return undefined
  }
}
