# Implementation Plan: Route Planner Cohesion

**Branch**: `064-route-planner-cohesion` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/064-route-planner-cohesion/spec.md`

## Summary

Three cohesive changes: (1) overnight sim anchored to published travel days — M from D/R, daily budget = route miles ÷ M, Local within ±20% of that budget; (2) move Calcular rota into a SideMenu tab (“Rota”), remove floating planner, map-pick + travel overlay only while that tab is active; (3) paint non-selected route polylines **red** (selected keeps 063 green/fatigue chrome).

## Technical Context

**Language/Version**: TypeScript/React 19; Python 3.12 (FastAPI)  
**Primary Dependencies**: `overnight.py`, `route_planner.py`, `SideMenu`, `RoutePlannerPanel`, `MapPage`, `RouteOverlay` / `CampaignMap.css`  
**Storage**: N/A (computed plan fields only)  
**Testing**: Manual quickstart visual/API smoke  
**Target Platform**: Web map + side menu  
**Project Type**: Monorepo frontend + backend  
**Performance Goals**: Unchanged route plan latency; UI tab switch instant  
**Constraints**: Clarifications locked (M, budget, ±20%, tab-scoped pick/overlay); keep 062/063 fatigue & pin rules  
**Scale/Scope**: One new side tab; overnight budget formula change; CSS alt colour  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clarifications complete (5/5): **PASS**
- Additive/fix to existing planner + overnight; no unjustified scope creep: **PASS**
- Constitution placeholder — follow repo patterns: **PASS**

**Post-Phase 1**: Unchanged — formula + UI shell + CSS.

## Project Structure

### Documentation (this feature)

```text
specs/064-route-planner-cohesion/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── overnight-march-days.md
│   └── ui-route-side-tab.md
└── tasks.md   # /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/services/overnight.py       # Budget = miles/M; M from D/R; ±20% Local window
backend/app/services/route_planner.py   # Pass dist-derived milhas_por_dia after tempo known; wire M
frontend/src/components/sidebar/SideMenu.tsx   # SideTab 'rota' + label
frontend/src/pages/MapPage.tsx          # Tab-scoped planner; drop floating open; overlay when tab===rota
frontend/src/components/routes/RoutePlannerPanel.tsx  # Embeddable in side content (no floating chrome)
frontend/src/components/map/CampaignMap.css / RouteOverlay.tsx  # Alt stroke red
CHANGELOG.md / version manifests
```

**Structure Decision**: Backend owns overnight↔tempo coherence; frontend owns side-tab shell, visibility gates, and alt colour.

## Complexity Tracking

> None.
