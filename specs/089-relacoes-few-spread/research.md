# Research: Anel de foco mais aberto (≤3 conexões)

**Feature**: `089-relacoes-few-spread`  
**Date**: 2026-08-14

## 1. Onde abrir

**Decision**: Só o `innerSpacing` de `computeFocusLayout`. Hoje `GraphStage` faz:

```ts
directIds.size > COMPACT_INNER_THRESHOLD
  ? compactInnerSpacing(espacamento)
  : espacamento
```

Passa a um selector único `focusInnerSpacing(espacamento, directIds.size)`:

| `directCount` | Folga interior |
|---------------|----------------|
| 0             | irrelevante (anel vazio); devolver `espacamento` |
| 1–3           | `sparseInnerSpacing` = `round(espacamento × 1.3)` → **312** |
| 4–6           | `espacamento` → **240** |
| >6            | `compactInnerSpacing` (088, inalterado) |

`computeInitialLayout(..., OVERVIEW_SPACING)` e o `espacamento` do anel exterior **não mudam**.

**Rationale**: FR-001–FR-004. O mesmo `innerSpacing` já governa só o anel das conexões directas.

**Alternatives considered**: Abrir também o anel exterior — rejeitado (FR-004). Abrir a vista geral com poucos discos — rejeitado (assumption da spec). Mudar o default `espacamento` 240 — rejeitado (apertaria/afastaria 4–6 e o exterior).

## 2. Magnitude (+30% da padrão)

**Decision**:

```ts
export const SPARSE_INNER_THRESHOLD = 3
export const SPARSE_INNER_FACTOR = 1.3

export function sparseInnerSpacing(spacing: number): number {
  return Math.round(spacing * SPARSE_INNER_FACTOR)
}

export function focusInnerSpacing(spacing: number, directCount: number): number {
  if (directCount > COMPACT_INNER_THRESHOLD) return compactInnerSpacing(spacing)
  if (directCount > 0 && directCount <= SPARSE_INNER_THRESHOLD) {
    return sparseInnerSpacing(spacing)
  }
  return spacing
}
```

Com `espacamento = 240`: `round(240 × 1.3) = 312`.

O raio interior já é `max(NODE_W, ringMinRadius(n, innerSpacing))`. Com 1 disco, `ringMinRadius(1, 312)` ≈ 212 (vs ~176 a 240) — o vizinho afasta-se. Com 2–3, a circunferência usa `NODE_W + 312` por caixa.

**Rationale**: Spec: 130% da folga **padrão** de foco, não da compacta 088.

**Alternatives considered**: 130% da compacta 088 — rejeitado. Factor aplicado ao raio em vez do `spacing` — rejeitado (o aceite é distância entre vizinhos = o `spacing` da circunferência).

## 3. Não tocar na 088

**Decision**: `compactInnerSpacing`, `COMPACT_INNER_TIGHTEN` e o limiar `>6` **não se alteram** (o valor actual de `TIGHTEN` pode ter sido afinado na sessão; 089 não o redefine).

**Rationale**: FR-003 / SC-003.

**Alternatives considered**: Rebaseline 088 nesta frente — fora de âmbito.

## 4. Backend e dados

**Decision**: Zero alterações em Python, SQLite, API.

**Rationale**: Só geometria de sessão no cliente.

**Alternatives considered**: Persistir folga — fora de âmbito.

## 5. Documentação

**Decision**: Actualizar `docs/manual-relacoes.md` (poucas conexões: anel mais aberto). CHANGELOG **0.18.3**. Linha 089 em `specs/v2/README.md`.

**Rationale**: Patch: afinação de layout, sem superfície nova.

**Alternatives considered**: 0.19.0 — rejeitado. 0.18.2 in-place — rejeitado (já publicado).

## 6. Testes

**Decision**: Quickstart manual + `npm run build`. Sem Vitest.

**Rationale**: Igual 086–088.

**Alternatives considered**: Unit test `focusInnerSpacing(240, 2) === 312` — deferido; a fórmula cabe no contrato.
