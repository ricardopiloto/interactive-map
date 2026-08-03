# Tasks: Hover no menu sem pan/zoom

**Input**: Design documents from `/specs/016-hover-no-pan/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) vista fixa no hover; US2 (P2) clique/foco e hover do cartão intactos.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e hipótese do re-disparo de foco

- [x] T001 Skim `specs/016-hover-no-pan/contracts/ui-hover-no-pan.md` and `research.md` (`PinFocusController` deps / `zoomToElement` identity; hover ≠ `focusRequest`)
- [x] T002 [P] Locate `PinFocusController` effect deps in `frontend/src/components/map/CampaignMap.tsx` and `onLocalHover={setHoveredLocalId}` in `frontend/src/pages/MapPage.tsx` / `frontend/src/components/sidebar/SideMenu.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirmar que hover não seta `focusRequest` — pré-requisito da correção

**⚠️ CRITICAL**: Completar antes de mudar o controller

- [x] T003 Verify `onLocalHover` / `setHoveredLocalId` never calls `setFocusRequest` in `frontend/src/pages/MapPage.tsx` (and LocalAdminList hover path if wired)

**Checkpoint**: Hover só mexe em `hoveredLocalId`

---

## Phase 3: User Story 1 — Percorrer a lista sem mover o mapa (Priority: P1) 🎯 MVP

**Goal**: Hover Locais não altera pan/zoom da vista; destaque local do pin permanece

**Independent Test**: Após um clique-foco, panar manualmente; hover vários locais → vista não volta/rezooma; pins destacam

### Implementation for User Story 1

- [x] T004 [US1] Stabilize `PinFocusController` in `frontend/src/components/map/CampaignMap.tsx` so the effect depends on `focusRequest.localId` + `focusRequest.nonce` (not unstable `zoomToElement` identity) — e.g. ref for `zoomToElement`
- [x] T005 [US1] Optionally clear/consume `focusRequest` after applying zoom in `frontend/src/pages/MapPage.tsx` and/or `CampaignMap.tsx` so leftover requests cannot re-fire on hover re-renders
- [x] T006 [US1] Confirm `.campaign-map__pin--hovered` scale/glow remains in `frontend/src/components/map/CampaignMap.css` (local highlight allowed)
- [x] T007 [US1] Confirm hover still toggles `hoveredLocalId` → `--hovered` class in `frontend/src/components/map/CampaignMap.tsx` without calling `zoomToElement`

**Checkpoint**: SC-001 / SC-002 / FR-001 / FR-002 / FR-003

---

## Phase 4: User Story 2 — Clique foca; cartão hover intacto (Priority: P2)

**Goal**: Menu/map click focus and menu card tint still work

**Independent Test**: Clicar menu → foca; hover cartão → tint; hover após foco não re-foca

### Implementation for User Story 2

- [x] T008 [US2] Confirm `selectLocalFromMenu` / `selectLocalFromMap` still set `focusRequest` and focus works in `frontend/src/pages/MapPage.tsx` (FR-004)
- [x] T009 [US2] Confirm Locais card `:hover` tint still present in `frontend/src/components/sidebar/SideMenu.css` (FR-005)
- [x] T010 [US2] Confirm click still opens detail / does not regress modal in `frontend/src/pages/MapPage.tsx` (FR-006)

**Checkpoint**: SC-003 / SC-004 / FR-004 / FR-005 / FR-006

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Regressões e quickstart (cenário C crítico)

- [x] T011 Run scenarios A–E from `specs/016-hover-no-pan/quickstart.md` (especially C: hover after manual pan must not re-focus) and fix gaps in `CampaignMap.tsx` / `MapPage.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T003)** → **US1** → **US2** → **Polish**

### User Story Dependencies

- **US1**: Correção do `PinFocusController` (bloqueia o bug)
- **US2**: Confirmações de não-regressão após T004–T005

### Parallel Opportunities

- T001 ∥ T002
- T006 ∥ T007 após T004 (confirmações)
- T008 ∥ T009 ∥ T010 após US1

---

## Parallel Example: User Story 1

```bash
# Sequencial no CampaignMap (efeito):
Task: "T004 stabilize PinFocusController deps"
Task: "T005 optional consume focusRequest"
# Confirmações:
Task: "T006 keep pin hover CSS"
Task: "T007 hovered class without zoom"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + T003
2. T004 (+ T005 se necessário)
3. **STOP**: quickstart A + C
4. US2 + Polish

### Incremental Delivery

1. Confirmar hover ≠ focusRequest
2. Estabilizar/consumir foco → vista fixa no hover (MVP)
3. Verificar clique + cartão
4. Quickstart A–E

---

## Notes

- [P] = paralelizável
- Sem testes automatizados
- Não remover destaque visual do pin
- Não desabilitar foco por clique
