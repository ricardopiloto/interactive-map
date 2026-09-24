# Tasks: Remover destaque de hover na linha de vínculo (Relações)

**Input**: Design documents from `/specs/136-remover-hover-linha-vinculo/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/edge-hover-removed.md](./contracts/edge-hover-removed.md), [quickstart.md](./quickstart.md)

**Depends on**: None blocking. Keep token/list `hoveredId` preview (spec 135) untouched.

**Tests**: OPTIONAL (UI polish — Constitution II MAY). Validation via [quickstart.md](./quickstart.md) + `tsc`. No pytest/API.

**Organization**: Uma user story P1 (US1). Paths are repo-relative.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete deps)
- **[Story]**: [US1]
- Setup / Foundational / Polish: no story label

---

## Phase 1: Setup

**Purpose**: Locate edge-hover surface in GraphStage

- [X] T001 Skim `frontend/src/components/relacoes/GraphStage.tsx` — `hoveredEdgeId` state, `graph-stage__edge-hit` `onPointerEnter`/`onPointerLeave`, `midLabelVisible = highlighted || hoveredEdgeId === v.id`, and `onClick` → `onEdgeClick`
- [X] T002 [P] Skim [contracts/edge-hover-removed.md](./contracts/edge-hover-removed.md) — remove hover only; preserve hit area + click + `highlighted` labels

---

## Phase 2: Foundational — N/A beyond skim

**Purpose**: No shared infra to build; deletion is the feature

- [X] T003 Confirm no other file references `hoveredEdgeId` (`rg hoveredEdgeId frontend/src`) before editing — scope stays in `GraphStage.tsx`

**Checkpoint**: Safe to edit a single file

---

## Phase 3: User Story 1 — Linha de vínculo não reage ao hover (P1) 🎯 MVP

**Goal**: Hovering an edge produces no mid-label / style change unless already `highlighted`

**Independent Test**: [quickstart.md](./quickstart.md) §1–4

### Implementation

- [X] T004 [US1] In `frontend/src/components/relacoes/GraphStage.tsx`, remove `const [hoveredEdgeId, setHoveredEdgeId] = useState...` and all references
- [X] T005 [US1] On `graph-stage__edge-hit` path in `frontend/src/components/relacoes/GraphStage.tsx`, remove `onPointerEnter` / `onPointerLeave`; **keep** transparent stroke, `strokeWidth` hit area, and `onClick` with `stopPropagation` → `onEdgeClick?.(v.id)` (FR-003)
- [X] T006 [US1] Set `midLabelVisible = highlighted` only (drop `|| hoveredEdgeId === v.id`) in `frontend/src/components/relacoes/GraphStage.tsx` — labels still show for selection/preview focus (FR-002)

**Checkpoint**: Edge hover silent; focused edges still labeled; GM click still opens edit

---

## Phase 4: Polish & Cross-Cutting

**Purpose**: Gates and docs

- [X] T007 Run [quickstart.md](./quickstart.md) §1–4 (hover off-focus, focus labels, click, double-edge)
- [X] T008 [P] Run `npx tsc -p tsconfig.app.json --noEmit` in `frontend/` until clean
- [X] T009 [P] Grep sanity from quickstart §5 (`hoveredEdgeId` gone; `edge-hit` / `onEdgeClick` / `midLabelVisible` present)
- [X] T010 [P] Note feature in `CHANGELOG.md` (Unreleased) — Relações: no mid-edge label on edge hover; click/focus unchanged

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 (3)** → **Polish (4)**
- T004 → T005 → T006 (same file; sequential)

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

1. Delete `hoveredEdgeId` + pointer handlers (T004–T005)
2. `midLabelVisible = highlighted` (T006)
3. Quickstart + tsc + CHANGELOG

### Incremental Delivery

Single atomic change in `GraphStage.tsx` — ship as one PR slice.

---

## Format Validation

- All tasks use `- [ ]`, sequential `T00N`, file paths, and `[US1]` on story phase only.
- No automated test tasks (UI polish MAY).
- Spec 135 (token hover) explicitly out of scope.
