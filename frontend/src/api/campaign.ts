import { api } from './client'
import type {
  Arco,
  GrupoPosicao,
  Local,
  ModoTransporte,
  NPC,
  OrdenacaoRota,
  Personagem,
  PreferenciaVia,
  Ritmo,
  RoutePlanResponse,
  Vinculo,
  Waypoint,
} from '../types'

export const campaignApi = {
  listLocais: (q?: string) =>
    api.get<Local[]>(`/api/locais${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getLocal: (id: number) => api.get<Local>(`/api/locais/${id}`),
  listNpcs: (q?: string) =>
    api.get<NPC[]>(`/api/npcs${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getNpc: (id: number) => api.get<NPC>(`/api/npcs/${id}`),
  listPersonagens: (q?: string) =>
    api.get<Personagem[]>(
      `/api/personagens${q ? `?q=${encodeURIComponent(q)}` : ''}`,
    ),
  getPersonagem: (id: number) => api.get<Personagem>(`/api/personagens/${id}`),
  listVinculos: () => api.get<Vinculo[]>('/api/vinculos'),
  listArcos: () => api.get<Arco[]>('/api/arcos'),
  getArco: (id: number) => api.get<Arco>(`/api/arcos/${id}`),
  getGrupo: () => api.get<GrupoPosicao>('/api/grupo'),
  listWaypoints: (linkedOnly = false) =>
    api.get<Waypoint[]>(`/api/waypoints${linkedOnly ? '?linked_only=true' : ''}`),
  planRoute: (
    origemWaypointId: number,
    destinoWaypointId: number,
    ritmo: Ritmo,
    modoTransporte: ModoTransporte = 'pago',
    velocidadeMediaMph?: number,
    ordenacao: OrdenacaoRota = 'mais_rapida',
    preferenciaVia: PreferenciaVia = 'nenhuma',
  ) => {
    const params = new URLSearchParams({
      origem_waypoint_id: String(origemWaypointId),
      destino_waypoint_id: String(destinoWaypointId),
      ritmo,
      ordenacao,
      modo_transporte: modoTransporte,
      preferencia_via: preferenciaVia,
    })
    if (modoTransporte === 'proprio' && velocidadeMediaMph != null) {
      params.set('velocidade_media_mph', String(velocidadeMediaMph))
    }
    return api.get<RoutePlanResponse>(`/api/routes/plan?${params}`)
  },
}
