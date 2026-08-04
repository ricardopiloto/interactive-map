# Research: Named Route Endpoints Only

**Feature**: `040-named-route-endpoints` | **Date**: 2026-08-04

## 1. Where to filter

**Decision**: Filter in `RoutePlannerPanel` when building combobox `options` (both De and Para share the same list).

**Rationale**: Single UI entry for endpoint choice; `WaypointCombobox` already filters by label string — excluding unnamed upstream removes `Nó {id}` from search too.

**Alternatives considered**:
- Filter inside `WaypointCombobox` via prop — unnecessary if panel owns the list
- Filter on `GET /waypoints` — rejected (clarification: UI only; would affect other consumers)
- Reject in `GET /routes/plan` — deferred (FR-007)

## 2. Named vs unnamed predicate

**Decision**: Mirror current label priority without the fallback:

```text
named ⇔ trim(wp.nome) ≠ ''  OR  (local_id linked AND trim(local.nome) ≠ '')
```

Unnamed ⇒ would have been labeled `Nó {id}` today — exclude from options.

**Rationale**: Matches FR-002 and existing `waypointOptionLabel` semantics minus the id fallback.

**Alternatives considered**:
- Require only `wp.nome` (ignore Local) — stricter than product language “local nomeado”
- Require `local_id` only — would hide named junction nodes without a Local link

## 3. Stale selection

**Decision**: If `origemId` / `destinoId` is set but the id is not in the filtered named options, treat as empty (clear selection and/or query) so Calcular cannot proceed with an invisible id.

**Rationale**: Spec edge case; prevents calculating with a leftover unnamed id after data refresh.

## 4. Pathfinding / digitizer

**Decision**: No code changes. Full waypoint graph still loaded for planning; digitizer keeps full list.

**Rationale**: US2, FR-004, FR-005.

## 5. Label helper cleanup

**Decision**: Keep `waypointOptionLabel` for named rows only (after filter, fallback `Nó {id}` is dead code for planner options). Either leave fallback for safety or assert named-only — prefer keep fallback as defensive last resort that should never appear in UI after filter.

**Rationale**: YAGNI; filter is the contract.

## 6. Backend / CHANGELOG

**Decision**: No backend. Document under next patch (e.g. 0.6.6) when implementing.
