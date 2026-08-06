# Data Model: Map Pick Route Cities

**Feature**: `060-map-pick-route-cities` | **Date**: 2026-08-05

No new persisted entities. Uses existing Local ↔ Waypoint link.

## Entities (logical)

### LocalPinClick

| Field | Meaning |
|-------|---------|
| `localId` | Pin clicked on map |
| Eligible? | Exists named waypoint linked to this local |

### RouteEndpointFields (panel state)

| Field | Rules on eligible map pick |
|-------|----------------------------|
| `origemId` | Set if currently empty |
| `destinoId` | Set/replaced if `origemId` already set |
| Queries | Updated to `waypointOptionLabel` for the picked waypoint |

### Link resolution

```text
Local --(waypoint.local_id | local.waypoint_id)--> Waypoint (named) --> De/Para id
```

## State transitions

```text
[Planner closed] --pin--> selectLocal (+ modal if player)
[Planner open, eligible] --pin--> update De/Para; no modal
[Planner open, ineligible] --pin--> selectLocal (+ modal if player)
[De cleared in UI] --next eligible pin--> fills De
```

## Validation

- Same as combobox: only named waypoint IDs.
- Calcular still rejects empty / origem === destino.
