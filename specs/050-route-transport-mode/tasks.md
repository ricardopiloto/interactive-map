# Tasks: Route Transport Mode (Paid vs Own)

**Input**: Design documents from `/specs/050-route-transport-mode/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) pago/próprio no planner+API+pedido FE; US2 (P1) UI alinhada (campo velocidade, reset, auto-recalc modo); US3 (P2) validação e custos zero visíveis.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 / US3 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e estado actual do Calcular rota

- [x] T001 Skim `specs/050-route-transport-mode/contracts/api-route-transport-mode.md`, `contracts/ui-route-transport-mode.md`, `research.md`, and `data-model.md` (modo, mph, custos 0, recalc rules)
- [x] T002 [P] Confirm `plan_routes` / `build_graph` / `segment_cost_bp` / mph override in `backend/app/services/route_planner.py` and `GET /routes/plan` in `backend/app/routers/public/routes.py`
- [x] T003 [P] Confirm `campaignApi.planRoute` and speed/ritmo/ordenação UI in `frontend/src/api/campaign.ts` and `frontend/src/components/routes/RoutePlannerPanel.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipo `ModoTransporte` e assinaturas partilhadas antes das stories

**⚠️ CRITICAL**: Completar antes das user stories

- [x] T004 Add `ModoTransporte` Literal `pago` | `proprio` in `backend/app/schemas/routes.py` (FR-001)
- [x] T005 [P] Add `ModoTransporte` type in `frontend/src/types/index.ts` (mirror backend)
- [x] T006 Extend `plan_routes` (and helpers as needed) to accept `modo_transporte: ModoTransporte = "pago"` in `backend/app/services/route_planner.py` without changing cost/speed semantics yet (wire-through only)

**Checkpoint**: Enum + param plumbados; comportamento ainda = tabela/legacy mph até US1

---

## Phase 3: User Story 1 — Escolher transporte pago ou próprio (Priority: P1) 🎯 MVP

**Goal**: Cálculo correcto por modo: pago = tabela; próprio = mph (default 4) + custos Dentro/Fora **0** no grafo e na resposta; UI mínima consegue escolher modo e calcular

**Independent Test**: Mesmo De/Para em pago vs próprio via UI ou curl; próprio com mph 4 → custos 0 e tempos distintos; pago → tarifas tabela (quickstart B–C / API contract)

### Implementation for User Story 1

- [x] T007 [US1] In `backend/app/services/route_planner.py`, when `modo_transporte=proprio`: resolve mph to sent value or **4.0**; force `custo_dentro_bp`/`custo_fora_bp` to **0** and `peso_barata` to `0 + ε·tempo` in `build_graph` (and any aggregate path) (FR-003–005, research §3–4)
- [x] T008 [US1] In `backend/app/services/route_planner.py`, when `modo_transporte=pago`: force table speeds (`velocidade_media_mph=None` internally) even if mph was passed (FR-002, research §2)
- [x] T009 [US1] Preserve legacy when `modo_transporte` omitted: mph omitted → table; mph set → override **with** table costs (research §6) in `backend/app/services/route_planner.py` / router
- [x] T010 [US1] Wire `modo_transporte` query (default `pago`) on `GET /api/routes/plan` in `backend/app/routers/public/routes.py`; pass into `plan_routes`; invalid mode → 422 (API contract)
- [x] T011 [US1] Extend `campaignApi.planRoute` to send `modo_transporte` and mph only when próprio in `frontend/src/api/campaign.ts` (FR-001/002/004)
- [x] T012 [US1] Replace primary free-speed-as-main-control with **Pago / Próprio** choice and call plan with mode in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-001/006); próprio sends mph (default 4)

**Checkpoint**: SC-002–003 via API/UI; MVP calculável

---

## Phase 4: User Story 2 — UI do menu alinhada ao modo (Priority: P1)

**Goal**: Velocidade só em próprio (init 4); abrir painel → sempre pago; pago↔próprio com De/Para válidos auto-recalcula; reentrar próprio → reset 4; sem auto-recalc só por editar velocidade

**Independent Test**: Alternar modos; campo some/aparece; fechar/reabrir → pago; mudar modo → lista actualiza; editar velocidade sem Calcular → lista estática (quickstart A, C–E)

### Implementation for User Story 2

