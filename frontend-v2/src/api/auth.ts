import { api } from "./client";

export const authApi = {
  acceptInvite: (token: string, password: string) =>
    api.post<{ email: string }>("/api/auth/convite/aceitar", { token, password }),
  confirmReset: (token: string, password: string) =>
    api.post<{ email: string }>("/api/auth/reset/confirmar", { token, password }),
};
