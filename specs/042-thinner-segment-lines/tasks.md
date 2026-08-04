# Tasks: Thinner Segment Lines

**Input**: Design documents from `/specs/042-thinner-segment-lines/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) traços de segmento mais finos na Rede de rotas (gravados + rascunho).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline e contrato

- [X] T001 Skim `specs/042-thinner-segment-lines/contracts/ui-thinner-segment-lines.md` and `research.md` (target `stroke-width` ~1.5; digitizer-only)
- [X] T002 [P] Confirm `.route-digitizer__seg` / `--draft` / type modifiers and SVG usage in `frontend/src/components/gm/RouteDigitizer.css` and `RouteDigitizerView.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Nenhum pré-requisito de infra — só CSS

- [X] T003 Confirm no hardcoded stroke widths in `frontend/src/components/gm/RouteDigitizerView.tsx` (strokes are CSS-class driven)

**Checkpoint**: Único ponto de mudança = CSS `.route-digitizer__seg`

---

## Phase 3: User Story 1 — Trace roads more precisely (Priority: P1) 🎯 MVP

**Goal**: Segmentos e rascunho ≤ ~60% da espessura anterior; tipos distinguíveis; mapa mais legível por baixo

**Independent Test**: Abrir Rede → traços mais finos; rascunho fino; estrada/rio/trilha ainda distintos

### Implementation for User Story 1

- [X] T004 [US1] Reduce `.route-digitizer__seg` `stroke-width` from `2.5` to `1.5` (≤ 60%) in `frontend/src/components/gm/RouteDigitizer.css` (FR-001, FR-002, SC-001)
- [X] T005 [P] [US1] Optionally scale `--trilha` and `--draft` `stroke-dasharray` slightly to match thinner stroke in `frontend/src/components/gm/RouteDigitizer.css` (FR-003)
- [X] T006 [US1] Verify type colors unchanged and draft inherits base thinness via shared `.route-digitizer__seg` class in `frontend/src/components/gm/RouteDigitizer.css` (FR-003, SC-003)

**Checkpoint**: SC-001–003; quickstart A–C

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Regressão, quickstart, changelog

- [X] T007 Confirm no edits to `frontend/src/components/routes/RouteOverlay.tsx` or campaign lore connection strokes (FR-006); smoke draw-seg/place-wp (FR-004, SC-004); nodes/aura untouched (FR-005)
- [X] T008 Run scenarios A–E from `specs/042-thinner-segment-lines/quickstart.md`; adjust only digitizer CSS if visibility needs a nudge within SC-001
- [X] T009 [P] Note change in `CHANGELOG.md` (Changed: linhas de segmento mais finas na Rede de rotas)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** (T003) → **US1** (T004–T006) → **Polish** (T007–T009)

### User Story Dependencies

- **US1 (P1)**: Entire feature

### Parallel Opportunities

- T001 ∥ T002
- T004 then T005 (same file — sequential preferred)
- T008 ∥ T009 after implementation

---

## Parallel Example: After T003

```bash
Task: "Set stroke-width 1.5 on .route-digitizer__seg"
Task: "Optionally scale dasharray for trilha/draft"  # after T004 in same CSS file
```

---

## Implementation Strategy

### MVP First

1. T001–T003 confirm CSS-only path
2. T004 set width 1.5
3. T005–T006 dashes/types
4. T007–T009 polish

### Incremental Delivery

1. Thinner stroke
2. Dash polish
3. Regression + changelog

---

## Notes

- Do not change RouteOverlay or CampaignMap connection lines
- Do not change NODE_SNAP / aura / disk
- Prefer 1.5; may go to ~1.4 only if still too thick in QA
