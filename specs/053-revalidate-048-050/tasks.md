# Tasks: Revalidate 048 and 050 After 052

**Input**: Design documents from `/specs/053-revalidate-048-050/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual QA only (quickstarts) — no automated TDD suite requested.

**Organization**: US1 = Rede/048; US2 = Calcular rota/050; US3 = ledger + remediação policy + close.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm docs and environment for the validation run

- [x] T001 Skim `specs/053-revalidate-048-050/plan.md`, `research.md`, and `contracts/validation-ledger.md` for PASS-default vs FAIL-remediação rules
- [x] T002 [P] Confirm servers up and GM/Rede + Calcular rota prerequisites per `specs/053-revalidate-048-050/quickstart.md`
- [x] T003 [P] Initialize run metadata (date, environment_ok, notes) in `specs/053-revalidate-048-050/contracts/validation-ledger.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Static smoke before UI story runs (research §2)

**⚠️ CRITICAL**: Complete before US1/US2 UI scenarios

- [x] T004 Verify 048 stroke signals in `frontend/src/components/gm/RouteDigitizer.css` (normal ~1, hover ~2.3, hit ≫ stroke); note in ledger static pre-check
- [x] T005 [P] Verify 050 transport mode still present in `frontend/src/components/routes/RoutePlannerPanel.tsx` and `backend/app/services/route_planner.py` (`modo_transporte` pago|proprio)
- [x] T006 [P] Confirm 052 baseline guard target: `frontend/src/components/map/CampaignMap.css` has no 047 nudge / 051 stage shrink product behavior; do not edit on PASS

**Checkpoint**: Static smoke consistent with research — UI revalidation can begin

---

## Phase 3: User Story 1 — Confirmar Rede de rotas (048) intacta (Priority: P1) 🎯 MVP

**Goal**: Prove segment stroke ~⅔, draft, hover, types still work after 052

**Independent Test**: Quickstart 048 A–E (F recommended) all PASS in ledger

### Implementation for User Story 1

- [x] T007 [US1] Run scenario A (traço normal ~⅔) per `specs/048-refine-segment-stroke/quickstart.md`; record in `specs/053-revalidate-048-050/contracts/validation-ledger.md`
- [x] T008 [US1] Run scenarios B–C (tipos + draft) per `specs/048-refine-segment-stroke/quickstart.md`; record in ledger
- [x] T009 [US1] Run scenarios D–E (hover + fluxo nó/segmento) per `specs/048-refine-segment-stroke/quickstart.md`; record in ledger
- [x] T010 [P] [US1] Run recommended scenario F (overlay/lore/nodes regression) per `specs/048-refine-segment-stroke/quickstart.md`; record in ledger
- [x] T011 [US1] Set **Overall 048** PASS/FAIL in `specs/053-revalidate-048-050/contracts/validation-ledger.md`; if FAIL after valid env, remediação only in `frontend/src/components/gm/RouteDigitizer.css` / `RouteDigitizer.tsx` (not `CampaignMap.css`), then re-run A–E to PASS

**Checkpoint**: US1 — Overall 048 PASS (MVP for Rede)

---

## Phase 4: User Story 2 — Confirmar Calcular rota (050) intacta (Priority: P1)

**Goal**: Prove pago/próprio model intact after 052

**Independent Test**: Quickstart 050 A–G (H + API optional) all PASS in ledger

### Implementation for User Story 2

- [x] T012 [US2] Run scenarios A–C (default pago, tabela, próprio 4 + custos 0) per `specs/050-route-transport-mode/quickstart.md`; record in `specs/053-revalidate-048-050/contracts/validation-ledger.md`
- [x] T013 [US2] Run scenarios D–E (no auto-recalc on speed edit; reset to 4) per `specs/050-route-transport-mode/quickstart.md`; record in ledger
- [x] T014 [US2] Run scenarios F–G (validação + ordenação em próprio) per `specs/050-route-transport-mode/quickstart.md`; record in ledger
- [x] T015 [P] [US2] Run recommended H + optional API curls per `specs/050-route-transport-mode/quickstart.md`; record in ledger
- [x] T016 [US2] Set **Overall 050** PASS/FAIL in ledger; if FAIL, remediação only in `frontend/src/components/routes/RoutePlannerPanel.tsx` / `RoutePlanner.css` / `frontend/src/api/campaign.ts` / `backend/app/services/route_planner.py` (and related routes schemas), not pin-align CSS; re-run A–G to PASS

