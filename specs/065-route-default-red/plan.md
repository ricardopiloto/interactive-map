# Implementation Plan: Route Default Red

**Branch**: `065-route-default-red` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/065-route-default-red/spec.md`

## Summary

CSS-only (plus trivial overlay class check): selected travel route base stroke returns from green (`#2f9e44`) to red (`#e5484d` family). Keep `--fadiga-1`…`--fadiga-6` darker reds for residual days. Alts stay dashed/lighter red so they remain distinct from selected base and from max fatigue.

## Technical Context

**Language/Version**: TypeScript/React (CSS in `CampaignMap.css`); no backend change  
**Primary Dependencies**: `CampaignMap.css`, `RouteOverlay.tsx`  
**Storage**: N/A  
**Testing**: Manual quickstart visual QA  
**Target Platform**: Web map travel overlay  
**Project Type**: Monorepo frontend visual tweak  
**Performance Goals**: N/A  
**Constraints**: Do not change overnight/fatigue eligibility logic (063/064); only base colour family  
**Scale/Scope**: Few CSS rules; confirm overlay class wiring  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec checklist complete; no open clarifications: **PASS**
- Scope limited to colour presentation: **PASS**

**Post-Phase 1**: Unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/065-route-default-red/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-route-default-red.md
└── tasks.md   # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/map/CampaignMap.css   # --selected green → red; tune alt vs fadiga contrast if needed
frontend/src/components/routes/RouteOverlay.tsx  # verify selected vs fadiga vs alt classes unchanged
CHANGELOG.md / version manifests
```

**Structure Decision**: Presentation-only CSS change; overlay class logic already correct.

## Complexity Tracking

> None.
