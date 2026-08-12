# Tasks: Disc Edge Anchor

**Input**: Design documents from `/specs/067-disc-edge-anchor/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual visual QA via `quickstart.md` — no automated TDD suite requested.

**Organization**: US1 = linhas no centro do disco; US2 = drag/etiquetas/layout intactos.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: US1 / US2
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock contract and current GraphStage geometry

- [x] T001 Skim `specs/067-disc-edge-anchor/contracts/ui-disc-edge-anchor.md` and `research.md` (disc centre offset; no clip/gap)
- [x] T002 [P] Confirm lines use layout `pos` (box centre) in `frontend/src/components/relacoes/GraphStage.tsx`; disc CSS (`padding-top`, `DISC`) in `frontend/src/components/relacoes/GraphStage.css` and `graphLayout.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Single helper mapping layout point → disc centre

**⚠️ CRITICAL**: US1/US2 both consume this helper

- [x] T003 Add `DISC_PAD_TOP` (match CSS `padding-top: 2px`) and `discCenterFromNodePos(pos)` in `frontend/src/components/relacoes/graphLayout.ts` (`y = pos.y - NODE_H/2 + DISC_PAD_TOP + DISC/2`; `x = pos.x`)

**Checkpoint**: Offset math lives in one place

---

## Phase 3: User Story 1 — Linhas no centro do disco (Priority: P1) 🎯 MVP

**Goal**: SVG line endpoints (and hit-line) are disc centres; edges stay under discs/halo; no gap

**Independent Test**: Quickstart scenarios 1–2 (`specs/067-disc-edge-anchor/quickstart.md`)

### Implementation for User Story 1

- [x] T004 [US1] In `frontend/src/components/relacoes/GraphStage.tsx`, compute disc centres from layout `pos` + drag offset via `discCenterFromNodePos`; set `<line>` / hit-line `x1,y1,x2,y2` to those points
- [x] T005 [US1] Confirm edge SVG remains behind nodes (and halo `box-shadow`) in `frontend/src/components/relacoes/GraphStage.tsx` / `GraphStage.css`; do **not** clip or shorten the segment
- [x] T006 [US1] Smoke quickstart scenarios 1–2 from `specs/067-disc-edge-anchor/quickstart.md`

**Checkpoint**: MVP — lines enter the middle of the disc

---

## Phase 4: User Story 2 — Drag, etiquetas e layout (Priority: P2)

**Goal**: Label midpoint uses disc centres; drag updates the same point; rings still use the node box

**Independent Test**: Quickstart scenario 3 (+ regression 4)

### Implementation for User Story 2

- [x] T007 [US2] Place edge labels at the midpoint of the **two disc centres** in `frontend/src/components/relacoes/GraphStage.tsx`
- [x] T008 [US2] Confirm ring helpers in `frontend/src/components/relacoes/graphLayout.ts` still use `NODE_W`/`NODE_H` (no change to `computeInitialLayout` / `computeFocusLayout` spacing)
- [x] T009 [US2] Smoke quickstart scenarios 3–4 from `specs/067-disc-edge-anchor/quickstart.md`

**Checkpoint**: Drag/labels/animation/visibility unchanged except anchor

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Changelog, version, spec status

- [x] T010 [P] Add CHANGELOG note for disc-centre edge anchors in `CHANGELOG.md`
- [x] T011 [P] Bump patch/minor in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock` if this release is versioned
- [x] T012 Mark feature status Implemented in `specs/067-disc-edge-anchor/spec.md` if acceptance matches

---

## Dependencies & Execution Order

```text
Setup (T001–T002) → Foundational (T003) → US1 (T004–T006) → US2 (T007–T009) → Polish
```

- US2 T007 can be done in the same GraphStage edit as T004 if convenient
- T008 is verify-only (no ring formula change)

### Parallel opportunities

- T001 ∥ T002
- T010 ∥ T011 after visual pass

### Independent tests (summary)

| Story | Independent test |
|-------|------------------|
| US1 | Lines aim at disc centre; under disc/halo; no gap |
| US2 | Drag follows disc; labels mid-disc; rings/animation/visibility OK |

### MVP scope

**T003 + US1** (helper + wire lines). US2 is the same file for labels + smoke.

## Implementation Strategy

1. Helper in `graphLayout.ts`
2. Wire GraphStage lines (MVP)
3. Labels + quickstart 3–4
4. Changelog / version / mark Implemented

## Format validation

All tasks use `- [ ]`, sequential `T00N` IDs, optional `[P]`, story labels only on US phases, and concrete file paths.
