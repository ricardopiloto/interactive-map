# UI Contract: Folga interior de foco >6 (Relações)

**Feature**: `088-relacoes-focus-tighter`  
**Scope**: FR-001–FR-005, US1, SC-001–SC-005  
**Supersedes (parcial)**: [086 `ui-relacoes-list-compact.md`](../../086-relacoes-list-compact/contracts/ui-relacoes-list-compact.md) § compactação interior — o valor passa de 160 para 112.  
**Não altera**: [087 `ui-overview-spacing.md`](../../087-relacoes-overview-compact/contracts/ui-overview-spacing.md) (`OVERVIEW_SPACING = 120`).

## Superfície

`frontend/src/components/relacoes/graphLayout.ts` (`compactInnerSpacing`). `GraphStage.tsx` já chama esta função quando `directIds.size > 6`.

```ts
export const COMPACT_INNER_THRESHOLD = 6
export const COMPACT_INNER_FACTOR = 2 / 3          // passo 086
export const COMPACT_INNER_SPACING_MIN = 120       // chão 086; NÃO clampar o resultado 088
export const COMPACT_INNER_TIGHTEN = 0.7           // spec 088: −30%
export const OVERVIEW_SPACING = COMPACT_INNER_SPACING_MIN // continua 120

// compactInnerSpacing(240) === 112
```

| Função | Folga |
|--------|-------|
| `computeInitialLayout(..., OVERVIEW_SPACING)` | 120 — inalterado |
| `computeFocusLayout(..., 240, 240)` se ≤6 | 240 — inalterado |
| `computeFocusLayout(..., 240, compactInnerSpacing(240))` se >6 | inner **112**, outer **240** |

`GraphStage` default `espacamento = 240` **não** desce. Zoom **não** muda.

## Proibições

- Clampar `compactInnerSpacing` a 120 (anularia os 30%).
- Baixar `OVERVIEW_SPACING` / `COMPACT_INNER_SPACING_MIN` para 112 (apertaria a vista geral).
- Passar 112 para o anel exterior do foco ou para `computeInitialLayout`.
- Alterar `NODE_W`, `NODE_H`, `DISC`, ou o tamanho da tipografia dos vínculos.
- Slider / persistência de folga.
- Alterar o limiar `COMPACT_INNER_THRESHOLD`.

## Chão de legibilidade (FR-003)

Alvo = 112. Discos e nomes na caixa 172×112 MUST permanecer sem overlap (`ringMinRadius`). Textos dos vínculos nas linhas MUST permanecer legíveis (sem se fundirem uns com os outros nem com os nomes). Se 112 violar isto no QA, aumentar `COMPACT_INNER_TIGHTEN` (ex. 0.75 → 120) — a legibilidade prevalece; **não** descer abaixo de 112 nesta frente.
