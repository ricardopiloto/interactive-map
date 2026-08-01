import { api } from './client'
import type { Arco, GrupoPosicao, Local, NPC } from '../types'

export const campaignApi = {
  listLocais: (q?: string) =>
    api.get<Local[]>(`/api/locais${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getLocal: (id: number) => api.get<Local>(`/api/locais/${id}`),
  listNpcs: (q?: string) =>
    api.get<NPC[]>(`/api/npcs${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getNpc: (id: number) => api.get<NPC>(`/api/npcs/${id}`),
  listArcos: () => api.get<Arco[]>('/api/arcos'),
  getArco: (id: number) => api.get<Arco>(`/api/arcos/${id}`),
  getGrupo: () => api.get<GrupoPosicao>('/api/grupo'),
}
