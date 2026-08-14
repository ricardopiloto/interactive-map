# UI Contract: Folga interior de foco ≤3 (Relações)

**Feature**: `089-relacoes-few-spread`  
**Scope**: FR-001–FR-005, US1, SC-001–SC-005  
**Não altera**: [088 `ui-focus-inner-spacing.md`](../../088-relacoes-focus-tighter/contracts/ui-focus-inner-spacing.md) (`compactInnerSpacing`); [087 `ui-overview-spacing.md`](../../087-relacoes-overview-compact/contracts/ui-overview-spacing.md) (`OVERVIEW_SPACING = 120`).

## Superfície

`frontend/src/components/relacoes/graphLayout.ts` + chamada em `GraphStage.tsx`.

```ts
export const SPARSE_INNER_THRESHOLD = 3
export const SPARSE_INNER_FACTOR = 1.3

// sparseInnerSpacing(240) === 312
// focusInnerSpacing(240, 2) === 312
// focusInnerSpacing(240, 5) === 240
// focusInnerSpacing(240, 8) === compactInnerSpacing(240)
```

`GraphStage`:

```ts
const innerSpacing = focusInnerSpacing(espacamento, directIds.size)
computeFocusLayout(..., espacamento, innerSpacing)
```

| Função | Folga |
|--------|-------|
| `computeInitialLayout(..., OVERVIEW_SPACING)` | 120 — inalterado |
| `computeFocusLayout` outer | 240 — inalterado |
| inner, count 1–3 | **312** |
| inner, count 4–6 | **240** |
| inner, count >6 | compactação 088 — inalterado |

`espacamento` default **240** não desce nem sobe globalmente. Zoom **não** muda.

## Proibições

- Passar 312 para `computeInitialLayout` ou para o anel exterior.
- Alterar `compactInnerSpacing` / `COMPACT_INNER_TIGHTEN` / `COMPACT_INNER_THRESHOLD`.
- Alterar `OVERVIEW_SPACING`.
- Alterar `NODE_W`, `NODE_H`, `DISC`, ou tipografia dos vínculos.
- Slider / persistência de folga.

## Limiares

- `≤3` (inclui 3): abertura 089.
- `4–6`: padrão.
- `>6`: compacto 088.
- `0`: sem anel interior; `focusInnerSpacing` pode devolver 240 (sem efeito visual).
