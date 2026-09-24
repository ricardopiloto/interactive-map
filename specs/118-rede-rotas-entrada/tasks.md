# Tasks: Rede de rotas — entrada em Rota e casca visual

**Input**: Design documents from `/specs/118-rede-rotas-entrada/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/entry-relocation.md](./contracts/entry-relocation.md), [contracts/digitizer-shell.md](./contracts/digitizer-shell.md), [quickstart.md](./quickstart.md)

**Depends on**: Spec **115** zoom chrome already on branch (reuse). Specs **114–116** MUST NOT be reopened.

**Tests**: OPTIONAL (UI polish — Constitution II MAY). Validation via [quickstart.md](./quickstart.md) + `tsc`. No pytest/API.

**Organization**: Por user story (US1–US2). Paths are repo-relative.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete deps)
- **[Story]**: [US1]…[US2]
- Setup / Foundational / Polish: no story label

---

## Phase 1: Setup

**Purpose**: Confirm call sites and visual references before edits

- [X] T001 Confirm MapPage GM menu still has «Rede de rotas» plus other items; note `RouteDigitizerView` mount/props in `frontend/src/pages/MapPage.tsx` for reuse on Rota
- [X] T002 [P] Skim visual SoT `frontend-next/src/pages/RotaPage.tsx` + `RotaPage.css` (digitizer button) and `frontend-next/src/components/route/RouteDigitizer.tsx` (+ `.css`) for zoom/chips/list/scale chrome

---

## Phase 2: Foundational

**Purpose**: No shared infra beyond kit/tokens already shipped — light prep only

**⚠️ CRITICAL**: Do not start US2 shell work until US1 entry move is wired (or keep US2 CSS-only parallel on digitizer files while Map/Rota entry lands)

- [X] T003 Confirm `mapPage.routeNetwork` exists in `frontend/src/locales/pt-BR/mapa.json` and `frontend/src/locales/en/mapa.json` (reuse for Rota button; no new key unless missing)
- [X] T004 [P] Note CampaignMap zoom CSS pattern in `frontend/src/components/map/CampaignMap.css` (`.campaign-map__controls` / `--radius-full` / `--shadow-md`) to mirror in digitizer shell

**Checkpoint**: i18n key + zoom pattern identified; ready for US1

---

## Phase 3: User Story 1 — Entrada «Rede de rotas» na página Rota (P1) 🎯 MVP

**Goal**: GM opens digitizer from Rota; Map GM menu no longer offers Rede de rotas; menu keeps other actions

**Independent Test**: [quickstart.md](./quickstart.md) §1; [contracts/entry-relocation.md](./contracts/entry-relocation.md)

### Implementation

- [X] T005 [US1] Add `digitizerOpen` state, GM-only «Rede de rotas» button (`t('mapPage.routeNetwork')`), and `RouteDigitizerView` fullscreen mount (same props pattern as former MapPage) in `frontend/src/pages/RotaPage.tsx`
- [X] T006 [US1] Add `.rota-page__digitizer-btn` (absolute top-right on stage, elevated + `--shadow-md`) in `frontend/src/pages/RotaPage.css` per prototype placement
- [X] T007 [US1] Ensure Rota refreshes campaign/waypoints after digitizer close/`onCampaignChanged` in `frontend/src/pages/RotaPage.tsx` (parity with MapPage refresh behavior)
- [X] T008 [US1] Remove Rede de rotas menuitem from `map-page__gm-menu` in `frontend/src/pages/MapPage.tsx`; keep remaining GM menu items and menu chrome
- [X] T009 [US1] Remove `routeDigitizerOpen` state, `RouteDigitizerView` mount, import, and digitizer-only effects from `frontend/src/pages/MapPage.tsx`; grep-clean per entry-relocation contract

**Checkpoint**: Rota opens digitizer; Map menu does not; non-GM sees no button

---

## Phase 4: User Story 2 — Casca visual alinhada ao protótipo (P1)

**Goal**: Digitizer look matches prototype + Map zoom language; digitization behavior unchanged

**Independent Test**: [quickstart.md](./quickstart.md) §2–3; [contracts/digitizer-shell.md](./contracts/digitizer-shell.md)

### Implementation

- [X] T010 [US2] Restyle `DigControls` to circular/`IconButton` zoom chrome (tokens `--radius-full`, `--shadow-md`, translucent elevated) in `frontend/src/components/gm/RouteDigitizerView.tsx` + `frontend/src/components/gm/RouteDigitizer.css` — **no** change to zoomIn/Out/reset handlers
- [X] T011 [US2] Swap «Novo nó» / «Traçar segmento» to interactive `Chip` with active/`aria-pressed` in `frontend/src/components/gm/RouteDigitizerView.tsx` — **same** mode/draft handlers
- [X] T012 [US2] Migrate digitizer chrome radii/shadows (controls, list column/sheet, toolbars; not intentional waypoint `50%` markers) to `--radius-full` / `--shadow-md` / MapSidePanel-like surfaces in `frontend/src/components/gm/RouteDigitizer.css`
- [X] T013 [P] [US2] If needed for row/search chrome only (no logic), adjust classes in `frontend/src/components/gm/DigitizerListPanel.tsx` to match MapSidePanel/list row pattern
- [X] T014 [US2] Tokenize scale field chrome only in `frontend/src/components/gm/RouteDigitizer.css` / view markup as needed — **keep** `saveScale` and validation behavior

**Checkpoint**: Capture matches prototype a olho nu; intermediate-point flow still works

---

## Phase 5: Polish & Cross-Cutting

**Purpose**: Gates and docs

- [X] T015 Run [quickstart.md](./quickstart.md) §1–3 (entry + shell + regression with intermediate point)
- [X] T016 [P] Run `npx tsc -p tsconfig.app.json --noEmit` in `frontend/` until clean
- [X] T017 [P] Grep sanity from quickstart §5 (`MapPage` no digitizer open path; `RotaPage` wires view + label)
- [X] T018 [P] Note feature in `CHANGELOG.md` (Unreleased) — Rede de rotas entry on Rota + digitizer shell tokens

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 (3)** → **US2 (4)** (US2 can start CSS on digitizer files in parallel with late US1 if Map/Rota not touching those files) → **Polish (5)**

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| **US1** | Phase 2 | Entry move MVP |
| **US2** | Phase 2; ideally after digitizer still reachable via US1 | Shell only |

### Parallel Opportunities

```text
T001 || T002
T003 || T004
T012 || T013
T016 || T017 || T018
```

### Parallel Example: US2 shell

```bash
# After DigControls + Chip swaps (T010–T011):
# Agent A — RouteDigitizer.css tokens (T012, T014)
# Agent B — DigitizerListPanel class hooks (T013) if needed
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup + Foundational (T001–T004)
2. Wire Rota button + remove Map entry (T005–T009)
3. **STOP** — validate quickstart §1
4. Then US2 shell (T010–T014) → Polish

### Incremental Delivery

1. Entry on Rota / gone from Map  
2. Zoom + chips  
3. List/scale chrome tokens  
4. CHANGELOG + tsc + captures  

---

## Format Validation

- All tasks use `- [ ]`, sequential `T00N`, file paths, and `[USn]` on story phases only.
- No automated test tasks (UI polish MAY).
