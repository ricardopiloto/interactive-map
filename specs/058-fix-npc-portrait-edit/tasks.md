# Tasks: Fix NPC Portrait in Edit Mode

**Input**: Design documents from `/specs/058-fix-npc-portrait-edit/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual visual QA via quickstart — no automated TDD suite requested.

**Organization**: US1 = full portrait in edit dialog; US2 = 50vh + dialog usable; US3 = upload + 057 regression.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock contract and current broken dialog markup

- [x] T001 Skim `specs/058-fix-npc-portrait-edit/contracts/ui-npc-portrait-edit.md` and `research.md` (shrink-to-fit + 50vh; `npc-form__portrait`; empty min-height)
- [x] T002 [P] Confirm `NpcFormDialog` ImageSlot uses `height: 110` in `frontend/src/components/admin/NpcAdminList.tsx`; note dialog styles live in `frontend/src/styles/nocturne.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Class + fit hook before CSS stories

**⚠️ CRITICAL**: Complete before visual story checks

- [x] T003 On the NPC form portrait `ImageSlot`, add `className="npc-form__portrait"`, `fit="contain"`, keep `editable` + `category="portraits"`; remove fixed `height: 110` inline style in `frontend/src/components/admin/NpcAdminList.tsx`
- [x] T004 [P] Optionally add empty-state class (e.g. `npc-form__portrait--empty` when `!retrato_url`) for min-height drop target in `frontend/src/components/admin/NpcAdminList.tsx` (research §2)

**Checkpoint**: Markup ready; upload props preserved

---

## Phase 3: User Story 1 — Retrato completo no diálogo (Priority: P1) 🎯 MVP

**Goal**: Edit dialog shows full portrait; box follows aspect ratio

**Independent Test**: Quickstart A

### Implementation for User Story 1

- [x] T005 [US1] Add `.npc-form__portrait` rules (width 100%, height auto, img height auto / object-fit contain) near dialog styles in `frontend/src/styles/nocturne.css`, overriding ImageSlot cover/`height: 100%` (FR-001 / FR-002)
- [x] T006 [US1] Style empty placeholder min-height (~110–140px) via `--empty` class or `:not(:has(img))` so drop zone stays obvious in `frontend/src/styles/nocturne.css` (FR-007)
- [x] T007 [US1] Smoke quickstart A from `specs/058-fix-npc-portrait-edit/quickstart.md`

**Checkpoint**: MVP — dialog portrait no longer a cropped strip

---

## Phase 4: User Story 2 — Diálogo / ecrã seguros (Priority: P1)

**Goal**: max-height 50vh; no horizontal page scroll; fields reachable

**Independent Test**: Quickstart B

### Implementation for User Story 2

- [x] T008 [US2] Add `max-height: 50vh` on `.npc-form__portrait` and its `img` in `frontend/src/styles/nocturne.css` (FR-003)
- [x] T009 [US2] Ensure `max-width: 100%` / no overflow so page has no horizontal scroll in `frontend/src/styles/nocturne.css` (FR-004 / SC-003)
- [x] T010 [US2] Confirm dialog body still scrolls and Guardar/Cancelar remain reachable with tall portrait (`frontend/src/styles/nocturne.css` `.dialog` / `.dialog__body` + form layout) (FR-005)
- [x] T011 [US2] Run quickstart B from `specs/058-fix-npc-portrait-edit/quickstart.md`

**Checkpoint**: Tall portraits capped; modal usable

---

## Phase 5: User Story 3 — Upload + sem regressão 057 (Priority: P2)

**Goal**: Upload still works; side-menu expand (057) unchanged; LocalForm untouched

**Independent Test**: Quickstart C + D + E

### Implementation for User Story 3

- [x] T012 [US3] Verify `editable` / `onUploaded` path still works after class change in `frontend/src/components/admin/NpcAdminList.tsx` (FR-006); run quickstart C
- [x] T013 [US3] Spot-check `frontend/src/components/sidebar/SideMenu.css` `.side-menu__npc-portrait` untouched; run quickstart D (FR-008)
- [x] T014 [US3] Confirm `frontend/src/components/admin/LocalFormDialog.tsx` unchanged; run quickstart E (empty placeholder)

**Checkpoint**: Upload + 057 OK; Locals deferred

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Changelog, version, full quickstart

- [x] T015 [P] Add CHANGELOG entry under next patch (likely **[0.6.13]**) in `CHANGELOG.md` for retrato no diálogo de edição de NPC
- [x] T016 [P] Bump version to match CHANGELOG in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`
- [x] T017 Run full `specs/058-fix-npc-portrait-edit/quickstart.md` A–E

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003–T004) → **US1** (T005–T007) → **US2** (T008–T011) → **US3** (T012–T014) → **Polish** (T015–T017)

### User Story Dependencies

- **US1 (P1)**: Shrink-to-fit in dialog — MVP
- **US2 (P1)**: Depends on US1 class; adds 50vh + overflow safety
- **US3 (P2)**: Upload + regression after CSS lands

### Parallel Opportunities

- T001 ∥ T002
- T015 ∥ T016
- Prefer sequential edits on `NpcAdminList.tsx` / `nocturne.css`

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + Foundational  
2. US1 CSS shrink-to-fit  
3. **STOP and VALIDATE** quickstart A  
4. Then US2 (50vh) + US3  

### Suggested MVP scope

**US1** (T001–T007). Include **US2 in the same PR** (dialog must not break the screen).

---

## Notes

- Do not reuse `.side-menu__npc-portrait` in the dialog — use `npc-form__portrait`
- Do not edit LocalFormDialog in this feature
- Mirror 057 sizing policy exactly for filled portraits
