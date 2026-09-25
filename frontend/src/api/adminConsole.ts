import { api } from './client'

export type AdminUserState = 'ativa' | 'pendente' | 'inativa'
export type AdminCampaignState = 'ativa' | 'inativa'

export interface AdminOwnedCampaign {
  id: number
  slug: string
  nome: string
  activa: boolean
}

export interface AdminUser {
  id: number
  email: string
  estado: AdminUserState
  is_admin: boolean
  criado_em: string
  mesas_proprietarias: AdminOwnedCampaign[]
}

export interface AdminCampaign {
  id: number
  nome: string
  slug: string
  sistema: string
  proprietario: { id: number; email: string }
  activa: boolean
  visibilidade: string
  criado_em: string | null
  modificado_em: string | null
  ultima_alteracao_em: string | null
}

export interface AdminLink { email: string; link: string }

export const adminConsoleApi = {
  users: (params: { email?: string; estado?: AdminUserState } = {}) => {
    const query = new URLSearchParams()
    if (params.email) query.set('email', params.email)
    if (params.estado) query.set('estado', params.estado)
    const suffix = query.size ? `?${query.toString()}` : ''
    return api.adminGet<{ usuarios: AdminUser[] }>(`/api/admin/usuarios${suffix}`)
  },
  invite: (email: string) => api.adminPost<AdminLink>('/api/admin/convites', { email }),
  reset: (id: number) => api.adminPost<AdminLink>(`/api/admin/usuarios/${id}/reset`, {}),
  setUserActive: (id: number, activo: boolean) =>
    api.adminPatch<AdminUser>(`/api/admin/usuarios/${id}/estado`, { activo }),
  deleteUser: (id: number) => api.adminDelete(`/api/admin/usuarios/${id}`),
  campaigns: (params: { q?: string; estado?: AdminCampaignState } = {}) => {
    const query = new URLSearchParams()
    if (params.q) query.set('q', params.q)
    if (params.estado) query.set('estado', params.estado)
    const suffix = query.size ? `?${query.toString()}` : ''
    return api.adminGet<{ campanhas: AdminCampaign[] }>(`/api/admin/campanhas${suffix}`)
  },
  setCampaignActive: (id: number, activa: boolean) =>
    api.adminPatch<AdminCampaign>(`/api/admin/campanhas/${id}/estado`, { activa }),
  transferCampaign: (id: number, email: string) =>
    api.adminPatch<AdminCampaign>(`/api/admin/campanhas/${id}/proprietario`, { email }),
  deleteCampaign: (id: number) => api.adminDelete(`/api/admin/campanhas/${id}`),
}
