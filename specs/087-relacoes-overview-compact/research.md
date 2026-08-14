# Research: Vista geral mais compacta (Relações)

**Feature**: `087-relacoes-overview-compact`  
**Date**: 2026-08-14

## 1. Onde apertar

**Decision**: Só `computeInitialLayout` (vista sem selecção). `GraphStage` deixa de passar o `espacamento` de foco (240) para a vista geral. `computeFocusLayout` e a compactação 086 (`innerSpacing` se `directIds.size > 6`) **não mudam**.

**Rationale**: FR-001, FR-004, clarification «só sem disco seleccionado». Hoje ambas as funções recebem o mesmo `espacamento = 240`; por isso o anel de NPCs herda a folga larga do foco.

**Alternatives considered**: Baixar o default `espacamento` global — rejeitado (apertaria o foco, viola FR-004). Baixar `MIN_SCALE` (0.35) — fora de âmbito. Auto-fit ao abrir — fora de âmbito.

## 2. Magnitude (chão de não-sobreposição)

**Decision**: Folga da vista geral = **`OVERVIEW_SPACING = 120`**, igual a `COMPACT_INNER_SPACING_MIN` da 086.

`ringMinRadius` já reserva `NODE_W + spacing` por disco na circunferência. Com `spacing = 120` as caixas 172×112 não se tocam; nomes/papel cabem na caixa. 120 é o chão já validado na 086 («não abaixo disto»). A spec pede ir **até ao chão**, não parar a ⅔ (160).

Efeito com o default actual 240 (raio do anel NPC ≈ `max(inner + NODE_H + spacing, ringMinRadius(nNPC, spacing))`):

| NPCs | Raio NPC @240 | Raio NPC @120 | No palco a 0.35× (diâmetro aprox.) |
|------|---------------|---------------|-------------------------------------|
| 12   | ~787          | ~558          | ~990 → ~700 px                      |
| 20   | ~1312         | ~930          | ~990+ → ~750 px                     |

Gap radial PJ→NPC também cai (`NODE_H + spacing`: 352 → 232). Com poucos NPCs o anel exterior deixa de «flutuar» longe dos PJs; com muitos, o raio passa a ser o da circunferência — ainda menor que hoje.

**Rationale**: FR-003 prevalece; 120 é o último valor já usado no projecto sem overlap. Metade de 240 é redução perceptível (SC-002). 4 PJs + 12 NPCs cabem no zoom mínimo numa secretária típica (~900 px de palco) sem violar o chão (FR-002 SHOULD).

**Alternatives considered**:

- 160 (`compactInnerSpacing(240)`) — rejeitado (spec: até ao chão, não «um terço»).
- 80 ou 0 — rejeitado (caixas encostam; nomes longos tapam-se; viola FR-003).
- Folga radial independente da circunferencial — rejeitado (YAGNI: um `spacing` governa ambos via a fórmula actual).

## 3. Como passar o valor

**Decision**: Exportar `OVERVIEW_SPACING` em `graphLayout.ts` (alias documentado de `COMPACT_INNER_SPACING_MIN`, ou constante `120` partilhada). Em `GraphStage`:

```ts
computeInitialLayout(pjIds, npcIds, CENTER, OVERVIEW_SPACING)
```

O prop `espacamento` (240) continua a alimentar **só** o layout de foco.

**Rationale**: Um sítio, zero risco de o foco herdar 120. Sem novo controlo UI.

**Alternatives considered**: Prop `overviewEspacamento` no palco — rejeitado (não há slider; spec fora de âmbito).

## 4. Backend e dados

**Decision**: Zero alterações em Python, SQLite, API.

**Rationale**: Só geometria de sessão no cliente.

**Alternatives considered**: Persistir folga — fora de âmbito.

## 5. Documentação

**Decision**: Corrigir `docs/manual-relacoes.md` (a linha da 086 «a vista geral não muda» deixa de ser verdade). CHANGELOG **0.18.1**. Linha 087 em `specs/v2/README.md`. Sem `docs/v2/feature-rede-relacoes.md`.

**Rationale**: O manual do palco contradiria o comportamento. Patch: ajuste de layout, sem superfície nova.

**Alternatives considered**: 0.19.0 — rejeitado (não é capacidade nova). 0.18.0 in-place — rejeitado (já publicado no CHANGELOG).

## 6. Testes

**Decision**: Quickstart manual + `npm run build`. Sem Vitest.

**Rationale**: Igual 086. `ringMinRadius(..., 120)` garante o chão de caixas.

**Alternatives considered**: Unit test de raios 12/20 NPCs — deferido.
