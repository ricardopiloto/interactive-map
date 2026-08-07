# Data Model: Route Overnight Pins & Fatigue Segment Colors

**Feature**: `063-route-pin-fatigue-colors` | **Date**: 2026-08-07

Additive computed fields on existing plan response. No new DB tables.

## DiaVisual (new on RoutePlanItem)

| Field | Type | Rules |
|-------|------|--------|
| dia | int | 1-based march day |
| residual | bool | true if relento overnight or arrival day without recovering overnight |
| fadiga_apos | int | ≥0; saldo after this day’s +1 / optional −1; 0 when ritmo normal |
| geometria | list[{x,y}] | Polyline points for this day’s stretch along the route (0–1 coords) |

**Count**: `len(dias_visuais) == number of march days` (= `len(pernoites) + 1`).

**Colour rule (client)**:

- If `residual == false` OR `fadiga_apos == 0` → paint green (or inherit base green).
- If `residual == true` AND `fadiga_apos >= 1` → red level `min(6, fadiga_apos)`.

## RoutePlanItem (extensions)

Existing `pernoites`, `fadiga_saldo`, `fadiga_pico`, … unchanged for API consumers.

Add:

- `dias_visuais: list[DiaVisual]` (default `[]`)

## UI-only state (not persisted)

| Concept | Source |
|---------|--------|
| Relento pin positions | `pernoites` where `tipo=relento` on **selected** route |
| Local overnight badge set | `local_id` from `pernoites` where `tipo=local` on selected route |
| List copy | No pernoite/fadiga strings |

## Relationships

```text
RoutePlanItem 1──* DiaVisual
RoutePlanItem 1──* Pernoite   (062; still used for pins/badges)
DiaVisual.geometria ⊆ RoutePlanItem.geometria (ordered subset)
```
