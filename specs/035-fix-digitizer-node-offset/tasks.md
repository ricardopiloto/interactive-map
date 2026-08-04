# Tasks: Corrigir offset dos nós ao traçar segmentos

**Input**: Design documents from `/specs/035-fix-digitizer-node-offset/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) alinhar referencial stage↔imagem na Rede (Traçar segmento); US2 (P2) Colocar nó / idle no mesmo referencial.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar causa (cover/aspect vs CSS 030) e contrato

- [X] T001 Skim `specs/035-fix-digitizer-node-offset/contracts/ui-digitizer-node-align.md` and `research.md` (stage aspect + `object-fit: cover`; wp already centered)
- [X] T002 [P] Confirm `.route-digitizer__stage` / `__image` / `__wp` and `onStageClick` rect math in `frontend/src/components/gm/RouteDigitizer.css` and `RouteDigitizerView.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Escolher e aplicar o referencial único stage↔imagem

**⚠️ CRITICAL**: Completar layout/frame antes das stories de validação por modo

- [X] T003 Align digitizer map frame so visible image matches 0–1 coords (prefer image-driven stage like campaign map; remove mismatched fixed `aspect-ratio` + `object-fit: cover` crop) in `frontend/src/components/gm/RouteDigitizer.css` and `RouteDigitizerView.tsx` if markup needed
- [X] T004 Ensure `onStageClick` uses the same element box as waypoint `left`/`top` % and SVG overlay parent in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-004: no DB rewrite)

**Checkpoint**: Um rectângulo de conteúdo; clique e marcadores no mesmo espaço

---

## Phase 3: User Story 1 — Traçar segmento alinhado (Priority: P1) 🎯 MVP

**Goal**: Em Traçar segmento, nós centrados no ponto do mapa; snap/selecção fiável; linhas coerentes

**Independent Test**: Traçar segmento → nó sobre feature óbvia; zoom; linha liga centros

### Implementation for User Story 1

- [X] T005 [US1] Keep `.route-digitizer__wp` center-anchored (do not copy campaign pin tip margins) in `frontend/src/components/gm/RouteDigitizer.css`
- [X] T006 [US1] Confirm SVG segment polylines (`viewBox 0 0 100 100`) still share the aligned stage with waypoints in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-005)
- [X] T007 [US1] Confirm draw-seg origin/finish snap + node button clicks still work after frame change in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-006)

**Checkpoint**: SC-001, SC-003, SC-004; FR-001, FR-003, FR-005–006

---

## Phase 4: User Story 2 — Colocar nó / idle (Priority: P2)

**Goal**: Mesmo alinhamento ao colocar nó e com a Rede idle

**Independent Test**: Colocar nó no cruzamento → marcador no sítio; idle igual

### Implementation for User Story 2

- [X] T008 [US2] Confirm `place-wp` path uses the same stage click math as draw-seg in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-002, SC-002)
- [X] T009 [US2] Confirm idle view shows the same `__wp` markers without a second positioning path in `frontend/src/components/gm/RouteDigitizerView.tsx`

**Checkpoint**: SC-002; FR-002

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Quickstart e não regressão 034

- [X] T010 Run scenarios A–E from `specs/035-fix-digitizer-node-offset/quickstart.md`; fix only digitizer files if needed
- [X] T011 [P] Confirm `CampaignMap.css` pin styles unchanged (034) in `frontend/src/components/map/CampaignMap.css` (FR-007)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T003–T004)** → **US1** → **US2** → **Polish**
- US2 é sobretudo verificação após o mesmo frame da foundational

### User Story Dependencies

- **US1 (P1)**: MVP — Traçar segmento alinhado
- **US2 (P2)**: Confirma Colocar nó / idle no mesmo fix

### Parallel Opportunities

- T001 ∥ T002
- T005 pode ir com T006 após T003 (CSS vs TSX)
- T010 ∥ T011

---

## Parallel Example: After T003

```bash
Task: "Verify SVG polylines share stage in RouteDigitizerView.tsx"
Task: "Keep wp center anchor in RouteDigitizer.css"
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T004 setup + frame align
2. T005–T007 draw-seg validation
3. T008–T009 place-wp / idle
4. T010–T011 polish

### Incremental Delivery

1. Foundational: referencial único
2. US1: Traçar segmento
3. US2: Colocar nó
4. Polish

---

## Notes

- Do not apply 030 tip-origin CSS to digitizer nodes
- Do not bulk-update waypoint `x/y` in the database
- Prefer matching campaign map’s image-driven sizing over `cover` crop
