# Tasks: Diminuir a distância entre tokens no grafo de Relações

**Input**: Design documents from `/specs/138-diminuir-distancia-tokens/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/token-spacing-base.md](./contracts/token-spacing-base.md), [quickstart.md](./quickstart.md)

**Depends on**: Specs **086–089** factors intact (`COMPACT_INNER_*`, `SPARSE_INNER_*`) — only bases change.

**Tests**: OPTIONAL (UI polish — Constitution II MAY). Validation via [quickstart.md](./quickstart.md) visual + optional arithmetic sanity + `tsc`. No pytest/API.

**Organization**: Uma user story P1 (US1). Paths are repo-relative.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete deps)
- **[Story]**: [US1]
- Setup / Foundational / Polish: no story label

---

## Phase 1: Setup

**Purpose**: Confirm both spacing bases (overview vs focus)

- [X] T001 Skim `frontend/src/components/relacoes/graphLayout.ts` — `COMPACT_INNER_SPACING_MIN` / `OVERVIEW_SPACING` (=120), `compactInnerSpacing` / `sparseInnerSpacing` / `focusInnerSpacing`, factors `2/3`, `0.6`, `1.3`
- [X] T002 [P] Skim `frontend/src/components/relacoes/GraphStage.tsx` — default `espacamento = 240`, `computeInitialLayout(..., OVERVIEW_SPACING)`, `focusInnerSpacing(espacamento, directIds.size)`
- [X] T003 [P] Skim [contracts/token-spacing-base.md](./contracts/token-spacing-base.md) — targets **84** / **168**; factors MUST NOT change

---

## Phase 2: Foundational — N/A beyond skim

**Purpose**: No new helpers; numeric constants are the feature

- [X] T004 Confirm no callers hard-code `120`/`240` spacing outside `graphLayout.ts` / `GraphStage` default (`rg` for `espacamento=` and `OVERVIEW_SPACING` / `COMPACT_INNER_SPACING_MIN` under `frontend/src`)

**Checkpoint**: Safe to change the two bases only

---

## Phase 3: User Story 1 — Tokens mais próximos (~30%) (P1) 🎯 MVP

**Goal**: Overview and focus bases reduced ~30%; sparse/default/compact remain distinct

**Independent Test**: [quickstart.md](./quickstart.md) §1–3

### Implementation

- [X] T005 [US1] In `frontend/src/components/relacoes/graphLayout.ts`, set `COMPACT_INNER_SPACING_MIN = 84` (was 120); keep `OVERVIEW_SPACING = COMPACT_INNER_SPACING_MIN`; update comments that still say 120 if stale
- [X] T006 [US1] In `frontend/src/components/relacoes/GraphStage.tsx`, change default `espacamento = 168` (was 240)
- [X] T007 [US1] Leave `COMPACT_INNER_FACTOR`, `COMPACT_INNER_TIGHTEN`, `SPARSE_INNER_FACTOR`, thresholds 3/6, and `ringMinRadius`/`layoutRings` **unchanged** (FR-002)
- [X] T008 [US1] Optional arithmetic check: `focusInnerSpacing(168, 2) === 218`, `focusInnerSpacing(168, 5) === 168`, `compactInnerSpacing(168) === 67` (quickstart §6)

**Checkpoint**: Overview tighter; focus 1–3 / 4–6 / >6 still look different; no box overlap

---

## Phase 4: Polish & Cross-Cutting

**Purpose**: Visual QA, gates, docs

- [X] T009 Run [quickstart.md](./quickstart.md) §1–5 (overview, focus branches, dense campaign, few nodes, zoom limits unchanged)
- [X] T010 If visual QA shows amontoado or imperceptible change, fine-tune **bases only** (e.g. 90/180) while keeping ≈30% and 1∶2 ratio — document chosen values in comments/[contracts](./contracts/token-spacing-base.md) if they differ from 84/168
- [X] T011 [P] Run `npx tsc -p tsconfig.app.json --noEmit` in `frontend/` until clean
- [X] T012 [P] Grep sanity from quickstart §7 (`COMPACT_INNER_SPACING_MIN`/`OVERVIEW_SPACING` ≈84; `espacamento =` ≈168; factors `2/3`, `0.6`, `1.3` intact)
- [X] T013 [P] Note feature in `CHANGELOG.md` (Unreleased) — Relações token spacing bases −30% (overview/focus); 086–089 factors unchanged

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 (3)** → **Polish (4)**
- T005 → T006 (can be same session); T007 is a verify constraint alongside them

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| **US1** | Phase 2 | Only story; is the MVP |

### Parallel Opportunities

```text
T001 || T002 || T003
T011 || T012 || T013
```

---

## Implementation Strategy

### MVP

1. Change `COMPACT_INNER_SPACING_MIN` / overview to 84 (T005)
2. Change GraphStage `espacamento` default to 168 (T006)
3. Visual quickstart + optional fine-tune + CHANGELOG

### Incremental Delivery

Numeric-only ship; no layout algorithm rewrite. Spec 139 (fit view) stays separate.

---

## Format Validation

- All tasks use `- [ ]`, sequential `T00N`, file paths, and `[US1]` on story phase only.
- No automated test tasks (UI polish MAY).
- Do not edit `MIN_SCALE`/`MAX_SCALE` or `NODE_*`.
