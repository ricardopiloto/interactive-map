# Tasks: Centralizar pin ao clicar no menu

**Input**: Design documents from `/specs/012-menu-center-pin/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) foco pan+zoom ao clicar no menu; US2 (P2) preservar seleção/modal e bloquear em placement.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e pontos de integração

- [x] T001 Skim `specs/012-menu-center-pin/contracts/ui-menu-focus-pin.md` and `research.md` (`zoomToElement`, `FOCUS_SCALE=2`, ~400ms, foco só pelo menu)
- [x] T002 [P] Locate pin buttons / `TransformWrapper` / `useControls` in `frontend/src/components/map/CampaignMap.tsx` and `selectLocal` / `SideMenu` wiring in `frontend/src/pages/MapPage.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: IDs de pin + constantes de foco — bloqueia US1

**⚠️ CRITICAL**: Completar antes das user stories

- [x] T003 Add stable pin DOM ids (`id={`map-pin-${local.id}`}`) on local pin buttons in `frontend/src/components/map/CampaignMap.tsx`
- [x] T004 [P] Define `FOCUS_SCALE` (2) and `FOCUS_ANIM_MS` (~400) constants in `frontend/src/components/map/CampaignMap.tsx` (or small colocated constants module under `frontend/src/components/map/`)

**Checkpoint**: Pins endereçáveis no DOM; constantes definidas

---

## Phase 3: User Story 1 — Encontrar o pin no mapa a partir do menu (Priority: P1) 🎯 MVP

**Goal**: Clique no local no menu anima o mapa para o pin com zoom moderado fixo

**Independent Test**: Afastar mapa; clicar local na lista; pin centrado com escala ~2

### Implementation for User Story 1

- [x] T005 [US1] Add `focusRequest` prop (`{ localId: number; nonce: number } | null`) to `CampaignMap` in `frontend/src/components/map/CampaignMap.tsx`
- [x] T006 [US1] Implement internal focus controller using `useControls().zoomToElement` (or TransformWrapper ref) on `#map-pin-{id}` with `FOCUS_SCALE` + animation in `frontend/src/components/map/CampaignMap.tsx` (no-op if element missing)
- [x] T007 [US1] In `frontend/src/pages/MapPage.tsx`, add `selectLocalFromMenu` that calls selection logic and sets a new `focusRequest` nonce; pass it to `SideMenu` as `onSelectLocal`
- [x] T008 [US1] Keep map pin `onSelectLocal` on `CampaignMap` as plain `selectLocal` (no focusRequest) in `frontend/src/pages/MapPage.tsx`

**Checkpoint**: SC-001 / SC-002 / SC-003 / FR-001 / FR-002 / FR-003 / FR-005 (hover untouched)

---

## Phase 4: User Story 2 — Seleção e placement intactos (Priority: P2)

**Goal**: Modal/seleção preservados; sem foco quando placement bloqueia seleção

**Independent Test**: Jogador abre modal + foca; GM em add-pin não foca ao clicar menu

### Implementation for User Story 2

- [x] T009 [US2] Ensure `selectLocalFromMenu` in `frontend/src/pages/MapPage.tsx` respects the same guard as `selectLocal` (`isGm && placement !== 'none'` → no selection and no focusRequest) (FR-004 / US2-3)
- [x] T010 [US2] Confirm player path still opens `PinModal` via `selectedLocalId` after menu click in `frontend/src/pages/MapPage.tsx` (FR-004)
- [x] T011 [US2] Confirm `onLocalHover` in `frontend/src/components/sidebar/SideMenu.tsx` / `MapPage.tsx` does not set `focusRequest` (FR-005)

**Checkpoint**: SC-004 / FR-004 / FR-005 / FR-007

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Regressões e quickstart

- [x] T012 [P] Guard focus when map surface/pins not ready (silent no-op) in `frontend/src/components/map/CampaignMap.tsx` (FR-007)
- [x] T013 Run scenarios A–G from `specs/012-menu-center-pin/quickstart.md` and fix gaps in `CampaignMap.tsx` / `MapPage.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T003–T004)** → **US1** → **US2** → **Polish**

### User Story Dependencies

- **US1**: Precisa de IDs + `zoomToElement` + wiring do menu
- **US2**: Refina guards do mesmo wiring; pode overlapping após T007

### Parallel Opportunities

- T001 ∥ T002
- T003 ∥ T004
- T010 ∥ T011 após T009

---

## Parallel Example: Foundational

```bash
Task: "Add map-pin-{id} on pin buttons in CampaignMap.tsx"
Task: "Define FOCUS_SCALE and FOCUS_ANIM_MS"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup + T003–T004
2. T005–T008 (foco pelo menu)
3. **STOP and VALIDATE**: quickstart A–C

### Incremental Delivery

1. US1 → foco
2. US2 → guards / regressões
3. Polish → A–G

---

## Notes

- Sem backend
- Clique no pin do mapa não dispara `focusRequest`
- `FOCUS_SCALE = 2` ajustável num único lugar
