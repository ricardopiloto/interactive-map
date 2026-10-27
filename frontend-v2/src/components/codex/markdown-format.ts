export const COMBAT_MARKER = "[!combate]";

export type MarkdownAction =
  "bold" | "italic" | "heading" | "list" | "ordered" | "quote" | "link" | "combat";
export type MarkdownExamples = {
  text: string;
  link: string;
  combatTitle: string;
  enemies: string;
  environment: string;
  tactics: string;
  outcome: string;
};
export type FormatResult = {
  texto: string;
  inicio: number;
  fim: number;
  trocaInicio: number;
  trocaFim: number;
  trecho: string;
};

const defaults: MarkdownExamples = {
  text: "texto",
  link: "https://",
  combatTitle: "Título do combate",
  enemies: "Inimigos",
  environment: "Ambiente",
  tactics: "Tática ou gatilho",
  outcome: "Desfecho",
};

export function aplicar(
  acao: MarkdownAction,
  texto: string,
  inicio: number,
  fim: number,
  examples: MarkdownExamples = defaults,
): FormatResult {
  const start = Math.max(0, Math.min(inicio, texto.length));
  const end = Math.max(start, Math.min(fim, texto.length));
  let next = texto;
  let selectionStart = start;
  let selectionEnd = end;
  const replace = (
    from: number,
    to: number,
    snippet: string,
    selectedFrom: number,
    selectedTo: number,
  ) => {
    next = texto.slice(0, from) + snippet + texto.slice(to);
    selectionStart = from + selectedFrom;
    selectionEnd = from + selectedTo;
  };

  if (acao === "bold" || acao === "italic") {
    const marker = acao === "bold" ? "**" : "*";
    const size = marker.length;
    if (
      start >= size &&
      texto.slice(start - size, start) === marker &&
      texto.slice(end, end + size) === marker
    ) {
      replace(start - size, end + size, texto.slice(start, end), 0, end - start);
    } else if (
      texto.slice(start, start + size) === marker &&
      texto.slice(end - size, end) === marker &&
      end - start >= size * 2
    ) {
      replace(start, end, texto.slice(start + size, end - size), 0, end - start - size * 2);
    } else {
      const content = texto.slice(start, end) || examples.text;
      replace(start, end, marker + content + marker, size, size + content.length);
    }
  } else if (acao === "link") {
    const before = texto.slice(0, start).match(/\[([^\]]*)\]\($/);
    const after = texto.slice(end).match(/^\)/);
    if (before && after) {
      const from = start - before[0].length;
      replace(from, end + 1, before[1] ?? "", 0, (before[1] ?? "").length);
    } else if (texto.slice(start, end).match(/^\[([^\]]*)\]\(([^)]*)\)$/)) {
      const match = /^\[([^\]]*)\]\(([^)]*)\)$/.exec(texto.slice(start, end))!;
      replace(start, end, match[1] ?? "", 0, (match[1] ?? "").length);
    } else {
      const content = texto.slice(start, end) || examples.text;
      const snippet = `[${content}](${examples.link})`;
      replace(start, end, snippet, content.length + 3, content.length + 3 + examples.link.length);
    }
  } else if (acao === "combat") {
    const title = texto.slice(start, end).split("\n")[0] || examples.combatTitle;
    const block = `> ${COMBAT_MARKER} ${title}\n> - **${examples.enemies}:** \n> - **${examples.environment}:** \n> - **${examples.tactics}:** \n> - **${examples.outcome}:** `;
    const before =
      start > 0 && texto[start - 1] !== "\n"
        ? "\n\n"
        : start > 0 && texto[start - 2] !== "\n"
          ? "\n"
          : "";
    const after =
      end < texto.length && texto[end] !== "\n"
        ? "\n\n"
        : end < texto.length && texto[end + 1] !== "\n"
          ? "\n"
          : "";
    const snippet = before + block + after;
    const titleStart = before.length + 2 + COMBAT_MARKER.length + 1;
    replace(start, end, snippet, titleStart, titleStart + title.length);
  } else {
    const lineStart = texto.lastIndexOf("\n", start - 1) + 1;
    const effectiveEnd = end > start && texto[end - 1] === "\n" ? end - 1 : end;
    const lineEndIndex = texto.indexOf("\n", effectiveEnd);
    const lineEnd = lineEndIndex < 0 ? texto.length : lineEndIndex;
    const original = texto.slice(lineStart, lineEnd);
    const lines = original.split("\n");
    const pattern =
      acao === "ordered"
        ? /^\d+\. /
        : acao === "heading"
          ? /^## /
          : acao === "list"
            ? /^- /
            : /^> /;
    const prefix =
      acao === "heading" ? "## " : acao === "list" ? "- " : acao === "ordered" ? "1. " : "> ";
    const remove = lines.every((line) => pattern.test(line));
    const transformed = lines.map((line) => (remove ? line.replace(pattern, "") : prefix + line));
    const snippet = transformed.join("\n");
    replace(
      lineStart,
      lineEnd,
      snippet,
      Math.max(0, start - lineStart + (remove ? -prefix.length : prefix.length)),
      Math.max(
        0,
        end - lineStart + (remove ? -prefix.length * lines.length : prefix.length * lines.length),
      ),
    );
    selectionStart = Math.min(lineStart + snippet.length, selectionStart);
    selectionEnd = Math.min(lineStart + snippet.length, selectionEnd);
  }

  let from = 0;
  while (from < texto.length && from < next.length && texto[from] === next[from]) from++;
  let oldEnd = texto.length;
  let newEnd = next.length;
  while (oldEnd > from && newEnd > from && texto[oldEnd - 1] === next[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }
  return {
    texto: next,
    inicio: selectionStart,
    fim: selectionEnd,
    trocaInicio: from,
    trocaFim: oldEnd,
    trecho: next.slice(from, newEnd),
  };
}
