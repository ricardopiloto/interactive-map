import { readFileSync } from "node:fs";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { ApiError } from "@/api/client";
import { EsqueciSenhaPage } from "./esqueci-senha";

const { resetConfig, requestReset } = vi.hoisted(() => ({
  resetConfig: vi.fn(),
  requestReset: vi.fn(),
}));
vi.mock("@/api/auth", () => ({ authApi: { resetConfig, requestReset } }));
vi.mock("@/components/site/SiteHeader", () => ({ SiteHeader: () => null }));

beforeEach(async () => {
  vi.clearAllMocks();
  await i18n.changeLanguage("pt-BR");
  resetConfig.mockResolvedValue({ disponivel: true, turnstile_site_key: null });
  requestReset.mockResolvedValue({ ok: true });
});

function show() {
  return render(
    <MemoryRouter>
      <EsqueciSenhaPage />
    </MemoryRouter>,
  );
}

it("shows loading and unavailable states without a form", async () => {
  let resolve!: (value: unknown) => void;
  resetConfig.mockReturnValueOnce(
    new Promise((done) => {
      resolve = done;
    }),
  );
  show();
  expect(screen.getByText("Carregando recuperação…")).toBeInTheDocument();
  resolve({ disponivel: false, turnstile_site_key: null });
  expect(await screen.findByText(/recuperação de senha não está disponível/)).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: "Contato" })[0]).toHaveAttribute("href", "/contato");
  expect(screen.queryByRole("button", { name: "Pedir link de redefinição" })).toBeNull();
});

it("sends the honeypot and shows the same neutral success", async () => {
  show();
  fireEvent.change(await screen.findByLabelText("E-mail"), {
    target: { value: "ana@example.org" },
  });
  fireEvent.change(document.querySelector('[name="reference_note"]')!, {
    target: { value: "trap" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Pedir link de redefinição" }));
  await waitFor(() =>
    expect(requestReset).toHaveBeenCalledWith("ana@example.org", "pt-BR", undefined, "trap"),
  );
  expect(await screen.findByRole("status")).toHaveTextContent("Se existir uma conta");
  expect(screen.getByText(/pasta de spam/)).toBeInTheDocument();
});

it("retains email and shows the API error", async () => {
  requestReset.mockRejectedValue(new ApiError(429, "LIMITE_PEDIDOS"));
  show();
  const input = await screen.findByLabelText("E-mail");
  fireEvent.change(input, { target: { value: "ana@example.org" } });
  fireEvent.click(screen.getByRole("button", { name: "Pedir link de redefinição" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Muitos pedidos");
  expect(input).toHaveValue("ana@example.org");
});

it("passes a Turnstile token and the current language", async () => {
  await i18n.changeLanguage("en");
  resetConfig.mockResolvedValue({ disponivel: true, turnstile_site_key: "site-key" });
  window.turnstile = {
    render: vi.fn((_node, options) => {
      options.callback("captcha-token");
      return "widget";
    }),
    remove: vi.fn(),
  };
  show();
  fireEvent.change(await screen.findByLabelText("Email"), {
    target: { value: "ana@example.org" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Request reset link" }));
  await waitFor(() =>
    expect(requestReset).toHaveBeenCalledWith("ana@example.org", "en", "captcha-token", ""),
  );
  delete window.turnstile;
});
it("registers the public route in both route blocks", () => {
  const source = readFileSync("src/main.tsx", "utf8");
  expect(source.match(/path="\/esqueci-senha" element=\{<EsqueciSenhaPage \/>\}/g)).toHaveLength(2);
});
