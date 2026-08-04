# Tasks: Título da Rota pelo Tipo de Via

**Input**: Design documents from `/specs/025-route-type-title/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação via `quickstart.md` na fase Polish.

**Organization**: Duas user stories (P1 título por tipo; P2 mistos + desambiguação). Só FE em `RoutePlannerPanel`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline 024 e contrato 025

- [x] T001 Confirm list title uses `Rota {i + 1}` and secondary `tipos` span in `frontend/src/components/routes/RoutePlannerPanel.tsx` per `specs/025-route-type-title/plan.md`
- [x] T002 [P] Skim `specs/025-route-type-title/contracts/ui-route-type-title.md` and `specs/025-route-type-title/research.md` (labels PT; dedupe `(2)`; remove tipos line)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Helpers de título partilhados pelas stories

**⚠️ CRITICAL**: Completar antes das user stories de render

- [x] T003 Add `formatRouteTipoLabel` / `routeTitleBase(tipos)` helpers (rio→Rio, empty→Rota; join with `", "`) in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T004 Add `disambiguateRouteTitles(bases: string[])` that returns display titles with `(2)`, `(3)` only for duplicates in `frontend/src/components/routes/RoutePlannerPanel.tsx`

**Checkpoint**: Helpers prontos; sem UI final ainda obrigatória

---

## Phase 3: User Story 1 — Título pelo tipo (Priority: P1) 🎯 MVP

**Goal**: Título = tipo capitalizado; sem “Rota N”; sem linha secundária de tipos; “mais rápida” no #1

**Independent Test**: Rota só-rio → título “Rio”; sem linha tipos; distância/tempo visíveis

### Implementation for User Story 1

- [x] T005 [US1] Compute display titles for `plan` via helpers and render title as tipo (not `Rota N`) in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T006 [US1] Keep ` · mais rápida` (or equivalent) on index 0 without restoring `Rota N` in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T007 [US1] Remove the secondary `route-planner__tipos` line from list items in `frontend/src/components/routes/RoutePlannerPanel.tsx`

**Checkpoint**: US1 testável — SC-001; clarificação A

---

## Phase 4: User Story 2 — Mistos e duplicados (Priority: P2)

**Goal**: Títulos multi-tipo; desambiguação “Estrada (2)”; fallback “Rota”

**Independent Test**: Misto → “Estrada, Rio”; duas estradas → “Estrada” / “Estrada (2)”

### Implementation for User Story 2

- [x] T008 [US2] Ensure multi-tipo bases join all labels (FR-003) via `routeTitleBase` in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T009 [US2] Wire `disambiguateRouteTitles` so duplicate bases get `(2)`+ and first stays bare in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T010 [US2] Confirm empty `tipos` falls back to title `Rota` in `frontend/src/components/routes/RoutePlannerPanel.tsx`

**Checkpoint**: US2 testável — SC-002 / SC-004

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: CSS + quickstart

- [x] T011 Remove unused `.route-planner__tipos` from `frontend/src/components/routes/RoutePlanner.css` if no longer referenced
- [x] T012 Run steps from `specs/025-route-type-title/quickstart.md` and adjust only `RoutePlannerPanel.tsx` / CSS if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → **US1** → **US2** → **Polish**
- MVP = Phase 3 (US1); T004/T009 cobrem duplicados (podem ir no mesmo PR)

### User Story Dependencies

- **US1**: Após helpers T003 (T004 útil mas US1 pode mostrar título simples)
- **US2**: Depende de T003–T004 + render US1

### Parallel Opportunities

- T001 ∥ T002
- T011 ∥ revisão visual T012 (cuidado no mesmo CSS)

---

## Parallel Example: Setup

```bash
Task: "Confirm Rota N + tipos span in RoutePlannerPanel.tsx"
Task: "Skim ui-route-type-title.md and research.md"
```

---

## Implementation Strategy

### MVP First (US1)

1. Helpers T003 (+ T004)
2. T005–T007 títulos + remover linha tipos
3. Smoke Rio / Estrada
4. T008–T010 mistos/duplicados + quickstart

### Incremental Delivery

1. US1: título por tipo
2. US2: mistos + `(2)`
3. Polish: CSS + quickstart

---

## Notes

- Sem mudanças de backend/API
- Ordem da lista = ordem da API (mais rápida primeiro) para contagem de duplicados
- Implemented 2026-08-03: título = tipo(s); dedupe `(2)`; linha tipos removida; ` · mais rápida` no #1
