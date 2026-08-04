# Tasks: Scroll e busca no menu lateral

**Input**: Design documents from `/specs/037-side-menu-scroll-search/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) scroll do corpo em todas as abas; US2 (P1) filtro Locais/NPCs/História (accent + arco∨local); US3 (P2) busca em jogador e GM, oculta em Grupo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 / US3 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e causa do scroll

- [X] T001 Skim `specs/037-side-menu-scroll-search/contracts/ui-side-menu-scroll-search.md` and `research.md` (min-height:0 chain; search except grupo; História título∨local)
- [X] T002 [P] Confirm current search gate `!isGm && (locais|npcs)`, body `overflow: auto`, and MapPage `query` state in `frontend/src/components/sidebar/SideMenu.tsx` and `frontend/src/pages/MapPage.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Helper de match partilhável antes das stories de filtro

**⚠️ CRITICAL**: Completar match helper antes de US2/US3

- [X] T003 Ensure accent-fold match is importable from sidebar/MapPage (reuse or move `labelMatchesQuery` from `frontend/src/components/routes/textMatch.ts` to e.g. `frontend/src/utils/textMatch.ts` and update route import if moved)

**Checkpoint**: `labelMatchesQuery` utilizável fora de `routes/`

---

## Phase 3: User Story 1 — Percorrer listas longas com scroll (Priority: P1) 🎯 MVP

**Goal**: Corpo do menu rola em todas as abas; header/abas/busca (se visível) ficam fixos

**Independent Test**: Lista ≥15 itens → scroll até ao fim; chrome não some; repetir NPCs/História/Grupo e overlay móvel

### Implementation for User Story 1

- [X] T004 [US1] Fix sidebar height chain (`min-height: 0` on grid/sidebar column and `.side-menu`; keep `__body` `flex: 1; min-height: 0; overflow: auto`) in `frontend/src/pages/MapPage.css` and `frontend/src/components/sidebar/SideMenu.css` (FR-001–002)
- [X] T005 [US1] Verify overlay mobile (`.side-menu--overlay`) still scrolls body content in `frontend/src/components/sidebar/SideMenu.css` (SC-004)

**Checkpoint**: SC-001, SC-004; quickstart A, B (scroll), G

---

## Phase 4: User Story 2 — Filtrar a lista da aba actual (Priority: P1)

**Goal**: Campo de busca nas abas com lista; filtro accent-insensitive; História por título ∨ local ligado; query persiste entre abas

**Independent Test**: Filtrar Locais/NPCs; em História achar por título e por nome de local; mudar de aba mantém texto

### Implementation for User Story 2

- [X] T006 [US2] Show search for `locais|npcs|arcos` (not only player) and hide for `grupo` in `frontend/src/components/sidebar/SideMenu.tsx` (FR-003, FR-011)
- [X] T007 [US2] Replace `toLowerCase().includes` with `labelMatchesQuery` for locais/npcs in `frontend/src/components/sidebar/SideMenu.tsx` (FR-005)
- [X] T008 [US2] Filter player História/arcos by arco título **or** linked local nome using `labelMatchesQuery` in `frontend/src/components/sidebar/SideMenu.tsx` (FR-010)
- [X] T009 [US2] Confirm `onTabChange` in `frontend/src/pages/MapPage.tsx` does not clear `query` (FR-006)
- [X] T010 [US2] Empty-filter and no-match messaging still clear for filtered lists in `frontend/src/components/sidebar/SideMenu.tsx` (FR-008)

**Checkpoint**: SC-002–SC-003; quickstart C, D, E

---

## Phase 5: User Story 3 — Busca em jogador e GM (Priority: P2)

**Goal**: Listas admin GM filtradas pelo mesmo `query`; Grupo sem busca; selecção/CRUD inalterados

**Independent Test**: Modo GM → filtrar Locais/NPCs/Arcos admin; Grupo sem input; editar item filtrado funciona

### Implementation for User Story 3

- [X] T011 [US3] Filter `locais` / `npcs` / `arcos` passed into admin lists by shared `query` (arcos: título ∨ local ligado) in `frontend/src/pages/MapPage.tsx` (FR-007, FR-010)
- [X] T012 [US3] Keep Add/actions chrome on admin lists usable when filtered (lists receive filtered arrays only) in `frontend/src/pages/MapPage.tsx` / `frontend/src/components/admin/*AdminList.tsx` (FR-009)
- [X] T013 [US3] Confirm Grupo tab hides search and still scrolls after T004–T006 in `frontend/src/components/sidebar/SideMenu.tsx` (FR-011)

**Checkpoint**: SC-005; quickstart B, F

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quickstart e changelog

- [X] T014 Run scenarios A–G from `specs/037-side-menu-scroll-search/quickstart.md`; fix only sidebar/MapPage/admin paths if needed
- [X] T015 [P] Note change in `CHANGELOG.md` (Added/Fixed under next patch, e.g. scroll + busca no menu lateral)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T003)** → **US1** → **US2** → **US3** → **Polish**
- US1 (scroll) pode validar-se antes do filtro; US2/US3 dependem do helper T003
- US3 assume search UI de T006

### User Story Dependencies

- **US1 (P1)**: MVP scroll
- **US2 (P1)**: Filtro player + História + persistência
- **US3 (P2)**: Paridade GM

### Parallel Opportunities

- T001 ∥ T002
- T004 ∥ T005 após alinhamento CSS (mesmo tema; sequencial se mesmo ficheiro)
- T014 ∥ T015 após implementação

---

## Parallel Example: After T003

```bash
Task: "Fix min-height scroll chain in MapPage.css / SideMenu.css"
Task: "Wire labelMatchesQuery into SideMenu filters (after T003)"
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T003 setup + match helper
2. T004–T005 scroll fiável
3. Validate quickstart A/B/G
4. T006–T010 filtro player/História
5. T011–T013 GM
6. T014–T015 polish

### Incremental Delivery

1. Foundational: textMatch partilhável
2. US1: scroll
3. US2: busca listas + História
4. US3: GM
5. Polish

---

## Notes

- Sem backend / API
- Não limpar `query` ao mudar de aba
- Não mostrar busca em Grupo
- Reutilizar match 036 (accent-fold)
