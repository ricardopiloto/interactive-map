# Tasks: Mobile Left Offset for Nodes and Locals

**Input**: Design documents from `/specs/047-mobile-left-offset/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) nudge ~8px à esquerda nos pins do mapa da campanha em mobile; US2 (P2) toggle celular↔desktop via layout existente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e estado actual do mapa móvel

- [X] T001 Skim `specs/047-mobile-left-offset/contracts/ui-mobile-left-offset.md`, `research.md`, and `data-model.md` (8px screen-left, `map-page--mobile`, digitizer/grupo out)
- [X] T002 [P] Confirm `MOBILE_BP` / `map-page--mobile` wiring in `frontend/src/pages/MapPage.tsx` and `frontend/src/pages/MapPage.css`
- [X] T003 [P] Confirm `.campaign-map__pin` transform variants (default/selected/hovered) and `--map-zoom` in `frontend/src/components/map/CampaignMap.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Âmbito e selector CSS alinhados ao research

**⚠️ CRITICAL**: Completar antes das user stories

- [X] T004 Confirm campaign map has no waypoint node discs today; note digitizer `__wp` is out of scope in `frontend/src/components/map/CampaignMap.tsx` vs `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-002/008)
- [X] T005 Choose CSS approach: `.map-page--mobile .campaign-map__pin` + `translateX(calc(-8px / var(--map-zoom, 1)))` (optional `--mobile-marker-nudge-x`) documented for implement in `frontend/src/components/map/CampaignMap.css` (research §1–2)

**Checkpoint**: Selector + formula locked; no backend work

---

## Phase 3: User Story 1 — Marcadores alinhados no telemóvel (Priority: P1) 🎯 MVP

**Goal**: Em modo celular, pins de locais no mapa da campanha ~6–10px (alvo 8px) à esquerda; digitizer/grupo/rotas intactos

**Independent Test**: Viewport &lt; 800px no mapa da campanha → pins visivelmente mais à esquerda vs desktop; digitizer inalterado

### Implementation for User Story 1

- [X] T006 [US1] Add mobile left nudge to default `.campaign-map__pin` transform under `.map-page--mobile` in `frontend/src/components/map/CampaignMap.css` (FR-001, research §2)
- [X] T007 [US1] Apply the same nudge translate to `.campaign-map__pin--selected` and `.campaign-map__pin--hovered` transforms under `.map-page--mobile` in `frontend/src/components/map/CampaignMap.css` (FR-001; no drop on state)
- [X] T008 [US1] Ensure `.campaign-map__party` and travel/connection SVG rules are untouched in `frontend/src/components/map/CampaignMap.css` (FR-005/006)
- [X] T009 [US1] Spot-check mobile pin nudge (~8 screen px) + tip still usable to tap in browser DevTools (&lt;800px) against `specs/047-mobile-left-offset/quickstart.md` scenario A/F

**Checkpoint**: SC-001; MVP visual fix on campaign pins

---

## Phase 4: User Story 2 — Transição celular ↔ desktop (Priority: P2)

**Goal**: Nudge só com `map-page--mobile`; some/desaparece ao redimensionar sem reload

**Independent Test**: Alternar &lt;800 ↔ ≥800 → nudge on/off; desktop alinhamento pré-feature

### Implementation for User Story 2

- [X] T010 [US2] Verify desktop (≥800px) pin transforms have no extra left nudge (rules scoped only under `.map-page--mobile`) in `frontend/src/components/map/CampaignMap.css` (FR-003, SC-002)
- [X] T011 [US2] Confirm resize toggles `map-page--mobile` so nudge appears/disappears without code changes beyond CSS in `frontend/src/pages/MapPage.tsx` (FR-007, SC-004); fix only if class missing on CampaignMap ancestor
- [X] T012 [US2] Run quickstart scenarios B–D from `specs/047-mobile-left-offset/quickstart.md` (desktop + resize + zoom/pan stability)

**Checkpoint**: SC-002/004; US1+US2 satisfied by same CSS scoping

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Exclusões, quickstart E–F, changelog

- [X] T013 Confirm RouteDigitizer `__wp` CSS unchanged in `frontend/src/components/gm/RouteDigitizer.css` (FR-008, SC-003)
- [X] T014 Run scenarios E–F from `specs/047-mobile-left-offset/quickstart.md`; tune only the `-8px` constant in `frontend/src/components/map/CampaignMap.css` if still outside 6–10px feel
- [X] T015 [P] Note change in `CHANGELOG.md` under next patch (e.g. 0.6.8): mobile-only left nudge for campaign map local pins

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T003) → **Foundational** (T004–T005) → **US1** (T006–T009) → **US2** (T010–T012) → **Polish** (T013–T015)
- US2 mostly validates CSS scoping from US1; do not start US2 polish checks before T006–T007 land

### User Story Dependencies

- **US1 (P1)**: MVP — mobile pin nudge CSS
- **US2 (P2)**: Depends on US1 transforms being scoped under `.map-page--mobile`

### Parallel Opportunities

- T002 ∥ T003
- T008 can be a checklist while writing T006–T007 (same file — sequential edits preferred)
- T013 ∥ T015 after UI done

---

## Parallel Example: After T005

```bash
Task: "Add mobile translateX to default pin transform in CampaignMap.css"
# Then sequentially:
Task: "Mirror nudge on selected/hovered pin transforms in CampaignMap.css"
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T005 skim + formula
2. T006–T009 pin nudge on mobile
3. T010–T012 resize/desktop check
4. T013–T015 polish + changelog

### Incremental Delivery

1. Foundational: confirm scope
2. US1: mobile pins shifted
3. US2: confirm desktop/resize
4. Polish: digitizer untouched + changelog

---

## Notes

- Prefer pure CSS; avoid JS offset of `left`/`x`
- Do not touch `RouteDigitizer*`
- Target `translateX(calc(-8px / var(--map-zoom, 1)))` inside existing rotate/scale chain
- No automated tests required
