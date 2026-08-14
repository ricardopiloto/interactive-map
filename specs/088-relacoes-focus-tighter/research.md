# Research: Anel de foco ainda mais compacto (>6 conexões)

**Feature**: `088-relacoes-focus-tighter`  
**Date**: 2026-08-14

## 1. Onde apertar

**Decision**: Só o retorno de `compactInnerSpacing` em `graphLayout.ts`. `GraphStage` já faz:

```ts
directIds.size > COMPACT_INNER_THRESHOLD
  ? compactInnerSpacing(espacamento)
  : espacamento
```

e passa o resultado como `innerSpacing` a `computeFocusLayout`. `computeInitialLayout(..., OVERVIEW_SPACING)` e o `espacamento` do anel exterior **não mudam**.

**Rationale**: FR-001, FR-004, FR-005. O gatilho >6 e o caminho de código já existem na 086; esta frente só muda a magnitude.

**Alternatives considered**: Baixar o default `espacamento` (240) — rejeitado (apertaria ≤6 e o anel exterior). Passar 112 para a vista geral — rejeitado (087 / FR-004). Novo prop/slider — fora de âmbito.

## 2. Magnitude (−30% da compactação 086)

**Decision**: Folga interior compacta = **70%** da 086.

| Passo | Folga |
|-------|-------|
| Default foco (`espacamento`) | 240 |
| Compactação 086 (`max(120, round(240 × ⅔))`) | **160** |
| Compactação 088 (`round(160 × 0.7)`) | **112** |

Implementação:

```ts
export const COMPACT_INNER_TIGHTEN = 0.7 // spec 088: −30% da folga 086

export function compactInnerSpacing(spacing: number): number {
  const after086 = Math.max(
    COMPACT_INNER_SPACING_MIN,
    Math.round(spacing * COMPACT_INNER_FACTOR),
  )
  return Math.round(after086 * COMPACT_INNER_TIGHTEN)
}
```

**Não** clampar o resultado a `COMPACT_INNER_SPACING_MIN` (120): isso anularia os 30% e deixaria 160→120 em vez de 160→112.

`OVERVIEW_SPACING` continua **120** (alias de `COMPACT_INNER_SPACING_MIN`). Não baixar essa constante.

Efeito no raio do anel interior (`ringMinRadius(n, spacing)`, caixas 172×112):

| Conexões | Raio @160 (086) | Raio @112 (088) |
|----------|-----------------|-----------------|
| 8        | ~423            | ~362            |
| 12       | ~634            | ~542            |

A distância **entre discos vizinhos** (o `spacing` na circunferência) cai 30% por construção. O raio cai menos que 30% porque `NODE_W` é fixo.

**Rationale**: Clarification 2026-08-14. `ringMinRadius` com 112 ainda reserva `NODE_W + 112` por disco — as caixas não se tocam (gap 112 vs 120 da 086: 8 px a menos, nomes continuam dentro da caixa 172).

**Alternatives considered**:

- Clamp final a 120 — rejeitado (seria −25%, não −30%).
- Ir ao chão da vista geral (120) como alvo — rejeitado (o utilizador pediu 30% da actual, não paridade com a 087).
- Factor único `240 × ⅔ × 0.7` sem o `max(120, …)` intermédio — equivalente com `espacamento = 240`; manter o passo 086 deixa o histórico explícito.

## 3. Textos dos vínculos (FR-003)

**Decision**: Não mexer em tipografia, `estimateLabelWidth`, nem posições (`mid` / `nearA` 0.22). A compactação é só geometria dos anéis. A **legibilidade** valida-se no quickstart; se 112 tapar rótulos, **sobe-se** a folga (FR-003 prevalece sobre FR-001).

Risco principal: rótulos no **meio** da linha (vínculo recíproco) aproximam-se uns dos outros porque o raio cai. Com 8 conexões, a corda entre mids passa ~162 px (@160) → ~139 px (@112). Um rótulo tipo «Vínculo de Sangue» (~140 px de pílula) fica no limite. Vínculos **duas pontas** colocam texto a 22% de cada extremo — perto do centro o arco é menor; 8+ duas-pontas no mesmo personagem é o pior caso.

**Rationale**: Spec: não alterar tamanho das etiquetas. O chão de caixas (112) não garante sozinho que pílulas nas linhas não se toquem — por isso o aceite é visual (SC-003), não só `ringMinRadius`.

**Alternatives considered**: Encolher `font-size` ou afastar rótulos do centro — fora de âmbito. Parar em 120 por precaução — rejeitado até o QA mostrar colisão (o pedido é −30%).

## 4. Backend e dados

**Decision**: Zero alterações em Python, SQLite, API.

**Rationale**: Só geometria de sessão no cliente.

**Alternatives considered**: Persistir folga — fora de âmbito.

## 5. Documentação

**Decision**: Actualizar `docs/manual-relacoes.md` (anel interior ainda mais junto com >6). CHANGELOG **0.18.2**. Linha 088 em `specs/v2/README.md`.

**Rationale**: Patch: afinação da compactação 086, sem superfície nova.

**Alternatives considered**: 0.19.0 — rejeitado. 0.18.1 in-place — rejeitado (já publicado).

## 6. Testes

**Decision**: Quickstart manual + `npm run build`. Sem Vitest.

**Rationale**: Igual 086/087. O aceite dos textos de vínculo é visual.

**Alternatives considered**: Unit test `compactInnerSpacing(240) === 112` — deferido; a fórmula cabe no contrato.
