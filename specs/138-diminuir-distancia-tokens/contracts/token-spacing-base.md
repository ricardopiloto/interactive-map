# Contract: Base de espaçamento entre tokens (Relações)

**Surface**: Layout math — `graphLayout.ts` + default `espacamento` em `GraphStage`.

## Valores canónicos (spec 138)

```ts
COMPACT_INNER_SPACING_MIN = 84          // was 120
OVERVIEW_SPACING = COMPACT_INNER_SPACING_MIN
// GraphStage props:
espacamento = 168                       // was 240
```

Afinação ± poucos px permitida após QA visual, mantendo ≈30% vs valores pré-138 e a razão overview∶foco ≈ 1∶2.

## Invariantes

1. `computeInitialLayout(..., OVERVIEW_SPACING)` — única folga da vista geral.
2. Com selecção: anel exterior usa `espacamento`; anel interior usa `focusInnerSpacing(espacamento, directCount)` **sem** alterar a implementação dos factores.
3. `COMPACT_INNER_FACTOR`, `COMPACT_INNER_TIGHTEN`, `SPARSE_INNER_FACTOR`, limiares 3/6 — **MUST NOT** mudar nesta feature.
4. `ringMinRadius` / `layoutRings` — fórmula intacta; spacing menor ⇒ raios menores, caixas sem overlap por construção (`NODE_W + spacing`).

## Derivados esperados (com alvos 84 / 168)

| Contexto | Espaçamento efectivo |
|----------|----------------------|
| Overview | 84 |
| Foco, 4–6 directos | 168 |
| Foco, 1–3 directos | `round(168 * 1.3)` ≈ 218 |
| Foco, >6 directos | `compactInnerSpacing(168)` ≈ 67 |

## Fora de escopo

- Limites de zoom (`MIN_SCALE` / `MAX_SCALE`)
- Fit-to-view do botão “1:1” (spec 139)
- Tamanho visual do token (`NODE_*` / CSS)
