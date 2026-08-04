# Implementation Plan: Tighter Finish Snap

**Branch**: `043-tighter-finish-snap` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/043-tighter-finish-snap/spec.md`

## Summary

On **Rede de rotas**, shrink only the **finish** snap (closing a draft segment onto a waypoint) to ~half of today’s unified `NODE_SNAP` (0.01 → ~0.005). Keep **origin** snap at 0.01. Make the visible node **aura (and hit box) mode-aware** so it always equals the snap zone in effect: origin-sized when idle / picking origin; finish-sized while a draft is open. Digitizer frontend only; no API/DB/lore-map changes.

## Technical Context

**Language/Version**: TypeScript / React 19 / CSS

**Primary Dependencies**: `RouteDigitizerView.tsx` (`NODE_SNAP`, `nearestWaypoint`, draft state `draftA`); `RouteDigitizer.css` (`.route-digitizer__wp` 22px aura)

**Storage**: N/A

**Testing**: Manual via [quickstart.md](./quickstart.md)

**Target Platform**: Modern browsers (GM desktop primary)

**Project Type**: Web application (GM digitizer UX)

**Performance Goals**: No extra per-node DOM; CSS size class toggle only

**Constraints**:
- Finish snap ≤ ~50% of current unified 0.01 (SC-001)
- Origin snap unchanged (FR-004)
- Aura exactly matches active snap (FR-007 / Clarifications)
- No CampaignMap / planner / API changes (FR-006)

**Scale/Scope**: `frontend/src/components/gm/RouteDigitizerView.tsx`, `RouteDigitizer.css` only (+ CHANGELOG note when shipping)

## Constitution Check

| Gate | Status |
|------|--------|
| Clarification closed (aura = active snap) | PASS |
| Digitizer-only; no API/DB | PASS |
| Minimal constants + CSS mode class | PASS |

**Post-design re-check**: PASS — UI contract; dual snap + mode-aware aura; no HTTP.

## Project Structure

### Documentation (this feature)

```text
specs/043-tighter-finish-snap/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-tighter-finish-snap.md
└── tasks.md             # /speckit-tasks — not created here
```

### Source Code

```text
frontend/src/components/gm/
├── RouteDigitizerView.tsx   # ORIGIN_SNAP + FINISH_SNAP; stage pick by draft phase; aura class from draftA
└── RouteDigitizer.css       # default wp = origin size; --closing / finish modifier = half diameter
```

**Structure Decision**: Split unified `NODE_SNAP` into `ORIGIN_SNAP` (0.01) and `FINISH_SNAP` (~0.005). Stage clicks use origin when `draftA == null`, finish when draft open. Toggle a CSS modifier on `.route-digitizer__wp` (e.g. `--closing`) while draft is open so element size + aura ≈ finish zone; default size remains origin/aura. Direct `__wp` button click still selects that node (disk always inside both zones). Do not touch `CampaignMap`.

## Complexity Tracking

Sem violações. Assimetria origin/finish + aura mode-aware é exigência da clarificação (reverte parcialmente o “um raio” de 041 só no lado finish).
