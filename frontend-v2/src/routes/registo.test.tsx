import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { RegistoPage } from "./registo";

const { register, registerConfig, useAuth } = vi.hoisted(() => ({
  register: vi.fn(),
  registerConfig: vi.fn(),
  useAuth: vi.fn(),
}));
vi.mock("@/api/auth", () => ({ authApi: { register, registerConfig } }));
vi.mock("@/auth/AuthContext", () => ({ useAuth }));
vi.mock("@/components/site/SiteHeader", () => ({ SiteHeader: () => null }));

beforeEach(async () => {
  vi.clearAllMocks();
  await i18n.changeLanguage("pt-BR");
  useAuth.mockReturnValue({ user: null, loading: false });
  registerConfig.mockResolvedValue({ modo: "aberto", turnstile_site_key: null });
  register.mockResolvedValue({ ok: true });
});
const show = () =>
  render(
    <MemoryRouter>
      <RegistoPage />
    </MemoryRouter>,
  );
it("submits accepted email and shows generic confirmation", async () => {
  show();
  fireEvent.change(await screen.findByLabelText("E-mail"), {
    target: { value: "person@example.org" },
  });
  const button = screen.getByRole("button", { name: "Pedir link de verificação" });
  expect(button).toBeDisabled();
  fireEvent.click(screen.getByRole("checkbox"));
  expect(screen.getByRole("link", { name: "termos de uso" })).toHaveAttribute("target", "_blank");
  expect(screen.getByRole("link", { name: "política de privacidade" })).toHaveAttribute(
    "rel",
    "noopener",
  );
  fireEvent.click(button);
  await waitFor(() =>
    expect(register).toHaveBeenCalledWith({
      email: "person@example.org",
      termos_aceitos: true,
      idioma: "pt-BR",
      campo_auxiliar: "",
    }),
  );
  expect(await screen.findByText("Verifique o seu e-mail.")).toBeInTheDocument();
  expect(screen.getByText(/spam/)).toBeInTheDocument();
});
it("hides the form when registration is closed", async () => {
  registerConfig.mockResolvedValue({ modo: "fechado", turnstile_site_key: null });
  show();
  expect(await screen.findByText(/registo não está disponível/)).toBeInTheDocument();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
it("redirects an authenticated user to the dashboard", () => {
  useAuth.mockReturnValue({ user: { id: 1, email: "person@example.org" }, loading: false });
  render(
    <MemoryRouter initialEntries={["/registo"]}>
      <RegistoPage />
    </MemoryRouter>,
  );
  expect(registerConfig).not.toHaveBeenCalled();
});
it("renders Turnstile only with a site key and submits its token", async () => {
  registerConfig.mockResolvedValue({ modo: "aberto", turnstile_site_key: "site-key" });
  const renderWidget = vi.fn((_node, options) => {
    options.callback("token-value");
    return "widget";
  });
  window.turnstile = { render: renderWidget, remove: vi.fn() };
  show();
  await waitFor(() => expect(renderWidget).toHaveBeenCalled());
  fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "person@example.org" } });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Pedir link de verificação" }));
  await waitFor(() =>
    expect(register).toHaveBeenCalledWith(
      expect.objectContaining({ captcha_token: "token-value" }),
    ),
  );
  delete window.turnstile;
});
