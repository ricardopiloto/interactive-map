import type { Personagem, NPCStatus } from '../../types'

export type RelacoesStatusFilter = 'todos' | NPCStatus

export const STATUS_FILTER_OPTIONS: RelacoesStatusFilter[] = [
  'todos',
  'vivo',
  'morto',
  'desconhecido',
  'desaparecido',
]

export function isRelacoesStatusFilter(value: string): value is RelacoesStatusFilter {
  return (STATUS_FILTER_OPTIONS as string[]).includes(value)
}

export function personagemStatus(p: Personagem): NPCStatus {
  return p.status ?? 'desconhecido'
}

export function matchesStatusFilter(p: Personagem, filter: RelacoesStatusFilter): boolean {
  if (filter === 'todos') return true
  return personagemStatus(p) === filter
}
