# Implementation Plan: Revalidate 048 and 050 After 052

**Branch**: `053-revalidate-048-050` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/053-revalidate-048-050/spec.md`

**Note**: `/speckit-clarify` was not run before this plan; revalidation scope is already bounded by 048/050 quickstarts + 052 FR-007. Proceeding with low rework risk.

## Summary

After **052** restored campaign-map presentation to pré-047, prove that **048** (Rede segment stroke ~⅔) and **050** (Calcular rota pago/próprio) still meet their acceptance criteria. Primary work is **manual revalidation** against existing quickstarts, **record PASS/FAIL** in this feature, and **scoped remediação only on FAIL** without reopening 047–051 or touching CampaignMap.css when both pass.

Static pre-check already shows 048/050 code still present (`RouteDigitizer.css` stroke 1 / hover 2.3; `modo_transporte` in planner API + UI) and distinct from the 052 CampaignMap restore.

## Technical Context

**Language/Version**: TypeScript (React frontend), Python 3.x (FastAPI backend) — existing stack  
**Primary Dependencies**: Existing Rede digitizer UI, Calcular rota panel, route planner service  
**Storage**: N/A for validation; existing route network + waypoints  
**Testing**: Manual quickstart execution (048 A–F, 050 A–H); optional curl against `/api/routes/plan`  
**Target Platform**: Local web app (desktop GM + player Calcular rota)  
**Project Type**: Web application (frontend + backend monorepo)  
**Performance Goals**: Complete 048 block ≤ 10 min, 050 block ≤ 15 min (SC-001/002)  
**Constraints**: Must not reintroduce 047–051 pin/stage changes; must not change 048/050 when PASS  
**Scale/Scope**: Two feature blocks only; remediação only if regression found  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution file is a placeholder template — no project-specific gates beyond Spec Kit norms.

- Validation-first / no speculative product change when PASS: **PASS**
- Scoped remediação without expanding to mobile pin align: **PASS**
- Reuse existing 048/050 contracts & quickstarts (no duplicate product specs): **PASS**

**Post-Phase 1**: Unchanged — design is validation ledger + pointers, not new APIs.

## Project Structure

### Documentation (this feature)

```text
specs/053-revalidate-048-050/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── validation-ledger.md
└── tasks.md             # /speckit-tasks (not this command)
```

### Source Code (repository root)

**Touch only if remediação after FAIL.** Validation itself is read-only against:

```text
frontend/src/components/gm/RouteDigitizer.css          # 048 stroke weights
frontend/src/components/gm/RouteDigitizer.tsx            # Rede UX (hover/draft)
frontend/src/components/routes/RoutePlannerPanel.tsx     # 050 UI
frontend/src/components/routes/RoutePlanner.css
frontend/src/api/campaign.ts
frontend/src/types/index.ts
backend/app/services/route_planner.py
backend/app/routers/public/routes.py
backend/app/schemas/routes.py

# Must NOT change on PASS (052 baseline)
frontend/src/components/map/CampaignMap.css
```

**Structure Decision**: Monorepo web app. This feature’s deliverable is validation artifacts under `specs/053-…`; product files are in-scope only for FAIL remediação matching 048/050 plans.

## Complexity Tracking

> None — no constitution violations.
