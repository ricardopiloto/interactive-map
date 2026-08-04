# Implementation Plan: Named Route Endpoints Only

**Branch**: `040-named-route-endpoints` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/040-named-route-endpoints/spec.md`

## Summary

In **Calcular rota** De/Para comboboxes, list only **named** waypoints (own trimmed name, or linked Local with trimmed name). Drop fallback `Nó {id}` options from the planner. Unnamed nodes remain in the graph for pathfinding and in the GM digitizer. UI-only filter — no plan API or waypoint list API changes (clarification A).

## Technical Context

**Language/Version**: TypeScript / React 19

**Primary Dependencies**: `RoutePlannerPanel.tsx` (`waypointOptionLabel`, `options` useMemo); `WaypointCombobox`; existing `Waypoint` / `Local` types

**Storage**: N/A

**Testing**: Manual via [quickstart.md](./quickstart.md)

**Target Platform**: Modern browsers

**Project Type**: Web application (route planner UX)

**Performance Goals**: Same in-memory filter over waypoints already loaded (O(n) map/filter)

**Constraints**:
- Named rule per FR-002 (clarifications + edge cases)
- No `Nó {id}` in De/Para (FR-001, FR-003)
- Pathfinding / plan API unchanged (FR-004, FR-007)
- Digitizer unchanged (FR-005)
- Clear stale selection if selected id becomes unnamed / missing from options

**Scale/Scope**: Primarily `frontend/src/components/routes/RoutePlannerPanel.tsx` (+ small shared helper if useful). No backend. No digitizer.

## Constitution Check

| Gate | Status |
|------|--------|
| Clarification closed (UI-only) | PASS |
| No persistence / plan API change | PASS |
| Digitizer out of scope | PASS |
| Minimal change (filter options) | PASS |

**Post-design re-check**: PASS — UI contract; namedness rules in data-model; no HTTP contracts.

## Project Structure

### Documentation (this feature)

```text
specs/040-named-route-endpoints/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-named-route-endpoints.md
└── tasks.md             # /speckit-tasks
```

### Source Code

```text
frontend/src/components/routes/
├── RoutePlannerPanel.tsx   # filter options to named only; helper isNamedWaypoint
└── WaypointCombobox.tsx    # unchanged (receives filtered options)
```

Optional: extract `isNamedWaypoint` / label helper to `frontend/src/utils/` only if reused; otherwise keep local to the panel.

**Structure Decision**: Filter at options construction in `RoutePlannerPanel` before sort — single choke point for De and Para. Digitizer and `campaignApi` plan calls untouched.

## Complexity Tracking

Sem violações. Alternativa “API reject” rejeitada na clarification.
