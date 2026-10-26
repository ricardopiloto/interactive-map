import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { emptyLocalDraft, emptyNpcDraft } from "./map-drafts";
import { LocalEditor, NpcEditor } from "./MapEditors";

vi.mock("./IaAssistente", () => ({
  IaAssistente: ({ onSubstituir }: { onSubstituir: (text: string) => void }) => (
    <button type="button" onClick={() => onSubstituir("Sugestão")}>
      IA
    </button>
  ),
}));
beforeEach(async () => {
  await i18n.changeLanguage("pt-BR");
});

function Npc({
  iaAtiva,
  isDono,
  novo = false,
}: {
  iaAtiva: boolean;
  isDono: boolean;
  novo?: boolean;
}) {
  const [draft, setDraft] = useState({
    ...emptyNpcDraft(),
    ...(!novo ? { id: 3 } : {}),
    isNew: novo,
    descricao: "Original",
  });
  return (
    <>
      <output>{draft.descricao}</output>
      <NpcEditor
        slug="teste"
        iaAtiva={iaAtiva}
        isDono={isDono}
        draft={draft}
        locais={[]}
        busy={false}
        onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
        onUploadPortrait={vi.fn()}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    </>
  );
}
function Local({
  iaAtiva,
  isDono,
  novo = false,
}: {
  iaAtiva: boolean;
  isDono: boolean;
  novo?: boolean;
}) {
  const [draft, setDraft] = useState({
    ...emptyLocalDraft(0, 0),
    ...(!novo ? { id: 4 } : {}),
    isNew: novo,
    descricao: "Original",
  });
  return (
    <>
      <output>{draft.descricao}</output>
      <LocalEditor
        slug="teste"
        iaAtiva={iaAtiva}
        isDono={isDono}
        draft={draft}
        locais={[]}
        npcs={[]}
        arcos={[]}
        waypoints={[]}
        busy={false}
        onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
        onUploadImage={vi.fn()}
        onReposition={vi.fn()}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    </>
  );
}
for (const [name, Component] of [
  ["NPC", Npc],
  ["local", Local],
] as const) {
  it(`${name}: IA só para dono com módulo ativo e registro salvo; callback só altera rascunho`, () => {
    const view = render(<Component iaAtiva={false} isDono />);
    expect(screen.queryByRole("button", { name: "IA" })).toBeNull();
    view.rerender(<Component iaAtiva isDono={false} />);
    expect(screen.queryByRole("button", { name: "IA" })).toBeNull();
    view.rerender(<Component key="new" iaAtiva isDono novo />);
    expect(screen.queryByRole("button", { name: "IA" })).toBeNull();
    view.rerender(<Component key="saved" iaAtiva isDono />);
    fireEvent.click(screen.getByRole("button", { name: "IA" }));
    expect(screen.getByText("Sugestão", { selector: "output" })).toBeTruthy();
  });
}
