import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Link, MemoryRouter, Route, Routes, useOutletContext } from "react-router-dom";
import { CampaignIndex, CampaignLayout } from "./CampaignLayout";
import { AuthProvider } from "@/auth/AuthContext";
import { CodexProvider } from "@/components/codex/codex-context";
import type { CampaignConfig } from "@/api/campaign";
import i18n from "@/i18n";

afterEach(() => vi.unstubAllGlobals());

function View() {
  const config = useOutletContext<CampaignConfig>();
  return <div data-testid="campaign-name">{config.nome}</div>;
}

it("troca a configuração ao trocar slug e redireciona campanha sem mapa para Relações", async () => {
  await i18n.changeLanguage("pt-BR");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: string) => {
      if (url === "/api/auth/me") return Promise.resolve(new Response("{}", { status: 401 }));
      const first = url === "/api/c/primeira/config";
      return Promise.resolve(
        new Response(
          JSON.stringify({
            slug: first ? "primeira" : "segunda",
            nome: first ? "Primeira" : "Segunda",
            sistema: "teste",
            genero: "fantasia",
            has_map_image: first,
            map_url: null,
            modulos_ativos: [],
          }),
          { status: 200 },
        ),
      );
    }),
  );
  render(
    <MemoryRouter initialEntries={["/c/primeira"]}>
      <AuthProvider>
        <CodexProvider>
          <Link to="/c/segunda">Trocar</Link>
          <Routes>
            <Route path="/c/:slug" element={<CampaignLayout />}>
              <Route index element={<CampaignIndex />} />
              <Route path="mapa" element={<View />} />
              <Route path="relacoes" element={<View />} />
            </Route>
          </Routes>
        </CodexProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
  await screen.findByText("Primeira");
  await waitFor(() => expect(screen.getByTestId("campaign-name")).toHaveTextContent("Primeira"));
  fireEvent.click(screen.getByText("Trocar"));
  await screen.findByText("Segunda");
  expect(screen.queryByText("Primeira")).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByTestId("campaign-name")).toHaveTextContent("Segunda"));
  expect(screen.getAllByRole("link", { name: "Relações" })[0]).toHaveAttribute(
    "aria-current",
    "page",
  );
  fireEvent.change(screen.getByRole("combobox", { name: "Idioma" }), { target: { value: "en" } });
  await waitFor(() =>
    expect(screen.getAllByRole("link", { name: "Relations" })[0]).toHaveAttribute(
      "aria-current",
      "page",
    ),
  );
  expect(screen.getByTestId("campaign-name")).toHaveTextContent("Segunda");
});
