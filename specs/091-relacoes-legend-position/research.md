# Research: Legenda da Rede no mesmo sítio que no mapa

**Feature**: `091-relacoes-legend-position`  
**Date**: 2026-08-14

## 1. Onde renderizar

**Decision**: Markup da chave em `GraphStage.tsx`, **irmão** de `.graph-stage__zoom`, filho directo de `.graph-stage` (`position: relative`). **Não** dentro de `.graph-stage__world` (esse nó sofre pan/zoom). Remover o bloco `.relacoes-side__legend` de `RelacoesSideColumn`.

**Rationale**: FR-001 / FR-004 / FR-006. O mapa ancora `campaign-map__legend` no palco, não na coluna. Isolar, estado e chips ficam na coluna (090).

**Alternatives considered**: Overlay em `RelacoesPage` sobre `__stage-wrap` — mesmo canto, mas duplica o sítio dos controlos de zoom. Extraír `GraphLegend.tsx` — YAGNI para ~15 linhas. Deixar a chave na coluna e só «parecer» o mapa — rejeitado pela spec.

## 2. Posição e conflito com zoom

**Decision**: `position: absolute; left: max(0.75rem, env(safe-area-inset-left)); bottom: max(0.75rem, env(safe-area-inset-bottom)); z-index: 3; max-width: calc(100% - 5.5rem)` — o mesmo canto e a mesma folga ao zoom que `.campaign-map__legend`. Zoom permanece `right` / `bottom` com `z-index` ≥ 4 para continuar clicável se as caixas se aproximarem (FR-005).

**Rationale**: SC-001 / SC-004. A referência é o canto, não a barra horizontal do mapa.

**Alternatives considered**: Overlay no viewport (ignorar a coluna) — desalinha com o mapa, cuja chave é relativa ao canvas. Empurrar zoom para cima em mobile — fora de âmbito (não mudar o canto do zoom).

## 3. Forma compacta, fundo e opacidade

**Decision**: Lista **vertical** (`flex-direction: column`). Sem `h6`, sem `.hr`, sem `background` / `border` / `box-shadow`. Tipografia ~0.65rem (como a chave do mapa), `gap` ~2px, discos ~10px, traços ~14×2px. `opacity: 0.55` no contentor (ícones e texto).

**Rationale**: Clarify Q1. 0,55 deixa o grafo ler-se por baixo e os rótulos continuam distinguíveis sobre o fundo ponteado do palco (SC-007). Compactar = menos espaço, não omitir tipos (FR-003, FR-009, FR-010).

**Alternatives considered**: Barra horizontal wrap estilo mapa — rejeitado na clarify. `opacity` 0,35 — rótulos ilegíveis. Placa a 92% como o mapa — rejeitado (sem fundo). Título visível «Legenda» — rejeitado (itens bastam; `column.legend` fica só em `aria-label`).

## 4. Gestos atravessam

**Decision**: `pointer-events: none` na overlay. Zoom e nós **não** herdam isso.

**Rationale**: Clarify Q2 / FR-011 / SC-008. A chave não é controlo (chips da coluna filtram tipos).

**Alternatives considered**: `pointer-events: auto` na overlay — bloquearia discos no canto. Itens clicáveis que isolam o tipo — fora de âmbito.

## 5. i18n

**Decision**: Rótulos visíveis iguais aos de hoje: `comum:tipo.pj|npc` e `getVinculoTipoLabel`. Sem chaves novas. `relacoes:column.legend` passa a `aria-label` da overlay (sem título visível).

**Rationale**: FR-008 / FR-010. Não deixar a chave `column.legend` órfã.

**Alternatives considered**: Apagar `column.legend` — pior para leitores de ecrã.

## 6. Backend, layout de anéis, mapa

**Decision**: Zero Python/API. Zero alterações a `graphLayout.ts` / 087–089. Zero alterações a `CampaignMap` legend.

**Rationale**: Spec out of scope.

## 7. Documentação e versão

**Decision**: `docs/manual-relacoes.md` — palco: chave no canto inferior esquerdo; coluna já não lista «Legenda». CHANGELOG **0.19.1** **Changed**. Linha 091 em `specs/v2/README.md`.

**Rationale**: Afinação de UI, não capacidade nova → patch após 0.19.0.

**Alternatives considered**: 0.20.0 — excesso. 0.19.0 amendar — já publicado na 090.

## 8. Testes

**Decision**: Quickstart manual + `npm run build`. Sem Vitest.

**Rationale**: Igual 087–090; aceite é visual e de gesto.
