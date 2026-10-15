import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import i18n from "@/i18n";
import { ExplorarPage } from "./explorar";

afterEach(() => vi.unstubAllGlobals());

it("filtra o catálogo por busca", async () => {
  await i18n.changeLanguage("pt-BR");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: string) => {
      if (String(url).includes("/api/auth/me"))
        return Promise.resolve(new Response("{}", { status: 401 }));
      if (String(url).includes("/api/campanhas/catalogo")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              campanhas: [
                { slug: "reino", nome: "Reino", sistema: "wfrp4e" },
                { slug: "estacao", nome: "Estação", sistema: "traveller" },
              ],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        );
      }
      return Promise.resolve(new Response("{}", { status: 404 }));
    }),
  );

  render(
    <MemoryRouter>
      <AuthProvider>
        <ExplorarPage />
      </AuthProvider>
    </MemoryRouter>,
  );

  expect(await screen.findByRole("article", { name: "Reino" })).toBeVisible();
  expect(screen.getByRole("article", { name: "Estação" })).toBeVisible();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Estação" } });
  expect(screen.queryByRole("article", { name: "Reino" })).not.toBeInTheDocument();
  expect(screen.getByRole("article", { name: "Estação" })).toBeVisible();
});
