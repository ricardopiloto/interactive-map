export type NPCStatus = 'vivo' | 'morto' | 'desaparecido' | 'desconhecido'
export type GrupoFormato = 'bandeira' | 'brasao'
export type RouteTipo = 'estrada' | 'rio' | 'trilha'
export type Ritmo = 'normal' | 'intenso'
export type OrdenacaoRota = 'mais_rapida' | 'mais_barata'


export interface Local {
  id: number
  nome: string
  descricao: string
  x: number
  y: number
  imagem_url: string | null
  data_sessao: string | null
  arco_id: number | null
  npc_ids: number[]
  saida_ids: number[]
  cor_pin: string
  waypoint_id?: number | null
}

export interface NPC {
  id: number
  nome: string
  descricao: string
  faccao: string | null
  status: NPCStatus | null
  retrato_url: string | null
  local_ids: number[]
}

export interface Arco {
  id: number
  titulo: string
  resumo: string
  ordem: number
}

export interface GrupoPosicao {
  x: number
  y: number
  formato: GrupoFormato
  atualizado_em: string
}

export interface MapPoint {
  x: number
  y: number
}

export interface Waypoint {
  id: number
  nome: string | null
  x: number
  y: number
  local_id: number | null
}

export interface RouteSegment {
  id: number
  waypoint_a_id: number
  waypoint_b_id: number
  tipo: RouteTipo
  pontos_intermediarios: MapPoint[]
  distancia_milhas: number
  modificador_velocidade: number | null
}

export interface RoutePlanItem {
  waypoint_ids: number[]
  distancia_milhas: number
  tempo_horas: number
  tempo_dias: number
  tempo_horas_resto: number
  tempo_texto: string
  tipos: string[]
  geometria: MapPoint[]
  custo_dentro_bp: number
  custo_fora_bp: number
}

export interface RoutePlanResponse {
  rotas: RoutePlanItem[]
}

export interface MapScale {
  id: number
  miles_per_map_unit: number
  notas: string | null
}
