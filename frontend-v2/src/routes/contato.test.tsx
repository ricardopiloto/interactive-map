import { readFileSync } from "node:fs";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { ApiError } from "@/api/client";
import { ContatoPage } from "./contato";

const { config, send, useAuth } = vi.hoisted(() => ({
  config: vi.fn(),
  send: vi.fn(),
  useAuth: vi.fn(),
}));
vi.mock("@/api/contato", () => ({ contatoApi: { config, send } }));
vi.mock("@/auth/AuthContext", () => ({ useAuth }));
vi.mock("@/components/site/SiteHeader", () => ({ SiteHeader: () => null }));

beforeEach(async () => {
  vi.clearAllMocks();
  await i18n.changeLanguage("pt-BR");
  useAuth.mockReturnValue({ user: null });
  config.mockResolvedValue({ disponivel: true, turnstile_site_key: null });
  send.mockResolvedValue({ ok: true });
});
const show = () =>
  render(
    <MemoryRouter>
      <ContatoPage />
    </MemoryRouter>,
  );
async function fill() {
  fireEvent.change(await screen.findByLabelText("Nome"), { target: { value: "Ana" } });
  fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "ana@example.org" } });
  fireEvent.change(screen.getByLabelText("Mensagem"), { target: { value: "Mensagem válida" } });
}
it("shows loading and unavailable states without a form", async () => {
  let resolve!: (value: unknown) => void;
  config.mockReturnValueOnce(
    new Promise((r) => {
      resolve = r;
    }),
  );
  show();
  expect(screen.getByText("Carregando contato…")).toBeInTheDocument();
  resolve({ disponivel: false, turnstile_site_key: null });
  expect(
    await screen.findByText("O contato não está disponível nesta instância."),
  ).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Enviar mensagem" })).not.toBeInTheDocument();
});
it("prefills editable email, sends honeypot and clears on success", async () => {
  useAuth.mockReturnValue({ user: { email: "login@example.org" } });
  show();
  expect(await screen.findByLabelText("E-mail")).toHaveValue("login@example.org");
  await fill();
  fireEvent.change(document.querySelector('[name="reference_note"]')!, {
    target: { value: "trap-value" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
  await waitFor(() =>
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ana@example.org",
        campo_auxiliar: "trap-value",
        idioma: "pt-BR",
      }),
    ),
  );
  expect(await screen.findByText(/Mensagem enviada/)).toBeInTheDocument();
});
it("retains fields and displays API error", async () => {
  send.mockRejectedValue(new ApiError(502, "CONTATO_ENVIO_FALHOU"));
  show();
  await fill();
  expect(screen.getByText("15 de 4000 caracteres")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível enviar");
  expect(screen.getByLabelText("Mensagem")).toHaveValue("Mensagem válida");
});
it("passes Turnstile token when configured", async () => {
  config.mockResolvedValue({ disponivel: true, turnstile_site_key: "site-key" });
  window.turnstile = {
    render: vi.fn((_node, options) => {
      options.callback("token");
      return "widget";
    }),
    remove: vi.fn(),
  };
  show();
  await fill();
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Enviar mensagem" })).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
  await waitFor(() =>
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ captcha_token: "token" })),
  );
  delete window.turnstile;
});

it("registers the public route in both route blocks", () => {
  const source = readFileSync("src/main.tsx", "utf8");
  expect(source.match(/path="\/contato" element={<ContatoPage \/>}/g)).toHaveLength(2);
});
