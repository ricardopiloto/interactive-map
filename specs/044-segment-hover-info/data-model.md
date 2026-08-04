# Data Model: Segment Hover Info

**Feature**: `044-segment-hover-info` | **Date**: 2026-08-04

Sem entidades persistidas. Modelo = estado de hover + apresentação no digitizer.

## Entities (UI)

### SavedSegment (existing)

| Field | Notes |
|-------|--------|
| `id` | Primary key; hover key |
| `waypoint_a_id` / `waypoint_b_id` | Endpoints |
| `tipo` | estrada / rio / trilha |
| `distancia_milhas` | Distance cue |
| `pontos_intermediarios` | Geometry for polyline |

Unchanged on server.

### SegmentIdentity (derived)

| Field | Notes |
|-------|--------|
| `labelA` / `labelB` | Waypoint `nome` if set, else id-style (`#id` / same as list) |
| `tipo` | Route type |
| `distancia` | Miles when available |
| `display` | e.g. `{labelA}↔{labelB} · {tipo} · {n} mi` |

### HoverSession (UI state)

| Field | Type | Notes |
|-------|------|--------|
| `hoveredSegmentId` | `number \| null` | Active saved segment under pointer |
| `tooltipPos` | optional `{x,y}` | Stage-relative or viewport for label placement |

**Invariant**: Draft polyline never sets `hoveredSegmentId`.

## Transitions

| Event | Effect |
|-------|--------|
| Pointer enter saved segment hit target | Set `hoveredSegmentId`; show tooltip; highlight + scroll list row; emphasize stroke |
| Pointer leave hit target | Clear `hoveredSegmentId`; hide tooltip; clear list highlight + stroke emphasis |
| Segment deleted while hovered | Clear hover (reload / filter) |

## Validation

- Tooltip text matches list identity cues (FR-002/003).
- List highlight id === hovered segment id (FR-009).
- Hover alone never deletes (FR-006).
