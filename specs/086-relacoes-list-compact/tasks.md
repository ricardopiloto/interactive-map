# Tasks: Lista na coluna, hover no palco e anéis mais compactos

**Input**: Design documents from `/specs/086-relacoes-list-compact/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = lista na coluna (P1 MVP); US2 = anel interior compacto (P1); US3 = hover → preview no palco (P2)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`
- Docs / version: `docs/manual-relacoes.md`, `CHANGELOG.md`, `README.md`, package manifests

---

## Phase 1: Setup

**Purpose**: Align with UI contract and existing Relacoes column/stage

- [x] T001 Skim `specs/086-relacoes-list-compact/contracts/ui-relacoes-list-compact.md`, `research.md`, `data-model.md`, and `quickstart.md`
- [x] T002 [P] Skim `frontend/src/components/relacoes/RelacoesSideColumn.tsx`, `RelacoesSideColumn.css`, `frontend/src/pages/RelacoesPage.tsx`, `frontend/src/components/relacoes/GraphStage.tsx`, `graphLayout.ts`, and `frontend/src/utils/textMatch.ts` (`labelMatchesQuery`, `selectPersonagem`)

---

## Phase 2: Foundational (Blocking)

**Purpose**: i18n keys the list (and empty states) will use; no UI yet

**⚠️ CRITICAL**: Do not add the list markup until these keys exist in both locales

- [x] T003 [P] Add `column.personagens`, `column.listEmpty`, and `column.listEmptySearch` to `frontend/src/locales/pt-BR/relacoes.json` and `frontend/src/locales/en/relacoes.json` (per [contracts/ui-relacoes-list-compact.md](./contracts/ui-relacoes-list-compact.md) §4)

**Checkpoint**: Locale keys resolve; column/stage code unchanged

---

## Phase 3: User Story 1 - Encontrar personagem pela lista da coluna (Priority: P1) 🎯 MVP

**Goal**: Scrollable A→Z list of all visible PJ+NPC below type chips; click = disc select; search filters the list; Isolate does not shrink it

**Independent Test**: Quickstart scenarios 1–5 (list placement/scroll, click parity, search, visibility, Isolate)

### Implementation for User Story 1

- [x] T004 [P] [US1] Change `.relacoes-side` to `overflow: hidden` (keep flex column) and add list styles (internal `overflow-y: auto`, `flex: 1`, `min-height: 0`, selected/empty rows) in `frontend/src/components/relacoes/RelacoesSideColumn.css`
- [x] T005 [US1] Add list section **immediately below** type chips and **before** Isolate in `frontend/src/components/relacoes/RelacoesSideColumn.tsx`: props `personagens`, `selectedId`, `onSelectPersonagem`; sort A→Z; filter with `labelMatchesQuery`; empty copy from T003; GM oculto indicator matching the disc; `aria-current` / `--selected` on the selected row
- [x] T006 [US1] Pass `personagens`, `query`, `selectedId`, and `selectPersonagem` into `RelacoesSideColumn` from `frontend/src/pages/RelacoesPage.tsx`. Do **not** filter the list by Isolate. Reuse existing search `query` (no second input)

**Checkpoint**: Quickstart 1–5 pass; chips and legend stay reachable with ≥8 names

---

## Phase 4: User Story 2 - Anel mais junto quando há muitas conexões (Priority: P1)

**Goal**: Focus inner ring uses compact spacing only when visible direct connections `> 6`; overview and ≤6 unchanged

**Independent Test**: Quickstart scenario 6 (overview ≥7; focus with 4, 6, and 8 directs)

### Implementation for User Story 2

- [x] T007 [US2] In `frontend/src/components/relacoes/graphLayout.ts` export `COMPACT_INNER_THRESHOLD = 6`, `COMPACT_INNER_FACTOR = 2/3`, `COMPACT_INNER_SPACING_MIN = 120`, `compactInnerSpacing(spacing)`; add `innerSpacing = spacing` to `computeFocusLayout` and use it **only** for the inner ring (`directIds`). Outer ring and `computeInitialLayout` keep `spacing`
- [x] T008 [US2] In `frontend/src/components/relacoes/GraphStage.tsx`, when `directIds.size > COMPACT_INNER_THRESHOLD` pass `compactInnerSpacing(espacamento)` as `innerSpacing` into `computeFocusLayout`; otherwise pass `espacamento` (default 240 → compact **160**)

**Checkpoint**: Quickstart 6 passes; 4 and 6 directs look as before; 8 directs visibly tighter without overlapping names/discs

---

## Phase 5: User Story 3 - Pré-ver personagem e vínculos ao passar o rato na lista (Priority: P2)

**Goal**: List hover highlights the disc and visible direct edges on the stage without selecting, rearranging layout, or panning

**Independent Test**: Quickstart scenario 7 (hover preview, leave, switch names, hover while selected, Isolate miss, no connections)

### Implementation for User Story 3

