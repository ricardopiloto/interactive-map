# Implementation Plan: Route Overnight Pins & Fatigue Segment Colors

**Branch**: `063-route-pin-fatigue-colors` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/063-route-pin-fatigue-colors/spec.md`

## Summary

Repintar o mapa de viagem: polilinhas **verdes**; trechos com fadiga residual **vermelhos** (intensidade por saldo); pernoite **relento** como pin azul pequeno; pernoite em **Local** como badge no pin existente; **remover** textos de pernoite/fadiga da lista do Calcular rota. Requer trechos por dia (geometria + `fadiga_apos`) — preferência: enriquecer a resposta do plano (062) no backend.

## Technical Context

**Language/Version**: TypeScript/React 19; Python 3.12 (FastAPI) for plan DTO enrichment  
**Primary Dependencies**: `RouteOverlay`, `CampaignMap`, `RoutePlannerPanel`, `overnight.py` / `RoutePlanItem`  
**Storage**: N/A (computed fields on plan response)  
**Testing**: Manual quickstart visual QA  
**Target Platform**: Web map + route planner panel  
**Project Type**: Monorepo frontend-heavy UX; small additive API fields  
**Performance Goals**: Split polylines for ≤5 routes × ~few days — negligible  
**Constraints**: Selected route only for badges/red; no death badge beyond darkest red; keep Local click behaviour  
**Scale/Scope**: Overlay colours + pins/badges + list cleanup + optional day-slice fields from overnight sim  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clarifications locked (residual red, intensity, Local badge, list cleanup): **PASS**
- Additive to 062; no rule change to fatigue math: **PASS**
- Constitution placeholder — follow repo patterns: **PASS**

**Post-Phase 1**: Unchanged — UI + DTO enrichment only.

## Project Structure

### Documentation (this feature)

```text
specs/063-route-pin-fatigue-colors/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-route-day-segments.md
│   └── ui-route-pin-fatigue-colors.md
└── tasks.md   # /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/services/overnight.py          # Emit per-day visual slices (geom + fadiga_apos + residual)
backend/app/schemas/routes.py              # DiasMarchaVisual / trechos on RoutePlanItem
frontend/src/types/index.ts                # Mirror DTO
frontend/src/components/routes/RouteOverlay.tsx   # Green/red polylines + hover; drop fat SVG overnight markers
frontend/src/components/map/CampaignMap.tsx       # Relento pins + Local --pernoite badge
frontend/src/components/map/CampaignMap.css
frontend/src/components/routes/RoutePlannerPanel.tsx  # Remove pernoite/fadiga list copy
frontend/src/components/routes/pernoiteSummary.ts     # Stop using in panel (keep or delete)
CHANGELOG.md / version manifests
```

**Structure Decision**: Backend supplies day slices for reliable colouring; frontend owns pins/badges/list cleanup and stroke styling.

## Complexity Tracking

> None.
