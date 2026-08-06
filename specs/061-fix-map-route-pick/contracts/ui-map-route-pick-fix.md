# UI Contract: Map Route Pick Fix

**Feature**: `061-fix-map-route-pick`  
**Date**: 2026-08-06  
**Surfaces**: Map pins + Calcular rota (De / Para / resultados)

## Eligible pin (painel aberto)

A pin is eligible if resolution finds a **named** waypoint that would appear in the De/Para combobox, via:

1. `waypoint.local_id` link, or  
2. `local.waypoint_id`, or  
3. **Name match** between Local and waypoint label/nome (trim; case- and accent-insensitive)

| Action | Required |
|--------|----------|
| Click eligible | Fill De if empty, else Para; **no** Local modal |
| Both De & Para set and distinct | **Auto-run** plan (same as Calcular) |
| Third eligible click | Replace Para + auto-run again |
| Click ineligible | De/Para unchanged; modal MAY open (current) |
| Panel closed | Unchanged pin behaviour |

## Combobox

- Remains fully usable; hybrid De (list) + Para (map) auto-calcs when Para set via map.

## Non-goals

- New click zones/halos
- Changing plan API semantics
- Digitizer / placement

## Acceptance mapping

| Spec | UI |
|------|-----|
| FR-009 / symptom | No modal-only fallthrough for combobox cities |
| FR-010 | Name/link resolve |
| FR-001–002 | De then Para |
| FR-011 / SC-001 | Auto-calc |
| FR-008 | No new visuals |
