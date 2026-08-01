# Tasks: Destacar pin ao passar o mouse no menu

**Input**: Design documents from `/specs/005-menu-hover-pin/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação via `quickstart.md` na fase Polish.

**Organization**: Uma user story (P1). Estado `hoveredLocalId` em MapPage; handlers só na aba Locais.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes)
- **[Story]**: US1 conforme spec.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar superfície de mudança

- [x] T001 Confirm wiring points in `frontend/src/pages/MapPage.tsx`, `frontend/src/components/sidebar/SideMenu.tsx`, `frontend/src/components/map/CampaignMap.tsx`, and GM list `frontend/src/components/admin/LocalAdminList.tsx` per `specs/005-menu-hover-pin/plan.md`
- [x] T002 [P] Skim `specs/005-menu-hover-pin/contracts/ui-hover-pin.md` and `research.md` (`hoveredLocalId` ≠ `selectedLocalId`; Locais only)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contrato de props para hover — bloqueia US1

**⚠️ CRITICAL**: Completar antes da implementação da story

- [x] T003 Add `hoveredLocalId: number | null` state (and clear-on-unneeded-tab optional) scaffold in `frontend/src/pages/MapPage.tsx` without changing pin visuals yet
- [x] T004 [P] Extend `CampaignMap` props with `hoveredLocalId` in `frontend/src/components/map/CampaignMap.tsx` (accept prop; no CSS class required until US1 if preferred, but prop must exist)

**Checkpoint**: MapPage pode guardar hover id; CampaignMap recebe a prop

---

## Phase 3: User Story 1 — Encontrar o pin pelo nome no menu (Priority: P1) 🎯 MVP

**Goal**: Hover no nome na aba Locais destaca o pin; leave remove; clique inalterado

**Independent Test**: ≥2 locais — hover destaca um pin; leave limpa; clique ainda abre modal; História/NPCs sem obrigação

### Implementation for User Story 1

- [x] T005 [US1] Add CSS class `campaign-map__pin--hovered` (distinct/combinable with selected) in `frontend/src/components/map/CampaignMap.css`
- [x] T006 [US1] Apply hovered class when `local.id === hoveredLocalId` in `frontend/src/components/map/CampaignMap.tsx`
- [x] T007 [US1] Add `onLocalHover?: (id: number | null) => void` and wire `onMouseEnter`/`onMouseLeave` on Locais list items only in `frontend/src/components/sidebar/SideMenu.tsx` (player Locais cards; do not require História/NPCs)
- [x] T008 [US1] Wire `onLocalHover` → `setHoveredLocalId` and pass `hoveredLocalId` to `CampaignMap` in `frontend/src/pages/MapPage.tsx`
- [x] T009 [US1] Add hover enter/leave on local name/cards in `frontend/src/components/admin/LocalAdminList.tsx` and thread callback from MapPage admin panel when tab is Locais
- [x] T010 [US1] Ensure hover does not open PinModal and does not call map recenter in `frontend/src/pages/MapPage.tsx` / `CampaignMap.tsx`

**Checkpoint**: US1 testável — Locais (jogador + GM) hover→pin; clique preservado

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Validação quickstart

- [x] T011 Run scenarios A–E from `specs/005-menu-hover-pin/quickstart.md` and fix gaps (História/NPCs must not be required; leave clears hover)

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational → US1 → Polish

### User Story Dependencies

- **US1 (P1)**: Após Foundational

### Parallel Opportunities

- T001/T002; T003/T004 (arquivos diferentes)
- T005 pode ir em paralelo a T007 se T004 já aceitar a prop

---

## Parallel Example: Foundational

```bash
Task: "Add hoveredLocalId state in MapPage.tsx"
Task: "Extend CampaignMap props with hoveredLocalId in CampaignMap.tsx"
```

---

## Implementation Strategy

### MVP First

1. Setup + Foundational  
2. T005–T010 (US1)  
3. T011 quickstart  

### Incremental Delivery

Único incremento: hover Locais → destaque do pin.

---

## Notes

- Não ligar hover em História/NPCs (FR-007)
- `hoveredLocalId` independente de `selectedLocalId`
