# Tasks: Route Type Coverage in Alternatives

**Input**: Design documents from `/specs/056-route-type-coverage/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual QA via quickstart / API curls — no automated TDD suite requested.

**Organization**: US1 = Altdorf→Ubersreik pure Estrada under Mais rápida; US2 = general pure-type coverage + preferência independence; US3 = ≤6 + keep #1 / sort invariants.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock contract and current planner touch points

- [x] T001 Skim `specs/056-route-type-coverage/contracts/api-route-type-coverage.md` and `research.md` (§2 type-restricted search, §3 assemble ≤6)
- [x] T002 [P] Confirm current mixed discovery loop and sort keys in `backend/app/services/route_planner.py` (`plan_routes`, `build_graph`, `edge_variants_for_path`, `K_MAX`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Helpers for type-restricted graphs and candidate sort/dedup before story wiring

**⚠️ CRITICAL**: Complete before user-story assembly changes

- [x] T003 Add helper to build a type-restricted NetworkX graph from `parallels` for a given `tipo` (estrada|rio|trilha), applying the same soft `preferencia_via` weight multipliers as mixed edges, in `backend/app/services/route_planner.py` (research §2)
- [x] T004 [P] Add helper to materialize the best pure `RoutePlanItem` for origem→destino on that restricted graph (shortest path by `tempo` / `peso_barata`; hops filtered to `tipo` only so `tipos == [tipo]`) in `backend/app/services/route_planner.py`
- [x] T005 Extract or reuse shared candidate sort key + segment-signature dedup used by mixed pool so pures and mixes share the same ranking rules in `backend/app/services/route_planner.py`

**Checkpoint**: Can compute a pure-estrada item for Altdorf→Ubersreik in isolation; API behavior still unchanged until assembly lands

---

## Phase 3: User Story 1 — Ver Estrada pura Altdorf → Ubersreik (Priority: P1) 🎯 MVP

**Goal**: Mais rápida Altdorf→Ubersreik returns ≥1 `tipos == ["estrada"]`

**Independent Test**: Quickstart A (`origem=1`, `destino=5`, `ordenacao=mais_rapida`)

### Implementation for User Story 1

- [x] T006 [US1] After mixed discovery in `plan_routes`, compute pure candidate for `estrada` (at minimum) via T003/T004 and merge into the candidate bag with dedup in `backend/app/services/route_planner.py`
- [x] T007 [US1] Assemble final ≤6 so missing pure estrada is injected when it exists (displace lowest non-#1 mix if needed) in `backend/app/services/route_planner.py` (research §3; FR-001/005)
- [x] T008 [US1] Re-sort assembled list with existing ordenação + preferência-share keys before return in `backend/app/services/route_planner.py`
- [x] T009 [US1] Run quickstart A from `specs/056-route-type-coverage/quickstart.md` (assert pure estrada present; n≤6)

**Checkpoint**: MVP — Altdorf→Ubersreik Mais rápida shows Estrada

---

## Phase 4: User Story 2 — Cobertura de tipos puros geral (Priority: P1)

**Goal**: Cover best pure for every tipo that exists on the network; preferência does not suppress opposite pures

**Independent Test**: Quickstart B + C; smoke Preferência Por rio still includes estrada

### Implementation for User Story 2

- [x] T010 [US2] Loop pure search over `estrada`, `rio`, and `trilha` (skip tipos with no path) in `backend/app/services/route_planner.py` (FR-002/FR-009)
- [x] T011 [US2] Ensure coverage injection is independent of `preferencia_via` (soft bias only; still inject opposite pure when connected) in `backend/app/services/route_planner.py` (FR-006; clarify Q1)
- [x] T012 [US2] Confirm MUST NOT invent a pure tipo when type-restricted graph is disconnected in `backend/app/services/route_planner.py` (FR-003)
- [x] T013 [US2] Run quickstart B (rio+estrada both present) + C (`preferencia_via=rio` still has estrada) from `specs/056-route-type-coverage/quickstart.md`

**Checkpoint**: General coverage + preferência independence

---

## Phase 5: User Story 3 — ≤6 e ordenação intacta (Priority: P2)

**Goal**: Cap 6; #1 remains best by active criterion after coverage merge

**Independent Test**: Quickstart A/D length + first-item checks; SC-003

### Implementation for User Story 3

- [x] T014 [US3] Verify assembly never exceeds `K_MAX` and never drops overall #1 to make room for a pure in `backend/app/services/route_planner.py` (FR-004/005)
- [x] T015 [US3] Verify fill order: after #1 + coverage pures, remaining slots from sorted mixes; drop mixes before unique coverage slots in `backend/app/services/route_planner.py` (research §3)
- [x] T016 [US3] Run quickstart D (mais_barata still has estrada; first = cheapest Dentro among returned) from `specs/056-route-type-coverage/quickstart.md`

**Checkpoint**: Sort and cap invariants hold

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Full quickstart, changelog, no frontend/API schema churn

- [x] T017 Optional UI smoke: select Estrada row Altdorf→Ubersreik; overlay matches road path (quickstart E) — no frontend code change expected
- [x] T018 [P] Confirm `backend/app/routers/public/routes.py` and frontend `planRoute` unchanged (no new params) per contract
- [x] T019 [P] Add CHANGELOG entry under next patch (likely **[0.6.11]**) in `CHANGELOG.md` for cobertura de tipos puros no Calcular rota
- [x] T020 Bump version to match CHANGELOG in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml` if changelog bumps
- [x] T021 Run full `specs/056-route-type-coverage/quickstart.md` A–D (+ E optional); confirm digitizer/`CampaignMap` untouched

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003–T005) → **US1** (T006–T009) → **US2** (T010–T013) → **US3** (T014–T016) → **Polish** (T017–T021)
- US2 extends US1’s estrada-only injection to all tipos
- US3 hardens assembly rules already used by US1/US2

### User Story Dependencies

- **US1 (P1)**: Estrada coverage for canonical pair — MVP
- **US2 (P1)**: Depends on US1 merge path; generalizes tipos + preferência
- **US3 (P2)**: Depends on assembly; validates cap/#1

### Within Each User Story

- Helpers (Phase 2) before `plan_routes` wiring
- Quickstart smoke before marking story done

### Parallel Opportunities

- T001 ∥ T002
- T003 then T004 (same file — sequential preferred); T005 can follow or overlap carefully
- T018 ∥ T019 (docs vs confirm no API churn)
- T017 optional after backend green

---

## Parallel Example: Foundational

```bash
# After T003 type-restricted graph exists:
Task: "Materialize best pure RoutePlanItem in route_planner.py"
Task: "Shared sort key + seg-id dedup in route_planner.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + Foundational helpers  
2. Inject pure estrada into assembly  
3. **STOP and VALIDATE** quickstart A  
4. Then US2 (rio/trilha + preferência) and US3 polish  

### Incremental Delivery

1. Helpers → foundation ready  
2. US1 → Altdorf Estrada visible → demo MVP  
3. US2 → full coverage + preferência  
4. US3 → cap/sort hardening  
5. CHANGELOG + full quickstart  

### Suggested MVP scope

**US1** (T001–T009): pure Estrada on Altdorf→Ubersreik Mais rápida. Prefer shipping US2 in the same change set (same file).

---

## Notes

- Backend-only; no new API params (FR contract)
- Same-file contention on `route_planner.py`: keep stories sequential
- Canonical IDs: Altdorf=`1`, Ubersreik=`5` (seed-stable for this campaign)
