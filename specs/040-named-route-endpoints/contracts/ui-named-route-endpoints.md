# UI Contract: Named Route Endpoints Only

**Feature**: `040-named-route-endpoints`  
**Surface**: Calcular rota — De/Para comboboxes (`RoutePlannerPanel`)  
**Date**: 2026-08-04

## Scope

Endpoint pickers only. No HTTP contract changes. Digitizer / Rede out of scope.

## Options list

| Aspect | Contract |
|--------|----------|
| Included | Waypoints that are **named** per [data-model.md](../data-model.md) |
| Excluded | Unnamed waypoints (no `Nó {id}` rows) |
| Label | Waypoint name if present; else linked Local name |
| Search | Same filtered list; unnamed never match |
| Sort | Unchanged (locale-aware by label) |

## Selection & calculate

| Aspect | Contract |
|--------|----------|
| Pick | Only from filtered options |
| Stale id | Cleared if not in named options |
| Plan API | Unchanged; still called with chosen ids |
| Intermediates | May be unnamed; not shown as De/Para choices |

## Non-goals

| Aspect | Contract |
|--------|----------|
| Digitizer waypoint list | Unchanged (all nodes) |
| `GET /routes/plan` validation | No new namedness checks |
| `GET /waypoints` | No new named-only query required |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001–003, FR-006, SC-001–002 | Filtered De/Para |
| FR-004, SC-003 | Plan still traverses unnamed |
| FR-005, SC-004 | Digitizer untouched |
| FR-007 | No API reject |
