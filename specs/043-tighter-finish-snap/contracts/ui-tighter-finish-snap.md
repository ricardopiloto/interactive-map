# UI Contract: Tighter Finish Snap

**Feature**: `043-tighter-finish-snap`  
**Surface**: Rede de rotas (`RouteDigitizerView`)  
**Date**: 2026-08-04

## Scope

GM digitizer finish snap radius + mode-aware node aura. No HTTP. No campaign map pins/party. No route planner De/Para.

## Pick zones

| Aspect | Contract |
|--------|----------|
| Origin radius | `ORIGIN_SNAP = 0.01` (unchanged vs post-041) |
| Finish radius | `FINISH_SNAP ≈ 0.005` (≤ ~50% of prior unified 0.01) |
| When origin | `draw-seg` and no open draft (`draftA == null`) |
| When finish | Open draft (`draftA != null`); nearest different node within finish radius closes |
| Outside finish | Do not close; existing midpoint (or non-finish) path |
| Nearest | Unchanged nearest-within-max algorithm |
| Button hit | Element size tracks active aura (origin vs finish modifier) |

## Aura

| Aspect | Contract |
|--------|----------|
| Equality | Aura extent **exactly** matches snap zone currently in effect (FR-007) |
| Idle / origin pick | Origin-sized aura (~22px as today) |
| Draft open | Finish-sized aura (~half diameter) |
| Zoom | Counter-scaled with node (`--map-zoom`) |
| Active | Origin-in-progress (`.is-active`) still distinct |
| Palette | Unchanged nocturne/digitizer chrome |

## Non-goals

| Aspect | Contract |
|--------|----------|
| CampaignMap pins/party | Unchanged |
| Route planner | Unchanged |
| Segment stroke (042) | Unchanged |
| API / persistence | Unchanged |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001, SC-001 | Smaller `FINISH_SNAP` |
| FR-002, SC-002 | Outside finish zone does not close |
| FR-003, SC-003 | Inside finish zone closes |
| FR-004, SC-004 | Origin snap unchanged / usable |
| FR-007, SC-005 | Aura size follows draft phase |
| FR-005 | Undo / draw / place flows intact |
| FR-006 | Lore map / planner untouched |
