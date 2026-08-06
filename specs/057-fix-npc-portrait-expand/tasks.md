# Tasks: Fix NPC Portrait Expand Sizing

**Input**: Design documents from `/specs/057-fix-npc-portrait-expand/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual visual QA via quickstart — no automated TDD suite requested.

**Organization**: US1 = shrink-to-fit full portrait; US2 = 50vh cap + no screen break; US3 = collapsed thumbnail regression.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock UI contract and current broken markup

- [x] T001 Skim `specs/057-fix-npc-portrait-expand/contracts/ui-npc-portrait-expand.md` and `research.md` (shrink-to-fit + `50vh`; SideMenu-scoped overrides)
- [x] T002 [P] Confirm expanded portrait uses fixed `height: 110` + default cover in `frontend/src/components/sidebar/SideMenu.tsx` and ImageSlot img rules in `frontend/src/components/media/ImageSlot.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Portrait class hook before story CSS polish

**⚠️ CRITICAL**: Complete before visual story checks

- [x] T003 Add `className` (e.g. `side-menu__npc-portrait`) on the **expanded** `ImageSlot` only; set `fit="contain"`; remove fixed `height: 110` inline style in `frontend/src/components/sidebar/SideMenu.tsx` (keep `width: '100%'` or move width to CSS)
- [x] T004 Confirm collapsed header `ImageSlot` still uses `shape="circle"` and ~40×40 inline styles unchanged in `frontend/src/components/sidebar/SideMenu.tsx` (FR-005)

**Checkpoint**: Markup ready for CSS; thumbnail markup untouched

---

## Phase 3: User Story 1 — Retrato completo ao expandir (Priority: P1) 🎯 MVP

**Goal**: Expanded portrait box follows image aspect (no broken fixed crop)

**Independent Test**: Quickstart A; expand NPC with portrait — full image, box height tracks image

### Implementation for User Story 1

- [x] T005 [US1] Style `.side-menu__npc-portrait` for shrink-to-fit: width 100%, height auto, image `height: auto` / `object-fit: contain`, overriding ImageSlot’s `height: 100%` + cover under this class in `frontend/src/components/sidebar/SideMenu.css` (FR-001 / FR-001a; research §2–3)
- [x] T006 [US1] Ensure no portrait block when `retrato_url` is missing (existing conditional) remains in `frontend/src/components/sidebar/SideMenu.tsx` (FR-006)
- [x] T007 [US1] Smoke quickstart A from `specs/057-fix-npc-portrait-expand/quickstart.md`

**Checkpoint**: MVP — portrait no longer looks “partido” in a fixed strip

---

## Phase 4: User Story 2 — Não partir o ecrã (Priority: P1)

**Goal**: `max-height: 50vh`; no horizontal page scroll; card still usable

**Independent Test**: Quickstart B (desktop + ~375px)

### Implementation for User Story 2

- [x] T008 [US2] Add `max-height: 50vh` on portrait container and `img` under `.side-menu__npc-portrait` in `frontend/src/components/sidebar/SideMenu.css` (FR-003; clarify Q2)
- [x] T009 [US2] Verify width constraints (`max-width: 100%`, no overflow) so page does not gain horizontal scroll in `frontend/src/components/sidebar/SideMenu.css` (FR-002 / SC-002)
- [x] T010 [US2] Confirm description/facção/locais remain reachable below portrait after expand in `frontend/src/components/sidebar/SideMenu.tsx` layout (FR-004)
- [x] T011 [US2] Run quickstart B from `specs/057-fix-npc-portrait-expand/quickstart.md`

**Checkpoint**: Tall portraits capped; screen usable

---

## Phase 5: User Story 3 — Miniatura colapsada intacta (Priority: P2)

**Goal**: List thumbnails stay compact; expanded styles do not leak

**Independent Test**: Quickstart C

### Implementation for User Story 3

- [x] T012 [US3] Spot-check CSS specificity: `.side-menu__npc-portrait` rules MUST NOT apply to header circle thumbnails in `frontend/src/components/sidebar/SideMenu.css` + `SideMenu.tsx` (FR-005)
- [x] T013 [US3] Run quickstart C (+ D no-portrait) from `specs/057-fix-npc-portrait-expand/quickstart.md`

**Checkpoint**: Collapsed list density unchanged

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Changelog, version, full quickstart

- [x] T014 [P] Add CHANGELOG entry under next patch (likely **[0.6.12]**) in `CHANGELOG.md` for fix do retrato expandido de NPC
- [x] T015 [P] Bump version to match CHANGELOG in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`
- [x] T016 Confirm no edits to map/routes/`ImageSlot` global defaults beyond necessary overrides; run full `specs/057-fix-npc-portrait-expand/quickstart.md` A–D (FR-007)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003–T004) → **US1** (T005–T007) → **US2** (T008–T011) → **US3** (T012–T013) → **Polish** (T014–T016)
- US2 extends US1 CSS with max-height
- US3 is regression after US1/US2 styles land

### User Story Dependencies

- **US1 (P1)**: Shrink-to-fit — MVP
- **US2 (P1)**: Depends on US1 portrait class; adds 50vh + overflow safety
- **US3 (P2)**: Depends on final CSS; verifies thumbnail isolation

### Parallel Opportunities

- T001 ∥ T002
- T014 ∥ T015 (docs/versions)
- Prefer sequential edits on `SideMenu.tsx` / `SideMenu.css`

---

## Parallel Example: Polish

```bash
Task: "CHANGELOG 0.6.12 entry"
Task: "Bump package/README/pyproject versions"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + Foundational (class + remove height 110)  
2. US1 CSS shrink-to-fit  
3. **STOP and VALIDATE** quickstart A  
4. Then US2 (50vh) and US3 regression  

### Suggested MVP scope

**US1** (T001–T007). Ship **US2 in the same PR** (max-height is required by the “não partir o ecrã” constraint).

---

## Notes

- Prefer SideMenu-scoped overrides over changing global `ImageSlot` defaults
- Do not introduce lightbox
- Canonical class name: `side-menu__npc-portrait` (or equivalent documented in PR)
