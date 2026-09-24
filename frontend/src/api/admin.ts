import { api } from './client'
import { campaignAdminPrefix } from './campaignSlug'
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
  Sessao,
  SessaoPayload,
  Evento,
  EventoPayload,
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
  visivel_para_todos?: boolean
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
  visivel_para_todos?: boolean
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
  session: () => api.adminGet<{ user: string }>(campaignAdminPrefix() + '/session'),

  createLocal: (body: LocalPayload) => api.adminPost<Local>(campaignAdminPrefix() + '/locais', body),
  updateLocal: (id: number, body: Partial<LocalPayload>) =>
    api.adminPut<Local>(`${campaignAdminPrefix()}/locais/${id}`, body),
  deleteLocal: (id: number) => api.adminDelete(`${campaignAdminPrefix()}/locais/${id}`),

  createNpc: (body: NPCPayload) => api.adminPost<NPC>(campaignAdminPrefix() + '/npcs', body),
  updateNpc: (id: number, body: Partial<NPCPayload>) =>
    api.adminPut<NPC>(`${campaignAdminPrefix()}/npcs/${id}`, body),
  deleteNpc: (id: number) => api.adminDelete(`${campaignAdminPrefix()}/npcs/${id}`),

  createPersonagem: (body: PersonagemPayload) =>
    api.adminPost<Personagem>(campaignAdminPrefix() + '/personagens', body),
  updatePersonagem: (id: number, body: Partial<PersonagemPayload>) =>
    api.adminPut<Personagem>(`${campaignAdminPrefix()}/personagens/${id}`, body),
  deletePersonagem: (id: number) => api.adminDelete(`${campaignAdminPrefix()}/personagens/${id}`),
  listPersonagensAdmin: () => api.adminGet<Personagem[]>(campaignAdminPrefix() + '/personagens'),
  listNpcsAdmin: () => api.adminGet<NPC[]>(campaignAdminPrefix() + '/npcs'),
  listLocaisAdmin: () => api.adminGet<Local[]>(campaignAdminPrefix() + '/locais'),

  listVinculosAdmin: () => api.adminGet<Vinculo[]>(campaignAdminPrefix() + '/vinculos'),
  createVinculo: (body: VinculoPayload) =>
    api.adminPost<Vinculo>(campaignAdminPrefix() + '/vinculos', body),
  updateVinculo: (id: number, body: Partial<VinculoPayload>) =>
    api.adminPut<Vinculo>(`${campaignAdminPrefix()}/vinculos/${id}`, body),
  deleteVinculo: (id: number) => api.adminDelete(`${campaignAdminPrefix()}/vinculos/${id}`),

  createArco: (body: ArcoPayload) => api.adminPost<Arco>(campaignAdminPrefix() + '/arcos', body),
  updateArco: (id: number, body: Partial<ArcoPayload>) =>
    api.adminPut<Arco>(`${campaignAdminPrefix()}/arcos/${id}`, body),
  deleteArco: (id: number) => api.adminDelete(`${campaignAdminPrefix()}/arcos/${id}`),
  listArcosAdmin: () => api.adminGet<Arco[]>(campaignAdminPrefix() + '/arcos'),

  updateGrupo: (body: { x: number; y: number; formato?: GrupoFormato }) =>
    api.adminPut<GrupoPosicao>(campaignAdminPrefix() + '/grupo', body),

  upload: (category: 'map' | 'portraits' | 'locals' | 'covers', file: File) =>
    api.adminUpload(category, file),

  listWaypoints: () => api.adminGet<Waypoint[]>(campaignAdminPrefix() + '/waypoints'),
  createWaypoint: (body: WaypointPayload) =>
    api.adminPost<Waypoint>(campaignAdminPrefix() + '/waypoints', body),
  updateWaypoint: (id: number, body: Partial<WaypointPayload>) =>
    api.adminPut<Waypoint>(`${campaignAdminPrefix()}/waypoints/${id}`, body),
  deleteWaypoint: (id: number) => api.adminDelete(`${campaignAdminPrefix()}/waypoints/${id}`),

  listRouteSegments: () => api.adminGet<RouteSegment[]>(campaignAdminPrefix() + '/route-segments'),
  createRouteSegment: (body: RouteSegmentPayload) =>
    api.adminPost<RouteSegment>(campaignAdminPrefix() + '/route-segments', body),
  updateRouteSegment: (id: number, body: Partial<RouteSegmentPayload>) =>
    api.adminPut<RouteSegment>(`${campaignAdminPrefix()}/route-segments/${id}`, body),
  deleteRouteSegment: (id: number) => api.adminDelete(`${campaignAdminPrefix()}/route-segments/${id}`),

  getMapScale: () => api.adminGet<MapScale>(campaignAdminPrefix() + '/map-scale'),
  updateMapScale: (body: { miles_per_map_unit: number; notas?: string | null }) =>
    api.adminPut<MapScale>(campaignAdminPrefix() + '/map-scale', body),

  listSessoesAdmin: () =>
    api.adminGet<{ sessoes: Sessao[] }>(campaignAdminPrefix() + '/sessoes'),
  proximoNumeroSessao: () =>
    api.adminGet<{ numero: number }>(campaignAdminPrefix() + '/sessoes/proximo-numero'),
  createSessao: (body: SessaoPayload) =>
    api.adminPost<Sessao>(campaignAdminPrefix() + '/sessoes', body),
  updateSessao: (id: number, body: Partial<SessaoPayload>) =>
    api.adminPatch<Sessao>(`${campaignAdminPrefix()}/sessoes/${id}`, body),
  deleteSessao: (id: number) => api.adminDelete(`${campaignAdminPrefix()}/sessoes/${id}`),

  listEventosAdmin: () =>
    api.adminGet<{ eventos: Evento[] }>(campaignAdminPrefix() + '/eventos'),
  createEvento: (body: EventoPayload) =>
    api.adminPost<Evento>(campaignAdminPrefix() + '/eventos', body),
  updateEvento: (id: number, body: Partial<EventoPayload>) =>
    api.adminPatch<Evento>(`${campaignAdminPrefix()}/eventos/${id}`, body),
  deleteEvento: (id: number) => api.adminDelete(`${campaignAdminPrefix()}/eventos/${id}`),
}
