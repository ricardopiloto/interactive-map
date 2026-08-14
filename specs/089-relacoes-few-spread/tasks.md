# Tasks: Anel de foco mais aberto (≤3 conexões)

**Input**: Design documents from `/specs/089-relacoes-few-spread/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = anel interior de foco 1–3 com folga 312 (P1 MVP)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`
- Docs / version: `docs/manual-relacoes.md`, `CHANGELOG.md`, `README.md`, package manifests

---

## Phase 1: Setup

**Purpose**: Align with sparse-spacing contract and current inner-spacing branches

- [x] T001 Skim `specs/089-relacoes-few-spread/contracts/ui-focus-sparse-spacing.md`, `research.md`, `data-model.md`, and `quickstart.md`
- [x] T002 [P] Skim `frontend/src/components/relacoes/graphLayout.ts` (`compactInnerSpacing`, `OVERVIEW_SPACING`) and `frontend/src/components/relacoes/GraphStage.tsx` (`innerSpacing` / `computeFocusLayout` / `computeInitialLayout`)

---

## Phase 2: Foundational (Blocking)

**Purpose**: Keep overview 120, outer 240, 4–6 at 240, and >6 compact on separate paths before adding ≤3 spread

**⚠️ CRITICAL**: Do not change `compactInnerSpacing` / `COMPACT_INNER_TIGHTEN`. Do not pass 312 into `computeInitialLayout` or the outer ring

- [x] T003 Confirm `frontend/src/components/relacoes/GraphStage.tsx` uses `compactInnerSpacing` only when `directIds.size > 6`, `espacamento` for outer / current ≤6, and `OVERVIEW_SPACING` for `computeInitialLayout`

**Checkpoint**: Three inner-spacing bands identified; only 1–3 will change

---

## Phase 3: User Story 1 - Poucas conexões mais legíveis (Priority: P1) 🎯 MVP

**Goal**: When selected with 1–3 visible directs, inner ring gap is 130% of default (240→312); 4–6 stay 240; >6 stay 088 compact; overview and outer ring unchanged

**Independent Test**: Quickstart scenarios 1–6 (2 directs ~30% more open; 3 vs 4 threshold; 5 unchanged; 8 compact unchanged; overview 120; 0 directs no inner ring)

### Implementation for User Story 1

- [x] T004 [US1] In `frontend/src/components/relacoes/graphLayout.ts`, add `SPARSE_INNER_THRESHOLD = 3`, `SPARSE_INNER_FACTOR = 1.3`, `sparseInnerSpacing`, and `focusInnerSpacing(spacing, directCount)` so 1–3 → 312, 4–6 → 240, >6 → `compactInnerSpacing`; do **not** modify `compactInnerSpacing` or `OVERVIEW_SPACING`
- [x] T005 [US1] In `frontend/src/components/relacoes/GraphStage.tsx`, set `innerSpacing` via `focusInnerSpacing(espacamento, directIds.size)` for `computeFocusLayout`; keep outer `espacamento` and `computeInitialLayout(..., OVERVIEW_SPACING)`

**Checkpoint**: Quickstart 1–6 pass; 1–3 open; 4–6 and >6 and overview unchanged

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Manual, version 0.18.3, changelog, build, spec status

- [x] T006 [P] In `docs/manual-relacoes.md` palco section: with 3 or fewer visible connections the inner ring is more open; with >6 it stays compact
- [x] T007 [P] Add `[0.18.3]` **Changed** entry in `CHANGELOG.md` (anel interior ≤3: 240→312; spec 089)
- [x] T008 [P] Bump version to **0.18.3** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`; add 089 row in `specs/v2/README.md` follow-ups table
- [x] T009 Run `cd frontend && npm run build` then `specs/089-relacoes-few-spread/quickstart.md`
- [x] T010 Set **Status: Implemented** in `specs/089-relacoes-few-spread/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001–T002) → Foundational (T003) → US1 (T004–T005) → Polish
- T005 depends on T004 (`focusInnerSpacing` export)
- Polish after US1

### User Story Dependencies

- **US1**: Only story; T004 then T005

### Parallel Opportunities

- T001 ∥ T002
- T006 ∥ T007 ∥ T008 (after T005)

---

## Parallel Example: Setup

```bash
Task: "Skim 089 contracts/research (T001)"
Task: "Skim graphLayout + GraphStage (T002)"
```

---

## Parallel Example: Polish docs

```bash
Task: "docs/manual-relacoes.md (T006)"
Task: "CHANGELOG 0.18.3 (T007)"
Task: "Bump manifests 0.18.3 (T008)"
```

---

## Implementation Strategy

### MVP

1. Setup + Foundational (T001–T003)
2. US1 (T004–T005) — `focusInnerSpacing` + `GraphStage` call
3. **STOP and VALIDATE**: Quickstart 1–6
4. 0.18.3 + quickstart

### Incremental Delivery

1. Setup + Foundational → bands confirmed
2. US1 → inner 1–3 at 312 (MVP)
3. Polish → 0.18.3

### Notes

- Sem backend, sem i18n nova, sem Vitest
- Overview **120**; foco 4–6 **240**; interior 1–3 **312**; >6 compacto 088
- Não alterar `COMPACT_INNER_TIGHTEN`
- `docs/v2/feature-rede-relacoes.md` fora de âmbito
