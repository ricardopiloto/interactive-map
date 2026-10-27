import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { fiosApi } from "@/api/fios";
import { FiosReview } from "./FiosReview";

beforeEach(async () => {
  await i18n.changeLanguage("pt-BR");
  vi.restoreAllMocks();
});
it("revisa itens e só grava os selecionados após aceitação, mapeando a sessão", async () => {
  vi.spyOn(fiosApi, "propose").mockResolvedValue({
    estado: "propostas",
    fios: [
      { titulo: "Primeiro", descricao: "Um", sessao_numero: 4 },
      { titulo: "Segundo", descricao: "Dois" },
      { titulo: "Terceiro", descricao: "Três" },
    ],
    sessoes_omitidas: 1,
    usou_conteudo_oculto: true,
  });
  const batch = vi.spyOn(fiosApi, "createBatch").mockResolvedValue([]);
  const added = vi.fn();
  render(
    <FiosReview
      slug="alpha"
      sessaoId={null}
      sessoes={[{ id: 7, numero: 4 }]}
      onClose={vi.fn()}
      onAdded={added}
    />,
  );
  expect(await screen.findByDisplayValue("Primeiro")).toBeTruthy();
  expect(batch).not.toHaveBeenCalled();
  expect(screen.getByText(/sessão omitida/)).toBeTruthy();
  expect(screen.getByText(/conteúdo oculto/)).toBeTruthy();
  fireEvent.click(screen.getAllByRole("checkbox")[1]!);
  fireEvent.change(screen.getAllByRole("textbox", { name: "Título" })[0]!, {
    target: { value: "Editado" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Adicionar selecionados" }));
  await waitFor(() =>
    expect(batch).toHaveBeenCalledWith("alpha", [
      { titulo: "Editado", descricao: "Um", origem: "ia", sessao_origem_id: 7 },
      { titulo: "Terceiro", descricao: "Três", origem: "ia", sessao_origem_id: null },
    ]),
  );
  expect(added).toHaveBeenCalled();
});
it("usa a sessão salva do editor para todos os fios aceitos", async () => {
  vi.spyOn(fiosApi, "propose").mockResolvedValue({
    estado: "propostas",
    fios: [
      { titulo: "Citado", descricao: "Um", sessao_numero: 4 },
      { titulo: "Sem sessão", descricao: "Dois" },
    ],
    sessoes_omitidas: 0,
    usou_conteudo_oculto: false,
  });
  const batch = vi.spyOn(fiosApi, "createBatch").mockResolvedValue([]);
  render(
    <FiosReview
      slug="alpha"
      sessaoId={28}
      sessoes={[{ id: 7, numero: 4 }]}
      onClose={vi.fn()}
      onAdded={vi.fn()}
    />,
  );
  fireEvent.click(await screen.findByRole("button", { name: "Adicionar selecionados" }));
  await waitFor(() =>
    expect(batch).toHaveBeenCalledWith("alpha", [
      { titulo: "Citado", descricao: "Um", origem: "ia", sessao_origem_id: 28 },
      { titulo: "Sem sessão", descricao: "Dois", origem: "ia", sessao_origem_id: 28 },
    ]),
  );
});
it("falha no lote preserva os itens para nova tentativa", async () => {
  vi.spyOn(fiosApi, "propose").mockResolvedValue({
    estado: "propostas",
    fios: [{ titulo: "Fio", descricao: "Texto" }],
    sessoes_omitidas: 0,
    usou_conteudo_oculto: false,
  });
  const batch = vi
    .spyOn(fiosApi, "createBatch")
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce([]);
  const added = vi.fn();
  render(
    <FiosReview slug="alpha" sessaoId={null} sessoes={[]} onClose={vi.fn()} onAdded={added} />,
  );
  fireEvent.click(await screen.findByRole("button", { name: "Adicionar selecionados" }));
  expect(await screen.findByText(/Não foi possível adicionar/)).toBeTruthy();
  expect(screen.getByDisplayValue("Fio")).toBeTruthy();
  expect(added).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Adicionar selecionados" }));
  await waitFor(() => expect(batch).toHaveBeenCalledTimes(2));
  expect(added).toHaveBeenCalledTimes(1);
});

it.each([
  [429, "Limite de pedidos atingido"],
  [403, "Acesso negado"],
])("mostra erro HTTP %i sem gravar", async (status, message) => {
  const { ApiError } = await import("@/api/client");
  vi.spyOn(fiosApi, "propose").mockRejectedValue(new ApiError(status, null));
  const batch = vi.spyOn(fiosApi, "createBatch");
  render(
    <FiosReview slug="alpha" sessaoId={null} sessoes={[]} onClose={vi.fn()} onAdded={vi.fn()} />,
  );
  expect(await screen.findByText(new RegExp(message))).toBeTruthy();
  expect(batch).not.toHaveBeenCalled();
});

it.each(["vazio", "falha"] as const)("mostra estado %s sem gravar", async (estado) => {
  vi.spyOn(fiosApi, "propose").mockResolvedValue({
    estado,
    fios: [],
    sessoes_omitidas: 0,
    usou_conteudo_oculto: false,
    mensagem: "Mensagem do servidor",
  });
  const batch = vi.spyOn(fiosApi, "createBatch");
  render(
    <FiosReview slug="alpha" sessaoId={null} sessoes={[]} onClose={vi.fn()} onAdded={vi.fn()} />,
  );
  expect(await screen.findByText("Mensagem do servidor")).toBeTruthy();
  expect(batch).not.toHaveBeenCalled();
});

it("mantém paridade das chaves de fios entre pt-BR e en", async () => {
  const pt = (await import("@/locales/pt-BR/sessoes.json")).default;
  const en = (await import("@/locales/en/sessoes.json")).default;
  expect(Object.keys(pt.fios).sort()).toEqual(Object.keys(en.fios).sort());
});
