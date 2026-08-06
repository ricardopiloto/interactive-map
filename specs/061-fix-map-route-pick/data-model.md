# Data Model: Fix Map Pick for Calcular Rota

**Feature**: `061-fix-map-route-pick` | **Date**: 2026-08-06

No new persisted entities.

## Resolution entity (logical)

### PinToNamedWaypoint

| Step | Match | Result |
|------|--------|--------|
| 1 | `Waypoint.local_id == Local.id` + named | That waypoint |
| 2 | `Local.waypoint_id` + named | That waypoint |
| 3 | Named waypoint whose label/nome equals Local.nome (trim, case-insensitive) | That waypoint |
| — | None | Ineligible → modal path |

### RouteEndpointFields

| Event | De | Para | Plan |
|-------|----|------|------|
| Eligible pick, De empty | Set | — | No auto-calc yet |
| Eligible pick, De set | Keep | Set/replace | Auto-calc if De ≠ Para |
| Same id both ends | — | — | No false routes; error on calc |

## Validation

- Resolved waypoint id MUST be in combobox named set.
- Auto-calc uses same API as Calcular button.
