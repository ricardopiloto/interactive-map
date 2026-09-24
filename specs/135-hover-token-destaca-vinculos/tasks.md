# Tasks: Hover no token do personagem destaca seus vínculos (Relações)

**Input**: Design documents from `/specs/135-hover-token-destaca-vinculos/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/graph-token-hover.md](./contracts/graph-token-hover.md), [quickstart.md](./quickstart.md)

**Depends on**: Existing `hoveredId` → `previewId` preview path (lista lateral já funcional).

**Tests**: OPTIONAL (UI polish — Constitution II MAY). Validation via [quickstart.md](./quickstart.md) + `tsc`. No pytest/API.

**Organization**: Uma user story P1 (US1). Paths are repo-relative.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete deps)
- **[Story]**: [US1]
- Setup / Foundational / Polish: no story label

---

## Phase 1: Setup

**Purpose**: Confirm existing preview path and list trigger

- [X] T001 Skim `frontend/src/pages/RelacoesPage.tsx` — `hoveredId` / `setHoveredId` on list rows (`onPointerEnter`/`Leave`) and `<GraphStage hoveredId={hoveredId} />`
- [X] T002 [P] Skim `frontend/src/components/relacoes/GraphStage.tsx` — `hoveredId` prop → `previewId` / `isPreviewEdge` / `graph-node--preview`; confirm `.graph-node` has no hover handlers yet; do **not** touch `hoveredEdgeId` (spec 136)

---

## Phase 2: Foundational — GraphStage API — BLOCKS US1

**Purpose**: Add the callback prop and token pointer handlers without wiring the parent yet

**⚠️ CRITICAL**: Handlers must call the callback only; MUST NOT invent local hover state or change highlight priority

- [X] T003 Add optional prop `onHoverPersonagem?: (id: number | null) => void` to `GraphStageProps` in `frontend/src/components/relacoes/GraphStage.tsx` per [contracts/graph-token-hover.md](./contracts/graph-token-hover.md)
- [X] T004 On each `.graph-node` in `frontend/src/components/relacoes/GraphStage.tsx`, add `onPointerEnter` → `onHoverPersonagem?.(p.id)` and `onPointerLeave` → `onHoverPersonagem?.(null)`; MUST NOT call `onSelect`/`onDeselect` from these handlers

**Checkpoint**: Prop exists; omitting it leaves behaviour unchanged; with a stub callback, tokens fire enter/leave

---

## Phase 3: User Story 1 — Hover no token destaca os vínculos (P1) 🎯 MVP

**Goal**: Token hover shares the same `hoveredId` as the list → same preview visual

**Independent Test**: [quickstart.md](./quickstart.md) §1–5 (lista baseline vs token; leave; rapid pass; selection intact; no bonds)

### Implementation

- [X] T005 [US1] In `frontend/src/pages/RelacoesPage.tsx`, pass `onHoverPersonagem={setHoveredId}` (or equivalent) to `<GraphStage />` so token hover writes the **same** state as list row hover (FR-003)
- [X] T006 [US1] Smoke-check: hover token does not clear `selectedId`; no new CSS for “token hover” beyond existing `previewId` path (SC-001 parity)

**Checkpoint**: Hovering a token matches hovering that person in the list

---

## Phase 4: Polish & Cross-Cutting

**Purpose**: Gates and docs

- [X] T007 Run [quickstart.md](./quickstart.md) §1–5
- [X] T008 [P] Run `npx tsc -p tsconfig.app.json --noEmit` in `frontend/` until clean
- [X] T009 [P] Grep sanity from quickstart §6 (`onHoverPersonagem` / `onPointerEnter` on GraphStage + RelacoesPage wiring)
- [X] T010 [P] Note feature in `CHANGELOG.md` (Unreleased) — token hover reuses list preview (`hoveredId`) on Relações graph

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 (3)** → **Polish (4)**
- T003 → T004 → T005

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| **US1** | Phase 2 | Only story; is the MVP |

### Parallel Opportunities

```text
T001 || T002
T008 || T009 || T010
```

---

## Implementation Strategy

### MVP

1. `onHoverPersonagem` + pointer handlers on `.graph-node` (T003–T004)
2. Wire `setHoveredId` from `RelacoesPage` (T005–T006)
3. Quickstart + tsc + CHANGELOG

### Incremental Delivery

1. API on GraphStage (no parent wire = no UX change)  
2. Parent wire = feature live  
3. Validate parity with list  

---

## Format Validation

- All tasks use `- [ ]`, sequential `T00N`, file paths, and `[US1]` on story phase only.
- No automated test tasks (UI polish MAY).
- Spec 136 (edge hover removal) explicitly out of scope.
