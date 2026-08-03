import { api } from './client'
import type { Arco, GrupoFormato, GrupoPosicao, Local, NPC } from '../types'

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
}

export interface NPCPayload {
  nome: string
  descricao?: string
  faccao?: string | null
  status?: NPC['status']
  retrato_url?: string | null
}

export interface ArcoPayload {
  titulo: string
  resumo?: string
  ordem?: number
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

  createArco: (body: ArcoPayload) => api.adminPost<Arco>('/api/admin/arcos', body),
  updateArco: (id: number, body: Partial<ArcoPayload>) =>
    api.adminPut<Arco>(`/api/admin/arcos/${id}`, body),
  deleteArco: (id: number) => api.adminDelete(`/api/admin/arcos/${id}`),

  updateGrupo: (body: { x: number; y: number; formato?: GrupoFormato }) =>
    api.adminPut<GrupoPosicao>('/api/admin/grupo', body),

  upload: (category: 'map' | 'portraits' | 'locals', file: File) =>
    api.adminUpload(category, file),
}
