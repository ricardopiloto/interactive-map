# Tasks: Tipo Filter Double-Click

**Input**: Design documents from `/specs/074-tipo-filter-double-click/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = solo/restore on double-click; US2 = delayed single-click toggle still works

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`
- Docs: `CHANGELOG.md`, version manifests

---

## Phase 1: Setup

**Purpose**: Confirm current chip toggle wiring

- [x] T001 Skim `activeTipos` / `toggleTipo` in `frontend/src/pages/RelacoesPage.tsx` and chip `onClick` in `frontend/src/components/relacoes/RelacoesSideColumn.tsx`
- [x] T002 [P] Confirm solo/restore + click-delay rules in `specs/074-tipo-filter-double-click/research.md` and `contracts/ui-tipo-filter-double-click.md`

---

## Phase 2: Foundational

**Purpose**: Page-level handlers for solo/restore before wiring gestures

- [x] T003 Add `soloOrRestoreTipo(tipo)` in `frontend/src/pages/RelacoesPage.tsx`: if `activeTipos` is exactly `{tipo}` → `setActiveTipos(new Set(VINCULO_TIPOS))`; else → `setActiveTipos(new Set([tipo]))`
- [x] T004 Pass `onDoubleClickTipo={soloOrRestoreTipo}` (name as implemented) into `RelacoesSideColumn` from `frontend/src/pages/RelacoesPage.tsx`

**Checkpoint**: Handlers ready; UI not yet wired to dblclick

---

## Phase 3: User Story 1 - Isolar um tipo com duplo clique (Priority: P1) 🎯 MVP

**Goal**: Double-click isolates one tipo; second double-click on the same sole chip restores all six; double-click another chip switches solo

**Independent Test**: Quickstart scenarios 1–3 on `/relacoes`

### Implementation for User Story 1

- [x] T005 [US1] Extend `RelacoesSideColumn` props in `frontend/src/components/relacoes/RelacoesSideColumn.tsx` with `onDoubleClickTipo: (tipo: VinculoTipo) => void` and attach `onDoubleClick` on each tipo chip button
- [x] T006 [US1] On chip `onDoubleClick` in `RelacoesSideColumn.tsx`, call `onDoubleClickTipo(tipo)` and cancel any pending single-click timer for that chip (per research)
- [x] T007 [US1] Manually verify isolate / restore / switch-solo (quickstart 1–3); confirm no empty-filter flash on restore

**Checkpoint**: US1 MVP — double-click solo/restore works

---

## Phase 4: User Story 2 - Clique simples continua a alternar (Priority: P2)

**Goal**: Single-click still toggles one chip; delayed so it does not fight dblclick

**Independent Test**: Quickstart scenario 4

### Implementation for User Story 2

- [x] T008 [US2] In `frontend/src/components/relacoes/RelacoesSideColumn.tsx`, change chip `onClick` to schedule `onToggleTipo(tipo)` after ~250–300ms; clear timer on unmount / dblclick
- [x] T009 [US2] Smoke single-click toggle on/off then double-click solo (quickstart 4); confirm multi-select still works when not double-clicking

**Checkpoint**: SC-003 — no single-click regression

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Release notes and version bump

- [x] T010 [P] Add `[0.10.1]` entry for tipo-chip double-click solo/restore in `CHANGELOG.md`
- [x] T011 [P] Bump version to `0.10.1` in `frontend/package.json`, `frontend/package-lock.json`, `README.md`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T012 Run full `specs/074-tipo-filter-double-click/quickstart.md`
- [x] T013 Set feature status to Implemented in `specs/074-tipo-filter-double-click/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → **US1** → **US2** (delay builds on US1 dblclick cancel) → **Polish**

### User Story Dependencies

- **US1**: Needs T003–T004
- **US2**: Needs US1 dblclick cancel path (T006); implements delayed click (T008)

### Parallel Opportunities

- T001 ∥ T002
- T010 ∥ T011

---

## Parallel Example: User Story 1

```bash
# After T004:
Task: "Wire onDoubleClickTipo on chips (T005)"
Task: "Cancel pending click on dblclick (T006)"
```

---

## Implementation Strategy

### MVP First (US1)

1. Setup + Foundational handlers
2. Wire double-click solo/restore
3. Validate quickstart 1–3
4. Add delayed single-click (US2)
5. Polish 0.10.1

---

## Notes

- Never leave `activeTipos` empty via the double-click path
- Keep isolate-seleção and search unchanged
- No automated tests requested
