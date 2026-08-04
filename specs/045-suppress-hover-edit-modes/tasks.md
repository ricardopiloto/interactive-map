# Tasks: Suppress Segment Hover in Edit Modes

**Input**: Design documents from `/specs/045-suppress-hover-edit-modes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) desligar segment-hover (UI + hit) em Novo nó / Traçar segmento.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e estado 044

- [X] T001 Skim `specs/045-suppress-hover-edit-modes/contracts/ui-suppress-hover-edit-modes.md`, `research.md`, and `data-model.md` (`segmentHoverEnabled = mode === 'idle'`; unmount hits)
- [X] T002 [P] Confirm `mode`, `hoveredSegmentId`, `__seg-hit` handlers, and mode toolbar toggles in `frontend/src/components/gm/RouteDigitizerView.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Flag de enable + limpeza ao sair de idle

**⚠️ CRITICAL**: Completar antes da story

- [X] T003 Introduce `segmentHoverEnabled = mode === 'idle'` (or equivalent) in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-001–003)
- [X] T004 Clear `hoveredSegmentId` and `tooltipPos` whenever `mode !== 'idle'` (`useEffect` and/or mode toggle handlers) in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-004, SC-004)

**Checkpoint**: Entrar em Novo nó / Traçar segmento limpa hover sticky

---

## Phase 3: User Story 1 — No segment hover while placing or drawing (Priority: P1) 🎯 MVP

**Goal**: Em edit modes, sem UI 044 e sem hit largo; idle intacto

**Independent Test**: Edit modes — passar sobre segmentos sem tooltip/lista/ênfase; cliques place/draw funcionam; idle restaura hover

### Implementation for User Story 1

- [X] T005 [US1] Mount `__seg-hit` polylines only when `segmentHoverEnabled` (do not render in `place-wp` / `draw-seg`) in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-007, SC-005)
- [X] T006 [US1] Guard pointer enter/move handlers so they no-op when hover disabled in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-005)
- [X] T007 [US1] Ensure tooltip, list `is-hovered`, and stroke `is-hovered` only appear when hover enabled / `hoveredSegmentId` set in idle in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-001, FR-002, FR-005)
- [X] T008 [US1] Spot-check idle still shows 044 tooltip + list + stroke emphasis in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-003, FR-008, SC-003)

**Checkpoint**: SC-001–005; quickstart A–E

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Regressão, quickstart, changelog

- [X] T009 Confirm CampaignMap / planner / snap-aura unchanged (FR-006); run quickstart F
- [X] T010 Run scenarios A–F from `specs/045-suppress-hover-edit-modes/quickstart.md`; fix only digitizer files if needed
- [X] T011 [P] Note change in `CHANGELOG.md` under 0.6.5 (or next patch): segment-hover desligado em Novo nó / Traçar segmento

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003–T004) → **US1** (T005–T008) → **Polish** (T009–T011)

### User Story Dependencies

- **US1 (P1)**: MVP único

### Parallel Opportunities

- T001 ∥ T002
- T010 ∥ T011 após implementação

---

## Parallel Example: After T004

```bash
Task: "Unmount __seg-hit when not idle in RouteDigitizerView.tsx"
Task: "Guard pointer handlers when segmentHoverEnabled is false"
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T004 enable flag + clear on mode
2. T005–T008 unmount hits + guards + idle check
3. T009–T011 polish

### Incremental Delivery

1. Foundational: clear sticky hover
2. US1: no hits / no UI in edit modes
3. Polish

---

## Notes

- Prefer unmounting `__seg-hit` over CSS-only `pointer-events: none`
- Do not change 044 idle identity content
