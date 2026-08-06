# Implementation Plan: Prefer River or Road in Route Planner

**Branch**: `054-prefer-river-road` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/054-prefer-river-road/spec.md`

## Summary

Add a **preferência de via** control to Calcular rota: **Sem preferência** (default) / **Rio** / **Estrada**. Soft bias only — mixed routes stay allowed. Backend accepts `preferencia_via`; when `rio` or `estrada`, path discovery applies mild edge-weight bias toward that tipo and final ranking uses preferred-miles share as tie-breaker after `ordenacao`. UI mirrors modo/ordenação (radios, auto-recalc, reset to Sem preferência on panel open).

## Technical Context

**Language/Version**: Python 3.12+ (FastAPI), TypeScript (React)  
**Primary Dependencies**: NetworkX shortest paths, existing `plan_routes`, `RoutePlannerPanel`  
**Storage**: N/A (query param only; no schema migration)  
**Testing**: Manual quickstart + optional curl; smoke with mixed De/Para  
**Target Platform**: Local/self-hosted web app  
**Project Type**: Web application (frontend + backend monorepo)  
**Performance Goals**: Same latency class as current plan (k ≤ 6); bias is O(edges)  
**Constraints**: Soft only; Sem preferência ≡ current behavior; digitizer untouched  
**Scale/Scope**: One planner panel + one plan endpoint param  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is a placeholder — Spec Kit norms only.

- Soft preference (no hard filter): **PASS** (clarified)
- Coexist with 046/050 params: **PASS**
- No digitizer / pin changes: **PASS**

**Post-Phase 1**: Unchanged — contracts extend existing plan API/UI.

## Project Structure

### Documentation (this feature)

```text
specs/054-prefer-river-road/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-preferencia-via.md
│   └── ui-preferencia-via.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/schemas/routes.py              # PreferenciaVia literal
backend/app/routers/public/routes.py       # query preferencia_via
backend/app/services/route_planner.py      # bias + tie-break sort

frontend/src/types/index.ts                # PreferenciaVia
frontend/src/api/campaign.ts               # planRoute param
frontend/src/components/routes/RoutePlannerPanel.tsx
frontend/src/components/routes/RoutePlanner.css
```

**Structure Decision**: Extend existing Calcular rota stack (same pattern as `modo_transporte` / `ordenacao`).

## Complexity Tracking

> None.
