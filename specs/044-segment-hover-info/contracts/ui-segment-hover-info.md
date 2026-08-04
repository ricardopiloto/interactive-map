# UI Contract: Segment Hover Info

**Feature**: `044-segment-hover-info`  
**Surface**: Rede de rotas (`RouteDigitizerView`)  
**Date**: 2026-08-04

## Scope

Saved-segment hover identity on the digitizer map + Segmentos list. No HTTP. No campaign map / planner.

## Hover target

| Aspect | Contract |
|--------|----------|
| What | Saved segment polylines only (not draft) |
| Hit | Wider than painted stroke so thin lines are hittable |
| Click | Must not delete; must not block stage draw/place click bubbling unnecessarily |

## Identity presentation

| Aspect | Contract |
|--------|----------|
| Map | Tooltip/label with endpoints (prefer names), tipo, distance |
| List | Matching Segmentos row highlighted while hovered |
| Scroll | Bring highlighted row into view if needed (FR-010) |
| Dismiss | Leave segment → clear tooltip, list highlight, stroke emphasis |

## Visual emphasis

| Aspect | Contract |
|--------|----------|
| Hovered stroke | Clearly distinct from other saved segments |
| Type color | Still recognizable |

## Non-goals

| Aspect | Contract |
|--------|----------|
| Delete on hover / map-click delete | Out of scope |
| CampaignMap / Calcular rota | Unchanged |
| Global stroke thickness | Unchanged (042) |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001–003, SC-001 | Identity content |
| FR-004, SC-003, SC-005 | Dismiss both surfaces |
| FR-005, US2 | Stroke emphasis |
| FR-006, SC-004* | No delete from hover |
| FR-007 | Draft excluded |
| FR-008 | Lore/planner untouched |
| FR-009–010 | Tooltip + list + scroll |

\*SC-004 may be implied by FR-006 even if numbering in spec skipped; treat as no accidental delete.
