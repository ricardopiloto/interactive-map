# Research: Thinner Segment Lines

**Feature**: `042-thinner-segment-lines` | **Date**: 2026-08-04

## 1. Where stroke is defined

**Decision**: Update `.route-digitizer__seg { stroke-width: 2.5 }` in `RouteDigitizer.css`. Draft uses the same base class plus `--draft`.

**Rationale**: Single choke point; FR-001/002 satisfied together.

**Alternatives considered**: Per-type widths — unnecessary; inline SVG attributes — duplicated.

## 2. Target width

**Decision**: Set `stroke-width` to **1.5** (60% of 2.5) or **1.4** if QA wants slightly thinner still within SC-001. Prefer **1.5** first for visibility on light maps.

**Rationale**: SC-001 ≤ ~60%; assumptions cite ~2.5 baseline.

## 3. Dash arrays

**Decision**: Optionally reduce `stroke-dasharray` for trilha (`4 3` → e.g. `3 2`) and draft (`5 4` → e.g. `4 3`) so dash period scales with thinner stroke. Colors unchanged.

**Rationale**: FR-003 “unchanged in intent”; proportional dashes avoid chunky gaps on thin lines.

## 4. Zoom / viewBox

**Decision**: Keep current SVG `viewBox="0 0 100 100"` + CSS stroke; no `vectorEffect` change required for this feature (digitizer strokes scale with the transform today). Do not port RouteOverlay’s `non-scaling-stroke` unless a follow-up asks for it.

**Rationale**: YAGNI; thinning alone meets the request.

## 5. Out of scope surfaces

**Decision**: No edits to `RouteOverlay.tsx`, campaign connection lines, or node aura CSS.

**Rationale**: Clarification A / FR-006.

## 6. CHANGELOG

**Decision**: Note under next patch (e.g. fold into 0.6.4 or 0.6.5 depending on release packaging).
