# Data Model: Thinner Segment Lines

**Feature**: `042-thinner-segment-lines` | **Date**: 2026-08-04

Sem entidades persistidas. Modelo = token de apresentação do traço.

## Entities (UI)

### SegmentStrokeStyle

| Field | Before | After (target) |
|-------|--------|----------------|
| `stroke-width` | 2.5 | ≤ 1.5 (~60%) |
| Applies to | `.route-digitizer__seg` (+ draft) | same |
| Type colors | estrada / rio / trilha | unchanged |
| Dash (trilha/draft) | `4 3` / `5 4` | optional slight scale-down |

### Invariants

- Geometry (`pontos_intermediarios`, endpoints) unchanged.
- Digitizer-only; overlay/lore strokes independent.

## Validation

- Computed/CSS `stroke-width` ≤ 1.5 (or ≤ 60% of prior measured value).
- All three tipos + draft still distinguishable.
