# Research: Segment Hover Info

**Feature**: `044-segment-hover-info` | **Date**: 2026-08-04

## 1. Enable hover on thin SVG strokes

**Decision**: Keep painted stroke at current thin width (042). Add a wider invisible hit stroke (e.g. `stroke-width` ~10–14 with `stroke: transparent` / opacity 0, or a dedicated `::`-less second `<polyline>` with class `__seg-hit`) and set `pointer-events: stroke` on hit targets. Change `.route-digitizer__segs` from blanket `pointer-events: none` to allow events on children (e.g. `pointer-events: none` on SVG root + `pointer-events: stroke` on hit polylines).

**Rationale**: FR hit-target edge case; thin 1.5px lines are hard to hover.

**Alternatives considered**:
- Only `title` attribute — fails FR-009 list highlight and weak UX
- Pixel hit-test in JS on mousemove — more accurate, heavier; defer

## 2. Hover state

**Decision**: `hoveredSegmentId: number | null` in `RouteDigitizerView`. Set on `pointerenter` / clear on `pointerleave` of the hit polyline (or use `onMouseEnter`/`onMouseLeave`). Do not clear on waypoint hover if pointer left the segment (normal leave).

**Rationale**: Single source for tooltip, list highlight, and stroke emphasis.

## 3. Map tooltip / label

**Decision**: Custom absolute tooltip in the digitizer chrome (not native `title` alone): text like `{labelA}↔{labelB} · {tipo} · {dist} mi` where label = `nome` or `#id` / list-compatible. Position: fixed near pointer (`clientX/Y` relative to stage) or centered above segment midpoint — prefer **follow pointer lightly** or **anchor near last pointer position on enter** for simplicity (store `tooltipPos` on enter/move).

**Rationale**: FR-002/003/009; readable and matches list cues.

**Alternatives considered**:
- Native SVG `<title>` — no list sync, poor styling
- Sidebar-only (Option B) — rejected in clarify

## 4. List highlight + scroll

**Decision**: `data-segment-id` / ref map on Segmentos `<li>`; class `is-hovered` (or `__seg-row--hovered`) when `hoveredSegmentId === s.id`. On hover enter, `li.scrollIntoView({ block: 'nearest', inline: 'nearest' })`.

**Rationale**: FR-009/010; Clarification C.

## 5. Visual emphasis (US2)

**Decision**: CSS modifier `.route-digitizer__seg.is-hovered` (or `--hovered`): thicker stroke and/or brighter stroke / white outline via `filter` or dual stroke — keep type color recognizable.

**Rationale**: FR-005.

## 6. Interaction with draw / place modes

**Decision**: Hover identity works in idle and while browsing; during `draw-seg` / `place-wp`, still allow hover on saved segments for identification, but hit targets must not call `preventDefault`/`stopPropagation` on **click** (no click handler on segments) so stage click for midpoints still works when clicking near a segment — note: clicking through transparent hit stroke may hit the polyline first. Prefer: segment hit layer receives pointer events for hover only; on `click`, do not stopPropagation so event reaches stage… Actually SVG child click won’t bubble to the stage div the same way if the polyline is the target. **Mitigation**: `pointer-events: stroke` on hit polylines; on `click` of hit polyline, either ignore (no handler) and let… clicks on SVG children don’t fall through to elements below. Stage `onClick` is on the parent div containing SVG — clicks on SVG polyline **do** bubble to the div if not stopped. Verify: React `onClick` on stage fires for bubbled events from SVG. Yes, bubbling works. Do **not** `stopPropagation` on segment hover targets.

**Draft**: no hover handlers on draft polyline (FR-007).

## 7. Backend / lore map

**Decision**: No changes.

## 8. CHANGELOG

**Decision**: Note under next patch (e.g. 0.6.6) when shipping.
