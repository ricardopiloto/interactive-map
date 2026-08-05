# Implementation Plan: Route Sort Preference

**Branch**: `046-route-sort-preference` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/046-route-sort-preference/spec.md`

## Summary

Add a **mais rápida / mais barata** preference to **Calcular rota**. Return up to **6** alternatives ranked for that preference (barata = **custo Dentro** primary). Discover candidates with the matching edge weight (not only re-sort a time-only set). Default **mais rápida**. Changing preference with valid De/Para **recalculates automatically**. Backend plan API + planner service + RoutePlannerPanel UI.

## Technical Context

**Language/Version**: Python 3.12 / FastAPI; TypeScript / React 19

**Primary Dependencies**: `backend/app/services/route_planner.py` (`K_MAX=5`, `shortest_simple_paths` weight=`tempo`); `backend/app/routers/public/routes.py`; `frontend` `campaignApi.planRoute`, `RoutePlannerPanel.tsx`

**Storage**: N/A (query param only)

**Testing**: Manual via [quickstart.md](./quickstart.md); optional pytest on planner sort/k if already present

**Target Platform**: Web (player + GM Calcular rota)

**Project Type**: Web application (API + SPA)

**Performance Goals**: Same k-shortest class as today; k=6

**Constraints**:
- Top 6 per preference (FR-003/004/006); K_MAX → 6
- Barata = Dentro then Fora then tempo (Clarification A)
- Discovery respects preference (FR-005)
- Auto-recalc on preference change (FR-009)
- Both costs still shown (FR-008)

**Scale/Scope**: Planner service, public `/routes/plan`, campaign API client, RoutePlannerPanel (+ light CSS)

## Constitution Check

| Gate | Status |
|------|--------|
| Clarifications closed (Dentro; auto-recalc) | PASS |
| Preferential discovery not client-only reorder | PASS |
| Minimal API surface (one query param) | PASS |

**Post-design re-check**: PASS — API + UI contracts; sort model; no DB migration.

## Project Structure

### Documentation (this feature)

```text
specs/046-route-sort-preference/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api-route-sort-preference.md
└── tasks.md
```

### Source Code

```text
backend/app/
├── services/route_planner.py     # K_MAX=6; ordenacao; weight tempo vs custo_dentro
├── routers/public/routes.py      # Query ordenacao
└── schemas/routes.py             # Ritmo-like enum / Literal for ordenacao (optional)

frontend/src/
├── api/campaign.ts               # planRoute(..., ordenacao)
├── types/index.ts                # OrdenacaoRota type
└── components/routes/
    ├── RoutePlannerPanel.tsx     # control + auto-recalc + badge label
    └── RoutePlanner.css          # preference control layout
```

**Structure Decision**: Add `ordenacao: mais_rapida | mais_barata` (default `mais_rapida`) to `GET /api/routes/plan`. In `plan_routes`, set `K_MAX = 6`; choose NetworkX path weight and parallel-edge “best hop” sort by preference; final `candidates.sort` with full tie-break keys; return `[:k]`. FE: preference control (radio/select); pass param; on change with valid De/Para call same `calcular` path; first-row cue “mais rápida” / “mais barata”.

## Complexity Tracking

Sem violações. Dual-weight discovery is required by FR-005 (not optional polish).
