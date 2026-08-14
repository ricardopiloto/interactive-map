# Research: Lista na coluna, hover no palco e anéis mais compactos

**Feature**: `086-relacoes-list-compact`  
**Date**: 2026-08-14

## 1. Onde vive a lista

**Decision**: Estender `RelacoesSideColumn` — nova secção **imediatamente abaixo** dos chips de tipo e **antes** de Isolar selecção / legenda. Dados e gestos vêm de `RelacoesPage` (já tem `personagens`, `query`, `selectPersonagem`).

**Rationale**: FR-001. A coluna já é o sítio da busca e dos filtros; a lista de Locais (`SideMenu` / `onLocalHover`) é o precedente de «nome na coluna ↔ destaque no palco». Não criar um painel paralelo.

**Alternatives considered**: Lista flutuante sobre o palco — rejeitado (spec: coluna esquerda). Filtrar a lista pelo Isolar — rejeitado (edge case da spec: a lista mantém o conjunto busca/visibilidade para saltar para outro personagem).

## 2. Conjunto e ordenação

**Decision**: A lista = `personagens` já carregados para o papel (API pública vs admin), ordenados por `nome` com `localeCompare` (pt), filtrados por `labelMatchesQuery` quando há texto na busca. PJ e NPC juntos, sem secções. Personagem oculto: só aparece se já veio na lista (GM); indicador igual ao disco (`graph-node--oculto` / ponto).

**Rationale**: Clarification Q1; FR-002 / FR-004; SC-002. O palco **não esconde** nomes que não batem na busca — só os atenua (`opacity 0.4`). A lista **filtra** (spec US1 cenário 3: «só mostra nomes que correspondem»). Visibilidade continua a ser da API, não da coluna.

**Alternatives considered**: Só NPCs — rejeitado na clarify. Agrupar PJ/NPC — fora de âmbito. Segunda busca — fora de âmbito.

## 3. Scroll da lista vs scroll da coluna

**Decision**: A coluna passa a `overflow: hidden` + flex column. A lista ganha `flex: 1; min-height: 0; overflow-y: auto`. Chips ficam no topo; Isolar + legenda (`margin-top: auto`) ficam sempre acessíveis. Estado vazio: uma linha i18n (`column.listEmpty` / `column.listEmptySearch`), não um bloco em branco.

**Rationale**: FR-005. Hoje `.relacoes-side { overflow-y: auto }` faria uma lista longa «comer» a legenda. No breakpoint ≤800px a coluna já tem `max-height: 38vh`; o scroll interno da lista continua a aplicar-se dentro desse tecto.

**Alternatives considered**: `max-height` fixo em px (ex. 240) — rejeitado (desperdica espaço em ecrãs altos). Scroll só na coluna inteira — rejeitado (FR-005).

## 4. Clique = disco

**Decision**: `onClick` no item chama o mesmo `selectPersonagem(id)` do palco (toggle: segundo clique desselecciona). Não abrir formulário GM.

**Rationale**: FR-003; assumption da spec.

**Alternatives considered**: Só focar sem abrir o painel — rejeitado (paridade com o disco).

## 5. Hover → destaque no palco

**Decision**: Estado `hoveredId: number | null` em `RelacoesPage` (espelho de `hoveredLocalId` no mapa). `RelacoesSideColumn` emite `onPersonagemHover(id | null)` em `pointerenter` / `pointerleave` do item. `GraphStage` recebe `hoveredId` e aplica pré-visualização **sem** alterar `selectedId`, layout, pan ou zoom.

Regras visuais (efeito simples):

- Disco com `hoveredId`: classe `graph-node--preview` — anel de realce no mesmo espírito de `.graph-node--selected` (box-shadow accent), sem escala que mude o layout.
- Linhas: `isPreviewEdge` = extremo = `hoveredId` **e** a aresta já está em `visibleEdges` (chips + Isolar + visibilidade). Opacidade `EDGE_OPACITY_FOCUS` (0.9) e `strokeWidth` 2.25, iguais ao foco por clique.
- Se `hoveredId` está definido e é **outro** que `selectedId`, as arestas de foco da selecção **não** competem: só as de preview sobem a 0.9; as restantes ficam no dim actual.
- Se `hoveredId === selectedId` (ou hover nulo): comportamento de selecção inalterado (`showEdges` + `isFocusEdge`).
- Se o disco de `hoveredId` não está no palco (`isVisible` falso, ex. Isolar): **nenhum** preview; Isolar não se desliga.
- `pointerleave` → `hoveredId = null`; a selecção por clique permanece.
- Toque sem hover: os eventos pointer de hover simplesmente não disparam de forma estável; o clique continua a ser o único gesto obrigatório (FR-013). Sem media-query extra.

