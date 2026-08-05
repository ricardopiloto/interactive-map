# Tasks: Refine Segment Stroke Weight

**Input**: Design documents from `/specs/048-refine-segment-stroke/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) traço normal/draft ~⅔; US2 (P2) hover ~⅔ com hit intacto.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e baseline CSS actual

- [X] T001 Skim `specs/048-refine-segment-stroke/contracts/ui-refine-segment-stroke.md`, `research.md`, and `data-model.md` (1.5→1.0, hover 3.5→2.3, hit 12)
- [X] T002 [P] Confirm `.route-digitizer__seg` / `.is-hovered` / `__seg-hit` / `--draft` stroke rules in `frontend/src/components/gm/RouteDigitizer.css`
- [X] T003 [P] Confirm segment SVG uses CSS classes only (no hardcoded strokeWidth) in `frontend/src/components/gm/RouteDigitizerView.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Alvos numéricos locked antes de editar CSS

**⚠️ CRITICAL**: Completar antes das user stories

- [X] T004 Record target widths for implement: normal/draft `1.0`, hover `2.3`, hit unchanged `12` per `specs/048-refine-segment-stroke/research.md`

**Checkpoint**: Targets clear; no CampaignMap changes planned

---

## Phase 3: User Story 1 — Segmentos mais finos (Priority: P1) 🎯 MVP

**Goal**: Traço normal e draft ~⅔ do peso actual (~1.0); tipos ainda distinguíveis

**Independent Test**: Abrir Rede; segmentos e draft claramente mais finos; mapa mais legível

### Implementation for User Story 1

- [X] T005 [US1] Set `.route-digitizer__seg` `stroke-width` from `1.5` to `1.0` in `frontend/src/components/gm/RouteDigitizer.css` (FR-001/002, SC-001)
- [X] T006 [US1] Spot-check estrada/rio/trilha + draft still distinguishable after thinness in Rede (FR-003, SC-003); optionally nudge `stroke-dasharray` on `--trilha` / `--draft` in `frontend/src/components/gm/RouteDigitizer.css` only if dashes look oversized
- [X] T007 [US1] Confirm no stroke changes in `frontend/src/components/map/CampaignMap.css` or route overlay files (FR-007)

**Checkpoint**: SC-001–003; MVP thinner segments

---

## Phase 4: User Story 2 — Hover usável (Priority: P2)

**Goal**: Hover stroke ~⅔ (~2.3); hit area permanece larga

**Independent Test**: Idle hover: destaque visível mas proporcional; fácil de acertar

### Implementation for User Story 2

- [X] T008 [US2] Set `.route-digitizer__seg.is-hovered` `stroke-width` from `3.5` to `2.3` in `frontend/src/components/gm/RouteDigitizer.css` (FR-004, SC-004)
- [X] T009 [US2] Leave `.route-digitizer__seg-hit` `stroke-width` at `12` in `frontend/src/components/gm/RouteDigitizer.css` (FR-005)
- [X] T010 [US2] Smoke hover on ≥3 segments in idle; confirm tooltip/list still work (SC-004)

**Checkpoint**: SC-004; hover ratio preserved

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Regressão, quickstart, changelog

- [X] T011 Confirm nodes/auras untouched in `frontend/src/components/gm/RouteDigitizer.css` (FR-006); run place-node + draw-segment smoke (SC-005)
- [X] T012 Run scenarios A–F from `specs/048-refine-segment-stroke/quickstart.md`; tune only `1.0` / `2.3` constants in `frontend/src/components/gm/RouteDigitizer.css` if QA needs ± small adjust within ~⅔ feel
- [X] T013 [P] Note change in `CHANGELOG.md` under next patch: Rede segment strokes refined (~⅔ normal + hover)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T003) → **Foundational** (T004) → **US1** (T005–T007) → **US2** (T008–T010) → **Polish** (T011–T013)
- US2 hover edit is same file as US1 — run after T005

### User Story Dependencies

- **US1 (P1)**: MVP base stroke
- **US2 (P2)**: Hover scale after base width set

### Parallel Opportunities

- T002 ∥ T003
- T007 can accompany T005 as checklist (different files)
- T013 ∥ T011 after CSS done

---

## Parallel Example: After T004

```bash
Task: "Set .route-digitizer__seg stroke-width to 1.0 in RouteDigitizer.css"
# Then:
Task: "Set .is-hovered stroke-width to 2.3; keep __seg-hit at 12"
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T004 confirm targets
2. T005–T007 base/draft 1.0
3. T008–T010 hover 2.3
4. T011–T013 polish + changelog

### Incremental Delivery

1. Thinner saved/draft lines
2. Proportional hover
3. Quickstart + changelog

---

## Notes

- CSS only; do not change TSX unless a hardcoded stroke is found
- Do not thin `__seg-hit`
- Do not touch CampaignMap / RouteOverlay strokes
