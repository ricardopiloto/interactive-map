# Tasks: Paridade de clique no filtro do painel de detalhe (Relações)

**Input**: Design documents from `/specs/134-paridade-clique-filtro-detalhe/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/tipo-chip-click.md](./contracts/tipo-chip-click.md), [quickstart.md](./quickstart.md)

**Depends on**: Spec **133** (filtro local `activeDetailTipos` + `key={personagem.id}` no detalhe).

**Tests**: OPTIONAL (UI polish — Constitution II MAY). Validation via [quickstart.md](./quickstart.md) + `tsc`. No pytest/API.

**Organization**: Uma user story P1 (US1). Paths are repo-relative.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete deps)
- **[Story]**: [US1]
- Setup / Foundational / Polish: no story label

---

## Phase 1: Setup

**Purpose**: Align with existing graph chip interaction and detail filter

- [X] T001 Skim `frontend/src/pages/RelacoesPage.tsx` — graph handlers (`CHIP_CLICK_DELAY_MS`, `handleChipClick`, `handleChipDoubleClick`, `soloOrRestoreTipo`, `pendingChipClick`) and `PersonagemDetailBody` chips (`toggleDetailTipo`, `onClick` only)
- [X] T002 [P] Skim [contracts/tipo-chip-click.md](./contracts/tipo-chip-click.md) and [research.md](./research.md) (shared helper; optional `onSingleClickSideEffect`; cleanup on unmount; keep per-filter toggle semantics)

---

## Phase 2: Foundational — shared click mechanics — BLOCKS US1

**Purpose**: One delay + solo/restore implementation used by both filters

**⚠️ CRITICAL**: Extract before wiring the detail panel, so the two filters cannot drift

- [X] T003 Create shared hook/helper (prefer `frontend/src/components/relacoes/useVinculoTipoChipClicks.ts`, or colocated export if keeping in-page) that:
  - Uses a single `CHIP_CLICK_DELAY_MS = 280`
  - Accepts `setTipos` (or toggle/solo callbacks) for the target `Set<VinculoTipo>`
  - Returns `onClick(tipo)` / `onDoubleClick(e, tipo)` per [contracts/tipo-chip-click.md](./contracts/tipo-chip-click.md)
  - Supports optional `onSingleClickSideEffect?` (graph expands panel)
  - Clears pending `setTimeout` on unmount (`useEffect` cleanup) — FR-004
  - Implements solo/restore: single active tipo → all `VINCULO_TIPOS`; else → `{tipo}`
- [X] T004 Refactor graph filter chips in `frontend/src/pages/RelacoesPage.tsx` to use the shared helper (replace inline `handleChipClick` / `handleChipDoubleClick` / `pendingChipClick`); pass `onSingleClickSideEffect` → `setExpanded(true)`; keep existing `toggleTipo` empty-set semantics

**Checkpoint**: Graph filter behaviour unchanged; helper is the sole delay/dblclick source for the graph

---

## Phase 3: User Story 1 — Clique único e duplo-clique iguais nos dois filtros (P1) 🎯 MVP

**Goal**: Detail panel type chips use the same delay + isolate/restore as the graph filter

**Independent Test**: [quickstart.md](./quickstart.md) §2–5; compare side-by-side with graph chips

### Implementation

- [X] T005 [US1] In `PersonagemDetailBody` (`frontend/src/pages/RelacoesPage.tsx`), wire type chips to the shared helper targeting `setActiveDetailTipos` — **no** expand side-effect; keep `toggleDetailTipo` empty→all restore if still desired (research Decisão 4)
- [X] T006 [US1] Ensure detail chips have `onDoubleClick` (and delayed single click) — remove direct `onClick={() => toggleDetailTipo(...)}` without delay
- [X] T007 [US1] Confirm `key={personagem.id}` on `PersonagemDetailBody` call site still present so remount + helper cleanup cancels pending click on person change (FR-004 / SC-003)

**Checkpoint**: Detail and graph chip interaction feel identical; Sets remain independent

---

## Phase 4: Polish & Cross-Cutting

**Purpose**: Gates and docs

- [X] T008 Run [quickstart.md](./quickstart.md) §1–6 (baseline graph, detail delay, solo/restore, dbl cancels single, person switch, independence regressão 133)
- [X] T009 [P] Run `npx tsc -p tsconfig.app.json --noEmit` in `frontend/` until clean
- [X] T010 [P] Grep sanity from quickstart §7 (`CHIP_CLICK_DELAY_MS` / `onDoubleClick`; no instant `toggleDetailTipo` onClick)
- [X] T011 [P] Note feature in `CHANGELOG.md` (Unreleased) — detail filter chip click parity with graph (delay + double-click isolate)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 (3)** → **Polish (4)**
- T003 before T004 and T005
- T004 and T005 can be sequential (same file `RelacoesPage.tsx`) — do T004 then T005 to avoid merge conflicts in one edit session

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| **US1** | Phase 2 | Only story; is the MVP |

### Parallel Opportunities

```text
T001 || T002
T009 || T010 || T011   # after implementation
```

---

## Implementation Strategy

### MVP

1. Shared helper (T003) + graph refactor (T004)
2. Detail wiring (T005–T007)
3. Quickstart + tsc + CHANGELOG

### Incremental Delivery

1. Extract mechanics without UX change on graph  
2. Apply to detail panel  
3. Validate parity + FR-004  

---

## Format Validation

- All tasks use `- [ ]`, sequential `T00N`, file paths, and `[US1]` on story phase only.
- No automated test tasks (UI polish MAY).
