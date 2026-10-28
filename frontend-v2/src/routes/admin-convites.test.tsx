import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { AdminConvitesPage } from "./admin-convites";

const { invite, inviteConfig } = vi.hoisted(() => ({ invite: vi.fn(), inviteConfig: vi.fn() }));
vi.mock("@/api/adminConsole", () => ({ adminConsoleApi: { invite, inviteConfig } }));
vi.mock("@/components/site/SiteHeader", () => ({ SiteHeader: () => null }));

beforeEach(async () => {
  vi.clearAllMocks();
  await i18n.changeLanguage("pt-BR");
  invite.mockResolvedValue({ email: "person@example.org", link: "http://localhost/convite/token" });
});

it("shows email option when available and submits it", async () => {
  inviteConfig.mockResolvedValue({ envio_email_disponivel: true });
  render(<AdminConvitesPage />);
  const checkbox = await screen.findByRole("checkbox", { name: "Enviar também por e-mail" });
  fireEvent.click(checkbox);
  fireEvent.change(screen.getByLabelText("E-mail do novo mestre"), {
    target: { value: "person@example.org" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Gerar convite" }));
  await waitFor(() => expect(invite).toHaveBeenCalledWith("person@example.org", true));
});

it("hides email option when unavailable", async () => {
  inviteConfig.mockResolvedValue({ envio_email_disponivel: false });
  render(<AdminConvitesPage />);
  await waitFor(() => expect(inviteConfig).toHaveBeenCalled());
  expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
});
