# Research: Suppress Segment Hover in Edit Modes

**Feature**: `045-suppress-hover-edit-modes` | **Date**: 2026-08-04

## 1. When hover is allowed

**Decision**: `segmentHoverEnabled = (mode === 'idle')` only. Both `place-wp` and `draw-seg` disable hover.

**Rationale**: FR-001/002/003; matches Novo nó / Traçar segmento tools.

## 2. Disable hit targets (Option B)

**Decision**: When `!segmentHoverEnabled`, **do not render** `.route-digitizer__seg-hit` polylines (preferred). Painted `__seg` strokes stay `pointer-events: none` as today.

**Rationale**: FR-007 — wide transparent strokes must not intercept place/draw clicks. Unmounting is clearer than toggling CSS and avoids residual hit testing quirks.

**Alternatives considered**:
- CSS `pointer-events: none` on hits only — also valid; slightly easier to leave DOM mounted
- Keep hits but no-op handlers — rejected (still intercepts clicks)

## 3. Clear hover on mode change

**Decision**: `useEffect` on `mode`: if `mode !== 'idle'`, set `hoveredSegmentId = null` and `tooltipPos = null`. Also clear when toolbar buttons set place/draw (effect covers that).

**Rationale**: FR-004 / SC-004 — no sticky tooltip/list/stroke.

## 4. Guard handlers

**Decision**: Early-return in `onSavedSegPointerEnter` / move if `!segmentHoverEnabled` (defense in depth if hits briefly exist).

**Rationale**: Belt-and-suspenders with unmount.

## 5. Idle regression

**Decision**: No changes to identity string, tooltip chrome, list highlight, or stroke emphasis when idle.

**Rationale**: FR-003, FR-008, SC-003.

## 6. Backend / lore map

**Decision**: No changes.

## 7. CHANGELOG

**Decision**: Fold into next note under 0.6.5 or next patch when shipping (project currently consolidating digitizer UX under 0.6.5).
