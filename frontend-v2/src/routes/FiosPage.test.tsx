import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import type { Fio } from "@/api/fios";
import { fiosApi } from "@/api/fios";
import i18n from "@/i18n";
import { Fios } from "./fios";

const permission = vi.hoisted(() => ({ ready: true, isDono: true, enabled: true }));
vi.mock("@/auth/EditModeContext", () => ({ useEditMode: () => permission }));
vi.mock("@/api/campaign", () => ({ useCampaignKey: () => "alpha" }));

const fio = (id: number, estado: Fio["estado"], ordem = id): Fio => ({
  id,
  titulo: `Fio ${id}`,
  descricao: `Descrição ${id}`,
  estado,
  ordem,
  origem: "manual",
  sessao_origem_id: null,
  criado_em: "2026-01-01",
});
let rows: Fio[];
beforeEach(async () => {
  await i18n.changeLanguage("pt-BR");
  Object.assign(permission, { ready: true, isDono: true, enabled: true });
  rows = [fio(1, "resolvido"), fio(2, "aberto")];
  vi.restoreAllMocks();
  vi.spyOn(fiosApi, "list").mockImplementation(async () => [...rows]);
  vi.spyOn(fiosApi, "create").mockImplementation(async (_slug, body) => {
    const created = { ...fio(3, "aberto"), ...body };
    rows.push(created);
    return created;
  });
  vi.spyOn(fiosApi, "update").mockImplementation(async (_slug, id, body) => {
    const row = rows.find((item) => item.id === id)!;
    Object.assign(row, body);
    return row;
  });
  vi.spyOn(fiosApi, "remove").mockImplementation(async (_slug, id) => {
    rows = rows.filter((item) => item.id !== id);
  });
  vi.spyOn(fiosApi, "reorder").mockImplementation(async (_slug, ids) => {
    ids.forEach((id, index) => {
      rows.find((item) => item.id === id)!.ordem = index;
    });
    return [...rows];
  });
});

it("carrega permissão antes de mostrar a lista", () => {
  permission.ready = false;
  render(<Fios />);
  expect(screen.getByRole("status")).toHaveTextContent("A carregar permissão");
  expect(fiosApi.list).not.toHaveBeenCalled();
});

it("protege os dados para não dono e com Modo GM desligado", () => {
  permission.isDono = false;
  const view = render(<Fios />);
  expect(screen.getByRole("alert")).toHaveTextContent("só para o mestre");
  expect(fiosApi.list).not.toHaveBeenCalled();
  permission.isDono = true;
  permission.enabled = false;
  view.rerender(<Fios />);
  expect(screen.getByRole("status")).toHaveTextContent("Ligue o Modo GM");
  expect(fiosApi.list).not.toHaveBeenCalled();
});

it("mostra abertos antes dos resolvidos e executa todas as ações", async () => {
  rows.push(fio(4, "aberto", 4));
  render(<Fios />);
  expect(await screen.findByText("Fio 2")).toBeVisible();
  const summaries = () => [...document.querySelectorAll("summary")];
  expect(summaries().map((item) => item.textContent)).toEqual([
    "Fio 2Em aberto",
    "Fio 4Em aberto",
    "Fio 1Resolvido",
  ]);
  fireEvent.click(summaries()[0]!);
  expect(screen.getByText("Descrição 2")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Mover para baixo: Fio 2" }));
  await waitFor(() => expect(fiosApi.reorder).toHaveBeenCalled());
  const card = summaries()
    .find((item) => item.textContent?.includes("Fio 2"))!
    .closest("details")!;
  fireEvent.click(within(card).getByRole("button", { name: "Editar" }));
  fireEvent.change(within(card).getByRole("textbox", { name: "Título" }), {
    target: { value: "Fio editado" },
  });
  fireEvent.click(within(card).getByRole("button", { name: "Salvar" }));
  expect(await screen.findByText("Fio editado")).toBeVisible();
  fireEvent.click(within(card).getByRole("button", { name: "Resolver" }));
  await waitFor(() => expect(rows.find((item) => item.id === 2)?.estado).toBe("resolvido"));
  fireEvent.click(within(card).getByRole("button", { name: "Reabrir" }));
  await waitFor(() => expect(rows.find((item) => item.id === 2)?.estado).toBe("aberto"));
  fireEvent.change(screen.getByRole("textbox", { name: "Título" }), { target: { value: "Novo" } });
  fireEvent.click(screen.getByRole("button", { name: "Adicionar fio" }));
  expect(await screen.findByText("Novo")).toBeVisible();
  fireEvent.click(summaries().find((item) => item.textContent?.includes("Novo"))!);
  fireEvent.click(
    within(
      summaries()
        .find((item) => item.textContent?.includes("Novo"))!
        .closest("details")!,
    ).getByRole("button", { name: "Remover" }),
  );
  fireEvent.click(
    within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Remover" }),
  );
  await waitFor(() => expect(screen.queryByText("Novo")).not.toBeInTheDocument());
});

it("mostra lista vazia e formulário", async () => {
  rows = [];
  render(<Fios />);
  expect(await screen.findByText("Nenhum fio narrativo.")).toBeVisible();
  expect(screen.getByRole("button", { name: "Adicionar fio" })).toBeVisible();
});

it("mostra falha de carregamento sem perder o formulário", async () => {
  vi.mocked(fiosApi.list).mockRejectedValue(new Error("offline"));
  render(<Fios />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar os fios");
  expect(screen.getByRole("textbox", { name: "Título" })).toBeVisible();
});

it("preserva o rascunho quando falha ao salvar", async () => {
  vi.mocked(fiosApi.create).mockRejectedValue(new Error("offline"));
  render(<Fios />);
  fireEvent.change(screen.getByRole("textbox", { name: "Título" }), {
    target: { value: "Rascunho" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Adicionar fio" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível salvar o fio");
  expect(screen.getByRole("textbox", { name: "Título" })).toHaveValue("Rascunho");
});
