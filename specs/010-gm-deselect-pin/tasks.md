# Tasks: Deselecionar pin no modo GM

**Input**: Design documents from `/specs/010-gm-deselect-pin/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) clique fora limpa seleção; US2 (P2) placement tem prioridade sobre deseleção.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato UI e pontos de clique atuais

- [x] T001 Skim `specs/010-gm-deselect-pin/contracts/ui-gm-pin-deselect.md` and `research.md` (stage idle → clear; placement wins; preserve `localDraft`; group stopPropagation)
- [x] T002 [P] Locate `handleStageClick` / pin `stopPropagation` / `selectedLocalId` wiring in `frontend/src/components/map/CampaignMap.tsx` and `frontend/src/pages/MapPage.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API de callback alinhada ao contrato — bloqueia US1/US2

**⚠️ CRITICAL**: Completar antes das user stories

- [x] T003 Add optional `onClearSelection?: () => void` prop to `CampaignMap` interface in `frontend/src/components/map/CampaignMap.tsx` (document: called on empty-stage click when not placing)

**Checkpoint**: Prop tipada; ainda sem comportamento — stories implementam o wire-up

---

## Phase 3: User Story 1 — GM deseleciona pin clicando fora (Priority: P1) 🎯 MVP

**Goal**: Em modo GM, clique na área vazia do mapa limpa `selectedLocalId` e o destaque; formulários admin intactos

**Independent Test**: Selecionar pin → destaque → clique vazio → nenhum pin `--selected`; `localDraft` se aberto permanece

### Implementation for User Story 1

- [x] T004 [US1] Extend `handleStageClick` in `frontend/src/components/map/CampaignMap.tsx`: when `!placing` and `onClearSelection` is set, invoke it (pins already `stopPropagation`)
- [x] T005 [US1] Add `stopPropagation` on group marker click (and avoid treating group as empty stage) in `frontend/src/components/map/CampaignMap.tsx` (FR-008 / edge case)
- [x] T006 [US1] Pass `onClearSelection={() => setSelectedLocalId(null)}` from `frontend/src/pages/MapPage.tsx` only when `isGm` (do not clear `localDraft`)
- [x] T007 [US1] Confirm selecting another pin still works via existing `onSelectLocal` in `frontend/src/components/map/CampaignMap.tsx` / `MapPage.tsx` (FR-002)

**Checkpoint**: SC-001 / SC-002 / FR-001 / FR-003 / FR-004 / FR-005 / FR-009

---

## Phase 4: User Story 2 — Placement não é interpretado como deseleção (Priority: P2)

**Goal**: Com `placementMode !== 'none'`, clique no stage posiciona; não usa o ramo só-deseleção

**Independent Test**: Add-pin / reposition / move-group → clique no mapa completa posicionamento mesmo com pin previamente selecionado

### Implementation for User Story 2

- [x] T008 [US2] Ensure `handleStageClick` in `frontend/src/components/map/CampaignMap.tsx` keeps placement branch first (`placing` → `onMapClickRelative` only; no `onClearSelection` in that branch) (FR-006)
- [x] T009 [US2] Smoke-check `MapPage` placement handlers (`add-pin` / `reposition` / `move-group`) in `frontend/src/pages/MapPage.tsx` still run after T004–T006 without requiring prior deselect (SC-003)

**Checkpoint**: SC-003 / FR-006; US1 ainda válido quando `placement === 'none'`

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Regressões e quickstart

- [x] T010 [P] Confirm controls/legend outside stage do not clear selection (no handler change needed unless bugs) in `frontend/src/components/map/CampaignMap.tsx` / `CampaignMap.css` (FR-008)
- [x] T011 [P] Confirm player mode still clears via `PinModal` close only in `frontend/src/pages/MapPage.tsx` (FR-009)
- [x] T012 Run scenarios A–G from `specs/010-gm-deselect-pin/quickstart.md` and fix gaps in `CampaignMap.tsx` / `MapPage.tsx` (incl. pan/zoom SC-004)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T003)** → **US1** → **US2** (US2 valida o mesmo handler; pode overlap após T004)
- **Polish** após US1+US2

### User Story Dependencies

- **US1 (P1)**: Precisa de T003; entrega MVP
- **US2 (P2)**: Depende do handler de T004 existir; reforça prioridade placement

### Parallel Opportunities

- T001 ∥ T002
- T010 ∥ T011 na polish
- T005 pode ir em paralelo com T006 após T004 (arquivos: mesmo `CampaignMap` vs `MapPage` — T005 e T006 [sequenciais se conflito no mesmo PR; T006 é MapPage → [P] ok com T005)

---

## Parallel Example: After Foundational

```bash
# Após T003–T004 no CampaignMap:
Task: "stopPropagation on group marker in CampaignMap.tsx"
Task: "Wire onClearSelection in MapPage.tsx when isGm"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup + T003
2. T004–T007 (clear selection)
3. **STOP and VALIDATE**: quickstart A, B, D

### Incremental Delivery

1. US1 → deseleção GM
2. US2 → garantir placement
3. Polish → A–G

---

## Notes

- Sem backend / schema
- Não limpar `localDraft` no clear
- Sem testes automatizados nesta entrega
