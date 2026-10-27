import { describe, expect, it } from "vitest";
import { aplicar, type MarkdownAction } from "./markdown-format";

const actions: MarkdownAction[] = [
  "bold",
  "italic",
  "link",
  "heading",
  "list",
  "ordered",
  "quote",
  "combat",
];

describe("aplicar", () => {
  it.each(actions)("%s produces a minimal usable replacement", (action) => {
    for (const [text, start, end] of [
      ["ponte", 0, 5],
      ["antes ponte depois", 6, 11],
      ["antes depois", 6, 6],
    ] as const) {
      const result = aplicar(action, text, start, end);
      expect(text.slice(0, result.trocaInicio) + result.trecho + text.slice(result.trocaFim)).toBe(
        result.texto,
      );
      expect(result.inicio).toBeGreaterThanOrEqual(0);
      expect(result.fim).toBeLessThanOrEqual(result.texto.length);
    }
  });
  it("toggles inline and block formatting", () => {
    for (const action of [
      "bold",
      "italic",
      "link",
      "heading",
      "list",
      "ordered",
      "quote",
    ] as const) {
      const first = aplicar(action, "ponte", 0, 5);
      const second = aplicar(action, first.texto, first.inicio, first.fim);
      expect(second.texto).toBe("ponte");
    }
  });
  it("formats every selected line and removes numbered prefixes of any value", () => {
    const first = aplicar("list", "a\nb\nc", 0, 5);
    expect(first.texto).toBe("- a\n- b\n- c");
    expect(aplicar("list", first.texto, 0, first.texto.length).texto).toBe("a\nb\nc");
    expect(aplicar("ordered", "2. a\n23. b", 0, 10).texto).toBe("a\nb");
  });
  it("inserts combat at boundaries and uses selected title", () => {
    for (const [text, start, end] of [
      ["before after", 7, 7],
      ["after", 0, 0],
      ["before", 6, 6],
    ] as const) {
      const result = aplicar("combat", text, start, end);
      expect(result.texto).toContain("> [!combate] Título do combate");
      expect(text.slice(0, result.trocaInicio) + result.trecho + text.slice(result.trocaFim)).toBe(
        result.texto,
      );
    }
    const selected = aplicar("combat", "Emboscada na ponte", 0, 18);
    expect(selected.texto).toContain("> [!combate] Emboscada na ponte");
  });
});
