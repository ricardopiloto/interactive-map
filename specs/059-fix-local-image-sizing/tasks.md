# Tasks: Apply Portrait Sizing Policy to Locals

**Input**: Design documents from `/specs/059-fix-local-image-sizing/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual visual QA via quickstart — no automated TDD suite requested.

**Organization**: US1 = pin modal full Local image; US2 = Local form edit image; US3 = NPC consistency + no regressions.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock contract and confirm both broken Local image call sites

- [x] T001 Skim `specs/059-fix-local-image-sizing/contracts/ui-local-image-sizing.md` and `research.md` (shrink-to-fit + 50vh; `pin-modal__image` / `local-form__image`; empty min-height on form)
- [x] T002 [P] Confirm `ImageSlot` uses `height: 150` in `frontend/src/components/common/PinModal.tsx` and `frontend/src/components/admin/LocalFormDialog.tsx`; note NPC rules live in `frontend/src/styles/nocturne.css` (`.npc-form__portrait`) and `frontend/src/components/sidebar/SideMenu.css` (`.side-menu__npc-portrait`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Class + fit hooks on both Local surfaces before CSS stories

**⚠️ CRITICAL**: Complete before visual story checks

- [x] T003 On the pin modal Local `ImageSlot`, add `className="pin-modal__image"`, `fit="contain"`, remove fixed `height: 150` inline style; keep read-only (no `editable`) in `frontend/src/components/common/PinModal.tsx`
- [x] T004 [P] On the Local form `ImageSlot`, add `className={`local-form__image${draft.imagem_url ? '' : ' local-form__image--empty'}`}`, `fit="contain"`, keep `editable` + `category="locals"` + `onUploaded`; remove fixed `height: 150` inline style in `frontend/src/components/admin/LocalFormDialog.tsx`

**Checkpoint**: Markup ready on both surfaces; form upload props preserved

---

## Phase 3: User Story 1 — Imagem completa no pin modal (Priority: P1) 🎯 MVP

**Goal**: Pin modal shows full Local image; box follows aspect ratio; capped at 50vh

**Independent Test**: Quickstart A (+ C for pin modal)

### Implementation for User Story 1

- [x] T005 [US1] Add `.pin-modal__image` rules (width 100%, height auto, max-height 50vh, max-width 100%; img height auto / max-height 50vh / object-fit contain) in `frontend/src/components/common/PinModal.css`, overriding ImageSlot cover/`height: 100%` (FR-001 / FR-003 / FR-004)
- [x] T006 [US1] Ensure pin modal without image has no broken giant empty box (no forced tall min-height when empty) in `frontend/src/components/common/PinModal.tsx` / `PinModal.css` (FR-007)
- [x] T007 [US1] Smoke quickstart A (and pin-modal half of C) from `specs/059-fix-local-image-sizing/quickstart.md`

**Checkpoint**: MVP — pin modal Local image no longer a cropped ~150px strip

---

## Phase 4: User Story 2 — Imagem completa no formulário Local (Priority: P1)

**Goal**: Create/edit Local dialog shows full image; shrink-to-fit + 50vh; upload works; dialog usable

**Independent Test**: Quickstart B + D + E (form)

### Implementation for User Story 2

- [x] T008 [US2] Add `.local-form__image` rules (width 100%, height auto, max-height 50vh, max-width 100%; img contain) next to `.npc-form__portrait` in `frontend/src/styles/nocturne.css` (FR-002 / FR-003 / FR-004 / FR-005)
- [x] T009 [US2] Style empty placeholder min-height (~110–150px) via `.local-form__image--empty` so drop zone stays obvious in `frontend/src/styles/nocturne.css` (FR-007)
- [x] T010 [US2] Confirm dialog body still scrolls and Guardar/Cancelar remain reachable with tall Local image (`.dialog` / `.dialog__body` + form) in `frontend/src/styles/nocturne.css` / `LocalFormDialog.tsx` (FR-005)
- [x] T011 [US2] Verify `editable` / `onUploaded` still works after class change in `frontend/src/components/admin/LocalFormDialog.tsx` (FR-006); run quickstart B + D + E (form)

**Checkpoint**: Form Local image matches 058 policy; upload OK

---

## Phase 5: User Story 3 — Consistência NPC + sem regressões (Priority: P2)

**Goal**: 057/058 NPC portraits unchanged; map/digitizer untouched; narrow viewport OK

**Independent Test**: Quickstart F (+ C for both surfaces)

### Implementation for User Story 3

- [x] T012 [US3] Spot-check `frontend/src/components/sidebar/SideMenu.css` `.side-menu__npc-portrait` and `frontend/src/styles/nocturne.css` `.npc-form__portrait` untouched; run quickstart F (FR-008 / SC-004)
- [x] T013 [US3] Confirm campaign map `ImageSlot` in `frontend/src/components/map/CampaignMap.tsx` and digitizer unchanged (FR-008)
- [x] T014 [US3] Run quickstart C on ~375px for pin modal + Local form — no page horizontal scroll (SC-003)

**Checkpoint**: NPC + map OK; mobile safe

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Changelog, version, full quickstart

- [x] T015 [P] Add CHANGELOG entry under next patch (fold into **[0.6.9]** if that release is still open, else next patch) in `CHANGELOG.md` for Local image sizing (pin modal + edit form)
- [x] T016 [P] Bump version to match CHANGELOG only if a new version line is needed in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`
- [x] T017 Run full `specs/059-fix-local-image-sizing/quickstart.md` A–F

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003–T004) → **US1** (T005–T007) and/or **US2** (T008–T011) → **US3** (T012–T014) → **Polish** (T015–T017)

### User Story Dependencies

- **US1 (P1)**: Pin modal sizing — MVP
- **US2 (P1)**: Independent of US1 after foundational (different files) — form sizing
- **US3 (P2)**: After US1 + US2 CSS land — regression + mobile

### Parallel Opportunities

- T001 ∥ T002
- T003 ∥ T004 (different files)
- After foundational: US1 (PinModal.css) ∥ US2 (nocturne.css / LocalFormDialog) on different files
- T015 ∥ T016
- Prefer sequential edits within the same CSS file

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + Foundational (both markups)  
2. US1 pin modal CSS  
3. **STOP and VALIDATE** quickstart A  
4. Then US2 form + US3  

### Suggested MVP scope

**US1** (T001–T007). Ship **US2 in the same PR** (same policy, same audit finding).

---

## Notes

- Do not reuse `.side-menu__npc-portrait` / `.npc-form__portrait` on Locals — use `pin-modal__image` / `local-form__image`
- Do not change NPC 057/058 rules
- Mirror 058 sizing policy exactly for filled Local images
- Side menu Locais list has no large image — leave alone
