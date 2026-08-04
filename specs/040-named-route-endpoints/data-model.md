# Data Model: Named Route Endpoints Only

**Feature**: `040-named-route-endpoints` | **Date**: 2026-08-04

Sem entidades persistidas novas. Modelo = regra de elegibilidade de endpoint na UI.

## Entities (existing)

### Waypoint

| Field | Role for this feature |
|-------|------------------------|
| `id` | Endpoint id when selected |
| `nome` | Optional; non-empty trim ⇒ named |
| `local_id` | Optional link to Local |

### Local

| Field | Role |
|-------|------|
| `id` | Join key from `waypoint.local_id` |
| `nome` | Non-empty trim ⇒ named via link |

## Namedness (derived)

| Status | Rule |
|--------|------|
| **Named** | `trim(waypoint.nome) ≠ ''` **OR** (`local_id` set **AND** linked Local exists **AND** `trim(local.nome) ≠ ''`) |
| **Unnamed** | Otherwise (including whitespace-only names, missing Local, empty Local name) |

**Invariant (planner UI)**: De/Para option lists ⊆ named waypoints only.

**Invariant (graph)**: Unnamed waypoints remain edges/nodes for `plan_routes`; not removed from storage.

## UI state

| Field | Notes |
|-------|--------|
| `origemId` / `destinoId` | Must be empty or a named waypoint id present in options |
| Transition | Options shrink → if current id ∉ options, clear to `''` |

## Validation

- No option whose display would be only `Nó {id}`.
- Named→named plan still returns routes that may list unnamed ids only as intermediates in `waypoint_ids` (OK).
