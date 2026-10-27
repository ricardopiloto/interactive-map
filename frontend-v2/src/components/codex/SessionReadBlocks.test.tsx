import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import type { Sessao } from "@/api/sessoes";
import { fiosApi, type Fio } from "@/api/fios";
import i18n from "@/i18n";
import { SessionReadBlocks } from "./SessionReadBlocks";

const sessao: Sessao = {
  id: 1,
  numero: 1,
  titulo: "A",
  data_rotulo: null,
  resumo: "Resumo público",
  notas_preparo: "Nota secreta",
  locais: [],
  personagens: [],
  arco_id: null,
  arco_transicao_id: null,
};
const fio = (id: number, session: number, estado: Fio["estado"]): Fio => ({
  id,
  titulo: `Fio ${id}`,
  descricao: `Descrição ${id}`,
  estado,
  origem: "manual",
  sessao_origem_id: session,
  ordem: id,
  criado_em: "2026-01-01",
});

beforeEach(async () => {
  await i18n.changeLanguage("pt-BR");
  vi.restoreAllMocks();
});

it("mostra os blocos privados na ordem, fios da sessão e resumo isolado", async () => {
  const list = vi
    .spyOn(fiosApi, "list")
    .mockResolvedValue([fio(2, 1, "resolvido"), fio(1, 1, "aberto")]);
  render(<SessionReadBlocks sessao={sessao} slug="mesa" enabled isDono fiosRevision={0} />);
  const sections = screen.getAllByRole("region");
  expect(sections.map((section) => section.getAttribute("aria-label"))).toEqual([
    "Notas de preparo",
    "Fios Narrativos",
    "Resumo",
  ]);
  expect(screen.getAllByText("Só para o mestre")).toHaveLength(2);
  expect(await screen.findByText("Fio 1")).toBeVisible();
  expect(list).toHaveBeenCalledWith("mesa", undefined, 1);
  expect(
    within(sections[1]!)
      .getAllByRole("listitem")
      .map((item) => item.textContent),
  ).toEqual([expect.stringContaining("Fio 1"), expect.stringContaining("Fio 2")]);
  expect(within(sections[2]!).queryByText("Nota secreta")).not.toBeInTheDocument();
  expect(within(sections[2]!).queryByText("Fio 1")).not.toBeInTheDocument();
  expect(within(sections[2]!).getByText("Resumo público")).toBeVisible();
  expect(screen.getByRole("link", { name: "Ver todos os fios em aberto" })).toHaveAttribute(
    "href",
    "#fios-em-aberto",
  );
});

it("não busca fios fora do modo GM do dono", () => {
  const list = vi.spyOn(fiosApi, "list");
  const { rerender } = render(
    <SessionReadBlocks sessao={sessao} slug="mesa" enabled={false} isDono fiosRevision={0} />,
  );
  expect(screen.queryByText("Nota secreta")).not.toBeInTheDocument();
  expect(screen.queryByText("Só para o mestre")).not.toBeInTheDocument();
  expect(screen.queryByText("Fios Narrativos")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Recolher|Expandir/ })).not.toBeInTheDocument();
  rerender(
    <SessionReadBlocks sessao={sessao} slug="mesa" enabled isDono={false} fiosRevision={0} />,
  );
  expect(screen.getByText("Nota secreta")).toBeVisible();
  expect(screen.queryByText("Fios Narrativos")).not.toBeInTheDocument();
  expect(list).not.toHaveBeenCalled();
});

it("inicia expandido e recolhe ou expande cada bloco independentemente", async () => {
  vi.spyOn(fiosApi, "list").mockResolvedValue([fio(1, 1, "aberto")]);
  render(<SessionReadBlocks sessao={sessao} slug="mesa" enabled isDono fiosRevision={0} />);
  const notes = screen.getByRole("button", { name: "Recolher Notas de preparo" });
  const threads = screen.getByRole("button", { name: "Recolher Fios Narrativos" });
  const summary = screen.getByRole("button", { name: "Recolher Resumo" });
  for (const button of [notes, threads, summary]) {
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(button.getAttribute("aria-controls")!)).toBeVisible();
  }
  expect(await screen.findByText("Fio 1")).toBeVisible();

  fireEvent.click(notes);
  fireEvent.click(threads);
  fireEvent.click(summary);
  for (const button of [notes, threads, summary]) {
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById(button.getAttribute("aria-controls")!)).not.toBeVisible();
  }
  expect(screen.getAllByText("Só para o mestre")).toHaveLength(2);
  expect(screen.getByText("Nota secreta")).not.toBeVisible();
  expect(screen.getByText("Fio 1")).not.toBeVisible();
  expect(screen.getByText("Resumo público")).not.toBeVisible();

  fireEvent.click(screen.getByRole("button", { name: "Expandir Fios Narrativos" }));
  expect(threads).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("Fio 1")).toBeVisible();
  expect(notes).toHaveAttribute("aria-expanded", "false");
});

it("reinicia os blocos expandidos quando a sessão ou campanha muda", () => {
  vi.spyOn(fiosApi, "list").mockResolvedValue([]);
  const { rerender } = render(
    <SessionReadBlocks sessao={sessao} slug="mesa" enabled isDono fiosRevision={0} />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Recolher Notas de preparo" }));
  rerender(
    <SessionReadBlocks sessao={{ ...sessao, id: 2 }} slug="mesa" enabled isDono fiosRevision={0} />,
  );
  expect(screen.getAllByRole("button", { name: /Recolher/ })).toHaveLength(3);
  expect(screen.getByText("Nota secreta")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Recolher Resumo" }));
  rerender(
    <SessionReadBlocks
      sessao={{ ...sessao, id: 2 }}
      slug="outra"
      enabled
      isDono
      fiosRevision={0}
    />,
  );
  expect(screen.getAllByRole("button", { name: /Recolher/ })).toHaveLength(3);
  expect(screen.getByText("Resumo público")).toBeVisible();
});

it("descarta resposta tardia e mantém resumo após erro de fios", async () => {
  let finish!: (rows: Fio[]) => void;
  vi.spyOn(fiosApi, "list")
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    )
    .mockRejectedValueOnce(new Error("429"));
  const { rerender } = render(
    <SessionReadBlocks sessao={sessao} slug="mesa" enabled isDono fiosRevision={0} />,
  );
  rerender(
    <SessionReadBlocks sessao={{ ...sessao, id: 2 }} slug="mesa" enabled isDono fiosRevision={0} />,
  );
  finish([fio(1, 1, "aberto")]);
  expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar os fios");
  expect(screen.queryByText("Fio 1")).not.toBeInTheDocument();
  expect(screen.getByText("Resumo público")).toBeVisible();
  await waitFor(() => expect(screen.queryByText("Fio 1")).not.toBeInTheDocument());
});

it("ativa combate somente nas Notas de Preparo", () => {
  vi.spyOn(fiosApi, "list").mockResolvedValue([]);
  const texto = "> [!combate] Ponte\n> - **Inimigos:** bandidos";
  render(
    <SessionReadBlocks
      sessao={{ ...sessao, notas_preparo: texto, resumo: texto }}
      slug="mesa"
      enabled
      isDono
      fiosRevision={0}
    />,
  );
  const [notes, , summary] = screen.getAllByRole("region");
  expect(within(notes!).getByText("Ponte")).toBeVisible();
  expect(within(notes!).queryByText(/\[!combate\]/)).not.toBeInTheDocument();
  expect(within(summary!).getByText(/\[!combate\] Ponte/)).toBeVisible();
  expect(summary!.querySelector("blockquote")).not.toBeNull();
});
