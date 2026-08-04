# Tasks: Zona Menor de Finalização de Segmento

**Input**: Design documents from `/specs/023-segment-finish-zone/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: Três user stories (P1 zona de finalização ~⅓; P2 origem intacta; P3 dica). Alteração cirúrgica em `nearestWaypoint` / `onStageClick` em `RouteDigitizerView`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes)
- **[Story]**: US1 / US2 / US3 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar ponto de mudança e contrato

- [x] T001 Confirm `nearestWaypoint(x, y, maxDist = 0.03)` and `draw-seg` stage-click finish path in `frontend/src/components/gm/RouteDigitizerView.tsx` per `specs/023-segment-finish-zone/plan.md`
- [x] T002 [P] Skim `specs/023-segment-finish-zone/contracts/ui-segment-finish-zone.md` and `specs/023-segment-finish-zone/research.md` (ORIGIN_SNAP `0.03`, FINISH_SNAP `0.01`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Baseline atual — nenhuma infra nova

**⚠️ CRITICAL**: Completar antes das user stories

- [x] T003 Note current single `maxDist = 0.03` applies to both origin pick and finish in `frontend/src/components/gm/RouteDigitizerView.tsx`; plan is dual radii only — no backend/CSS pin resize required

**Checkpoint**: Alvo claro — origem 0.03; finalização 0.01; marcador fecha sempre

---

## Phase 3: User Story 1 — Finalizar segmento só perto do destino (Priority: P1) 🎯 MVP

**Goal**: Com origem definida, clique no mapa só fecha o segmento se estiver dentro de ~⅓ da zona antiga (0.01); senão adiciona intermediário

**Independent Test**: Traçar segmento → clique na faixa antiga (~0.02 do destino) → intermediário; clique em ~0.01 ou no marcador → grava

### Implementation for User Story 1

- [x] T004 [US1] Introduce named snap constants `ORIGIN_SNAP = 0.03` and `FINISH_SNAP = 0.01` near `nearestWaypoint` in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T005 [US1] In `onStageClick` `draw-seg` when `draftA != null`, call `nearestWaypoint(x, y, FINISH_SNAP)` so only close hits finish; otherwise append mid point in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T006 [US1] Verify waypoint button `onClick` still saves segment on destination marker click (FR-004) without depending on `FINISH_SNAP` in `frontend/src/components/gm/RouteDigitizerView.tsx`

**Checkpoint**: US1 testável — zona de fechamento ~⅓; intermediários mais perto do destino

---

## Phase 4: User Story 2 — Escolher origem sem regressão (Priority: P2)

**Goal**: Seleção de origem continua com raio 0.03

**Independent Test**: Traçar segmento sem origem → clique perto do nó (zona atual) → origem seleciona facilmente

### Implementation for User Story 2

- [x] T007 [US2] In `onStageClick` `draw-seg` when `draftA == null`, call `nearestWaypoint(x, y, ORIGIN_SNAP)` (0.03) in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T008 [US2] Confirm origin path does not accidentally use `FINISH_SNAP` and error message for missing origin hit remains sensible in `frontend/src/components/gm/RouteDigitizerView.tsx`

**Checkpoint**: US2 testável — SC-004 / FR-003

---

## Phase 5: User Story 3 — Feedback claro de como fechar (Priority: P3)

**Goal**: Dica deixa claro que é preciso clicar no (ou bem junto ao) nó de destino; clique longe sem erro alarmante

**Independent Test**: Com origem escolhida, ler hint; clique longe → intermediário sem alerta; fechar no nó → sucesso

### Implementation for User Story 3

- [x] T009 [US3] Update draw-seg hint copy when `draftA` is set to emphasize clicking the destination node (or very near it) in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T010 [US3] Confirm far clicks with active draft only add mids / do not set alarming `setError` for “missed finish” in `frontend/src/components/gm/RouteDigitizerView.tsx`

**Checkpoint**: US3 testável — orientação clara, sem erro falso

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação quickstart

- [x] T011 Run all steps from `specs/023-segment-finish-zone/quickstart.md` and adjust only snap constants / hint in `frontend/src/components/gm/RouteDigitizerView.tsx` if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → **US1** → **US2** → **US3** → **Polish**
- MVP = Phase 3 (US1); T007 costuma ir no mesmo PR que T005 (mesmo `onStageClick`)

### User Story Dependencies

- **US1 (P1)**: Após Foundational; entrega `FINISH_SNAP`
- **US2 (P2)**: Complementa o mesmo `onStageClick` com `ORIGIN_SNAP` explícito
- **US3 (P3)**: Após comportamento de US1; só copy / ausência de erro

### Parallel Opportunities

- T001 e T002 em Setup
- T004–T010 sequenciais no mesmo arquivo (não marcar [P] entre si)

---

## Parallel Example: Setup

```bash
Task: "Confirm nearestWaypoint / draw-seg in RouteDigitizerView.tsx"
Task: "Skim ui-segment-finish-zone.md and research.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + Foundational
2. T004–T006 (`FINISH_SNAP` + stage finish path + marker)
3. Quick visual: intermediário na faixa antiga; fechar perto / no marcador
4. T007–T010 + T011 no mesmo ciclo (arquivo único)

### Incremental Delivery

1. US1: finalização 0.01
2. US2: origem 0.03 explícita
3. US3: hint
4. Polish: quickstart

---

## Notes

- Um único arquivo esperado: `RouteDigitizerView.tsx`
- Não alterar tamanho CSS do pin nesta feature
- Distâncias em coords 0–1 (zoom não muda a zona)
- Implemented 2026-08-03: `ORIGIN_SNAP=0.03`, `FINISH_SNAP=0.01`; raios distintos em `onStageClick`; clique no marcador inalterado; hint atualizado
