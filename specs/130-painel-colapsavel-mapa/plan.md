# Implementation Plan: MapSidePanel colapsável no desktop

**Branch**: `130-painel-colapsavel-mapa` | **Date**: 2026-09-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/130-painel-colapsavel-mapa/spec.md`

## Summary

**Achado ao planejar, que reduz o escopo real do trabalho:** boa parte do FR-002/FR-003 (expandir ao focar busca / selecionar algo) **já existe em código**, em `MapPage.tsx` e `RelacoesPage.tsx` — os dois já têm estado `expanded` com `setExpanded(true)` disparado por `onFocus` do campo de busca e por handlers de seleção (pino, personagem). O que falta de verdade, confirmado ao reler `MapSidePanel.css`:

1. **O CSS de desktop nunca usa `[data-expanded]`** — a regra em `@media (min-width: 861px)` é estática, `width: 372px` sempre; só o `@media (max-width: 860px)` (mobile) lê o atributo. É por isso que, mesmo com o estado JS já correto, nada muda visualmente hoje no desktop. Este é o trabalho central da feature.
2. **Não existe lógica de "voltar a colapsar" em lugar nenhum** — os três `setExpanded` só ligam pra `true`; a única forma de desligar hoje é o botão manual (`onToggleExpand`, grabber mobile). FR-004 (colapsar quando a busca perde foco sem seleção, ou a seleção é limpa) precisa ser escrito de verdade.
3. **`RotaPage` nasce com `useState(true)`** (não `false`) — mudança trivial de default, mas o `head` dela é sempre o formulário De/Para do planejador de rota, não um campo de busca livre — o "focar a busca" do FR-002 não tem um equivalente 1:1 lá; o gatilho equivalente é focar os campos do formulário ou escolher uma opção de rota (`onSelectIndex`, que já chama `setExpanded(true)`).

## Technical Context

**Language/Version**: TypeScript/React 19 + CSS

**Primary Dependencies**: Nenhuma nova

**Storage**: N/A

**Testing**: Quickstart manual (Constitution II permite pra UI de polimento)

**Target Platform**: Desktop das três telas de campanha (Mapa, Relações, Rota); mobile não muda

**Project Type**: Frontend web application

**Performance Goals**: N/A

**Constraints**: Não alterar `@media (max-width: 860px)` de `MapSidePanel.css`; não persistir estado (FR-007); não adicionar string de i18n nova (reaproveitar `panel.expand`/`panel.collapse`)

**Scale/Scope**: Um arquivo CSS (regra de desktop nova) + três componentes de página (estado de foco novo + efeito de auto-colapsar) + um default trocado em `RotaPage`

## Constitution Check

- **I. Isolamento**: PASS / N/A.
- **II. Testes primeiro**: PASS. UI de polimento — quickstart manual é suficiente.
- **III. Produção legada**: PASS / N/A.
- **IV. Simplicidade**: PASS. Estende o padrão `[data-expanded]` que o componente já usa no mobile; reaproveita estado (`expanded`, `selectedId`/`selectedLocalId`) já existente em cada página.
- **V. i18n**: PASS. Sem string nova.
- **VI. Migrações**: PASS / N/A.

## Project Structure

### Documentation (this feature)

```text
specs/130-painel-colapsavel-mapa/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md                    # Created by speckit-tasks, not this phase
```

### Source Code (repository root)

```text
frontend/src/
├── components/map/MapSidePanel.css   # NOVO: regra de desktop com [data-expanded='false'] (colapsado, só head) e ='true' (372px, como hoje)
├── pages/MapPage.tsx                  # NOVO: estado searchFocused; efeito que colapsa quando !searchFocused && !selectedLocalId
├── pages/RelacoesPage.tsx             # NOVO: mesmo padrão — searchFocused + efeito ligado a selectedId
├── pages/RotaPage.tsx                 # useState(true) → useState(false); equivalente de "foco expande" nos campos do formulário/seleção de rota
└── pages/RotaPage.css / MapPage.css / RelacoesPage.css  # ajuste visual do estado colapsado, se o head precisar de padding/tamanho diferente
```

**Structure Decision**: Não cria componente novo — estende `MapSidePanel.css` (a peça que falta de verdade) e completa a lógica de auto-colapsar nas três páginas, que já têm a metade "expandir" pronta. `RotaPage` ganha o alinhamento de default e um gatilho equivalente ao de busca, já que seu `head` é um formulário, não uma busca livre.

## Complexity Tracking

Nenhuma violação de constituição, nenhuma dependência nova.
