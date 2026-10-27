import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import i18n from "@/i18n";

beforeEach(async () => {
  await i18n.changeLanguage("pt-BR");
});
import { SessionEditor, type SessaoDraft } from "./SessionEditor";

const draft: SessaoDraft = {
  isNew: true,
  numero: 1,
  titulo: "Sessão",
  data_rotulo: "",
  resumo: "",
  notas_preparo: "",
  visivel_para_todos: false,
  local_ids: [],
  personagem_ids: [],
};

function montar(visivel_para_todos: boolean, iaAtiva = true, isDono = true) {
  const onChange = vi.fn();
  const view = render(
    <SessionEditor
      draft={{ ...draft, visivel_para_todos }}
      slug="campanha"
      isDono={isDono}
      locais={[]}
      personagens={[]}
      iaAtiva={iaAtiva}
      busy={false}
      suggesting={false}
      sugestaoMsg={null}
      error={null}
      onChange={onChange}
      onSuggest={vi.fn()}
      onSave={vi.fn()}
      onCancel={vi.fn()}
    />,
  );
  return { ...view, onChange };
}

it("mostra Rascunho e Fios apenas com sessão oculta", () => {
  const view = montar(false);
  expect(screen.getByText("Rascunho")).toBeTruthy();
  expect(screen.getByText("Fios narrativos")).toBeTruthy();
  view.unmount();
  montar(true);
  expect(screen.queryByText("Rascunho")).toBeNull();
  expect(screen.queryByText("Fios narrativos")).toBeNull();
});

it("gate reage à visibilidade no formulário", () => {
  const { onChange } = montar(false);
  fireEvent.click(screen.getByRole("checkbox", { name: /visível/i }));
  expect(onChange).toHaveBeenCalledWith({ visivel_para_todos: true });
});

it("oferece IA no resumo de sessão nova apenas para dono com módulo ativo", () => {
  const view = montar(true);
  expect(screen.getAllByRole("button", { name: "Sugerir com IA" })).toHaveLength(1);
  view.unmount();
  const nonOwner = montar(true, true, false);
  expect(screen.queryByRole("button", { name: "Sugerir com IA" })).toBeNull();
  nonOwner.unmount();
  montar(true, false);
  expect(screen.queryByRole("button", { name: "Sugerir com IA" })).toBeNull();
});
