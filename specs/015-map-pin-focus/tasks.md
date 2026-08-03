# Tasks: Focar pin ao clicar no mapa

**Input**: Design documents from `/specs/015-map-pin-focus/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) foco no clique do pin (jogador); US2 (P2) paridade menu / GM / hover.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e wiring atual de foco (012)

- [x] T001 Skim `specs/015-map-pin-focus/contracts/ui-map-pin-focus.md` and `research.md` (`selectLocalFromMap` + `focusRequest` nonce; só jogador; reaplicar a cada clique)
- [x] T002 [P] Locate `selectLocal` / `selectLocalFromMenu` / `focusRequest` and `CampaignMap.onSelectLocal={selectLocal}` in `frontend/src/pages/MapPage.tsx`; confirm `PinFocusController` in `frontend/src/components/map/CampaignMap.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirmar que a infra de foco (012) está pronta — sem mudança obrigatória em CampaignMap

**⚠️ CRITICAL**: Não reimplementar zoom; só wiring

- [x] T003 Confirm `PinFocusController` reacts to new `focusRequest` nonces for the same `localId` in `frontend/src/components/map/CampaignMap.tsx` (re-apply on repeat click)

**Checkpoint**: Foco via `focusRequest` reutilizável pelo handler do mapa

---

## Phase 3: User Story 1 — Clicar no pin e vê-lo no centro (Priority: P1) 🎯 MVP

**Goal**: Clique no pin (jogador) seleciona + dispara foco com mesmo `FOCUS_SCALE` do menu; reaplica com nonce

**Independent Test**: Afastar mapa; clicar pin; pin na vista com zoom moderado; clicar de novo após pan → refoca

### Implementation for User Story 1

- [x] T004 [US1] Add `selectLocalFromMap` in `frontend/src/pages/MapPage.tsx` that calls selection logic and, when `!isGm`, sets `focusRequest` with a new nonce (`Date.now()` or increment)
- [x] T005 [US1] Pass `selectLocalFromMap` to `CampaignMap` as `onSelectLocal` in `frontend/src/pages/MapPage.tsx` (replace plain `selectLocal`)
- [x] T006 [US1] Ensure repeat clicks on the same pin issue a new nonce so `PinFocusController` re-runs in `frontend/src/pages/MapPage.tsx` / `CampaignMap.tsx` (FR-003)

**Checkpoint**: SC-001 / SC-002 / SC-003 / FR-001 / FR-002 / FR-003 / FR-004

---

## Phase 4: User Story 2 — Consistência e sem regressão (Priority: P2)

**Goal**: Menu continua focando; hover sem foco; GM não dispara foco desta feature

**Independent Test**: Menu vs mapa mesmo zoom; hover sem pan; GM clica pin sem exigir foco

### Implementation for User Story 2

- [x] T007 [US2] Keep `selectLocalFromMenu` focusing as today in `frontend/src/pages/MapPage.tsx` (same `FOCUS_SCALE` path via shared `focusRequest`)
- [x] T008 [US2] Ensure `selectLocalFromMap` does **not** set `focusRequest` when `isGm` in `frontend/src/pages/MapPage.tsx` (FR-001 / FR-006)
- [x] T009 [US2] Confirm `onLocalHover` / `setHoveredLocalId` still does not set `focusRequest` in `frontend/src/pages/MapPage.tsx` (FR-005)
- [x] T010 [US2] Confirm PinModal beside-pin (013) still opens for player after map pin click in `frontend/src/pages/MapPage.tsx`

**Checkpoint**: SC-004 / FR-005 / FR-006 / FR-007

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Regressões e quickstart

- [x] T011 [P] Guard: if selection is blocked (`isGm && placement !== 'none'`), no focusRequest in map path in `frontend/src/pages/MapPage.tsx` (align with `selectLocal` guard)
- [x] T012 Run scenarios A–G from `specs/015-map-pin-focus/quickstart.md` and fix gaps in `MapPage.tsx` / `CampaignMap.tsx` if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T003)** → **US1** → **US2** → **Polish**

### User Story Dependencies

- **US1**: Precisa de `selectLocalFromMap` + wire no `CampaignMap`
- **US2**: Refina guards GM/hover/menu no mesmo `MapPage.tsx`

### Parallel Opportunities

- T001 ∥ T002
- T007 ∥ T009 ∥ T010 após T005 (confirmações; mesmo arquivo — sequenciar no mesmo agente)
- T011 com cuidado no mesmo arquivo que T008

---

## Parallel Example: User Story 1

```bash
# Sequencial no MapPage.tsx:
Task: "T004 selectLocalFromMap"
Task: "T005 wire CampaignMap.onSelectLocal"
Task: "T006 nonce on repeat click"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + T003
2. US1 (`selectLocalFromMap`)
3. **STOP**: validar A–C do quickstart
4. US2 + Polish

### Incremental Delivery

1. Setup → confirmar 012
2. US1 → clique no pin foca (MVP)
3. US2 → GM/hover/menu regressões
4. Polish → quickstart A–G

---

## Notes

- [P] = paralelizável
- Sem testes automatizados
- Não alterar `FOCUS_SCALE` / `FOCUS_ANIM_MS` salvo bug
- Não focar no GM nesta feature
