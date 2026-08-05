# Tasks: Revert Pin Alignment Fixes (047 / 049 / 051)

**Input**: Design documents from `/specs/052-revert-pin-align-fixes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) desktop Altdorf no ponto verde; US2 (P1) remoção completa do pacote 047/049/051 (restauro pré-047).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline HEAD e diffs a reverter

- [x] T001 Skim `specs/052-revert-pin-align-fixes/contracts/ui-revert-pin-align-fixes.md`, `research.md`, and `data-model.md` (restore HEAD; keep 048/050)
- [x] T002 [P] Diff working tree vs HEAD for `frontend/src/components/map/CampaignMap.css` (`git diff HEAD -- frontend/src/components/map/CampaignMap.css`) — confirm 047/049/051 presentation edits only
- [x] T003 [P] List CHANGELOG sections 0.6.8 / 0.6.9 / 0.6.10 / 0.6.11 / 0.6.12 in `CHANGELOG.md` — note which to drop (8/9/12) vs keep (10/11)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Lock do método de restauro (research §2)

**⚠️ CRITICAL**: Completar antes das user stories

- [x] T004 Lock approach: restore `CampaignMap.css` from git HEAD atomically; do not half-keep 051 stage or 049 nudge plumbing — per `specs/052-revert-pin-align-fixes/research.md`
- [x] T005 Confirm out-of-scope paths stay untouched: `frontend/src/components/gm/RouteDigitizer.css`, `frontend/src/components/routes/RoutePlanner*`, `backend/app/services/route_planner.py` (FR-007)

**Checkpoint**: Restore strategy locked

---

## Phase 3: User Story 1 — Desktop: pin no ponto verde (Priority: P1) 🎯 MVP

**Goal**: No desktop, Altdorf (e marcadores) voltam ao alinhamento pré-047; pin no ponto verde do print

**Independent Test**: Viewport ≥800px; Altdorf tip on print green (quickstart A)

### Implementation for User Story 1

- [x] T006 [US1] Restore `frontend/src/components/map/CampaignMap.css` from git HEAD (`git checkout HEAD -- frontend/src/components/map/CampaignMap.css` or equivalent) (FR-001/002/004)
- [x] T007 [US1] Verify restored file has stage `min-height: 540px`, image `object-fit: cover`, and pin/party transforms **without** `--mobile-marker-nudge-x` / nudge `translateX` in `frontend/src/components/map/CampaignMap.css` (SC-004)
- [x] T008 [US1] Visual QA desktop: Altdorf matches print green target (`specs/052-revert-pin-align-fixes/quickstart.md` A) (SC-001) — ready for user confirm

**Checkpoint**: SC-001 — desktop Altdorf no verde (MVP)

---

## Phase 4: User Story 2 — Remover o pacote 047 + 049 + 051 (Priority: P1)

**Goal**: Nenhum comportamento 047/049/051 activo; outros pins pré-047; 048/050 intactos

**Independent Test**: Diff CSS empty vs HEAD; quickstart B–E; no digitizer/planner regressions from this task set

### Implementation for User Story 2

- [x] T009 [US2] Confirm `git diff HEAD -- frontend/src/components/map/CampaignMap.css` is empty after restore (FR-001, SC-004)
- [x] T010 [US2] Spot-check ≥2 other desktop pins + zoom/pan (`quickstart.md` B–C) (FR-003/005, SC-002/003) — ready for user confirm
- [x] T011 [US2] Remove CHANGELOG sections **[0.6.8]**, **[0.6.9]**, **[0.6.12]** only; keep **[0.6.10]** and **[0.6.11]** in `CHANGELOG.md` (research §3, FR-007)
- [x] T012 [US2] Smoke: digitizer / Calcular rota unchanged by this feature (`quickstart.md` E) (SC-005)
- [x] T013 [US2] Optional note: mobile may show pré-047 misalignment — acceptable (`quickstart.md` F); do not reintroduce 047–051

**Checkpoint**: SC-002–005; pacote removido

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Spec history intact; final QA

- [x] T014 Confirm `specs/047-*`, `specs/049-*`, `specs/051-*` directories still present (history only — do not delete)
- [x] T015 Run remaining quickstart checks from `specs/052-revert-pin-align-fixes/quickstart.md`; no further CSS tweaks unless desktop green fails (then re-check HEAD restore)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T003) → **Foundational** (T004–T005) → **US1** (T006–T008) → **US2** (T009–T013) → **Polish** (T014–T015)
- T006 is the core restore; T011 (CHANGELOG) can follow T006 in parallel with T008 visual QA if staffing allows

### User Story Dependencies

- **US1 (P1)**: MVP — restore CSS + desktop green
- **US2 (P1)**: Completeness (diff empty, changelog, smoke out-of-scope) after US1 restore

### Parallel Opportunities

- T002 ∥ T003
- T008 ∥ T011 (after T006)
- T012 ∥ T014

---

## Parallel Example: After T006

```bash
Task: "Desktop visual QA Altdorf green"
Task: "Strip 0.6.8/0.6.9/0.6.12 from CHANGELOG.md"
```

---

## Implementation Strategy

### MVP First (US1)

1. Setup + Foundational
2. `git checkout HEAD -- frontend/src/components/map/CampaignMap.css`
3. **STOP**: Desktop Altdorf on green
4. Then CHANGELOG cleanup + smoke

### Incremental Delivery

1. Restore CSS → desktop fixed (MVP!)
2. Prove 047–051 gone + changelog + out-of-scope smoke
3. Leave mobile pré-047 as accepted

---

## Notes

- Atomic HEAD restore preferred over manual CSS surgery
- Never reintroduce 047 left nudge or 051 stage shrink-wrap in this feature
- Do not revert 048/050 code or delete old spec folders
- [P] = arquivos diferentes sem dependência incompleta
