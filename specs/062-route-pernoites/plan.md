# Implementation Plan: Route Overnight Stops (Pernoites)

**Branch**: `062-route-pernoites` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/062-route-pernoites/spec.md`

## Summary

Estender o cálculo de rota existente para simular **pernoites** dia a dia (Local dentro de ±tolerância ou ao relento), expor resumo em **todas** as linhas multi-dia, marcadores no mapa na rota seleccionada, e **fadiga informativa** em ritmo intenso (saldo, aviso se saldo final > 1, alerta de morte se pico ≥ 6) — sem alterar milhas/tempo/grafo.

## Technical Context

**Language/Version**: Python 3.12+ (FastAPI / uv), TypeScript, React 19  
**Primary Dependencies**: `route_planner.py`, Pydantic schemas `routes.py`, `RoutePlannerPanel`, `RouteOverlay` / `CampaignMap`, Settings  
**Storage**: N/A new tables — compute on plan response; Settings for `tolerancia_pernoite_pct`  
**Testing**: pytest unit tests for overnight + fatigue sim; manual quickstart UI  
**Target Platform**: Web (player Calcular rota) + API `GET /api/routes/plan`  
**Project Type**: Monorepo web app (backend + frontend)  
**Performance Goals**: Negligible — post-process each of ≤5 routes along dozens of edges  
**Constraints**: Additive API fields; informational fatigue only; no random encounters; no UI to edit milhas/dia  
**Scale/Scope**: Planner service + schema/types + panel list + map overnight markers + CSS warn/death  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarifications locked (stretch, budget, markers, fatigue, death): **PASS**
- Additive change to existing route plan (no new screen): **PASS**
- Fatigue non-mechanical (no graph/budget mutation): **PASS**
- Constitution file is placeholder — follow repo conventions (schemas, Settings, CHANGELOG): **PASS**

**Post-Phase 1**: Unchanged — design stays additive DTO + pure simulation helper.

## Project Structure

### Documentation (this feature)

```text
specs/062-route-pernoites/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-routes-plan-pernoites.md
│   └── ui-route-pernoites.md
└── tasks.md              # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
backend/app/config.py                         # tolerancia_pernoite_pct
backend/app/schemas/routes.py                 # Pernoite*, fatigue fields on RoutePlanItem
backend/app/services/route_planner.py         # or overnight.py helper called from item_from_edges / plan_routes
backend/tests/…                               # unit tests overnight + fatigue

frontend/src/types/index.ts                   # mirror DTO
frontend/src/components/routes/RoutePlannerPanel.tsx  # summaries, soft warn, death alert
frontend/src/components/routes/RouteOverlay.tsx       # and/or CampaignMap — overnight markers
frontend/src/components/routes/RoutePlanner.css
frontend/src/components/map/CampaignMap.css           # marker styles if needed
CHANGELOG.md / README.md                      # release notes (tasks)
```

**Structure Decision**: Pure function `simulate_pernoites_and_fatigue(...)` applied when building each `RoutePlanItem` after path geometry/edges are known; frontend only renders new fields + markers.

## Complexity Tracking

> None.
