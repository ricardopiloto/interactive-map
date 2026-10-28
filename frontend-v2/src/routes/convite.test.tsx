import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import { ApiError } from "@/api/client";
import i18n from "@/i18n";
import { ConvitePage } from "./convite";

const { acceptInvite, registerConfig, refresh } = vi.hoisted(() => ({
  acceptInvite: vi.fn(),
  registerConfig: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("@/api/auth", () => ({ authApi: { acceptInvite, registerConfig } }));
vi.mock("@/auth/AuthContext", () => ({ useAuth: () => ({ refresh }) }));
vi.mock("@/components/site/SiteHeader", () => ({ SiteHeader: () => null }));
beforeEach(async () => {
  vi.clearAllMocks();
  await i18n.changeLanguage("pt-BR");
});
const show = () =>
  render(
    <MemoryRouter initialEntries={["/convite/expired"]}>
      <Routes>
        <Route path="/convite/:token" element={<ConvitePage />} />
      </Routes>
    </MemoryRouter>,
  );
async function submit() {
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "password123" } });
  fireEvent.click(screen.getByRole("button", { name: "Activar" }));
  await screen.findByRole("alert");
}
it("offers registration for an expired verification link when registration is open", async () => {
  acceptInvite.mockRejectedValue(new ApiError(400, "CONVITE_EXPIRADO", { tipo: "verificar" }));
  registerConfig.mockResolvedValue({ modo: "aberto", turnstile_site_key: null });
  show();
  await submit();
  expect(await screen.findByRole("link", { name: "Pedir novo link" })).toHaveAttribute(
    "href",
    "/registo",
  );
  expect(screen.queryByText(/administrador/)).not.toBeInTheDocument();
});
it("does not offer registration for an expired verification link when registration is closed", async () => {
  acceptInvite.mockRejectedValue(new ApiError(400, "CONVITE_EXPIRADO", { tipo: "verificar" }));
  registerConfig.mockResolvedValue({ modo: "fechado", turnstile_site_key: null });
  show();
  await submit();
  await waitFor(() => expect(registerConfig).toHaveBeenCalled());
  expect(screen.queryByRole("link", { name: "Pedir novo link" })).not.toBeInTheDocument();
});
it("directs expired administrator invites to the administrator without offering registration", async () => {
  acceptInvite.mockRejectedValue(new ApiError(400, "CONVITE_EXPIRADO", { tipo: "activar" }));
  show();
  await submit();
  expect(screen.getByText(/administrador/)).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Pedir novo link" })).not.toBeInTheDocument();
  expect(registerConfig).not.toHaveBeenCalled();
});