**Rationale**: FR-009–FR-013; precedente 005 (`onLocalHover` + `campaign-map__pin--hovered`). Reutilizar opacidades já definidas em `graphLayout.ts` evita uma paleta de preview paralela.

**Alternatives considered**: Tratar hover como selecção temporária (recalcular anéis) — rejeitado (FR-011, «efeito simples»). Atenuar todo o resto do grafo tipo Isolar — rejeitado (demasiado). Destacar vizinhos (discos) além das linhas — não pedido; as linhas bastam. Foco de teclado — fora de âmbito.

## 6. Folga compacta do anel interior

**Decision**: Constantes em `graphLayout.ts`:

| Constante | Valor | Uso |
|-----------|-------|-----|
| `espacamento` default (já em `GraphStage`) | `240` | vista geral e anel exterior do foco; anel interior se `directIds.length ≤ 6` |
| `COMPACT_INNER_THRESHOLD` | `6` | compactar só se `count > 6` |
| `COMPACT_INNER_FACTOR` | `2/3` | «cerca de um terço menos» (assumption da spec) |
| `COMPACT_INNER_SPACING_MIN` | `120` | chão para rótulos; `ringMinRadius` já impede sobreposição de caixas |

`compactInnerSpacing(spacing) = max(120, round(spacing * 2/3))` → com 240, **160**.

`computeFocusLayout` passa a aceitar `innerSpacing` (default = `spacing`). Raio interior e `layoutRings` dos `directIds` usam `innerSpacing`; anel exterior e gap `NODE_H + spacing` usam o `spacing` padrão.

`computeInitialLayout` **não** muda (clarification Q2 / FR-008 / SC-005).

O conjunto `directIds` continua a ser o de `filteredVinculos` (chips activos) — «conexões directas **visíveis**».

**Rationale**: `ringMinRadius(count, spacing)` deriva o raio de `count * (NODE_W + spacing)`. Reduzir `spacing` no anel interior encolhe o círculo; as caixas 172×112 continuam sem overlap por construção. Com 7 nós e 160px de folga o raio cai ~459→370 px (visível, SC-003) sem colisão. Com 4 ou 6 nós o `innerSpacing` permanece 240 (SC-004).

**Alternatives considered**: Compactar qualquer anel com >6 discos — rejeitado na clarify (Q2 = só foco interior). Factor 1/2 (120px) como valor único — rejeitado (o spec pede «um pouco»; 120 é o chão, não o alvo). Controlo do utilizador — fora de âmbito. Mudar `NODE_W` / `DISC` — fora de âmbito.

## 7. Backend e dados

**Decision**: Zero alterações em Python, SQLite, API, seed.

**Rationale**: FR implícito / assumption «sem dados novos nem migração». A lista lê o mesmo `GET` de personagens; hover e folga são estado de sessão no cliente.

**Alternatives considered**: Persistir posições ou folga — fora de âmbito.

## 8. i18n e documentação

**Decision**: Novas chaves em `frontend/src/locales/{pt-BR,en}/relacoes.json` (`column.personagens`, `column.listEmpty`, `column.listEmptySearch`). Actualizar `docs/manual-relacoes.md` (secção coluna: lista, hover, anel compacto). Linha 086 em `specs/v2/README.md`. CHANGELOG 0.18.0. Não exigir `docs/v2/feature-rede-relacoes.md`.

**Rationale**: 080 cobre UI; o manual de produto da Rede já descreve a coluna. Mesmo critério da 085 (não alargar `docs/v2`).

**Alternatives considered**: Só CHANGELOG — rejeitado (manual ficaria desactualizado na coluna, que é o sítio que o utilizador lê).

## 9. Versão

**Decision**: **0.18.0** (minor).

**Rationale**: Três capacidades novas de produto (lista, hover-preview, layout compacto no foco). Contrasta com 0.17.1 (só paleta) e alinha a «Added» no changelog, não patch de 0.17.x.

**Alternatives considered**: 0.17.2 — rejeitado (não é correcção nem ajuste mínimo de 0.17.1). 0.19.0 — desnecessário.

## 10. Testes

**Decision**: Sem runner de unit tests no frontend (`package.json` só `tsc -b` + Vite). Validação = quickstart manual + `npm run build`. A matemática de layout fica em funções puras (`compactInnerSpacing`, `computeFocusLayout` com `innerSpacing`) para um teste futuro; esta frente não introduz Vitest.

**Rationale**: Consistente com 081–085. O risco de overlap está fechado por `ringMinRadius`.

**Alternatives considered**: Adicionar Vitest só para `graphLayout` — deferido (custo de tooling > ganho nesta frente).
