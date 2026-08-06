# Implementation Plan: Map Pick Route Cities

**Branch**: `060-map-pick-route-cities` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/060-map-pick-route-cities/spec.md`

## Summary

Com **Calcular rota** aberto, clicar num pin de Local ligado a um **nó nomeado** da rede preenche **De** ou **Para** (estado dos campos: De vazio → De; senão → Para) sem abrir o modal do Local. Pin sem nó mantém o comportamento actual (modal/selecção). Sem zonas clicáveis novas. Frontend-only wiring entre `MapPage` / `CampaignMap` pin click e `RoutePlannerPanel`.

## Technical Context

**Language/Version**: TypeScript, React 19  
**Primary Dependencies**: `MapPage.tsx`, `RoutePlannerPanel.tsx`, `CampaignMap.tsx`, types `Local` / `Waypoint`  
**Storage**: N/A (uses existing `Waypoint.local_id` / `Local.waypoint_id`)  
**Testing**: Manual visual quickstart  
**Target Platform**: Web (player + GM with planner open)  
**Project Type**: Frontend UX feature  
**Performance Goals**: N/A  
**Constraints**: No new hit-area UI; only when `routePlannerOpen`; same waypoint IDs as combobox; digitizer/placement modes unchanged  
**Scale/Scope**: MapPage click branch + panel apply-pick + small helper for local→named waypoint  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder — Spec Kit norms.

- Clarifications locked (field state, modal policy): **PASS**
- No visual click zones: **PASS**
- Combobox remains available: **PASS**

**Post-Phase 1**: Unchanged — UI contract; no API/schema.

## Project Structure

### Documentation (this feature)

```text
specs/060-map-pick-route-cities/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-map-pick-route.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/pages/MapPage.tsx                    # Branch selectLocalFromMap when routePlannerOpen
frontend/src/components/routes/RoutePlannerPanel.tsx  # Accept map-pick → set origem/destino + queries
frontend/src/components/routes/routeMapPick.ts    # OPTIONAL: resolve localId → named waypoint id
# CampaignMap: likely unchanged (still calls onSelectLocal)
# No CSS for new zones
```

**Structure Decision**: Keep pin click entry in MapPage; RoutePlannerPanel owns De/Para state and applies FR-007; optional tiny pure helper for eligibility lookup shared with panel’s named-waypoint rules.

## Complexity Tracking

> None.
