import { api } from "./client";

export const authApi = {
  registerConfig: () =>
    api.get<{ modo: string; turnstile_site_key: string | null }>("/api/auth/registo/config"),
  register: (body: {
    email: string;
    termos_aceitos: boolean;
    idioma: "pt-BR" | "en";
    captcha_token?: string;
    campo_auxiliar: string;
  }) => api.post<{ ok: boolean }>("/api/auth/registo", body),
  acceptInvite: (token: string, password: string) =>
    api.post<{ email: string }>("/api/auth/convite/aceitar", { token, password }),
  confirmReset: (token: string, password: string) =>
    api.post<{ email: string }>("/api/auth/reset/confirmar", { token, password }),
};
