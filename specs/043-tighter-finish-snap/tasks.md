# Tasks: Tighter Finish Snap

**Input**: Design documents from `/specs/043-tighter-finish-snap/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) finish snap mais apertado + aura mode-aware igual à zona activa.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e estado pós-041

- [X] T001 Skim `specs/043-tighter-finish-snap/contracts/ui-tighter-finish-snap.md`, `research.md`, and `data-model.md` (`ORIGIN_SNAP` 0.01, `FINISH_SNAP` ~0.005, aura = active snap)
- [X] T002 [P] Confirm current `NODE_SNAP`, origin/finish `nearestWaypoint` call sites, `draftA` usage, and `.route-digitizer__wp` (22px) in `frontend/src/components/gm/RouteDigitizerView.tsx` and `RouteDigitizer.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Constantes de snap separadas prontas para o fluxo draw-seg

**⚠️ CRITICAL**: Completar antes da story de UI

- [X] T003 Replace `NODE_SNAP` with `ORIGIN_SNAP = 0.01` and `FINISH_SNAP = 0.005` in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-001, FR-004, SC-001)
- [X] T004 Wire stage pick: `nearestWaypoint(..., ORIGIN_SNAP)` when `draftA == null`; `nearestWaypoint(..., FINISH_SNAP)` when draft open in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-002, FR-003)

**Checkpoint**: Origem e fecho usam raios distintos; sem `NODE_SNAP` unificado

---

## Phase 3: User Story 1 — Close only when close enough + aura matches (Priority: P1) 🎯 MVP

**Goal**: Finish snap mais apertado; aura (e hit box) encolhe com draft aberto para igualar a zona de fecho; origem/idle mantêm aura grande

**Independent Test**: Draft aberto — clique fora da aura pequena não fecha; dentro fecha; sem draft, aura/origem como pós-041

### Implementation for User Story 1

- [X] T005 [US1] Add CSS modifier (e.g. `.route-digitizer__wp--closing`) with ~half diameter (~11px) matching `FINISH_SNAP`, keep default 22px for origin/idle, preserve `--map-zoom` counter-scale and `.is-active` in `frontend/src/components/gm/RouteDigitizer.css` (FR-007, SC-005)
- [X] T006 [US1] Apply finish-aura modifier on `__wp` buttons when `draftA != null` in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-007)
- [X] T007 [US1] Keep direct `__wp` click start/finish paths working with the mode-aware hit box in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-003, FR-005)
- [X] T008 [US1] Spot-check undo midpoints / cancel draft / place-wp still work in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-005)

**Checkpoint**: SC-001–005; quickstart A–F

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Regressão, quickstart, changelog

- [X] T009 Confirm campaign map pins/party and segment stroke unchanged (no edits to `CampaignMap` / stroke styles) (FR-006); run quickstart G
- [X] T010 Run scenarios A–G from `specs/043-tighter-finish-snap/quickstart.md`; tune `FINISH_SNAP` and/or CSS px only in digitizer files if aura ≠ snap
- [X] T011 [P] Note change in `CHANGELOG.md` under next patch (Changed: finish snap mais apertado + aura mode-aware na Rede de rotas)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003–T004) → **US1** (T005–T008) → **Polish** (T009–T011)

### User Story Dependencies

- **US1 (P1)**: MVP único — finish snap + aura mode-aware

### Parallel Opportunities

- T001 ∥ T002
- T005 pode começar após T003 (CSS) em paralelo com T004 se T004 ainda não tocar CSS
- T010 ∥ T011 após implementação

---

## Parallel Example: After T003

```bash
Task: "Wire ORIGIN/FINISH nearestWaypoint by draftA in RouteDigitizerView.tsx"
Task: "Add .route-digitizer__wp--closing finish-sized aura in RouteDigitizer.css"
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T004 split snap constants + wire picks
2. T005–T008 mode-aware aura + click paths
3. T009–T011 polish

### Incremental Delivery

1. Foundational: asymmetric snap
2. US1: aura = active zone
3. Polish

---

## Notes

- Do not touch CampaignMap or planner
- Disk `::after` ~11px may stay; finish modifier shrinks the outer hit/aura chrome
- Partially supersedes 041 unified snap for finish only
