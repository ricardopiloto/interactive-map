# UI Contract: Map Pick Route Cities

**Feature**: `060-map-pick-route-cities`  
**Date**: 2026-08-05  
**Surfaces**: Campaign map pins + Calcular rota panel (De / Para)

## When Calcular rota is open

| Pin click | De / Para | Pin modal (player) |
|-----------|-----------|--------------------|
| Local with **named** linked waypoint | De empty → set De; else set/replace Para | **Must not** open |
| Local **without** named linked waypoint | Unchanged | Opens as today |
| Visual | No new zones/halos/hit-areas | — |

## When Calcular rota is closed

- Pin click behaviour unchanged (select + modal for player).

## Field rules (FR-007)

1. Eligible pick + De empty → De = that waypoint (label synced).
2. Eligible pick + De set → Para = that waypoint (label synced).
3. Clearing De in combobox → next eligible pick fills De again.
4. Combobox typing/selection remains fully available.

## Non-goals

- Drawing waypoint hit zones
- Selecting unnamed / unlinked network-only nodes from the map
- Changing route calculation API
- Digitizer / pin placement modes

## Acceptance mapping

| Spec | UI |
|------|-----|
| FR-001 / FR-007 | Field-state fill |
| FR-002 / FR-008 | Ineligible → modal; eligible → no modal |
| FR-003 / SC-003 | No new click visuals |
| FR-004 | Closed panel unchanged |
| FR-005 / FR-006 | Combobox + same IDs |
| SC-001 | Two clicks → Calcular |
