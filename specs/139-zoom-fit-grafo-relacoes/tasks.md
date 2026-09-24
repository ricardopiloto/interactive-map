# Tasks: Botão "1:1" ajusta a tela pra mostrar todos os tokens (Relações)

**Input**: Design documents from `/specs/139-zoom-fit-grafo-relacoes/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/fit-view-control.md](./contracts/fit-view-control.md), [quickstart.md](./quickstart.md)

**Depends on**: Existing `scale`/`pan`/`viewportCenter` transform in `GraphStage`; `NODE_W`/`NODE_H`/`isVisible`. Independent of 138 spacing.

**Tests**: OPTIONAL (UI polish — Constitution II MAY). Validation via [quickstart.md](./quickstart.md) + `tsc`. No pytest/API.

**Organization**: Uma user story P1 (US1). Paths are repo-relative.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete deps)
- **[Story]**: [US1]
- Setup / Foundational / Polish: no story label

---

## Phase 1: Setup

**Purpose**: Map current reset + coordinate system

- [X] T001 Skim `frontend/src/components/relacoes/GraphStage.tsx` — `resetView` (`setScale(1)`/`setPan({0,0})`), transform `translate(viewportCenter + pan) scale(scale)`, `MIN_SCALE`/`MAX_SCALE`, `measureUsableCenter` / `.map-panel`, button label `1:1`
- [X] T002 [P] Skim [contracts/fit-view-control.md](./contracts/fit-view-control.md) and [research.md](./research.md) — bbox, usable rect, `scale = min(fit, 1)` then clamp, `pan = -scale * center`, zero-token no-op, i18n keys

---

## Phase 2: Foundational — pure fit math + i18n — BLOCKS US1 wiring

**Purpose**: Geometry helper and copy ready before replacing the button behaviour

**⚠️ CRITICAL**: Fit math must match the existing transform (origin 0,0); do not invent a second pan model

- [X] T003 Add pure helper(s) in `frontend/src/components/relacoes/graphLayout.ts` (e.g. bbox of node centres ± `NODE_W/2`/`NODE_H/2`, then `fitScalePan({ bbox, usableW, usableH, padding, minScale, maxScale })` returning `{ scale, pan }` per contract — cap zoom-in at 1.0)
- [X] T004 [P] Add `graph.fitView` / `graph.fitViewAria` to `frontend/src/locales/pt-BR/relacoes.json` and `frontend/src/locales/en/relacoes.json` (pt: «Ajustar» / aria longa; en: «Fit» / aria longa)

**Checkpoint**: Helper callable without React; locale keys exist

---

## Phase 3: User Story 1 — Botão ajusta a vista (fit) (P1) 🎯 MVP

**Goal**: Button fits all currently visible tokens into the usable canvas

**Independent Test**: [quickstart.md](./quickstart.md) §1–5

### Implementation

- [X] T005 [US1] In `frontend/src/components/relacoes/GraphStage.tsx`, extract or reuse usable-viewport measurement (same rules as `measureUsableCenter` — stage minus `.map-panel` overlap) so fit can read `{ width, height, center }` at click time
- [X] T006 [US1] Replace `resetView` with `fitView` (or rewrite body): collect `personagens.filter(p => isVisible(p.id))` with `positions`; if empty → no-op; else bbox + helper from T003; `setScale`/`setPan` (FR-001–004)
- [X] T007 [US1] Wire the control button `onClick` to `fitView`; replace hardcoded `1:1` with `t('graph.fitView')` and `aria-label={t('graph.fitViewAria')}` in `frontend/src/components/relacoes/GraphStage.tsx`
- [X] T008 [US1] Confirm zoom ± / pan / pinch handlers unchanged; fit MUST NOT call `onSelect`/`onDeselect`

**Checkpoint**: Large graph fits after pan/zoom; small graph does not zoom in past 1; filters respected; 0/1 token safe

---

## Phase 4: Polish & Cross-Cutting

**Purpose**: Gates and docs

- [X] T009 Run [quickstart.md](./quickstart.md) §1–5 (fit after pan, small graph, filters, 0/1 token, i18n)
- [X] T010 [P] Run `npx tsc -p tsconfig.app.json --noEmit` in `frontend/` until clean
- [X] T011 [P] Grep sanity from quickstart §6 (`fitView` / no label `1:1`; locale keys present)
- [X] T012 [P] Note feature in `CHANGELOG.md` (Unreleased) — Relações: view control fits visible tokens (ex-“1:1”); i18n «Ajustar»/«Fit»

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 (3)** → **Polish (4)**
- T003 before T006; T004 before T007; T005 before or with T006

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| **US1** | Phase 2 | Only story; is the MVP |

### Parallel Opportunities

```text
T001 || T002
T003 || T004
T010 || T011 || T012
```

---

## Implementation Strategy

### MVP

1. Pure fit helper + i18n (T003–T004)
2. Usable rect + replace `resetView` + button label (T005–T007)
3. Quickstart + tsc + CHANGELOG

### Incremental Delivery

1. Math without UI  
2. Button behaviour + copy  
3. Edge cases (0/1 token, panel overlap) in QA  

---

## Format Validation

- All tasks use `- [ ]`, sequential `T00N`, file paths, and `[US1]` on story phase only.
- No automated test tasks (UI polish MAY).
- Spec 138 spacing / 135–136 hover out of scope.
