import { api } from './client'
import type {
  Arco,
  GrupoFormato,
  GrupoPosicao,
  Local,
  MapPoint,
  MapScale,
  NPC,
  Personagem,
  RouteSegment,
  RouteTipo,
  Vinculo,
  VinculoTipo,
  Waypoint,
} from '../types'

export interface LocalPayload {
  nome: string
  descricao?: string
  x: number
  y: number
  imagem_url?: string | null
  data_sessao?: string | null
  arco_id?: number | null
  npc_ids?: number[]
  saida_ids?: number[]
  cor_pin: string
  waypoint_id?: number | null
}

export interface NPCPayload {
  nome: string
  tipo?: NPC['tipo']
  papel?: string | null
  descricao?: string
  faccao?: string | null
  status?: NPC['status']
  retrato_url?: string | null
  visivel_para_todos?: boolean
}

export interface PersonagemPayload {
  nome: string
  tipo: NonNullable<NPC['tipo']>
  papel?: string | null
  descricao?: string
  faccao?: string | null
  status?: NPC['status']
  retrato_url?: string | null
  visivel_para_todos?: boolean
  extensoes_mecanica?: Record<string, unknown>
}

export interface VinculoPayload {
  personagem_a_id: number
  personagem_b_id: number
  tipo_ab: VinculoTipo
  tipo_ba?: VinculoTipo | null
  nota_ab?: string
  nota_ba?: string
  publico?: boolean
  conhecido_ab?: boolean
  conhecido_ba?: boolean
  qualificador_ab?: string
  qualificador_ba?: string
  direcao?: 'a_para_b' | 'b_para_a' | null
}

export interface ArcoPayload {
  titulo: string
  resumo?: string
  ordem?: number
}

export interface WaypointPayload {
  nome?: string | null
  x: number
  y: number
  local_id?: number | null
}

export interface RouteSegmentPayload {
  waypoint_a_id: number
  waypoint_b_id: number
  tipo: RouteTipo
  pontos_intermediarios?: MapPoint[]
  modificador_velocidade?: number | null
}

export const adminApi = {
  session: () => api.adminGet<{ user: string }>('/api/admin/session'),

  createLocal: (body: LocalPayload) => api.adminPost<Local>('/api/admin/locais', body),
  updateLocal: (id: number, body: Partial<LocalPayload>) =>
    api.adminPut<Local>(`/api/admin/locais/${id}`, body),
  deleteLocal: (id: number) => api.adminDelete(`/api/admin/locais/${id}`),

  createNpc: (body: NPCPayload) => api.adminPost<NPC>('/api/admin/npcs', body),
  updateNpc: (id: number, body: Partial<NPCPayload>) =>
    api.adminPut<NPC>(`/api/admin/npcs/${id}`, body),
  deleteNpc: (id: number) => api.adminDelete(`/api/admin/npcs/${id}`),

  createPersonagem: (body: PersonagemPayload) =>
    api.adminPost<Personagem>('/api/admin/personagens', body),
  updatePersonagem: (id: number, body: Partial<PersonagemPayload>) =>
    api.adminPut<Personagem>(`/api/admin/personagens/${id}`, body),
  deletePersonagem: (id: number) => api.adminDelete(`/api/admin/personagens/${id}`),
  listPersonagensAdmin: () => api.adminGet<Personagem[]>('/api/admin/personagens'),
  listNpcsAdmin: () => api.adminGet<NPC[]>('/api/admin/npcs'),
  listLocaisAdmin: () => api.adminGet<Local[]>('/api/admin/locais'),

  listVinculosAdmin: () => api.adminGet<Vinculo[]>('/api/admin/vinculos'),
  createVinculo: (body: VinculoPayload) =>
    api.adminPost<Vinculo>('/api/admin/vinculos', body),
  updateVinculo: (id: number, body: Partial<VinculoPayload>) =>
    api.adminPut<Vinculo>(`/api/admin/vinculos/${id}`, body),
  deleteVinculo: (id: number) => api.adminDelete(`/api/admin/vinculos/${id}`),

  createArco: (body: ArcoPayload) => api.adminPost<Arco>('/api/admin/arcos', body),
  updateArco: (id: number, body: Partial<ArcoPayload>) =>
    api.adminPut<Arco>(`/api/admin/arcos/${id}`, body),
  deleteArco: (id: number) => api.adminDelete(`/api/admin/arcos/${id}`),

  updateGrupo: (body: { x: number; y: number; formato?: GrupoFormato }) =>
    api.adminPut<GrupoPosicao>('/api/admin/grupo', body),

  upload: (category: 'map' | 'portraits' | 'locals', file: File) =>
    api.adminUpload(category, file),

  listWaypoints: () => api.adminGet<Waypoint[]>('/api/admin/waypoints'),
  createWaypoint: (body: WaypointPayload) =>
    api.adminPost<Waypoint>('/api/admin/waypoints', body),
  updateWaypoint: (id: number, body: Partial<WaypointPayload>) =>
    api.adminPut<Waypoint>(`/api/admin/waypoints/${id}`, body),
  deleteWaypoint: (id: number) => api.adminDelete(`/api/admin/waypoints/${id}`),

  listRouteSegments: () => api.adminGet<RouteSegment[]>('/api/admin/route-segments'),
  createRouteSegment: (body: RouteSegmentPayload) =>
    api.adminPost<RouteSegment>('/api/admin/route-segments', body),
  updateRouteSegment: (id: number, body: Partial<RouteSegmentPayload>) =>
    api.adminPut<RouteSegment>(`/api/admin/route-segments/${id}`, body),
  deleteRouteSegment: (id: number) => api.adminDelete(`/api/admin/route-segments/${id}`),

  getMapScale: () => api.adminGet<MapScale>('/api/admin/map-scale'),
  updateMapScale: (body: { miles_per_map_unit: number; notas?: string | null }) =>
    api.adminPut<MapScale>('/api/admin/map-scale', body),
}
