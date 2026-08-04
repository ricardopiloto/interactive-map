# Tasks: Vincular Nó a Local Após a Criação

**Input**: Design documents from `/specs/029-link-node-local/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação via `quickstart.md` na fase Polish.

**Organization**: Duas user stories (P1 vínculo+snap via Rede; P2 formulário de Local). Helper BE partilhado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline e contratos 029

- [x] T001 Confirm `PUT /waypoints/{id}` accepts `local_id` without snapping Local coords in `backend/app/routers/admin/waypoints.py`
- [x] T002 [P] Confirm digitizer node list only shows `local_id` and create-time Local select in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T003 [P] Confirm `LocalFormDialog` / `LocalCreate` have no `waypoint_id` in `frontend/src/components/admin/LocalFormDialog.tsx` and `backend/app/schemas/local.py`
- [x] T004 [P] Skim `specs/029-link-node-local/contracts/api-link-node-local.md` and `specs/029-link-node-local/contracts/ui-link-node-local.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Serviço de sync + APIs com snap e `waypoint_id`

**⚠️ CRITICAL**: Completar antes das UIs

- [x] T005 Create `set_waypoint_local` / `set_local_waypoint` (unicidade + snap Local→nó; clear sem mover) in `backend/app/services/waypoint_local_link.py`
- [x] T006 Wire `update_waypoint` to call link service when `local_id` changes in `backend/app/routers/admin/waypoints.py`
- [x] T007 Add optional `waypoint_id` to `LocalCreate`, `LocalUpdate`, and `LocalRead` in `backend/app/schemas/local.py`
- [x] T008 Wire `create_local` / `update_local` (+ `_to_read` for `waypoint_id`) to call `set_local_waypoint` and snap in `backend/app/routers/admin/locais.py`
- [x] T009 [P] Add `waypoint_id` to `LocalPayload` / types as needed in `frontend/src/api/admin.ts` and `frontend/src/types/index.ts`

**Checkpoint**: curl/admin pode vincular por PUT waypoint ou Local e o pin do Local move para o nó

---

## Phase 3: User Story 1 — Vínculo na Rede de rotas (Priority: P1) 🎯 MVP

**Goal**: Editar Local de nó existente na lista; snap; desvincular; unicidade

**Independent Test**: Nó sem Local → Local noutro sítio → select na lista de nós → Local no mapa na posição do nó

### Implementation for User Story 1

- [x] T010 [US1] Add per-node Local `<select>` (Sem Local + elegíveis) calling `adminApi.updateWaypoint` in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T011 [US1] Show linked Local **name** (not only id) in the node list in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T012 [US1] Ensure create-node optional Local select still works unchanged in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T013 [US1] After link/unlink from digitizer, refresh campaign locais if needed so map pins move (hook/callback or existing `locais` prop refresh) via `frontend/src/components/gm/RouteDigitizerView.tsx` / `frontend/src/pages/MapPage.tsx`

**Checkpoint**: US1 testável — SC-001–SC-005 via Rede; FR-001–FR-008

---

## Phase 4: User Story 2 — Vínculo no formulário de Local (Priority: P2)

**Goal**: Criar/editar Local com select de nó; elegibilidade; payload `waypoint_id`

**Independent Test**: Form Local → escolher nó → gravar → Local na posição do nó; lista de nós mostra vínculo

### Implementation for User Story 2

- [x] T014 [US2] Add `waypoint_id` to `LocalFormDraft` / `localToDraft` and “Nó da rede” select (elegíveis) in `frontend/src/components/admin/LocalFormDialog.tsx`
- [x] T015 [US2] Pass waypoints into `LocalFormDialog` and hydrate `waypoint_id` when editing in `frontend/src/pages/MapPage.tsx`
- [x] T016 [US2] Include `waypoint_id` on create/update Local save payloads in `frontend/src/pages/MapPage.tsx`
- [x] T017 [US2] Optional: when user picks a node in the form, preview-update `draft.x/y` to node coords in `frontend/src/components/admin/LocalFormDialog.tsx`

**Checkpoint**: US2 testável — FR-006 / FR-009; cenários US2

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Quickstart + mensagens

- [x] T018 Run steps from `specs/029-link-node-local/quickstart.md`; fix only feature-scoped files if needed
- [x] T019 [P] Confirm conflict 422 messages are user-visible in digitizer and Local save error handling in `frontend/src/components/gm/RouteDigitizerView.tsx` / `frontend/src/pages/MapPage.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T005–T009)** → **US1** → **US2** → **Polish**
- MVP = Phase 3 (Rede); form Local pode seguir no mesmo PR
- T006 e T008 ambos dependem de T005

### User Story Dependencies

- **US1**: Após foundational (PUT waypoint + snap)
- **US2**: Após foundational (Local `waypoint_id`); independente da UI US1 mas partilha serviço

### Parallel Opportunities

- T001–T004 setup
- T007 schemas ∥ início do serviço T005
- T010–T012 digitizer vs T014–T017 Local form após T008–T009

---

## Parallel Example: After foundational

```bash
Task: "Add Local select per node in RouteDigitizerView.tsx"
Task: "Add waypoint_id field to LocalFormDialog.tsx"
```

---

## Implementation Strategy

### MVP First (US1)

1. T005–T008 serviço + routers
2. T010–T013 UI Rede
3. T014–T017 form Local
4. T018–T019 quickstart

### Incremental Delivery

1. Foundational: sync API
2. US1: Rede de rotas
3. US2: formulário Local
4. Polish

---

## Notes

- Sem migration
- Desvincular não reverte coords do Local
- Um Local ↔ um nó
