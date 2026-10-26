import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { ApiError } from "@/api/client";
import { campanhasApi, type AssistirResponse } from "@/api/campanhas";
import i18n from "@/i18n";
import pt from "@/locales/pt-BR/comum.json";
import en from "@/locales/en/comum.json";
import { IaAssistente } from "./IaAssistente";

const resposta: AssistirResponse = {
  estado: "sugestao",
  texto: "Ideia nova",
  mensagem: "",
  usou_conteudo_oculto: true,
  truncado: false,
  limite_caracteres: 100,
  campo_destino: "descricao",
};

beforeEach(async () => {
  await i18n.changeLanguage("pt-BR");
  vi.restoreAllMocks();
});

function montar(overrides: Partial<React.ComponentProps<typeof IaAssistente>> = {}) {
  const onInserir = vi.fn();
  const onSubstituir = vi.fn();
  const props = {
    slug: "campanha",
    tipo: "descricao_local" as const,
    alvoId: 1,
    textoAtual: "Texto atual",
    campoPublico: true,
    onInserir,
    onSubstituir,
    ...overrides,
  };
  const view = render(<IaAssistente {...props} />);
  return { ...view, props, onInserir, onSubstituir };
}

async function pedir() {
  fireEvent.click(screen.getByRole("button", { name: "Sugerir com IA" }));
  await screen.findByText("Ideia nova");
}

it("envia instrução e permite inserir, substituir ou descartar sem gravar", async () => {
  const api = vi.spyOn(campanhasApi, "assistir").mockResolvedValue(resposta);
  const { onInserir, onSubstituir } = montar();
  fireEvent.change(screen.getByLabelText("Instrução opcional para a IA"), {
    target: { value: "  tom sombrio  " },
  });
  await pedir();
  expect(api).toHaveBeenCalledWith(
    "campanha",
    expect.objectContaining({
      instrucao: "tom sombrio",
      texto_atual: "Texto atual",
      campo_publico: true,
      alvo_id: 1,
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Inserir ao final" }));
  expect(onInserir).toHaveBeenCalledWith("Ideia nova");
  expect(screen.queryByText("Ideia nova")).toBeNull();
  await pedir();
  fireEvent.click(screen.getByRole("button", { name: "Substituir" }));
  expect(onSubstituir).toHaveBeenCalledWith("Ideia nova");
  await pedir();
  fireEvent.click(screen.getByRole("button", { name: "Descartar" }));
  expect(screen.queryByText("Ideia nova")).toBeNull();
  expect(onInserir).toHaveBeenCalledTimes(1);
  expect(onSubstituir).toHaveBeenCalledTimes(1);
});

it("mantém rascunho em falha e mostra estados 429 e 403", async () => {
  const api = vi.spyOn(campanhasApi, "assistir");
  api.mockResolvedValueOnce({
    ...resposta,
    estado: "falha",
    texto: null,
    mensagem: "Provedor indisponível",
  });
  api.mockRejectedValueOnce(new ApiError(429, null));
  api.mockRejectedValueOnce(new ApiError(403, null));
  const { onInserir, onSubstituir } = montar();
  fireEvent.click(screen.getByRole("button", { name: "Sugerir com IA" }));
  expect(await screen.findByText("Provedor indisponível")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Sugerir com IA" }));
  expect(await screen.findByText("Limite atingido. Tente em instantes.")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Sugerir com IA" }));
  expect(
    await screen.findByText(
      "A assistência de IA não está disponível para esta campanha ou usuário.",
    ),
  ).toBeTruthy();
  expect(onInserir).not.toHaveBeenCalled();
  expect(onSubstituir).not.toHaveBeenCalled();
});

it("atualiza aviso quando a visibilidade do rascunho muda", async () => {
  vi.spyOn(campanhasApi, "assistir").mockResolvedValue(resposta);
  const { rerender, props } = montar({ campoPublico: false });
  await pedir();
  expect(screen.queryByText(/Esta sugestão usou conteúdo oculto/)).toBeNull();
  rerender(<IaAssistente {...props} campoPublico />);
  expect(screen.getByText(/Esta sugestão usou conteúdo oculto/)).toBeTruthy();
});

it("descarta painel e resposta tardia ao trocar de alvo", async () => {
  let resolver!: (value: AssistirResponse) => void;
  vi.spyOn(campanhasApi, "assistir")
    .mockResolvedValueOnce(resposta)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolver = resolve;
        }),
    );
  const { rerender, props } = montar();
  await pedir();
  rerender(<IaAssistente {...props} alvoId={2} />);
  expect(screen.queryByText("Ideia nova")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Sugerir com IA" }));
  expect(screen.getByRole("button", { name: "Gerando sugestão…" })).toHaveProperty(
    "disabled",
    true,
  );
  rerender(<IaAssistente {...props} alvoId={3} />);
  resolver(resposta);
  await waitFor(() => expect(screen.queryByText("Ideia nova")).toBeNull());
});

it("bloqueia ações acima do limite e indica truncamento", async () => {
  vi.spyOn(campanhasApi, "assistir").mockResolvedValue({
    ...resposta,
    truncado: true,
    limite_caracteres: 15,
  });
  montar();
  await pedir();
  expect(screen.getByText("A sugestão foi reduzida para caber no limite do campo.")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Inserir ao final" })).toHaveProperty("disabled", true);
  expect(screen.getByRole("button", { name: "Substituir" })).toHaveProperty("disabled", false);
});

it("não envia pedidos duplicados durante loading e mostra resposta vazia", async () => {
  let resolver!: (value: AssistirResponse) => void;
  const api = vi.spyOn(campanhasApi, "assistir").mockImplementation(
    () =>
      new Promise((resolve) => {
        resolver = resolve;
      }),
  );
  montar();
  fireEvent.click(screen.getByRole("button", { name: "Sugerir com IA" }));
  expect(screen.getByRole("button", { name: "Gerando sugestão…" })).toHaveProperty(
    "disabled",
    true,
  );
  expect(api).toHaveBeenCalledTimes(1);
  resolver({ ...resposta, estado: "vazio", texto: null, mensagem: "Pouco contexto" });
  expect(await screen.findByText("Pouco contexto")).toBeTruthy();
});

it("mantém paridade de chaves da assistência entre os idiomas", () => {
  expect(Object.keys(pt.iaAssistente).sort()).toEqual(Object.keys(en.iaAssistente).sort());
});

it("traduz o rótulo e a ajuda do toggle com chaves equivalentes", async () => {
  expect(Object.keys(pt.painel).sort()).toEqual(Object.keys(en.painel).sort());
  expect(i18n.t("painel.moduloIaArcos", { ns: "comum" })).toBe("Assistente de IA");
  expect(i18n.t("painel.moduloIaArcosAjuda", { ns: "comum" })).toContain("DeepSeek");
  await i18n.changeLanguage("en");
  expect(i18n.t("painel.moduloIaArcos", { ns: "comum" })).toBe("AI assistant");
  expect(i18n.t("painel.moduloIaArcosAjuda", { ns: "comum" })).toContain("DeepSeek");
});
