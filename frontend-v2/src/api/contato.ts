import { api } from "./client";

export interface ContatoBody {
  nome: string;
  email: string;
  assunto: "duvida" | "privacidade" | "problema" | "sugestao" | "outro";
  mensagem: string;
  idioma: "pt-BR" | "en";
  campo_auxiliar: string;
  captcha_token?: string;
}

export const contatoApi = {
  config: () =>
    api.get<{ disponivel: boolean; turnstile_site_key: string | null }>("/api/contato/config"),
  send: (body: ContatoBody) => api.post<{ ok: boolean }>("/api/contato", body),
};