- [x] T013 [US2] Show speed field **only** when mode is próprio; hide/disable in pago in `frontend/src/components/routes/RoutePlannerPanel.tsx` (+ `frontend/src/components/routes/RoutePlanner.css` if needed) (FR-004, US2)
- [x] T014 [US2] On panel `open` false→true, reset mode to **pago** and prepare speed draft **4** in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-012)
- [x] T015 [US2] On pago→próprio (and each entry to próprio), reset speed field to **4**; keep edited value while staying in próprio in `frontend/src/components/routes/RoutePlannerPanel.tsx` (US2 / Assumptions)
- [x] T016 [US2] Auto-recalculate when `modo_transporte` changes and De/Para are valid (same pattern as ordenação `useEffect`) in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-010)
- [x] T017 [US2] Ensure changing only the speed input does **not** trigger plan; apply on Calcular or mode/ordenação recalc in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-011)

**Checkpoint**: FR-010–012; SC-001; quickstart A, D, E

---

## Phase 5: User Story 3 — Validação e resultados claros (Priority: P2)

**Goal**: Velocidade própria inválida bloqueia com mensagem; lista mostra Dentro/Fora 0 em próprio e tarifas em pago; ordenação/ritmo ok

**Independent Test**: Próprio com velocidade inválida → erro sem lista; próprio válido → 0 bp; pago → bp tabela (quickstart F–G)

### Implementation for User Story 3

- [x] T018 [US3] Validate próprio speed (empty / non-numeric / ≤ 0) before request with clear error in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-008, SC-004)
- [x] T019 [US3] Confirm route list still shows Dentro/Fora rows with **0** in próprio (no hide) and table values in pago in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-009)
- [x] T020 [US3] Smoke: ritmo + ordenação still work in both modes (incl. mais_barata with all-zero costs) in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-007, SC-005)

**Checkpoint**: US3 + edge “mais barata em próprio”

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quickstart completo, changelog, regressão digitizer

- [x] T021 Run scenarios A–H from `specs/050-route-transport-mode/quickstart.md` (incl. optional curls); fix gaps only in planner/panel/API files listed in plan
- [x] T022 Confirm digitizer / Rede / segment model untouched; legacy omitted-mode+mph still table-costs if applicable (Out of Scope / research §6)
- [x] T023 [P] Note change in `CHANGELOG.md` under next patch: Calcular rota — transporte pago vs próprio (default 4, custos 0 em próprio)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T003) → **Foundational** (T004–T006) → **US1** (T007–T012) → **US2** (T013–T017) → **US3** (T018–T020) → **Polish** (T021–T023)
- T005 can parallel T004; T011 can start once T004/T010 shape is known

### User Story Dependencies

- **US1 (P1)**: MVP — API semantics + mode choice that calculates correctly
- **US2 (P1)**: Builds on US1 panel; UX rules (reset/recalc/visibility)
- **US3 (P2)**: Validation + result clarity on top of US1/US2

### Parallel Opportunities

- T002 ∥ T003
- T004 ∥ T005
- T011 (FE api) ∥ T007–T010 (BE) after T004/T006
- T023 ∥ late T021 after implementation

---

## Parallel Example: After T006

```bash
Task: "Zero costs + mph default for próprio in route_planner.py"
Task: "Add ModoTransporte + planRoute params in frontend types/api"
```

---

## Parallel Example: User Story 2

```bash
# Sequencial no mesmo ficheiro RoutePlannerPanel.tsx — não paralelizar T013–T017 entre si
Task: "T013–T017 sequentially in RoutePlannerPanel.tsx (+ CSS if needed)"
```

---

## Implementation Strategy

### MVP First (US1)

1. Setup + Foundational
2. US1 (backend mode semantics + minimal mode UI + API client)
3. **STOP**: curl/UI pago vs próprio — SC-002/003
4. Then US2 UX, US3 validation, Polish

### Incremental Delivery

1. Foundation → mode param exists
2. US1 → correct costs/speeds (MVP!)
3. US2 → open/reset/recalc UX
4. US3 → validation polish
5. Quickstart + CHANGELOG

---

## Notes

- CSS real path: `frontend/src/components/routes/RoutePlanner.css` (não `RoutePlannerPanel.css`)
- Não reintroduzir campo de velocidade como controlo principal em pago
- Custos zero MUST ser no planner (não só máscara FE)
- [P] = arquivos diferentes sem dependência incompleta
