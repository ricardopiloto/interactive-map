# Tasks: Digitizer Node Hit Aura

**Input**: Design documents from `/specs/041-digitizer-node-aura/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) zona clicável/snap menor e unificada; US2 (P1) aura sempre visível alinhada à zona + activo distinto.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e constantes actuais

- [X] T001 Skim `specs/041-digitizer-node-aura/contracts/ui-digitizer-node-aura.md`, `research.md`, and `data-model.md` (`NODE_SNAP` único ~0.01; aura CSS; activo distinto)
- [X] T002 [P] Confirm `ORIGIN_SNAP`/`FINISH_SNAP`, `nearestWaypoint` call sites, and `.route-digitizer__wp` styles in `frontend/src/components/gm/RouteDigitizerView.tsx` and `RouteDigitizer.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Constante única de snap pronta para ambos os fluxos

**⚠️ CRITICAL**: Completar antes das stories de UI

- [X] T003 Replace `ORIGIN_SNAP` and `FINISH_SNAP` with a single `NODE_SNAP` (≤ ~0.021, recommend ~0.01) in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-001, FR-003a, SC-001)
- [X] T004 Wire both origin and finish `nearestWaypoint` calls to use `NODE_SNAP` in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-003a, FR-006)

**Checkpoint**: Origem e fecho usam o mesmo raio; sem referências a ORIGIN/FINISH snap

---

## Phase 3: User Story 1 — Smaller, honest click target (Priority: P1) 🎯 MVP

**Goal**: Zona de pick apertada; cliques fora da zona não agarram o nó

**Independent Test**: Nós próximos — clique fora da nova zona não selecciona; dentro selecciona (origem e fecho)

### Implementation for User Story 1

- [X] T005 [US1] Ensure `__wp` hit box does not contradict the smaller snap (padding/size aligned to intended zone, not larger than aura will show) in `frontend/src/components/gm/RouteDigitizer.css` and/or `RouteDigitizerView.tsx` (FR-001, FR-003, SC-003)
- [X] T006 [US1] Spot-check place-wp / draw-seg still complete with the tighter snap in `frontend/src/components/gm/RouteDigitizerView.tsx` (FR-006)

**Checkpoint**: SC-001, SC-003 (pick half); quickstart B–C

---

## Phase 4: User Story 2 — See the clickable zone (Priority: P1)

**Goal**: Aura sempre visível em cada nó; coincide com a zona; activo distinto

**Independent Test**: Abrir Rede — todas as auras visíveis; clique dentro/fora; origem activa óbvia

### Implementation for User Story 2

- [X] T007 [US2] Add always-on aura (box-shadow and/or `::before`) on `.route-digitizer__wp`, counter-scaled with `--map-zoom`, sized to read as the pick zone in `frontend/src/components/gm/RouteDigitizer.css` (FR-002, FR-004, SC-002)
- [X] T008 [US2] Keep `.route-digitizer__wp.is-active` visually stronger/distinct from default aura in `frontend/src/components/gm/RouteDigitizer.css` (FR-005, SC-004)
- [X] T009 [US2] Tune aura extent vs `NODE_SNAP` so inside-aura / outside-aura clicks match (adjust CSS and/or `NODE_SNAP` slightly) in `RouteDigitizer.css` / `RouteDigitizerView.tsx` (FR-003, SC-003)

**Checkpoint**: SC-002–004; quickstart A, D, E

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Regressão, quickstart, changelog

- [X] T010 Confirm campaign map pins/party hit targets unchanged (no edits to `frontend/src/components/map/CampaignMap.tsx` / `.css`) (FR-007); run quickstart F
- [X] T011 Run scenarios A–F from `specs/041-digitizer-node-aura/quickstart.md`; fix only digitizer files if needed
- [X] T012 [P] Note change in `CHANGELOG.md` under next release after 0.6.3 (Added/Changed: aura + zona de clique menor na Rede de rotas)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003–T004) → **US1** (T005–T006) → **US2** (T007–T009) → **Polish** (T010–T012)
- US2 aura tuning (T009) may adjust `NODE_SNAP` set in foundational — allowed

### User Story Dependencies

- **US1 (P1)**: MVP — snap unificado menor
- **US2 (P1)**: Aura (pode seguir logo a seguir no mesmo PR; T009 alinha com US1)

### Parallel Opportunities

- T001 ∥ T002
- T007 ∥ T008 (mesmo CSS — preferir sequencial se conflitar)
- T011 ∥ T012 após implementação

---

## Parallel Example: After T004

```bash
Task: "Align __wp hit box to smaller zone in RouteDigitizer.css"
Task: "Add always-on aura styles on .route-digitizer__wp"  # can start in parallel if careful
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T004 unify + shrink snap
2. T005–T006 hit box / flow check
3. T007–T009 aura + active + tune
4. T010–T012 polish

### Incremental Delivery

1. Foundational: `NODE_SNAP`
2. US1: honest smaller pick
3. US2: visible aura
4. Polish

---

## Notes

- Do not touch CampaignMap
- Prefer CSS aura over extra DOM nodes
- Disk fill ~11px may stay; aura may extend slightly beyond fill
