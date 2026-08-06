# Implementation Plan: Clean Calcular Rota Panel

**Branch**: `055-clean-route-planner` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/055-clean-route-planner/spec.md`

## Summary

Reorganize **Calcular rota** for progressive disclosure: vertical order **De → Para → Calcular → Opções (collapsed) → Resultados**. Advanced controls move into a collapsible “Opções de viagem” with a **non-default-only** header summary. Compact result rows and shorter labels. **No backend / planner logic changes** — preserve 046/050/054 behaviors.

## Technical Context

**Language/Version**: TypeScript, React 19  
**Primary Dependencies**: Existing `RoutePlannerPanel`, `RoutePlanner.css`  
**Storage**: N/A (UI state only: `optionsOpen`)  
**Testing**: Manual quickstart  
**Target Platform**: Web (desktop + narrow panel / mobile)  
**Project Type**: Frontend panel in monorepo web app  
**Performance Goals**: Same; no extra plan calls beyond existing auto-recalc  
**Constraints**: FR-010 — presentation only; no API/route_planner changes  
**Scale/Scope**: One panel component + CSS  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder — Spec Kit norms.

- UI-only / no capability removal: **PASS**
- Clarified order + collapsed summary: **PASS**

**Post-Phase 1**: Unchanged — UI contract only.

## Project Structure

### Documentation (this feature)

```text
specs/055-clean-route-planner/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-clean-route-planner.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/components/routes/RoutePlannerPanel.tsx   # layout, collapse, summary, labels, result meta
frontend/src/components/routes/RoutePlanner.css        # options block, compact items
# Optional small helper (same file or adjacent):
# formatOptionsSummary(...) for non-default chips
```

**Structure Decision**: Frontend-only edits to the existing route planner panel.

## Complexity Tracking

> None.
