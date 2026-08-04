# Tasks: Segment Hover Info

**Input**: Design documents from `/specs/044-segment-hover-info/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) identidade no hover (tooltip + lista); US2 (P2) ênfase visual do traço.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e estado actual do digitizer

- [X] T001 Skim `specs/044-segment-hover-info/contracts/ui-segment-hover-info.md`, `research.md`, and `data-model.md` (tooltip + list highlight; wide hit; draft excluded)
- [X] T002 [P] Confirm segment SVG (`pointer-events: none` on `__segs`), Segmentos list markup, and `removeSegment` in `frontend/src/components/gm/RouteDigitizerView.tsx` and `RouteDigitizer.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Hit targets + hover state partilhados pelas stories

**⚠️ CRITICAL**: Completar antes das user stories

- [X] T003 Enable pointer events on saved-segment hit targets (wide transparent stroke or dual polyline; SVG root no longer blocks children) in `frontend/src/components/gm/RouteDigitizer.css` and `RouteDigitizerView.tsx` (research §1)
- [X] T004 Add `hoveredSegmentId` state (`number | null`) with pointer enter/leave on saved segments only (not draft) in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-007)
- [X] T005 Ensure segment hit targets do not `stopPropagation` on click so stage draw/place still receives bubbled clicks in `frontend/src/components/gm/RouteDigitizerView.tsx` (research §6)

**Checkpoint**: Hover sobre traço fino activa `hoveredSegmentId`; draft ignorado; cliques de desenho ainda funcionam

---

## Phase 3: User Story 1 — Identify segment on hover (Priority: P1) 🎯 MVP

**Goal**: Tooltip/rótulo no mapa com identidade + destaque (e scroll) da linha na lista Segmentos

**Independent Test**: Hover num segmento gravado → tooltip A↔B · tipo · mi e linha da lista destacada; sair limpa ambos

### Implementation for User Story 1

- [X] T006 [US1] Build segment identity display string (prefer waypoint `nome`, else id-style; include tipo + distância) in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-002, FR-003)
- [X] T007 [US1] Render map tooltip/label when `hoveredSegmentId` is set (position near pointer or stage) in `frontend/src/components/gm/RouteDigitizerView.tsx` and style in `RouteDigitizer.css` (FR-001, FR-009)
- [X] T008 [US1] Highlight matching Segmentos `<li>` while hovered and `scrollIntoView({ block: 'nearest' })` on enter in `frontend/src/components/gm/RouteDigitizerView.tsx` + `RouteDigitizer.css` (FR-009, FR-010)
- [X] T009 [US1] Clear tooltip and list highlight when pointer leaves the segment in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-004, SC-005)

**Checkpoint**: SC-001, SC-005; quickstart A–C, E–F

---

## Phase 4: User Story 2 — Emphasize hovered stroke (Priority: P2)

**Goal**: Traço sob o rato claramente distinto dos outros segmentos gravados

**Independent Test**: Hover → traço enfatizado; leave → aparência normal

### Implementation for User Story 2

- [X] T010 [US2] Add hovered stroke CSS (thicker/brighter; type color still readable) on `.route-digitizer__seg` when hovered in `frontend/src/components/gm/RouteDigitizer.css` (FR-005)
- [X] T011 [US2] Apply hovered class to the active saved polyline from `hoveredSegmentId` in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-005)

**Checkpoint**: US2 acceptance; quickstart D

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Regressão, quickstart, changelog

- [X] T012 Confirm hover never deletes; list **Apagar** still works; draft has no saved-segment hover identity (FR-006, FR-007); run quickstart G–H
- [X] T013 Confirm CampaignMap / planner untouched and base stroke width unchanged (FR-008); run quickstart I
- [X] T014 Run scenarios A–I from `specs/044-segment-hover-info/quickstart.md`; tune hit width / tooltip only in digitizer files if needed
- [X] T015 [P] Note change in `CHANGELOG.md` under next patch (Added/Changed: hover de segmento com identidade + destaque na lista na Rede de rotas)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003–T005) → **US1** (T006–T009) → **US2** (T010–T011) → **Polish** (T012–T015)
- US2 pode seguir imediatamente após foundational se US1 tooltip ainda incompleto, mas o estado `hoveredSegmentId` (T004) é partilhado — preferir US1 depois US2 no mesmo PR

### User Story Dependencies

- **US1 (P1)**: MVP — identidade + lista
- **US2 (P2)**: Ênfase visual (depende de T004)

### Parallel Opportunities

- T001 ∥ T002
- T007 ∥ T008 após T006 (tooltip vs lista — mesmo TSX: sequencial se conflitar)
- T010 (CSS) ∥ T007 após T004 se ficheiros diferentes
- T014 ∥ T015 após implementação

---

## Parallel Example: After T004

```bash
Task: "Render map tooltip for hovered segment identity in RouteDigitizerView.tsx"
Task: "Add hovered stroke CSS in RouteDigitizer.css"  # US2 can start in parallel carefully
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T005 hit + hover state
2. T006–T009 tooltip + list
3. T010–T011 stroke emphasis
4. T012–T015 polish

### Incremental Delivery

1. Foundational: hittable segments + state
2. US1: identify for delete
3. US2: see which line
4. Polish

---

## Notes

- Do not touch CampaignMap or planner
- Do not add delete-on-hover or map-click delete
- Keep painted stroke thin; widen hit only
