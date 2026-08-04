# Data Model: Tighter Finish Snap

**Feature**: `043-tighter-finish-snap` | **Date**: 2026-08-04

Sem entidades persistidas. Modelo = parâmetros de interação/apresentação no digitizer.

## Entities (UI)

### OriginSnapZone

| Field | Type | Notes |
|-------|------|--------|
| `ORIGIN_SNAP` | number (0–1) | Max Euclidean distance in normalized map coords for picking segment **origin** |
| Value | `0.01` | Unchanged from post-041 `NODE_SNAP` |

### FinishSnapZone

| Field | Type | Notes |
|-------|------|--------|
| `FINISH_SNAP` | number (0–1) | Max distance to **close** draft onto a different waypoint |
| Value | `0.005` | ≤ ~50% of prior unified finish (0.01); SC-001 |

**Invariant**: `FINISH_SNAP < ORIGIN_SNAP` (and ≤ ~0.5 × prior finish).

### NodeAura (presentation)

| Field | Notes |
|-------|--------|
| Visibility | Always on for every rendered `__wp` |
| Extent (idle / origin pick) | Matches `ORIGIN_SNAP` (~22px element) |
| Extent (draft open / finish) | Matches `FINISH_SNAP` (~11px element; modifier class) |
| Active | `.is-active` remains distinct (origin-in-progress) |

### DraftSegment (existing UI state)

| Field | Notes |
|-------|--------|
| `draftA` | Origin waypoint id while drawing; `null` = no open draft |
| `draftMids` | Midpoints; unchanged |

**Drive for aura mode**: `draftA != null` → finish-sized aura; else → origin-sized.

### Waypoint (existing)

Unchanged fields. Only pick radius / chrome change.

## Transitions

| Mode | Pick | Aura size |
|------|------|-----------|
| Start segment (`draftA == null`) | `nearestWaypoint(x, y, ORIGIN_SNAP)` | Origin |
| Finish / midpoints (`draftA != null`) | `nearestWaypoint(x, y, FINISH_SNAP)` then finish or add mid | Finish |
| Click `__wp` | Direct select; hit area ≈ current aura | As above |
| Idle / place-wp | N/A for segment snap | Origin-sized (idle presentation) |

## Validation

- Origin snap not reduced.
- Finish snap ≤ ~half of previous unified.
- Aura never larger than active snap zone.
- Outside finish zone → no close (midpoint or non-finish).
