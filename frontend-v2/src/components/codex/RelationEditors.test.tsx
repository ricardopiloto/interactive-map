import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";
import type { PersonagemDraft } from "./RelationEditors";
import { PersonagemEditor } from "./RelationEditors";
import i18n from "@/i18n";

it("mostra o retrato cadastrado e atualiza a prévia após upload", async () => {
  await i18n.changeLanguage("pt-BR");
  const upload = vi.fn();
  const original: PersonagemDraft = {
    id: 1,
    isNew: false,
    nome: "Ada",
    tipo: "pj",
    papel: "",
    faccao: "",
    descricao: "",
    status: "vivo",
    retrato_url: "/portraits/ada-old.jpg",
    visivel_para_todos: true,
    fadiga: 0,
  };
  function Fixture() {
    const [draft, setDraft] = useState(original);
    return (
      <PersonagemEditor
        draft={draft}
        modules={[]}
        busy={false}
        onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
        onUploadPortrait={(file) => {
          upload(file);
          setDraft((current) => ({ ...current, retrato_url: "/portraits/ada-new.jpg" }));
        }}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    );
  }
  render(<Fixture />);
  const input = screen.getByLabelText("Retrato do personagem") as HTMLInputElement;
  expect(document.querySelector('img[src="/portraits/ada-old.jpg"]')).not.toBeNull();
  fireEvent.change(input, {
    target: { files: [new File(["image"], "ada.jpg", { type: "image/jpeg" })] },
  });
  expect(upload).toHaveBeenCalledOnce();
  expect(input.value).toBe("");
  expect(document.querySelector('img[src="/portraits/ada-new.jpg"]')).not.toBeNull();
});
