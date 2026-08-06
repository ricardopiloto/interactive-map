# Research: Fix Map Pick for Calcular Rota

**Feature**: `061-fix-map-route-pick` | **Date**: 2026-08-06

## 1. Root cause of 060 symptom

**Decision**: Treat primary bug as **failed pin→waypoint resolution**, not missing UI wiring.

**Evidence**:

- Symptom: panel open → pin click → **modal** + De/Para unchanged → `selectLocalFromMap` fallthrough (`resolveNamedWaypointForLocal` returned `null`).
- Same cities appear in combobox → a **named** waypoint exists for that label.
- Current resolver only checks:
  1. `waypoints.find(w => w.local_id === localId)`
  2. `local.waypoint_id` → waypoint by id  
  It does **not** match `Local.nome` to a named waypoint’s `nome` / combobox label.
- Combobox eligibility (`isNamedWaypoint`) is true when `wp.nome` is set **even if `local_id` is null**.

**Rationale**: Explains “city in list” + “click acts like no node”.

**Alternatives considered**: `routePlannerOpen` false (user would not see panel); mapPick effect bug (would fill without modal — contradicts symptom); z-index blocking clicks (would be “nothing”, not modal).

## 2. Resolution strategy (FR-010)

**Decision**: Extend `resolveNamedWaypointForLocal` priority:

1. `waypoint.local_id === localId` (named)
2. `local.waypoint_id` → that waypoint (named)
3. **NEW**: among **named** waypoints (same set as combobox), match Local name to `waypointOptionLabel` / `wp.nome` with trim + case-insensitive (+ accent-insensitive via `frontend/src/utils/textMatch.ts` fold / equality on folded strings)
4. If multiple name matches: prefer already-handled link; else lowest `id` (stable)

**Rationale**: User expectation = “cidade no mapa = mesma entrada De/Para”; FR-003/FR-010.

**Alternatives considered**: Force all waypoints to have `local_id` in DB (correct long-term, doesn’t fix current data); only use `linked_only` waypoints for map pick (would shrink eligible set vs combobox — worse UX).

## 3. Auto-calc (FR-011)

**Decision**: After a map pick updates De/Para state, if `origemId` and `destinoId` are both set and distinct, call existing `calcular()` (same path as the button). Trigger also when hybrid: De from combobox, Para from map.

**Rationale**: Clarification Q3; existing recalc effects only watch ordenacao/modo/preferencia — **not** origem/destino — so map fill alone never auto-plans today.

**Implementation note**: Apply pick with functional updates or call `calcular` in the mapPick effect after setting both ids (pass explicit ids into `calcular` overload if closure stale — prefer extending `calcular` to accept optional origem/destino overrides like it already does for ordenacao).

**Alternatives considered**: New effect on `[origemId, destinoId]` always auto-calc (might surprise when typing combobox mid-edit — scoped trigger from map pick + optionally when second field becomes set is enough; if combobox selection also sets both, product already may not auto-calc — FR-011 says when both filled including map completing second field; hybrid via map Para is in US3).

## 4. Modal policy unchanged

**Decision**: Keep 060 policy: eligible pick → no `selectLocal`; ineligible → existing modal path.

**Rationale**: Spec FR-004/FR-005.

## 5. Non-goals

**Decision**: No new hit-area CSS; no route algorithm changes; no requiring DB migration for links (name fallback covers orphan named nodes).
