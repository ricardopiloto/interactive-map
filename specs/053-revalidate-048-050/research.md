# Research: Revalidate 048 and 050 After 052

**Feature**: `053-revalidate-048-050` | **Date**: 2026-08-05

## 1. What “revalidate” means as implementation

**Decision**: Treat 053 as a **QA + ledger** feature. Default path: run existing 048/050 quickstarts, fill [contracts/validation-ledger.md](./contracts/validation-ledger.md), and ship with **no product code changes** if both blocks PASS. Remediação tasks only unlock on FAIL.

**Rationale**: Spec FR-006/007 and US3 — do not change 048/050 or 052 baseline when validation passes.

**Alternatives considered**:
- Rewrite 048/050 specs — rejected (Assumptions: source of truth stays those folders)
- Automated visual regression suite — out of scope; originals were manual

## 2. Static pre-check vs HEAD / working tree

**Decision**: Use a short static smoke before manual UI:

| Area | Expected signal after 052 | Observed (plan-time) |
|------|---------------------------|----------------------|
| 048 | Digitizer stroke ~1 / hover ~2.3; hit-area wide | `RouteDigitizer.css`: `stroke-width: 1` / `2.3` / hit `12` |
| 050 | `modo_transporte` pago\|proprio in API + UI | Present in `route_planner.py`, `routes.py`, `RoutePlannerPanel.tsx`, types |
| 052 | `CampaignMap.css` matches pré-047 (no nudge/stage 051) | Restored in 052; do not edit on PASS |
| CHANGELOG | Keep 0.6.10 (048) and 0.6.11 (050) | Present; 0.6.8/9/12 removed by 052 |

**Rationale**: Catches accidental wholesale reverts before spending 25 minutes on UI.

**Alternatives considered**: Skip static check — higher chance of false “environment” FAIL.

## 3. Validation procedure

**Decision**: Orchestrate via this feature’s [quickstart.md](./quickstart.md), which **defers** scenario detail to:

- `specs/048-refine-segment-stroke/quickstart.md` (A–F; A–E mandatory)
- `specs/050-route-transport-mode/quickstart.md` (A–H; A–G mandatory)

Optional API curls from 050 quickstart remain optional.

**Rationale**: FR-003; avoid duplicating acceptance text.

**Alternatives considered**: Copy all scenarios into 053 — drift risk.

## 4. Remediação policy on FAIL

**Decision**:

1. Confirm environment prerequisites (segments, De/Para with tariffs, servers up).
2. If still FAIL: fix **only** the failing surface (digitizer stroke CSS / planner UI / `resolve_speed_and_zero_costs`) per original 048 or 050 plan — **not** CampaignMap.css.
3. Re-run the failed block’s quickstart to PASS.
4. Spot-check desktop pin alignment (SC-004) after any remediação.

**Rationale**: Spec edge cases + FR-005.

**Alternatives considered**: “Revert 052” on any FAIL — rejected; would re-break desktop.

## 5. Where to record results

**Decision**: Fill the validation ledger contract in this feature directory (PASS/FAIL per scenario + overall block). Tasks.md (later) will mark ledger completion.

**Rationale**: FR-004, SC-005 — auditável without inventing a new product UI.
