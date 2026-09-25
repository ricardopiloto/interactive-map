export type NPCStatus = 'vivo' | 'morto' | 'desaparecido' | 'desconhecido'
export type EstadoExploracao = 'conhecido' | 'visitado'
export type PersonagemTipo = 'pj' | 'npc'
export type VinculoTipo =
  | 'aliado'
  | 'vinculo_sangue'
  | 'amizade'
  | 'inimizade'
  | 'adversario'
  | 'romance'
  | 'familia'
  | 'conhecido'
export type VinculoDirecao = 'a_para_b' | 'b_para_a'
export type GrupoFormato = 'bandeira' | 'brasao'
export type RouteTipo = 'estrada' | 'rio' | 'trilha'
export type Ritmo = 'normal' | 'intenso'
export type OrdenacaoRota = 'mais_rapida' | 'mais_barata'
export type ModoTransporte = 'pago' | 'proprio'
export type PreferenciaVia = 'nenhuma' | 'rio' | 'estrada'

export interface InstanceConfig {
  slug: string
  nome: string
  sistema: string
  modulos_ativos: string[]
  has_map_image: boolean
  mapa_arquivo?: string | null
  map_url?: string | null
  unidade_distancia?: 'mi' | 'km'
  genero?: string
  capa_url?: string | null
}

export type ExtensoesMecanica = Record<string, number | string | boolean>

export interface Local {
  id: number
  nome: string
  descricao: string
  x: number
  y: number
  imagem_url: string | null
  data_sessao: string | null
  estado_exploracao: EstadoExploracao
  arco_id: number | null
  npc_ids: number[]
  saida_ids: number[]
  cor_pin: string
  waypoint_id?: number | null
  visivel_para_todos?: boolean
}

export interface NPC {
  id: number
  nome: string
  tipo?: PersonagemTipo
  papel?: string | null
  descricao: string
  faccao: string | null
  status: NPCStatus | null
  retrato_url: string | null
  local_ids: number[]
  visivel_para_todos?: boolean
  extensoes_mecanica?: ExtensoesMecanica
}

/** Personagem unificado (PJ|NPC) — mesma API/shape do NPC evoluído. */
export type Personagem = Required<Pick<NPC, 'tipo'>> & NPC

export interface Vinculo {
  id: number
  personagem_a_id: number
  personagem_b_id: number
  tipo_ab: VinculoTipo | null
  tipo_ba: VinculoTipo | null
  nota_ab: string
  nota_ba: string
  publico: boolean
  conhecido_ab?: boolean | null
  conhecido_ba?: boolean | null
  qualificador_ab?: string
  qualificador_ba?: string
  direcao?: VinculoDirecao | null
}

export interface Arco {
  id: number
  titulo: string
  resumo: string
  ordem: number
  visivel_para_todos?: boolean
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

export type PernoiteTipo = 'local' | 'relento'

export interface Pernoite {
  dia: number
  tipo: PernoiteTipo
  local_id: number | null
  nome: string | null
  x: number
  y: number
}

export interface DiaVisual {
  dia: number
  residual: boolean
  fadiga_apos: number
  geometria: MapPoint[]
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
  pernoites?: Pernoite[]
  fadiga_saldo?: number
  fadiga_pico?: number
  fadiga_aviso?: boolean
  fadiga_morte?: boolean
  dias_visuais?: DiaVisual[]
}

export interface RoutePlanResponse {
  rotas: RoutePlanItem[]
}

export interface MapScale {
  id: number
  miles_per_map_unit: number
  notas: string | null
}

export interface SessaoRefLocal {
  id: number
  nome: string
}

export interface SessaoRefPersonagem {
  id: number
  nome: string
  tipo: string
}

export interface Sessao {
  id: number
  numero: number
  titulo: string
  data_rotulo?: string | null
  resumo: string
  locais: SessaoRefLocal[]
  personagens: SessaoRefPersonagem[]
  visivel_para_todos?: boolean
}

export interface SessaoPayload {
  numero: number
  titulo: string
  data_rotulo?: string | null
  resumo?: string
  visivel_para_todos?: boolean
  local_ids?: number[]
  personagem_ids?: number[]
}

export interface EventoRefLocal {
  id: number
  nome: string
}

export interface EventoRefPersonagem {
  id: number
  nome: string
  tipo: string
  retrato_url?: string | null
}

export interface Evento {
  id: number
  titulo: string
  ano: number
  mes?: number | null
  rotulo_era?: string | null
  descricao: string
  sessao_id?: number | null
  locais: EventoRefLocal[]
  personagens: EventoRefPersonagem[]
  visivel_para_todos?: boolean
}

export interface EventoPayload {
  titulo: string
  ano: number
  mes?: number | null
  rotulo_era?: string | null
  descricao?: string
  visivel_para_todos?: boolean
  sessao_id?: number | null
  local_ids?: number[]
  personagem_ids?: number[]
}
