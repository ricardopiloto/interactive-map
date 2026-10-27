import { createRef, useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { MarkdownField } from "./MarkdownField";
import { RichContent } from "./RichContent";

beforeEach(async () => {
  await i18n.changeLanguage("pt-BR");
});

function Field({ combat = false, disabled = false, onChange = vi.fn() }) {
  const [value, setValue] = useState("ponte");
  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <MarkdownField
        label="Notas"
        value={value}
        combat={combat}
        disabled={disabled}
        onValueChange={(text) => {
          onChange(text);
          setValue(text);
        }}
      />
    </form>
  );
}

it("associates label, keeps focus and applies each button once", () => {
  const onChange = vi.fn();
  const { container } = render(<Field onChange={onChange} />);
  const field = screen.getByLabelText("Notas") as HTMLTextAreaElement;
  expect(container.querySelector("label")?.htmlFor).toBe(field.id);
  field.focus();
  expect(document.activeElement).toBe(field);
  for (const name of [
    "Negrito",
    "Itálico",
    "Título",
    "Lista com marcadores",
    "Lista numerada",
    "Citação",
    "Link",
  ]) {
    const before = onChange.mock.calls.length;
    field.focus();
    field.setSelectionRange(0, field.value.length);
    fireEvent.mouseDown(screen.getByRole("button", { name }));
    fireEvent.click(screen.getByRole("button", { name }));
    expect(onChange).toHaveBeenCalledTimes(before + 1);
    expect(document.activeElement).toBe(field);
  }
  expect(screen.queryByRole("button", { name: "Bloco de combate" })).toBeNull();
});

it("supports shortcuts, disabled state, forwarded ref and combat rendering", () => {
  const ref = createRef<HTMLTextAreaElement>();
  const onChange = vi.fn();
  const { rerender } = render(
    <MarkdownField ref={ref} label="Notas" value="ponte" onValueChange={onChange} combat />,
  );
  expect(ref.current).toBe(screen.getByLabelText("Notas"));
  fireEvent.keyDown(ref.current!, { key: "b", ctrlKey: true });
  expect(onChange).toHaveBeenCalledWith("**texto**ponte");
  fireEvent.click(screen.getByRole("button", { name: "Bloco de combate" }));
  const markdown = onChange.mock.lastCall![0];
  expect(markdown).toContain("[!combate]");
  rerender(
    <>
      <MarkdownField ref={ref} label="Notas" value="ponte" onValueChange={onChange} disabled />
      <RichContent markdown={markdown} callouts />
    </>,
  );
  expect(screen.getByRole("button", { name: "Negrito" })).toBeDisabled();
  expect(screen.getByText("Título do combate")).toBeVisible();
});

it("does not submit its enclosing form", () => {
  const submit = vi.fn();
  render(
    <form onSubmit={submit}>
      <MarkdownField label="Notas" value="" onValueChange={vi.fn()} />
    </form>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Negrito" }));
  expect(submit).not.toHaveBeenCalled();
});

it("uses only the input event after successful execCommand", async () => {
  const original = document.execCommand;
  const onChange = vi.fn();
  Object.defineProperty(document, "execCommand", {
    configurable: true,
    value: vi.fn((_command: string, _ui: boolean, snippet: string) => {
      const field = screen.getByLabelText("Notas") as HTMLTextAreaElement;
      const next =
        field.value.slice(0, field.selectionStart) +
        snippet +
        field.value.slice(field.selectionEnd);
      fireEvent.change(field, { target: { value: next } });
      return true;
    }),
  });
  try {
    render(<Field onChange={onChange} />);
    const field = screen.getByLabelText("Notas") as HTMLTextAreaElement;
    field.focus();
    field.setSelectionRange(0, 5);
    fireEvent.click(screen.getByRole("button", { name: "Negrito" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("**ponte**");
    await waitFor(() => expect(field.selectionStart).toBe(2));
    expect(field.selectionEnd).toBe(7);
  } finally {
    Object.defineProperty(document, "execCommand", { configurable: true, value: original });
  }
});
