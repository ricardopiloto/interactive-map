import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import i18n from "@/i18n";
import { HomePage } from "./home";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("carrega a home sem autenticação, com vitrine", async () => {
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
              campanhas: [{ slug: "mesa-aberta", nome: "Mesa Aberta", sistema: "wfrp4e" }],
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
        <HomePage />
      </AuthProvider>
    </MemoryRouter>,
  );

  expect(await screen.findByRole("heading", { level: 1, name: /mapa, o elenco/i })).toBeVisible();
  expect(await screen.findByRole("article", { name: "Mesa Aberta" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Ver campanhas abertas" })).toHaveAttribute(
    "href",
    "/explorar",
  );

  expect(document.documentElement).not.toHaveAttribute("data-genre");
});
