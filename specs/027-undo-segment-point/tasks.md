# Tasks: Desfazer Último Ponto do Segmento (Botão Direito)

**Input**: Design documents from `/specs/027-undo-segment-point/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação via `quickstart.md` na fase Polish.

**Organization**: Duas user stories (P1 desfazer intermédios; P2 limpar origem). Só FE em `RouteDigitizerView.tsx`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline e contrato 027

- [x] T001 Confirm `mode === 'draw-seg'`, `draftA`, and `draftMids` draft flow in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T002 [P] Skim `specs/027-undo-segment-point/contracts/ui-undo-segment-point.md` and `specs/027-undo-segment-point/research.md` (contextmenu on stage + waypoints; pop mids then clear origin; preventDefault)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Helper de undo partilhado pelas stories

**⚠️ CRITICAL**: Completar antes de ligar `onContextMenu` nas stories

- [x] T003 Add `undoDraftPoint` (or equivalent) in `frontend/src/components/gm/RouteDigitizerView.tsx`: if not `draw-seg` or `busy`, no-op (still allow callers to preventDefault when draw-seg); if `draftMids.length > 0` pop last; else if `draftA != null` clear `draftA` and mids; never set `mode` to `idle`
- [x] T004 Add `onContextMenu` handler on `.route-digitizer__stage` in `frontend/src/components/gm/RouteDigitizerView.tsx` that `preventDefault`s when `mode === 'draw-seg'` and calls `undoDraftPoint`

**Checkpoint**: Stage right-click wired; waypoint handlers still pending for full node coverage

---

## Phase 3: User Story 1 — Desfazer último intermédio (Priority: P1) 🎯 MVP

**Goal**: Botão direito remove o último ponto intermédio; menu browser bloqueado; segmentos guardados intactos

**Independent Test**: Traçar segmento → origem → ≥1 mid → direito → some só o último mid; polyline atualiza

### Implementation for User Story 1

- [x] T005 [US1] Ensure `undoDraftPoint` pops exactly one mid per call and keeps `draftA` / remaining mids in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T006 [US1] Add `onContextMenu` on each `.route-digitizer__wp` button in `frontend/src/components/gm/RouteDigitizerView.tsx`: `preventDefault`, `stopPropagation`, call `undoDraftPoint` (never trigger save/finish)
- [x] T007 [US1] Verify left-click on destination waypoint still creates segment via existing `onClick` in `frontend/src/components/gm/RouteDigitizerView.tsx`

**Checkpoint**: US1 testável — SC-001 / SC-003 / SC-004; direito no nó = undo

---

## Phase 4: User Story 2 — Limpar origem sem mids (Priority: P2)

**Goal**: Com só origem, direito limpa `draftA`; modo `draw-seg` permanece; sem origem = no-op seguro

**Independent Test**: Origem sem mids → direito → origem limpa; Traçar segmento ainda ativo

### Implementation for User Story 2

- [x] T008 [US2] Confirm `undoDraftPoint` clears `draftA` when mids empty and leaves `mode === 'draw-seg'` in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T009 [US2] Confirm empty draft (`draftA == null`) right-click is no-op without error and still `preventDefault`s in `frontend/src/components/gm/RouteDigitizerView.tsx`

**Checkpoint**: US2 testável — clarificação B; FR-003 / FR-004

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Hint + quickstart

- [x] T010 Update `route-digitizer__hint` copy in `frontend/src/components/gm/RouteDigitizerView.tsx` to mention right-click undoes last point (when `draw-seg`)
- [x] T011 Run steps from `specs/027-undo-segment-point/quickstart.md` and fix only `RouteDigitizerView.tsx` if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T003–T004)** → **US1** → **US2** → **Polish**
- MVP = Phase 3 (US1); T003 já inclui ramo de limpar origem → US2 é sobretudo verificação
- T006 [US1] depende de T003; T004 e T006 ambos usam o helper

### User Story Dependencies

- **US1**: Após T003–T004; inclui nós (T006)
- **US2**: Mesmo helper; validar após US1

### Parallel Opportunities

- T001 ∥ T002
- Pouco paralelismo de ficheiros (um só TSX) — sequência no mesmo arquivo

---

## Parallel Example: Setup

```bash
Task: "Confirm draftA/draftMids in RouteDigitizerView.tsx"
Task: "Skim ui-undo-segment-point.md and research.md"
```

---

## Implementation Strategy

### MVP First (US1)

1. T003–T004 helper + stage contextmenu
2. T005–T007 pop mid + waypoint contextmenu + left-click save intact
3. T008–T009 origem / no-op
4. T010–T011 hint + quickstart

### Incremental Delivery

1. US1: desfazer intermédios (mapa + nó)
2. US2: limpar origem
3. Polish: hint + validação manual

---

## Notes

- Sem mudanças de backend/API/CSS obrigatórias
- Não chamar `deleteWaypoint` / `deleteRouteSegment` a partir do direito
- Quando `busy`, não mutar rascunho (só preventDefault se draw-seg)
- Implemented 2026-08-03: `undoDraftPoint` + `onDrawSegContextMenu` no stage e nós; hint atualizado. Validação visual com botão direito fica para o utilizador.
