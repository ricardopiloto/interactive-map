# Tasks: Esconder modal ao reposicionar local

**Input**: Design documents from `/specs/032-fix-reposition-modal/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) ocultar dialog durante reposition e reabrir após clique; US2 (P2) Cancelar no banner.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar causa e contrato UI

- [X] T001 Skim `specs/032-fix-reposition-modal/contracts/ui-local-reposition.md` and `research.md` (unmount dialog while reposition; draft kept; Cancel on banner)
- [X] T002 [P] Confirm current `onStartReposition` / `localDraft && LocalFormDialog` / reposition click branch in `frontend/src/pages/MapPage.tsx` and banner in `frontend/src/components/map/CampaignMap.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Superfície de cancel no mapa — bloqueia US2; útil antes de polish

**⚠️ CRITICAL**: Completar prop tipada antes de wire-up US2

- [X] T003 Add optional `onCancelPlacement?: () => void` to `CampaignMap` props in `frontend/src/components/map/CampaignMap.tsx` (document: banner Cancel for reposition)

**Checkpoint**: Prop tipada; stories implementam montagem/ocultação e Cancelar

---

## Phase 3: User Story 1 — Reposicionar com mapa livre (Priority: P1) 🎯 MVP

**Goal**: Ao “Reposicionar no mapa”, o `LocalFormDialog` deixa de montar; draft fica em memória; clique no mapa actualiza `x/y` e o dialog volta

**Independent Test**: Editar local → alterar descrição → Reposicionar → dialog some → clique no mapa → dialog com novos x/y e mesma descrição

### Implementation for User Story 1

- [X] T004 [US1] Render `LocalFormDialog` only when `localDraft && placement !== 'reposition'` in `frontend/src/pages/MapPage.tsx` (FR-001, FR-004)
- [X] T005 [US1] Confirm `onStartReposition` only sets `setPlacement('reposition')` and does not clear `localDraft` in `frontend/src/pages/MapPage.tsx`
- [X] T006 [US1] Confirm existing reposition click handler still updates `localDraft` x/y and sets `placement` to `'none'` in `frontend/src/pages/MapPage.tsx` (FR-003)
- [X] T007 [US1] Confirm map banner still shows reposition hint when `placementMode === 'reposition'` in `frontend/src/components/map/CampaignMap.tsx` (FR-002)

**Checkpoint**: SC-001–SC-003; FR-001–FR-004; FR-006–FR-007 inalterados (save/cancel dialog)

---

## Phase 4: User Story 2 — Cancelar no banner (Priority: P2)

**Goal**: Controlo **Cancelar** no aviso do mapa sai do reposition sem mudar coords e reabre o dialog

**Independent Test**: Reposicionar → Cancelar no banner → dialog com x/y anteriores

### Implementation for User Story 2

- [X] T008 [US2] Add **Cancelar** control to reposition banner that calls `onCancelPlacement` without triggering stage place-click in `frontend/src/components/map/CampaignMap.tsx` (FR-005)
- [X] T009 [P] [US2] Style Cancel control on banner if needed in `frontend/src/components/map/CampaignMap.css`
- [X] T010 [US2] Pass `onCancelPlacement={() => setPlacement('none')}` from `frontend/src/pages/MapPage.tsx` when GM (do not mutate `localDraft`) (SC-004)
- [X] T011 [US2] Limit visible Cancel to `placementMode === 'reposition'` only (add-pin / move-group unchanged) in `frontend/src/components/map/CampaignMap.tsx`

**Checkpoint**: SC-004; FR-005; clarificação Session 2026-08-03

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Quickstart e regressões

- [X] T012 Run scenarios A–E from `specs/032-fix-reposition-modal/quickstart.md`; fix only `MapPage.tsx` / `CampaignMap.tsx` / `CampaignMap.css` if needed
- [X] T013 [P] Confirm add-pin and move-group still work without requiring Cancel on their banners in `frontend/src/pages/MapPage.tsx` / `CampaignMap.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T003)** → **US1 (MVP)** → **US2** → **Polish**
- US1 pode ser validado antes do botão Cancelar (ainda sem saída excepto clicar no mapa)
- US2 depende de T003 + dialog já a desmontar (T004)

### User Story Dependencies

- **US1 (P1)**: MVP — mapa livre + reabrir após clique
- **US2 (P2)**: Cancelar no banner; após T004 para o dialog reaparecer ao cancelar

### Parallel Opportunities

- T001 ∥ T002
- T009 ∥ T010 após T008 (CSS vs MapPage)
- T012 ∥ T013 na polish (cuidado se ambos editarem os mesmos ficheiros)

---

## Parallel Example: After T004

```bash
Task: "Wire onCancelPlacement in MapPage.tsx"
Task: "Style Cancel on CampaignMap.css"
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T003 setup + prop
2. T004–T007 unmount dialog during reposition
3. Validar quickstart A
4. T008–T011 Cancelar
5. T012–T013 polish

### Incremental Delivery

1. US1: bug principal resolvido
2. US2: cancel descoberta
3. Polish: regressões add-pin / move-group

---

## Notes

- Não tocar backend / LocalFormDialog salvo se o botão Reposicionar precisar de ajuste trivial
- Preferir não montar o dialog a `pointer-events: none`
