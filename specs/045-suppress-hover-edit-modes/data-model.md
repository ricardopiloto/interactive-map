# Data Model: Suppress Segment Hover in Edit Modes

**Feature**: `045-suppress-hover-edit-modes` | **Date**: 2026-08-04

Sem entidades persistidas. Extensão do modelo de hover 044 + modo do digitizer.

## Entities (UI)

### DigitizerMode (existing)

| Value | Hover |
|-------|--------|
| `idle` | Segment-hover enabled (044) |
| `place-wp` | Segment-hover suppressed (UI + hit) |
| `draw-seg` | Segment-hover suppressed (UI + hit) |

### HoverSession (from 044)

| Field | Notes |
|-------|--------|
| `hoveredSegmentId` | Must be `null` whenever mode ≠ idle |
| `tooltipPos` | Cleared with hovered id |

**Derived**: `segmentHoverEnabled = mode === 'idle'`

## Transitions

| Event | Effect |
|-------|--------|
| Enter `place-wp` or `draw-seg` | Clear hover session; unmount/disable hit targets |
| Pointer over saved segment while edit mode | No hover UI; clicks reach stage for place/draw |
| Return to `idle` | Hit targets + 044 presentation available again |

## Validation

- Edit modes: zero hover UI; hits inactive.
- Idle: 044 behavior intact.
- Mode switch clears sticky hover.
