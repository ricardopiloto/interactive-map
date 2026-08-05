# Tasks: Fix Mobile Marker Alignment (after 047)

**Input**: Design documents from `/specs/049-fix-mobile-marker-align/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) eliminar offset à esquerda no móvel (locais + grupo); US2 (P2) não repetir o erro da 047 / exclusões.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e estado pós-047

- [X] T001 Skim `specs/049-fix-mobile-marker-align/contracts/ui-fix-mobile-marker-align.md`, `research.md`, and `data-model.md` (remove left nudge; optional right; locais+grupo)
- [X] T002 [P] Locate `--mobile-marker-nudge-x: -8px` and pin transform chain in `frontend/src/components/map/CampaignMap.css`
- [X] T003 [P] Confirm `map-page--mobile` / `MOBILE_BP` in `frontend/src/pages/MapPage.tsx`; confirm party classes in `frontend/src/components/map/CampaignMap.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estratégia de correcção locked (research §1)

**⚠️ CRITICAL**: Completar antes das user stories

- [X] T004 Lock approach: (1) remove 047 left nudge; (2) QA; (3) only if residual left bias on pin+party, shared **positive** `--mobile-marker-nudge-x` (right) under `.map-page--mobile` — never more left — per `specs/049-fix-mobile-marker-align/research.md`
- [X] T005 Confirm no campaign-map waypoint node discs today in `frontend/src/components/map/CampaignMap.tsx` (FR-002 apply-when-present; do not invent nodes)

**Checkpoint**: Plan clear; digitizer out of scope

---

## Phase 3: User Story 1 — Marcadores deixam de ficar à esquerda (Priority: P1) 🎯 MVP

**Goal**: Em móvel, locais (+ nós se existirem) e grupo alinhados; sem excesso à esquerda

**Independent Test**: Viewport &lt;800px; tips de ≥3 locais + grupo no ponto do mapa

### Implementation for User Story 1

- [X] T006 [US1] Remove `.map-page--mobile .campaign-map__pin { --mobile-marker-nudge-x: -8px; }` (or set to `0`) in `frontend/src/components/map/CampaignMap.css` (FR-001/005)
- [X] T007 [US1] Keep or simplify pin `translateX(calc(var(--mobile-marker-nudge-x) / var(--map-zoom)))` so desktop stays `0` nudge in `frontend/src/components/map/CampaignMap.css` (FR-004)
- [X] T008 [US1] Wire `.campaign-map__party--bandeira` and `--brasao` to the same `--mobile-marker-nudge-x` (default `0`) in their transforms in `frontend/src/components/map/CampaignMap.css` (FR-003)
- [X] T009 [US1] Spot-check mobile (&lt;800px): locais + grupo no longer too far left (`specs/049-fix-mobile-marker-align/quickstart.md` A); if residual left remains, set shared **positive** nudge (e.g. `8px`) under `.map-page--mobile` for pin+party only — never negative (research §1–2, FR-005)

**Checkpoint**: SC-001; MVP alignment on mobile

---

## Phase 4: User Story 2 — Não repetir o erro da 047 (Priority: P2)

**Goal**: Sem mais nudge à esquerda; desktop/digitizer intactos; resize OK

**Independent Test**: Desktop alinhado; digitizer unchanged; resize toggles correctly

### Implementation for User Story 2

- [X] T010 [US2] Verify no rule under `.map-page--mobile` uses a **negative** (left) marker nudge in `frontend/src/components/map/CampaignMap.css` (FR-005)
- [X] T011 [US2] Confirm desktop (≥800) pin/party transforms match pre-049 correct alignment in `frontend/src/components/map/CampaignMap.css` (FR-004, SC-002)
- [X] T012 [US2] Confirm `RouteDigitizer.css` / segment strokes and campaign travel-route rules untouched (FR-007); grep or quick visual
- [X] T013 [US2] Run quickstart B–D (desktop, resize, zoom/pan) from `specs/049-fix-mobile-marker-align/quickstart.md` (FR-006, SC-003)

**Checkpoint**: SC-002–004; 047 mistake not repeated

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Exclusões, changelog, note nodes-when-present

- [X] T014 Run quickstart E–F from `specs/049-fix-mobile-marker-align/quickstart.md`; document in a one-line CSS comment if a shared right nudge value was chosen in `frontend/src/components/map/CampaignMap.css`
- [X] T015 [P] Note change in `CHANGELOG.md` under next patch: fix mobile campaign-map marker alignment (remove 047 left nudge; locais + grupo)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T003) → **Foundational** (T004–T005) → **US1** (T006–T009) → **US2** (T010–T013) → **Polish** (T014–T015)
- T008 (party) can follow T006 in same file sequentially
- T009 residual right-nudge only after visual check of T006–T008

### User Story Dependencies

- **US1 (P1)**: MVP — remove left bias on mobile markers
- **US2 (P2)**: Validates directionality + exclusions after US1 CSS

### Parallel Opportunities

- T002 ∥ T003
- T012 ∥ T011 after CSS settled
- T015 ∥ T014

---

## Parallel Example: After T005

```bash
Task: "Remove -8px mobile left nudge from .campaign-map__pin in CampaignMap.css"
Task: "Add --mobile-marker-nudge-x to party bandeira/brasao transforms in CampaignMap.css"
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T005 skim + approach
2. T006–T009 remove 047 + party parity + QA/optional right nudge
3. T010–T013 verify no left nudge / desktop / digitizer
4. T014–T015 polish + changelog

### Incremental Delivery

1. Remove incorrect left nudge
2. Party shares variable
3. Optional shared right correction
4. Polish

---

## Notes

- Never increase left (negative) nudge as a “fix”
- Do not invent campaign-map nodes
- Do not touch digitizer segment strokes (048 is separate)
- Prefer CSS under `.map-page--mobile` only
