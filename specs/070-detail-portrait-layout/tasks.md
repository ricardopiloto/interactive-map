# Tasks: Detail Portrait Layout

**Input**: Design documents from `/specs/070-detail-portrait-layout/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual visual QA via `quickstart.md` — no automated TDD suite requested.

**Organization**: US1 = retrato estável com descrição longa; US2 = descrição curta sem regressão.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: US1 / US2
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock contract and current ficha CSS

- [x] T001 Skim `specs/070-detail-portrait-layout/contracts/ui-detail-portrait-layout.md` and `research.md` (flex-shrink; contain ≤220px; Relações only)
- [x] T002 [P] Confirm `.relacoes-detail` is a flex column with `overflow-y: auto` and `.relacoes-detail__portrait` has no `flex-shrink: 0` in `frontend/src/components/relacoes/RelacoesDetailPanel.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Stop the portrait slot from shrinking when the sheet overflows

**⚠️ CRITICAL**: US1–US2 assume the slot no longer yields height

- [x] T003 Set `flex-shrink: 0`, `overflow: hidden`, and keep `width: 100%` / `max-height: 220px` on `.relacoes-detail__portrait.image-slot` in `frontend/src/components/relacoes/RelacoesDetailPanel.css` (do not change map `SideMenu`)

**Checkpoint**: Long text can scroll the panel; portrait box is no longer compressed

---

## Phase 3: User Story 1 — Retrato intacto com descrição longa (Priority: P1) 🎯 MVP

**Goal**: With a long description, the ficha portrait (or placeholder) stays full/`contain`, not flattened; the sheet scrolls; long tokens wrap inside 300px

**Independent Test**: Quickstart scenarios 1, 2, 4 (`specs/070-detail-portrait-layout/quickstart.md`)

### Implementation for User Story 1

- [x] T004 [US1] Size `.relacoes-detail__portrait.image-slot img` like 057: `width: 100%`, `height: auto`, `max-height: 220px`, `object-fit: contain`, `display: block` in `frontend/src/components/relacoes/RelacoesDetailPanel.css` (override `.image-slot img { height: 100% }`)
- [x] T005 [US1] Add `overflow-wrap: anywhere` and `min-width: 0` on `.relacoes-detail__desc` (and `min-width: 0` on `.relacoes-detail` if needed) in `frontend/src/components/relacoes/RelacoesDetailPanel.css`
- [x] T006 [US1] Smoke quickstart scenarios 1, 2, and 4 from `specs/070-detail-portrait-layout/quickstart.md`

**Checkpoint**: MVP — long lore no longer breaks the image area

---

## Phase 4: User Story 2 — Descrição curta não muda (Priority: P2)

**Goal**: Short/empty description fichas look as today: no extra scrollbar, portrait not smaller

**Independent Test**: Quickstart scenario 3

### Implementation for User Story 2

- [x] T007 [US2] Confirm kicker/name/tags still sit above the portrait without a large empty min-height on the slot in `frontend/src/components/relacoes/RelacoesDetailPanel.css`; tweak only if short-copy layout regresses
- [x] T008 [US2] Smoke quickstart scenario 3 from `specs/070-detail-portrait-layout/quickstart.md`

**Checkpoint**: Short copy unchanged; long copy still fixed

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Changelog, version, spec status

- [x] T009 [P] Add CHANGELOG note for the Relações ficha portrait layout in `CHANGELOG.md`
- [x] T010 [P] Bump patch version (0.8.4) in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T011 Mark feature status Implemented in `specs/070-detail-portrait-layout/spec.md` if acceptance matches

---

## Dependencies & Execution Order

```text
Setup → Foundational (T003 flex-shrink: 0) → US1 (img contain + wrap) → US2 (short-copy smoke) → Polish
```

US2 is a regression check on the same CSS as US1.

### Parallel opportunities

- T001 ∥ T002
- T004 and T005 are the same file — sequential
- T009 ∥ T010 after visual pass

### Independent tests (summary)

| Story | Independent test |
|-------|------------------|
| US1 | Long description: portrait intact; sheet scrolls; wide token wraps |
| US2 | Short description: no extra scroll; portrait size unchanged |

### MVP scope

**T003 + US1** (stop shrink + contain img + word wrap).

## Implementation Strategy

1. `flex-shrink: 0` on the portrait slot
2. Intrinsic `contain` img ≤ 220px; wrap description
3. Smoke short copy
4. Changelog / version / Implemented

## Format validation

All tasks use `- [ ]`, sequential `T00N` IDs, optional `[P]`, story labels only on US phases, and concrete file paths.