**Checkpoint**: US2 — Overall 050 PASS

---

## Phase 5: User Story 3 — Registo do resultado + close (Priority: P2)

**Goal**: Auditável PASS/FAIL; remediação scoped; close gates; protect 052 desktop

**Independent Test**: Ledger complete for mandatory scenarios; SC-003/004/005 met

### Implementation for User Story 3

- [x] T017 [US3] Ensure every mandatory scenario row (048 A–E, 050 A–G) has explicit PASS/FAIL (not blank) in `specs/053-revalidate-048-050/contracts/validation-ledger.md` (SC-005)
- [x] T018 [US3] Complete Baseline 052 guard section in ledger (desktop pins spot-check; CampaignMap.css untouched on PASS-without-remediação) per `specs/053-revalidate-048-050/quickstart.md` §3
- [x] T019 [US3] If any remediação occurred, document it in ledger remediação fields and confirm it did not reintroduce 047–051 behavior in `frontend/src/components/map/CampaignMap.css`
- [x] T020 [US3] Set feature close gates in `specs/053-revalidate-048-050/contracts/validation-ledger.md` when both blocks PASS (SC-003)

**Checkpoint**: Feature auditable and closed

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final orchestration check

- [x] T021 Re-run `specs/053-revalidate-048-050/quickstart.md` close checklist; confirm FR-003 coverage and no intentional product churn when both blocks already PASS
- [x] T022 [P] Optional note in `specs/053-revalidate-048-050/contracts/validation-ledger.md` Notes if 048/050 failures were pre-existing vs introduced by 052 (per spec Assumptions)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T003) → **Foundational** (T004–T006) → **US1** (T007–T011) → **US2** (T012–T016) → **US3** (T017–T020) → **Polish** (T021–T022)
- US1 and US2 are both P1; prefer US1 first (MVP Rede), then US2; can parallelize after foundational if two reviewers

### User Story Dependencies

- **US1 (P1)**: After foundational — no dependency on US2
- **US2 (P1)**: After foundational — independent of US1 results (except shared ledger file — serialize ledger writes)
- **US3 (P2)**: After US1 + US2 results recorded (needs both overalls)

### Parallel Opportunities

- T002 ∥ T003
- T005 ∥ T006 (after T004 or with T004 if careful)
- T010 ∥ late US1 if A–E already done
- T015 ∥ after D–G of US2
- US1 ∥ US2 only if two people and coordinated ledger edits
- T022 ∥ T021 notes

---

## Parallel Example: After Foundational

```bash
# Two reviewers:
Task: "US1 — 048 quickstart A–F → ledger"
Task: "US2 — 050 quickstart A–H → ledger"
# Then serialize US3 close on the shared ledger
```

---

## Implementation Strategy

### MVP First (US1)

1. Setup + Foundational static smoke
2. Complete 048 A–E → Overall 048 PASS
3. **STOP**: Rede validated post-052
4. Continue US2 + US3 for full SC-003

### Incremental Delivery

1. Static smoke → confidence 048/050 code still present
2. US1 PASS → Rede OK
3. US2 PASS → Calcular rota OK
4. US3 ledger close + 052 guard → feature done (often **zero** product code changes)

---

## Notes

- Default path: **documentation-only** (fill ledger); product files only on FAIL remediação
- Never “fix” mobile pins as part of 053 when 048/050 PASS
- [P] = different concerns / can overlap carefully; ledger is shared — avoid conflicting edits
- All tasks use checklist format with IDs and paths
