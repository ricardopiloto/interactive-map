import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { ApiError } from "@/api/client";
import { ResetPage } from "./reset";

const { confirmReset } = vi.hoisted(() => ({ confirmReset: vi.fn() }));
vi.mock("@/api/auth", () => ({ authApi: { confirmReset } }));
vi.mock("@/components/site/SiteHeader", () => ({ SiteHeader: () => null }));

beforeEach(async () => {
  vi.clearAllMocks();
  await i18n.changeLanguage("pt-BR");
});

function show() {
  render(
    <MemoryRouter initialEntries={["/reset/token"]}>
      <Routes>
        <Route path="/reset/:token" element={<ResetPage />} />
        <Route path="/login" element={<p>Login destination</p>} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "new-password-123" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar senha" }));
}

it.each(["CONVITE_EXPIRADO", "CONVITE_JA_USADO", "CONVITE_INVALIDO"])(
  "offers a new link for %s",
  async (code) => {
    confirmReset.mockRejectedValue(new ApiError(400, code));
    show();
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pedir novo link" })).toHaveAttribute(
      "href",
      "/esqueci-senha",
    );
  },
);

it("navigates to login after a valid reset", async () => {
  confirmReset.mockResolvedValue({ email: "ana@example.org" });
  show();
  expect(await screen.findByText("Login destination")).toBeInTheDocument();
});
