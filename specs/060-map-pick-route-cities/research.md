# Research: Map Pick Route Cities

**Feature**: `060-map-pick-route-cities` | **Date**: 2026-08-05

## 1. Eligibility: Local → named waypoint

**Decision**: A pin is eligible iff there is a waypoint usable in the De/Para combobox linked to that Local, using the same `isNamedWaypoint` rules as `RoutePlannerPanel`:

1. Prefer `waypoints.find(w => w.local_id === localId)` (canonical link on Waypoint).
2. Also accept `local.waypoint_id` if present and that waypoint is named (defensive if list/API exposes it).
3. Named = `wp.nome?.trim()` OR linked local has trimmed name (existing helper).

If no such waypoint → treat as **sem nó** for this feature.

**Rationale**: Combobox already filters to named waypoints; map pick must produce the same `origemId`/`destinoId` (FR-006).

**Alternatives considered**: Click any pin and invent a route endpoint — rejected (spec: sem nó → nada para rota). Geographic hit on unnamed network nodes — rejected (no new zones; out of scope).

## 2. Wiring MapPage ↔ RoutePlannerPanel

**Decision**: Keep `origemId`/`destinoId` inside `RoutePlannerPanel`. MapPage, when `routePlannerOpen` and pin eligible, signals a pick (e.g. `mapPick={{ waypointId, nonce }}` prop or equivalent) and **does not** call `selectLocal` (avoids PinModal). Panel effect/handler applies FR-007 and syncs combobox query labels via existing `waypointOptionLabel`.

**Rationale**: Panel already owns validation and labels; lifting state would be a larger refactor for little gain.

**Alternatives considered**: Lift De/Para to MapPage — more churn; imperative `ref.applyPick` — works but prop+nonce is more React-idiomatic here.

## 3. FR-007 field-state apply

**Decision**: On eligible pick:

```text
if (origemId === '') → setOrigemId(wpId), setOrigemQuery(label)
else → setDestinoId(wpId), setDestinoQuery(label)
```

Clearing De in combobox already clears `origemId`; next pick fills De again (no separate click counter).

**Rationale**: Matches Clarification Q3; hybrid combobox+map.

## 4. Modal policy (FR-008)

**Decision**:

| Panel open? | Named waypoint for pin? | Action |
|-------------|-------------------------|--------|
| No | * | Existing `selectLocalFromMap` |
| Yes | Yes | Apply pick only; no `setSelectedLocalId` |
| Yes | No | Existing `selectLocalFromMap` (player → modal) |

**Rationale**: Clarification Q2 option C.

## 5. Placement / digitizer / GM

**Decision**: Existing guards (`placement !== 'none'`) remain first. Digitizer view is separate — out of scope. GM: PinModal already player-only; eligible pick still fills planner when open.

**Rationale**: Spec out of scope / edge cases.

## 6. Visual affordances

**Decision**: No cursor/halo/CSS changes for “route pick mode”. Optional: none.

**Rationale**: FR-003 / SC-003.
