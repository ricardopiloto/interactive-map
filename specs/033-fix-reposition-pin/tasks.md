# Tasks: Corrigir reposicionamento visual do pin

**Input**: Design documents from `/specs/033-fix-reposition-pin/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) pin reflecte draft após clique; US2 (P2) preservar 032 (modal + Cancelar banner) e cancel edição restaura pin.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar causa (pin usa `locais`, não draft) e contrato

- [X] T001 Skim `specs/033-fix-reposition-pin/contracts/ui-pin-draft-position.md` and `research.md` (merge draft→display locais; cancel edit clears override)
- [X] T002 [P] Confirm `CampaignMap` pin `left`/`top` from `local.x`/`local.y` and reposition updates only `localDraft` in `frontend/src/components/map/CampaignMap.tsx` and `frontend/src/pages/MapPage.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Helper/merge de display — bloqueia US1

**⚠️ CRITICAL**: Completar antes de wire-up no mapa

- [X] T003 Add `displayLocais` (or equivalent) merge in `frontend/src/pages/MapPage.tsx`: when `localDraft` has `id` and `!isNew`, override that local’s `x`/`y` (optionally `cor_pin`) from draft; else use `locais`

**Checkpoint**: Merge disponível; ainda pode não estar passado ao `CampaignMap`

---

## Phase 3: User Story 1 — Pin move ao confirmar (Priority: P1) 🎯 MVP

**Goal**: Após clique de reposicionamento, o pin do local em edição aparece na nova posição antes de salvar; form coords alinhadas

**Independent Test**: Editar → Reposicionar → clicar no mapa → pin no ponto clicado sem Salvar; x/y no formulário batem

### Implementation for User Story 1

- [X] T004 [US1] Pass merged `displayLocais` (not raw `locais`) to `CampaignMap` `locais` prop in `frontend/src/pages/MapPage.tsx` (FR-001)
- [X] T005 [US1] Confirm connection-line origin/dest that use the same map list also see draft coords when that local is being edited in `frontend/src/pages/MapPage.tsx` / `CampaignMap.tsx` (data-model invariant)
- [X] T006 [US1] Confirm reposition click still sets `localDraft` x/y then `placement` to `'none'` in `frontend/src/pages/MapPage.tsx` so merge updates pin immediately (FR-002)
- [X] T007 [US1] Confirm save path still persists draft x/y and refresh clears draft so pin stays on new spot in `frontend/src/pages/MapPage.tsx` (FR-006)

**Checkpoint**: SC-001, SC-002, SC-005; FR-001, FR-002, FR-006, FR-007

---

## Phase 4: User Story 2 — Preservar 032 e restaurar no cancel (Priority: P2)

**Goal**: Modal continua a esconder-se; Cancelar no banner não move pin; Cancelar edição restaura pin persistido

**Independent Test**: Banner Cancel → pin intacto; após mover pin → Cancelar formulário → pin volta

### Implementation for User Story 2

- [X] T008 [US2] Confirm `LocalFormDialog` still mounts only when `localDraft && placement !== 'reposition'` in `frontend/src/pages/MapPage.tsx` (FR-003)
- [X] T009 [US2] Confirm banner **Cancelar** only calls `setPlacement('none')` without changing `localDraft` in `frontend/src/pages/MapPage.tsx` / `CampaignMap.tsx` (FR-004, SC-004)
- [X] T010 [US2] Confirm dialog `onCancel` sets `localDraft` to `null` so merge drops and pin uses persisted `locais` in `frontend/src/pages/MapPage.tsx` (FR-005, SC-003)

**Checkpoint**: SC-003, SC-004; FR-003–FR-005

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Quickstart e regressões

- [X] T011 Run scenarios A–E from `specs/033-fix-reposition-pin/quickstart.md`; fix only `MapPage.tsx` (and `CampaignMap.tsx` if required)
- [X] T012 [P] Confirm add-pin / move-group unaffected and admin lists still use persisted `locais` (not display merge) in `frontend/src/pages/MapPage.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T003)** → **US1 (MVP)** → **US2** → **Polish**
- US2 é sobretudo verificação + cancel restore (depende do merge da US1 para SC-003)

### User Story Dependencies

- **US1 (P1)**: MVP — pin preview via merge
- **US2 (P2)**: Regressão 032 + cancel edição com merge activo

### Parallel Opportunities

- T001 ∥ T002
- T008 ∥ T009 após US1 (verificações em ficheiros já tocados — sequencial se mesmo PR)
- T011 ∥ T012 com cuidado no mesmo ficheiro

---

## Parallel Example: After T003

```bash
Task: "Pass displayLocais to CampaignMap in MapPage.tsx"
Task: "Verify reposition click updates draft in MapPage.tsx"
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T003 setup + merge helper
2. T004–T007 wire display + confirm click/save
3. T008–T010 032 + cancel restore
4. T011–T012 quickstart

### Incremental Delivery

1. Foundational merge
2. US1 pin moves before save
3. US2 preserve 032 / restore on cancel
4. Polish

---

## Notes

- Prefer merge in `MapPage`; avoid mutating persisted `locais` state for preview
- Do not change backend or waypoint link rules
- Admin side lists should keep using persisted `locais`, not the map display merge
