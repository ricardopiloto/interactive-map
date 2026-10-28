import { api } from "./client";

export type AdminUserState = "ativa" | "pendente" | "inativa";
export type AdminCampaignState = "ativa" | "inativa";

export interface AdminOwnedCampaign {
  id: number;
  slug: string;
  nome: string;
  activa: boolean;
}

export interface AdminUser {
  id: number;
  email: string;
  estado: AdminUserState;
  is_admin: boolean;
  criado_em: string;
  mesas_proprietarias: AdminOwnedCampaign[];
}

export interface AdminCampaign {
  id: number;
  nome: string;
  slug: string;
  sistema: string;
  proprietario: { id: number; email: string };
  activa: boolean;
  visibilidade: string;
  criado_em: string | null;
  modificado_em: string | null;
  ultima_alteracao_em: string | null;
}

export interface AdminLink {
  email: string;
  link: string;
}

function query(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const suffix = search.size ? `?${search.toString()}` : "";
  return suffix;
}

export const adminConsoleApi = {
  users: (params: { email?: string; estado?: AdminUserState } = {}) =>
    api.get<{ usuarios: AdminUser[] }>(
      `/api/admin/usuarios${query({ email: params.email, estado: params.estado })}`,
    ),
  inviteConfig: () => api.get<{ envio_email_disponivel: boolean }>("/api/admin/convites/config"),
  invite: (email: string, enviar_email = false) =>
    api.post<AdminLink>("/api/admin/convites", { email, enviar_email }),
  reset: (id: number) => api.post<AdminLink>(`/api/admin/usuarios/${id}/reset`, {}),
  setUserActive: (id: number, activo: boolean) =>
    api.patch<AdminUser>(`/api/admin/usuarios/${id}/estado`, { activo }),
  deleteUser: (id: number) => api.delete(`/api/admin/usuarios/${id}`),
  campaigns: (params: { q?: string; estado?: AdminCampaignState } = {}) =>
    api.get<{ campanhas: AdminCampaign[] }>(
      `/api/admin/campanhas${query({ q: params.q, estado: params.estado })}`,
    ),
  setCampaignActive: (id: number, activa: boolean) =>
    api.patch<AdminCampaign>(`/api/admin/campanhas/${id}/estado`, { activa }),
  transferCampaign: (id: number, email: string) =>
    api.patch<AdminCampaign>(`/api/admin/campanhas/${id}/proprietario`, { email }),
  deleteCampaign: (id: number) => api.delete(`/api/admin/campanhas/${id}`),
};