- [x] T009 [P] [US3] Add `.graph-node--preview` disc ring (accent box-shadow, no layout shift) in `frontend/src/components/relacoes/GraphStage.css` — same spirit as `.graph-node--selected`, must not replace selection styles
- [x] T010 [US3] Add `hoveredId` state in `frontend/src/pages/RelacoesPage.tsx`; pass `onPersonagemHover` to `RelacoesSideColumn` and `hoveredId` to `GraphStage`. Hover MUST NOT call `selectPersonagem` / change Isolate / pan / zoom
- [x] T011 [US3] In `frontend/src/components/relacoes/RelacoesSideColumn.tsx`, `pointerenter` / `pointerleave` on each list item call `onPersonagemHover(id | null)`
- [x] T012 [US3] In `frontend/src/components/relacoes/GraphStage.tsx`, honor `hoveredId`: if the node is `isVisible`, apply `--preview` and raise matching `visibleEdges` to `EDGE_OPACITY_FOCUS` / stroke 2.25; if `hoveredId !== selectedId`, dim the selection’s focus edges while preview is active; if the node is not drawn (Isolate), no preview. Reuse opacities from `graphLayout.ts` (no new hex)

**Checkpoint**: Quickstart 7 passes; hover ≠ click (detail panel stays closed)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Manual, version 0.18.0, changelog, build, spec status

- [x] T013 [P] Update the left-column section in `docs/manual-relacoes.md`: list below types (PJ+NPC, scroll, search, Isolate unchanged), hover preview (disc + direct lines, not a click), compact inner ring only when selected character has **>6** visible directs
- [x] T014 [P] Add `[0.18.0]` **Added** entry in `CHANGELOG.md` (lista na coluna, hover-preview, anel interior compacto >6)
- [x] T015 [P] Bump version to **0.18.0** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`; add 086 row in `specs/v2/README.md` follow-ups table
- [x] T016 Run `cd frontend && npm run build` then `specs/086-relacoes-list-compact/quickstart.md`
- [x] T017 Set **Status: Implemented** in `specs/086-relacoes-list-compact/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001–T002) → Foundational (T003) → US1 (T004–T006) and US2 (T007–T008) → US3 (T009–T012) → Polish
- US1 and US2 do not share files — can proceed in parallel after T003
- US3 needs the list from US1 and should land **after** US2 if both edit `GraphStage.tsx` (T008 then T012)
- Polish after US1–US3

### User Story Dependencies

- **US1**: T003 locales; column CSS (T004) ∥ then list markup (T005) then page wiring (T006)
- **US2**: Independent of US1; T007 then T008
- **US3**: Depends on US1 (items to hover). T009 CSS ∥ T010 page state; T011 after T005+T010; T012 after T008+T010

### Parallel Opportunities

- T001 ∥ T002
- After T003: US1 (T004) ∥ US2 (T007)
- T004 ∥ T007 (CSS vs `graphLayout.ts`)
- T009 ∥ T010 (CSS vs `RelacoesPage.tsx`)
- T013 ∥ T014 ∥ T015

---

## Parallel Example: Setup

```bash
Task: "Skim 086 contracts/research (T001)"
Task: "Skim RelacoesSideColumn + GraphStage + graphLayout (T002)"
```

---

## Parallel Example: After locales (US1 CSS ∥ US2 layout math)

```bash
Task: "RelacoesSideColumn.css list scroll (T004)"
Task: "graphLayout innerSpacing + compact constants (T007)"
```

---

## Parallel Example: US3 CSS ∥ page state

```bash
Task: "graph-node--preview CSS (T009)"
Task: "hoveredId in RelacoesPage (T010)"
```

---

## Parallel Example: Polish docs

```bash
Task: "docs/manual-relacoes.md (T013)"
Task: "CHANGELOG 0.18.0 (T014)"
Task: "Bump manifests 0.18.0 (T015)"
```

---

## Implementation Strategy

### MVP

1. Setup + Foundational (T001–T003)
2. US1 (T004–T006) — lista clicável
3. **STOP and VALIDATE**: Quickstart 1–5
4. US2 (T007–T008) — anel compacto
5. US3 (T009–T012) — hover preview
6. 0.18.0 + quickstart

### Incremental Delivery

1. Setup + Foundational → i18n ready
2. US1 → navigate by name (MVP)
3. US2 → dense focus ring readable
4. US3 → list ↔ stage preview like Locais pins
5. Polish → 0.18.0

### Notes

- Sem backend, sem migração, sem Vitest
- Compact: factor ⅔, min 120, default 240 → **160**; limiar **estrito** `> 6`; só anel interior do foco
- Lista = PJ+NPC visíveis ao papel; Isolar não a reduz
- Hover ≠ selecção; preview só em discos `isVisible`; arestas ⊂ `visibleEdges`
- `docs/v2/feature-rede-relacoes.md` fora de âmbito
