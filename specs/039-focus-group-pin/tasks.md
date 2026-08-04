# Tasks: Focus Group Pin

**Input**: Design documents from `/specs/039-focus-group-pin/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) botão + centrar pin do grupo; US2 (P2) visibilidade segura (ocultar sem grupo / lore oculto).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e pontos de extensão no mapa

- [X] T001 Skim `specs/039-focus-group-pin/contracts/ui-focus-group-pin.md`, `research.md`, and `data-model.md` (zoom cluster; hide when no group; `map-party`; shared `FOCUS_SCALE`/`FOCUS_ANIM_MS`)
- [X] T002 [P] Confirm `MapControls`, `PinFocusController`, party markup, and `PinFocusRequest` usage in `frontend/src/components/map/CampaignMap.tsx` and `frontend/src/pages/MapPage.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Âncora DOM do grupo + pedido de foco generalizado (local | group)

**⚠️ CRITICAL**: Completar antes das user stories de UI

- [X] T003 Add stable `id="map-party"` on the party marker element in `frontend/src/components/map/CampaignMap.tsx`
- [X] T004 Extend `PinFocusRequest` (or equivalent) to support `target: 'local' | 'group'` with `localId` only for local, keep `nonce`, in `frontend/src/components/map/CampaignMap.tsx`
- [X] T005 Update `PinFocusController` to resolve `#map-party` for group focus and `map-pin-{id}` for local, reuse `FOCUS_SCALE`/`FOCUS_ANIM_MS`, clear via `onFocusApplied`, no-op if element missing, in `frontend/src/components/map/CampaignMap.tsx`
- [X] T006 Update local-focus call sites to the new request shape in `frontend/src/pages/MapPage.tsx` (menu + player pin click) so location focus still works

**Checkpoint**: Menu “focus local” still recenters pins; `#map-party` exists when grupo is rendered

---

## Phase 3: User Story 1 — Locate the party from anywhere (Priority: P1) 🎯 MVP

**Goal**: Controlo no cluster de zoom que anima pan+zoom até o pin do grupo ficar centrado

**Independent Test**: Com grupo no mapa, panear para longe → activar controlo → grupo centrado em ≤ 1 s; sem modal

### Implementation for User Story 1

- [X] T007 [US1] Extend `MapControls` to accept a focus-group action (callback and/or show flag) and render a control with Portuguese accessible name (e.g. `aria-label="Ir ao grupo"`) in `frontend/src/components/map/CampaignMap.tsx` (FR-001, FR-004)
- [X] T008 [US1] Wire control click to enqueue group focus request (`target: 'group'`, new `nonce`) inside `CampaignMap` (prefer local state if MapPage need not know) in `frontend/src/components/map/CampaignMap.tsx` (FR-002, FR-003, FR-006, FR-007)
- [X] T009 [P] [US1] Optional CSS polish for the new control in the zoom cluster in `frontend/src/components/map/CampaignMap.css` (spacing/icon only; no layout rewrite)

**Checkpoint**: SC-001, SC-002, SC-004; quickstart A–D

---

## Phase 4: User Story 2 — Discoverable and safe when group missing (Priority: P2)

**Goal**: Controlo oculto quando não há grupo (ou party não renderizada); mapa continua usável

**Independent Test**: Sem `grupo` → botão ausente; com `hideLorePins` → não oferecer foco enganoso; sem crash

### Implementation for User Story 2

- [X] T010 [US2] Show focus-group control only when party would render (`grupo != null` and not `hideLorePins`); never render disabled stub in `frontend/src/components/map/CampaignMap.tsx` (FR-005, SC-003)
- [X] T011 [US2] Confirm missing-DOM path remains silent no-op if focus somehow fires without `#map-party` in `frontend/src/components/map/CampaignMap.tsx` (edge case)

**Checkpoint**: SC-003; quickstart E–F

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Quickstart e changelog

- [X] T012 Run scenarios A–F from `specs/039-focus-group-pin/quickstart.md`; fix only map focus/control files if needed
- [X] T013 [P] Note change in `CHANGELOG.md` (Added: botão para centralizar pin do grupo)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003–T006) → **US1** (T007–T009) → **US2** (T010–T011) → **Polish** (T012–T013)
- US2 depends on US1 control existing (visibility rules on that control)

### User Story Dependencies

- **US1 (P1)**: MVP — botão + foco do grupo
- **US2 (P2)**: Regras de ocultação; pode ser feito no mesmo PR logo após T007–T008

### Parallel Opportunities

- T001 ∥ T002
- T009 ∥ (after T007) CSS while wiring click in T008 if careful
- T012 ∥ T013 after implementation

---

## Parallel Example: After T006

```bash
Task: "Add Ir ao grupo button + enqueue group focus in CampaignMap.tsx"
Task: "Optional CampaignMap.css control polish"  # after button markup exists
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T006 foundation (id + focus request + controller + MapPage local callers)
2. T007–T008 button + group focus
3. Validate quickstart B/C
4. T010–T011 hide rules
5. T012–T013 polish

### Incremental Delivery

1. Foundation: group DOM id + generalized focus
2. US1: zoom-cluster button focuses party
3. US2: hide when no party
4. Polish

---

## Notes

- Do not open modals or force Grupo tab on focus (FR-006)
- Keep location menu focus working after type change
- No backend / no group coordinate schema changes
- Digitizer full-screen tool out of scope; only main `CampaignMap` chrome
