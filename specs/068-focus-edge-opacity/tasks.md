# Tasks: Focus Edge Opacity

**Input**: Design documents from `/specs/068-focus-edge-opacity/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual visual QA via `quickstart.md` — no automated TDD suite requested.

**Organization**: US1 = rede a 18% sem selecção; US2 = realce 90% após animação; US3 = filtros/isolar/papel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: US1 / US2 / US3
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock contract and current edge-gating

- [x] T001 Skim `specs/068-focus-edge-opacity/contracts/ui-focus-edge-opacity.md` and `research.md` (0.18 / 0.90; `showEdges` = highlight ready)
- [x] T002 [P] Confirm `showEdges` + `visibleEdges` (only selected) in `frontend/src/pages/RelacoesPage.tsx` and `frontend/src/components/relacoes/GraphStage.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared opacity constants

**⚠️ CRITICAL**: US1–US3 consume these values

- [x] T003 Add `EDGE_OPACITY_DIM = 0.18` and `EDGE_OPACITY_FOCUS = 0.90` in `frontend/src/components/relacoes/graphLayout.ts` (or `edgeOpacity.ts` beside it)

**Checkpoint**: Constants ready

---

## Phase 3: User Story 1 — Rede visível sem selecção (Priority: P1) 🎯 MVP

**Goal**: Idle graph draws all role+chip-visible edges at 18%; no labels

**Independent Test**: Quickstart scenario 1

### Implementation for User Story 1

- [x] T004 [US1] In `frontend/src/components/relacoes/GraphStage.tsx`, draw filtered `vinculos` even when `selectedId` is null (stop gating the SVG on “has selection”)
- [x] T005 [US1] Apply `EDGE_OPACITY_DIM` to those idle lines; omit type labels when there is no highlight-ready focus in `frontend/src/components/relacoes/GraphStage.tsx`
- [x] T006 [US1] Smoke quickstart scenario 1 from `specs/068-focus-edge-opacity/quickstart.md`

**Checkpoint**: MVP — faint network on open

---

## Phase 4: User Story 2 — Realce após animação (Priority: P1)

**Goal**: During 0.6s motion all edges stay 18%; after settle, incident-to-focus edges 90%; deselect drops highlight immediately

**Independent Test**: Quickstart scenarios 2–3

### Implementation for User Story 2

- [x] T007 [US2] Treat `showEdges` in `frontend/src/components/relacoes/GraphStage.tsx` as highlight-ready: incident edges use `EDGE_OPACITY_FOCUS` only when `showEdges && selectedId`; others stay dim
- [x] T008 [US2] Keep RelacoesPage 600ms timer; on deselect set `showEdges=false` immediately (already the pattern) in `frontend/src/pages/RelacoesPage.tsx` so highlight drops before the return animation
- [x] T009 [US2] Show `rotulosVinculo` labels only on highlight-ready focus edges in `frontend/src/components/relacoes/GraphStage.tsx`
- [x] T010 [US2] Smoke quickstart scenarios 2–3 from `specs/068-focus-edge-opacity/quickstart.md`

**Checkpoint**: Focus highlight after motion; idle network never vanishes

---

## Phase 5: User Story 3 — Filtros e isolar (Priority: P2)

**Goal**: Tipo chips and isoliar apply to dim and highlight edges; `publico` unchanged

**Independent Test**: Quickstart scenario 4

### Implementation for User Story 3

- [x] T011 [US3] When isolate + selected, restrict drawn edges to those touching the focus in `frontend/src/components/relacoes/GraphStage.tsx` (same neighbour set as nodes)
- [x] T012 [US3] Confirm tipo-chip filtering already applied to the edge list in `frontend/src/components/relacoes/GraphStage.tsx` works for idle and focused states
- [x] T013 [US3] Smoke quickstart scenario 4 from `specs/068-focus-edge-opacity/quickstart.md`

**Checkpoint**: Filters/isolate consistent

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Changelog, version, spec status

- [x] T014 [P] Add CHANGELOG note for dim/highlight edges in `CHANGELOG.md`
- [x] T015 [P] Bump version in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T016 Mark feature status Implemented in `specs/068-focus-edge-opacity/spec.md` if acceptance matches

---

## Dependencies & Execution Order

```text
Setup → Foundational (T003) → US1 (idle 18%) → US2 (90% after timer) → US3 (isolate/chips) → Polish
```

US2 depends on US1 drawing all edges. US3 is a filter pass on the same list.

### Parallel opportunities

- T001 ∥ T002
- T014 ∥ T015 after visual pass

### Independent tests (summary)

| Story | Independent test |
|-------|------------------|
| US1 | Idle faint lines; no labels; no private edges for player |
| US2 | Dim during 0.6s; then focus 90%; deselect keeps faint net |
| US3 | Isolar + chips in both states |

### MVP scope

**T003 + US1** (constants + idle 18% network).

## Implementation Strategy

1. Constants + always draw filtered edges at 18%
2. Wire highlight-ready to 90% + labels
3. Isolate/chip smoke
4. Changelog / version / Implemented

## Format validation

All tasks use `- [ ]`, sequential `T00N` IDs, optional `[P]`, story labels only on US phases, and concrete file paths.
