# Data Model: Digitizer Node Hit Aura

**Feature**: `041-digitizer-node-aura` | **Date**: 2026-08-04

Sem entidades persistidas. Modelo = parâmetros de interação/apresentação no digitizer.

## Entities (UI)

### NodePickZone

| Field | Type | Notes |
|-------|------|--------|
| `NODE_SNAP` | number (0–1) | Max Euclidean distance in normalized map coords for `nearestWaypoint` |
| Scope | — | Used for **both** origin and finish segment picks |

**Invariant**: No separate origin/finish snap constants.

**Target**: `NODE_SNAP ≤ 0.021` (≤70% of former 0.03); recommended ~0.01.

### NodeAura (presentation)

| Field | Notes |
|-------|--------|
| Visibility | Always on for every rendered `__wp` |
| Extent | Matches interactive zone (element hit + snap intent) |
| Active | `.is-active` distinct from default aura |

### Waypoint (existing)

Unchanged fields (`id`, `x`, `y`, …). Only pick radius / chrome change.

## Transitions

| Mode | Pick |
|------|------|
| Start segment | `nearestWaypoint(x, y, NODE_SNAP)` |
| Finish segment | `nearestWaypoint(x, y, NODE_SNAP)` (same) |
| Click `__wp` | Direct select; hit area ≈ aura |

## Validation

- Origin and finish use identical constant.
- Aura visible without hover.
- Click outside zone does not pick that node.
