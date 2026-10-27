import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import { campanhasApi, type PainelItem } from "@/api/campanhas";
import { indiceIaApi, type EstadoIndiceIa } from "@/api/indiceIa";
import i18n from "@/i18n";
import pt from "@/locales/pt-BR/comum.json";
import en from "@/locales/en/comum.json";
import { PainelPage } from "./painel";

vi.mock("@/components/site/SiteHeader", () => ({ SiteHeader: () => null }));
vi.mock("@/components/site/CampaignCard", () => ({
  CampaignCard: ({ children, slug }: { children: React.ReactNode; slug: string }) => (
    <article data-testid={`campanha-${slug}`}>{children}</article>
  ),
}));

const campaign = (slug: string, active: boolean): PainelItem => ({
  id: slug === "uma" ? 1 : 2,
  slug,
  nome: slug,
  sistema: "wfrp4e",
  visibilidade: "listada",
  bytes_usados: 0,
  cota_bytes: 1000,
  aviso_cota: false,
  modulos_ativos: active ? ["ia_arcos"] : [],
});
const result = (estado: EstadoIndiceIa["estado"]): EstadoIndiceIa => ({
  estado,
  registros: 2,
  trechos: 5,
  atualizado_em: null,
});

beforeEach(async () => {
  vi.restoreAllMocks();
  await i18n.changeLanguage("pt-BR");
  vi.spyOn(campanhasApi, "minhas").mockResolvedValue({
    campanhas: [campaign("uma", true), campaign("duas", false)],
  });
});

function montar() {
  return render(
    <MemoryRouter>
      <PainelPage />
    </MemoryRouter>,
  );
}

it.each([
  ["ausente", "Ainda não criado"],
  ["ok", "Em dia"],
  ["desatualizado", "Desatualizado"],
  ["indisponivel", "Indisponível"],
] as const)("mostra o estado %s e omite a seção com IA desligada", async (estado, label) => {
  vi.spyOn(indiceIaApi, "estado").mockResolvedValue(result(estado));
  montar();
  const uma = await screen.findByTestId("campanha-uma");
  expect(await within(uma).findByText(`Estado: ${label}`)).toBeTruthy();
  expect(within(uma).getByText("2 registros · 5 trechos")).toBeTruthy();
  expect(within(uma).getByText("Última atualização: Nunca")).toBeTruthy();
  expect(
    within(await screen.findByTestId("campanha-duas")).queryByText("Índice da campanha"),
  ).toBeNull();
});

it("reindexa somente a campanha selecionada e mostra sucesso", async () => {
  vi.spyOn(indiceIaApi, "estado").mockResolvedValue(result("ausente"));
  const reindex = vi
    .spyOn(indiceIaApi, "reindexar")
    .mockResolvedValue({ ...result("ok"), registros: 3 });
  montar();
  fireEvent.click(await screen.findByRole("button", { name: "Reindexar" }));
  expect(await screen.findByText("Índice atualizado com sucesso.")).toBeTruthy();
  expect(screen.getByText("3 registros · 5 trechos")).toBeTruthy();
  expect(reindex).toHaveBeenCalledWith("uma");
});

it("mostra erro ao consultar e ao reindexar", async () => {
  vi.spyOn(indiceIaApi, "estado").mockRejectedValue(new Error("falha"));
  vi.spyOn(indiceIaApi, "reindexar").mockRejectedValue(new Error("falha"));
  montar();
  expect(await screen.findByRole("alert")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Reindexar" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível atualizar o índice");
});

it("mantém paridade de textos pt-BR/en", () => {
  expect(Object.keys(pt.painel.indice).sort()).toEqual(Object.keys(en.painel.indice).sort());
  expect(Object.keys(pt.painel.indice.states).sort()).toEqual(
    Object.keys(en.painel.indice.states).sort(),
  );
});
