import type { GenreId } from '../theme/genres'

export type PersonagemStatus = 'vivo' | 'morto' | 'desaparecido' | 'desconhecido'
export type PersonagemTipo = 'pj' | 'npc'
export type VinculoFamilia = 'afinidade' | 'laco' | 'hostil' | 'neutro'
export type VinculoTipo =
  | 'aliado' | 'amizade' | 'romance' | 'familia' | 'vinculo_sangue'
  | 'inimizade' | 'adversario' | 'conhecido'

export interface Arco {
  id: string
  titulo: string
  resumo: string
  ordem: number
  visivelParaTodos: boolean
}

export interface Local {
  id: string
  nome: string
  descricao: string
  x: number // 0–1
  y: number // 0–1
  corPin: string
  visitado: boolean
  arcoId: string | null
  npcIds: string[]
  saidaIds: string[]
  imagemUrl?: string
  waypointId?: string
}

export interface Personagem {
  id: string
  nome: string
  tipo: PersonagemTipo
  papel?: string
  faccao?: string
  status: PersonagemStatus
  descricao: string
  retratoUrl?: string
  visivelParaTodos: boolean
  localIds: string[]
}

export interface Vinculo {
  id: string
  aId: string
  bId: string
  familia: VinculoFamilia
  tipo: VinculoTipo
  qualificador?: string
  nota?: string
}

export interface WaypointNode {
  id: string
  nome: string
  x: number
  y: number
  localId?: string
}

export interface RouteEdge {
  a: string
  b: string
  tipo: 'estrada' | 'rio' | 'trilha'
  distanciaMi: number
}

export interface Sessao {
  id: string
  numero: number
  titulo: string
  data: string
  resumo: string
  localIds: string[]
  npcIds: string[]
}

export interface GrupoPosicao {
  x: number
  y: number
  formato?: 'bandeira' | 'brasao'
  localId?: string
}

export interface Campaign {
  slug: string
  nome: string
  sistema: string
  genero: GenreId
  mestre: string
  visibilidade: 'listada' | 'so_link'
  capaGradient: string
  resumo: string
  jogadores: number
  ultimaSessao: string
  cotaUsadaGb: number
  cotaTotalGb: number
  arcos: Arco[]
  locais: Local[]
  personagens: Personagem[]
  vinculos: Vinculo[]
  waypoints: WaypointNode[]
  edges: RouteEdge[]
  sessoes: Sessao[]
  grupo: GrupoPosicao
}
