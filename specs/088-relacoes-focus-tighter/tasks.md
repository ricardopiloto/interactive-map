# Tasks: Anel de foco ainda mais compacto (>6 conexões)

**Input**: Design documents from `/specs/088-relacoes-focus-tighter/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = anel interior de foco >6 com folga 112 (P1 MVP)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`
- Docs / version: `docs/manual-relacoes.md`, `CHANGELOG.md`, `README.md`, package manifests

---

## Phase 1: Setup

**Purpose**: Align with focus-inner-spacing contract and current compact path

- [x] T001 Skim `specs/088-relacoes-focus-tighter/contracts/ui-focus-inner-spacing.md`, `research.md`, `data-model.md`, and `quickstart.md`
- [x] T002 [P] Skim `frontend/src/components/relacoes/graphLayout.ts` (`compactInnerSpacing`, `COMPACT_INNER_*`, `OVERVIEW_SPACING`) and `frontend/src/components/relacoes/GraphStage.tsx` (`innerSpacing` / `computeFocusLayout` / `computeInitialLayout`)

---

## Phase 2: Foundational (Blocking)

**Purpose**: Keep overview 120 and ≤6 / anel exterior 240 on separate paths before changing compact inner

**⚠️ CRITICAL**: Do not clamp the new inner spacing to 120. Do not change `OVERVIEW_SPACING` or pass 112 into `computeInitialLayout` / anel exterior

- [x] T003 Confirm `frontend/src/components/relacoes/GraphStage.tsx` calls `compactInnerSpacing(espacamento)` only when `directIds.size > COMPACT_INNER_THRESHOLD`, uses `espacamento` (240) for `computeFocusLayout` outer / ≤6, and `OVERVIEW_SPACING` for `computeInitialLayout`

**Checkpoint**: Compact-inner is a single function; overview and outer focus stay untouched

---

## Phase 3: User Story 1 - Anel interior mais junto com muitas conexões (Priority: P1) 🎯 MVP

**Goal**: When selected with >6 visible directs, inner ring gap is 70% of the 086 compact (160→112); discs/names/vínculo labels stay readable; ≤6, outer ring, and overview unchanged

**Independent Test**: Quickstart scenarios 1–5 (4 directs unchanged; 8 directs ~30% tighter; labels readable; overview 120; outer 240; threshold 6 vs 7)

### Implementation for User Story 1

- [x] T004 [US1] In `frontend/src/components/relacoes/graphLayout.ts`, add `COMPACT_INNER_TIGHTEN = 0.7` and change `compactInnerSpacing` to `round(after086 * 0.7)` so `compactInnerSpacing(240) === 112`; do **not** clamp the result to `COMPACT_INNER_SPACING_MIN`; do **not** change the value of `OVERVIEW_SPACING` / `COMPACT_INNER_SPACING_MIN` (stay 120)
- [x] T005 [US1] Confirm `frontend/src/components/relacoes/GraphStage.tsx` needs no call-site change (still `compactInnerSpacing(espacamento)` for inner >6 only); if comments mention 160, update them

**Checkpoint**: Quickstart 1–5 pass; inner >6 is 112; labels readable; overview and ≤6 unchanged

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Manual, version 0.18.2, changelog, build, spec status

- [x] T006 [P] In `docs/manual-relacoes.md` palco section: with >6 visible connections the inner ring is even tighter; vínculo labels on lines stay readable
- [x] T007 [P] Add `[0.18.2]` **Changed** entry in `CHANGELOG.md` (anel interior >6: 160→112; textos de vínculo legíveis; spec 088)
- [x] T008 [P] Bump version to **0.18.2** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`; add 088 row in `specs/v2/README.md` follow-ups table
- [x] T009 Run `cd frontend && npm run build` then `specs/088-relacoes-focus-tighter/quickstart.md` (include scenario 3 — textos dos vínculos)
- [x] T010 Set **Status: Implemented** in `specs/088-relacoes-focus-tighter/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001–T002) → Foundational (T003) → US1 (T004–T005) → Polish
- T005 depends on T004 (`compactInnerSpacing` already returns 112)
- Polish after US1

### User Story Dependencies

- **US1**: Only story; T004 then T005

### Parallel Opportunities

- T001 ∥ T002
- T006 ∥ T007 ∥ T008 (after T005)

---

## Parallel Example: Setup

```bash
Task: "Skim 088 contracts/research (T001)"
Task: "Skim graphLayout + GraphStage (T002)"
```

---

## Parallel Example: Polish docs

```bash
Task: "docs/manual-relacoes.md (T006)"
Task: "CHANGELOG 0.18.2 (T007)"
Task: "Bump manifests 0.18.2 (T008)"
```

---

## Implementation Strategy

### MVP

1. Setup + Foundational (T001–T003)
2. US1 (T004–T005) — `COMPACT_INNER_TIGHTEN` + `compactInnerSpacing` → 112
3. **STOP and VALIDATE**: Quickstart 1–5 (labels!)
4. 0.18.2 + quickstart

### Incremental Delivery

1. Setup + Foundational → compact path confirmed
2. US1 → inner >6 at 112 (MVP)
3. Polish → 0.18.2

### Notes

- Sem backend, sem i18n nova, sem Vitest
- Overview **120**; foco ≤6 **240**; interior >6 **112**
- Não clampar 112 a 120; se rótulos ilegíveis no QA, subir `COMPACT_INNER_TIGHTEN` (FR-003)
- `docs/v2/feature-rede-relacoes.md` fora de âmbito
