# Implementation Plan: Fix Map Pick for Calcular Rota

**Branch**: `061-fix-map-route-pick` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/061-fix-map-route-pick/spec.md`

## Summary

Corrigir 060: com Calcular rota aberto, clicar num pin cuja cidade **já aparece no combobox** deve preencher De→Para (sem modal) e, quando ambos estiverem preenchidos e distintos, **auto-calcular**. Causa raiz provável: resolução pin→nó só por `local_id`/`waypoint_id`, enquanto o combobox aceita nós **só com nome** — o clique cai no fallthrough (modal). Alargar o resolver + disparar `calcular` após pick.

## Technical Context

**Language/Version**: TypeScript, React 19  
**Primary Dependencies**: `routeMapPick.ts`, `MapPage.tsx`, `RoutePlannerPanel.tsx`  
**Storage**: N/A (existing Local ↔ Waypoint data)  
**Testing**: Manual quickstart (symptom + auto-calc)  
**Target Platform**: Web  
**Project Type**: Frontend bugfix + UX polish  
**Performance Goals**: N/A  
**Constraints**: Same combobox IDs; no new map zones; keep Calcular button; digitizer/placement untouched  
**Scale/Scope**: Resolver match + mapPick apply + auto-calc hook  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clarifications locked (symptom, combobox cities exist, auto-calc): **PASS**
- Fix must not break closed-panel pin modal: **PASS**

**Post-Phase 1**: Unchanged — UI only.

## Project Structure

### Documentation (this feature)

```text
specs/061-fix-map-route-pick/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-map-route-pick-fix.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/components/routes/routeMapPick.ts       # Fix resolve: link + name match to named options
frontend/src/components/routes/RoutePlannerPanel.tsx # After mapPick apply both ends → void calcular()
frontend/src/pages/MapPage.tsx                       # Keep branch; verify open + resolve used
# Optional: small unit test for resolveNamedWaypointForLocal if harness exists — else manual
```

**Structure Decision**: Fix resolver first (unblocks fill); then auto-calc on successful dual fill in panel.

## Complexity Tracking

> None.
