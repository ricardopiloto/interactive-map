# Tasks: Vista geral mais compacta (Relações)

**Input**: Design documents from `/specs/087-relacoes-overview-compact/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = vista geral com folga 120 (P1 MVP)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`
- Docs / version: `docs/manual-relacoes.md`, `CHANGELOG.md`, `README.md`, package manifests

---

## Phase 1: Setup

**Purpose**: Align with overview-spacing contract and current layout call sites

- [x] T001 Skim `specs/087-relacoes-overview-compact/contracts/ui-overview-spacing.md`, `research.md`, `data-model.md`, and `quickstart.md`
- [x] T002 [P] Skim `frontend/src/components/relacoes/graphLayout.ts` (`computeInitialLayout`, `COMPACT_INNER_SPACING_MIN`, `computeFocusLayout`) and `frontend/src/components/relacoes/GraphStage.tsx` (`espacamento`, `computeInitialLayout` call)

---

## Phase 2: Foundational (Blocking)

**Purpose**: Keep focus spacing on a separate path before changing overview

**⚠️ CRITICAL**: Do not pass overview 120 into `computeFocusLayout`

- [x] T003 Confirm `GraphStage.tsx` calls `computeFocusLayout` with `espacamento` (240) / `compactInnerSpacing` only when `directIds.size > COMPACT_INNER_THRESHOLD`, and that `computeInitialLayout` is the only unselected-layout path in `frontend/src/components/relacoes/GraphStage.tsx`

**Checkpoint**: Focus path identified; overview is a single call site

---

## Phase 3: User Story 1 - Ver toda a Rede no palco sem selecção (Priority: P1) 🎯 MVP

**Goal**: Unselected view uses 120px ring gap (PJ inner / NPC outer); names and discs do not overlap; focus layout unchanged

**Independent Test**: Quickstart scenarios 1–3 (tighter overview, no overlap, min zoom, focus 4/8 directs)

### Implementation for User Story 1

- [x] T004 [US1] Export `OVERVIEW_SPACING = 120` in `frontend/src/components/relacoes/graphLayout.ts` (same floor as `COMPACT_INNER_SPACING_MIN`; do **not** change `compactInnerSpacing` or `computeFocusLayout`)
- [x] T005 [US1] Pass `OVERVIEW_SPACING` into `computeInitialLayout` in `frontend/src/components/relacoes/GraphStage.tsx`; keep default `espacamento = 240` for focus only

**Checkpoint**: Quickstart 1–3 pass; overview tighter; zero overlap; selecting 4 vs 8 directs matches 086

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Manual, version 0.18.1, changelog, build, spec status

- [x] T006 [P] In `docs/manual-relacoes.md` palco section: vista geral mais junta (sem selecção); remove or replace the 086 line that says the overview layout does not change
- [x] T007 [P] Add `[0.18.1]` **Changed** entry in `CHANGELOG.md` (vista geral 240→120; foco inalterado; spec 087)
- [x] T008 [P] Bump version to **0.18.1** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`; add 087 row in `specs/v2/README.md` follow-ups table
- [x] T009 Run `cd frontend && npm run build` then `specs/087-relacoes-overview-compact/quickstart.md`
- [x] T010 Set **Status: Implemented** in `specs/087-relacoes-overview-compact/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001–T002) → Foundational (T003) → US1 (T004–T005) → Polish
- T005 depends on T004 (`OVERVIEW_SPACING` export)
- Polish after US1

### User Story Dependencies

- **US1**: Only story; T004 then T005

### Parallel Opportunities

- T001 ∥ T002
- T006 ∥ T007 ∥ T008 (after T005)

---

## Parallel Example: Setup

```bash
Task: "Skim 087 contracts/research (T001)"
Task: "Skim graphLayout + GraphStage (T002)"
```

---

## Parallel Example: Polish docs

```bash
Task: "docs/manual-relacoes.md (T006)"
Task: "CHANGELOG 0.18.1 (T007)"
Task: "Bump manifests 0.18.1 (T008)"
```

---

## Implementation Strategy

### MVP

1. Setup + Foundational (T001–T003)
2. US1 (T004–T005) — `OVERVIEW_SPACING` + `computeInitialLayout`
3. **STOP and VALIDATE**: Quickstart 1–3
4. 0.18.1 + quickstart

### Incremental Delivery

1. Setup + Foundational → focus path confirmed
2. US1 → tighter overview (MVP)
3. Polish → 0.18.1

### Notes

- Sem backend, sem i18n nova, sem Vitest
- Overview **120**; foco **240** / interior >6 **160**
- Não baixar `MIN_SCALE`; não apertar abaixo de 120
- `docs/v2/feature-rede-relacoes.md` fora de âmbito
