# Tasks: Filtro de estado na Rede de Relações

**Input**: Design documents from `/specs/090-relacoes-status-filter/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = filtro Todos | Vivos | Mortos | Desconhecidos | Desaparecido (P1 MVP)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`
- Docs / version: `docs/manual-relacoes.md`, `CHANGELOG.md`, `README.md`, package manifests

---

## Phase 1: Setup

**Purpose**: Align with status-filter contract and current column / stage data flow

- [x] T001 Skim `specs/090-relacoes-status-filter/contracts/ui-status-filter.md`, `research.md`, `data-model.md`, and `quickstart.md`
- [x] T002 [P] Skim `frontend/src/pages/RelacoesPage.tsx` (personagens → coluna e palco), `frontend/src/components/relacoes/RelacoesSideColumn.tsx` (lista + Isolar), and `frontend/src/components/relacoes/GraphStage.tsx` (layout from `personagens`)

---

## Phase 2: Foundational (Blocking)

**Purpose**: Confirm filtering the arrays is enough to recompute rings; Isolar stays a stage-only mask

**⚠️ CRITICAL**: Do not persist the filter. Do not shrink the list when Isolar is on. Do not change 088/089 spacing constants

- [x] T003 Confirm `frontend/src/components/relacoes/GraphStage.tsx` builds rings only from the `personagens` prop and Isolar only hides already-laid-out nodes (`isolated` / `isVisible`), and that `frontend/src/components/relacoes/RelacoesSideColumn.tsx` lists whatever `personagens` it receives (search afterwards)

**Checkpoint**: Passing a filtered array to page children is the layout strategy

---

## Phase 3: User Story 1 - Ver só um estado de personagem (Priority: P1) 🎯 MVP

**Goal**: Select next to Isolar filters palco + lista by status; rings recompute without holes; Isolar applies after; default Todos; reload resets

**Independent Test**: Quickstart scenarios 1–8 (control placement, Todos, Mortos/Vivos rings, other statuses, deselect, Isolar, empty copy, reload)

### Implementation for User Story 1

- [x] T004 [P] [US1] Add `RelacoesStatusFilter`, `STATUS_FILTER_OPTIONS`, `personagemStatus`, and `matchesStatusFilter` in `frontend/src/components/relacoes/statusFilter.ts` (`null`/absent status → `desconhecido`; `todos` matches all)
- [x] T005 [P] [US1] Add `column.statusFilter`, `column.statusFilterTodos`, and `column.listEmptyStatus` in `frontend/src/locales/pt-BR/relacoes.json` and `frontend/src/locales/en/relacoes.json` (status option labels reuse `comum:status.*`)
- [x] T006 [US1] In `frontend/src/components/relacoes/RelacoesSideColumn.tsx` and `RelacoesSideColumn.css`, add a `<select>` immediately above Isolar in the same section (options order: Todos, Vivos, Mortos, Desconhecidos, Desaparecido); empty list uses `listEmptyStatus` when the query is empty; wire `statusFilter` / `onStatusFilterChange` props
- [x] T007 [US1] In `frontend/src/pages/RelacoesPage.tsx`, hold `statusFilter` default `'todos'`, compute `visiblePersonagens` / `visibleVinculos`, pass them to `RelacoesSideColumn` and `GraphStage`, and `deselectPersonagem` when `selectedId` is not in the visible set (do **not** persist)

**Checkpoint**: Quickstart 1–8 pass; rings have no holes; Isolar still stage-only; list shrinks with status not with Isolar

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Manual, version 0.19.0, changelog, build, spec status

- [x] T008 [P] In `docs/manual-relacoes.md` coluna: document the status filter next to Isolar (Todos / Vivos / Mortos / Desconhecidos / Desaparecido)
- [x] T009 [P] Add `[0.19.0]` **Added** entry in `CHANGELOG.md` (filtro de estado na Rede; spec 090)
- [x] T010 [P] Bump version to **0.19.0** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`; add 090 row in `specs/v2/README.md` follow-ups table
- [x] T011 Run `cd frontend && npm run build` then `specs/090-relacoes-status-filter/quickstart.md`
- [x] T012 Set **Status: Implemented** in `specs/090-relacoes-status-filter/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001–T002) → Foundational (T003) → US1 (T004–T007) → Polish
- T006 depends on T004 (types) and T005 (i18n keys)
- T007 depends on T004 and T006 (props)
- Polish after US1

### User Story Dependencies

- **US1**: Only story; T004 ∥ T005 → T006 → T007

### Parallel Opportunities

- T001 ∥ T002
- T004 ∥ T005
- T008 ∥ T009 ∥ T010 (after T007)

---

## Parallel Example: Setup

```bash
Task: "Skim 090 contracts/research (T001)"
Task: "Skim RelacoesPage + SideColumn + GraphStage (T002)"
```

---

## Parallel Example: US1 helpers

```bash
Task: "statusFilter.ts (T004)"
Task: "relacoes.json pt-BR + en (T005)"
```

---

## Parallel Example: Polish docs

```bash
Task: "docs/manual-relacoes.md (T008)"
Task: "CHANGELOG 0.19.0 (T009)"
Task: "Bump manifests 0.19.0 (T010)"
```

---

## Implementation Strategy

### MVP

1. Setup + Foundational (T001–T003)
2. US1 (T004–T007) — helper, i18n, select, page wiring
3. **STOP and VALIDATE**: Quickstart 1–8
4. 0.19.0 + quickstart

### Incremental Delivery

1. Setup + Foundational → filter-the-array strategy confirmed
2. US1 → working status filter (MVP)
3. Polish → 0.19.0

### Notes

- Sem backend, sem Vitest
- Isolar **não** reduz a lista; o filtro de estado **sim**
- Spacing 087–089 aplica-se ao conjunto **já** filtrado
- `docs/v2/feature-rede-relacoes.md` fora de âmbito
