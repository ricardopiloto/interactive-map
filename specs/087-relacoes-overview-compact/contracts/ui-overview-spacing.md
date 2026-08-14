# UI Contract: Folga da vista geral (Relações)

**Feature**: `087-relacoes-overview-compact`  
**Scope**: FR-001–FR-005, US1, SC-001–SC-004  
**Supersedes (parcial)**: [086 `ui-relacoes-list-compact.md`](../../086-relacoes-list-compact/contracts/ui-relacoes-list-compact.md) §3 — a frase «`computeInitialLayout` não recebe compactação» deixa de aplicar-se.

## Superfície

`frontend/src/components/relacoes/graphLayout.ts` + chamada em `GraphStage.tsx`.

```ts
export const OVERVIEW_SPACING = 120  // chão = COMPACT_INNER_SPACING_MIN
```

| Função | Folga |
|--------|-------|
| `computeInitialLayout(..., OVERVIEW_SPACING)` | 120 — PJs interior, NPCs exterior |
| `computeFocusLayout(..., espacamento, innerSpacing)` | inalterado (240 / 160 se >6) |

`GraphStage` default `espacamento = 240` **não** desce. Zoom `MIN_SCALE = 0.35` **não** muda.

## Proibições

- Passar 120 (ou qualquer compactação de overview) para `computeFocusLayout`.
- Alterar `NODE_W`, `NODE_H`, `DISC`.
- Slider / persistência de folga.
- Apertar abaixo de 120 na vista geral.

## Chão (FR-003)

`layoutRings` / `ringMinRadius(count, 120)` = um arco `NODE_W + 120` por disco. Discos e rótulos na caixa 172×112 MUST permanecer sem overlap. Se com 120 o grafo ainda não couber no zoom mínimo, pan — não reduzir mais a folga.
