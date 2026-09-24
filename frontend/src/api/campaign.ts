import { api } from './client'
import { campaignApiPrefix } from './campaignSlug'
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
  Sessao,
} from '../types'

function p(path: string): string {
  return `${campaignApiPrefix()}${path}`
}

export const campaignApi = {
  listLocais: (q?: string) =>
    api.get<Local[]>(`${p('/locais')}${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getLocal: (id: number) => api.get<Local>(p(`/locais/${id}`)),
  listNpcs: (q?: string) =>
    api.get<NPC[]>(`${p('/npcs')}${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getNpc: (id: number) => api.get<NPC>(p(`/npcs/${id}`)),
  listPersonagens: (q?: string) =>
    api.get<Personagem[]>(
      `${p('/personagens')}${q ? `?q=${encodeURIComponent(q)}` : ''}`,
    ),
  getPersonagem: (id: number) => api.get<Personagem>(p(`/personagens/${id}`)),
  listVinculos: () => api.get<Vinculo[]>(p('/vinculos')),
  listArcos: () => api.get<Arco[]>(p('/arcos')),
  getArco: (id: number) => api.get<Arco>(p(`/arcos/${id}`)),
  getGrupo: () => api.get<GrupoPosicao>(p('/grupo')),
  listWaypoints: (linkedOnly = false) =>
    api.get<Waypoint[]>(`${p('/waypoints')}${linkedOnly ? '?linked_only=true' : ''}`),
  listSessoes: () => api.get<{ sessoes: Sessao[] }>(p('/sessoes')),
  getSessao: (id: number) => api.get<Sessao>(p(`/sessoes/${id}`)),
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
    return api.get<RoutePlanResponse>(`${p('/routes/plan')}?${params}`)
  },
}
