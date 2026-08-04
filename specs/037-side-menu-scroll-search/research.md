# Research: Scroll e busca no menu lateral

**Feature**: `037-side-menu-scroll-search` | **Date**: 2026-08-04

## 1. Porque o scroll não funciona hoje

**Decision**: Tratar como falha da cadeia de altura flex/grid, não como “falta de `overflow: auto`”.

**Rationale**: `.side-menu__body` já tem `overflow: auto` e `.side-menu { height: 100% }`, mas o grid `.map-page` usa `height: 100dvh; overflow: hidden` sem garantir `min-height: 0` no item da coluna do menu. Em CSS Grid/Flex, filhos default `min-height: auto` impedem encolher abaixo do conteúdo — o body cresce e nunca faz scroll.

**Alternatives considered**:
- Só aumentar `overflow` noutros wrappers — mascara o sintoma
- Scroll na página inteira — viola FR-002 (chrome fixo)

**Fix direction**: `min-height: 0` (e/ou `overflow: hidden`) na coluna sidebar e em `.side-menu`; manter `flex: 1; overflow: auto; min-height: 0` no `__body`. Validar overlay móvel (`side-menu--overlay` com `inset: 0`).

## 2. Visibilidade do campo de busca

**Decision**: Mostrar busca quando `tab !== 'grupo'` (jogador e GM). Hoje só `!isGm && (locais|npcs)`.

**Rationale**: FR-007 + clarification Grupo A.

## 3. Matching accent-insensitive

**Decision**: Reutilizar `labelMatchesQuery` / `foldText` de `frontend/src/components/routes/textMatch.ts` (feature 036). Opcionalmente mover para `frontend/src/utils/textMatch.ts` se o import cross-feature for indesejável — YAGNI: import directo ou move numa task.

**Rationale**: Mesma regra já aceite no produto; evita duplicar NFD/`\p{M}`.

## 4. Filtro História (arco ∨ locais)

**Decision**: Arco incluído se `labelMatchesQuery(arco.titulo, q)` **ou** algum `local` com `local.arco_id === arco.id` e `labelMatchesQuery(local.nome, q)`.

**Rationale**: Clarification B. Não filtrar pelo resumo do arco (não pedido).

## 5. Onde filtrar no modo GM

**Decision**: Filtrar os arrays passados a `LocalAdminList` / `NpcAdminList` / `ArcoAdminList` em `MapPage` (ou wrapper), usando o mesmo `query` de estado já partilhado com `SideMenu`. Listas admin continuam “burros” se receberem lista já filtrada.

**Rationale**: Evita duplicar UI de search nas listas; SideMenu já tem o input. Botões “Adicionar” nas listas GM devem permanecer visíveis acima da lista filtrada (não filtrar a chrome da secção).

**Alternatives considered**: Prop `query` dentro de cada AdminList — mais ficheiros tocados, mesmo resultado.

## 6. Persistência do query

**Decision**: Manter `query` em `MapPage`; `onTabChange` não limpa `query`.

**Rationale**: Clarification A / FR-006. Já é o comportamento actual do estado.

## 7. Backend

**Decision**: Sem alterações.

**Rationale**: Spec assumptions.
