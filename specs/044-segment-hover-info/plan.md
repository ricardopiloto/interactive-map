# Implementation Plan: Segment Hover Info

**Branch**: `044-segment-hover-info` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/044-segment-hover-info/spec.md`

## Summary

On **Rede de rotas**, hovering a **saved** segment polyline shows identity (endpoints with names when available, tipo, distância) in a map tooltip/label **and** highlights the matching Segmentos list row (scroll into view if needed). Emphasize the hovered stroke. Draft polyline excluded. Hover never deletes. Digitizer frontend only.

## Technical Context

**Language/Version**: TypeScript / React 19 / CSS

**Primary Dependencies**: `RouteDigitizerView.tsx` (segments SVG polylines, Segmentos list + `removeSegment`); `RouteDigitizer.css` (`.route-digitizer__segs` currently `pointer-events: none`; thin `.route-digitizer__seg` strokes)

**Storage**: N/A

**Testing**: Manual via [quickstart.md](./quickstart.md)

**Target Platform**: Modern browsers (GM desktop primary)

**Project Type**: Web application (GM digitizer UX)

**Performance Goals**: O(segments) hover handlers; no layout thrash beyond scrollIntoView on hover enter

**Constraints**:
- Tooltip + list highlight together (FR-009 / Clarifications)
- Wider hit than painted stroke (thin 042 lines)
- No CampaignMap / planner / API (FR-008)
- No delete-on-hover (FR-006)

**Scale/Scope**: `frontend/src/components/gm/RouteDigitizerView.tsx`, `RouteDigitizer.css` (+ CHANGELOG when shipping)

## Constitution Check

| Gate | Status |
|------|--------|
| Clarification closed (tooltip + list) | PASS |
| Digitizer-only; no API/DB | PASS |
| Minimal UI state + CSS | PASS |

**Post-design re-check**: PASS — UI contract; hover model; no HTTP.

## Project Structure

### Documentation (this feature)

```text
specs/044-segment-hover-info/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-segment-hover-info.md
└── tasks.md             # /speckit-tasks — not created here
```

### Source Code

```text
frontend/src/components/gm/
├── RouteDigitizerView.tsx   # hoveredSegmentId; polyline hover; tooltip; list highlight + scrollIntoView
└── RouteDigitizer.css       # pointer-events on hit strokes; --hovered emphasis; list row highlight; tooltip chrome
```

**Structure Decision**: Enable pointer events on saved-segment hit targets (wide transparent stroke or dual path) without blocking stage clicks for place/draw (waypoints already stopPropagation; hit targets must not steal clicks needed for midpoints unless hover-only — prefer `pointer-events: stroke` on segments with no click handler that prevents bubbling incorrectly; use mouseenter/leave only). Track `hoveredSegmentId`. Render floating label near cursor or over stage with identity string. Mark list `<li>` with highlight class + `scrollIntoView({ block: 'nearest' })` on enter. CSS class on hovered polyline for thicker/brighter stroke. Skip draft polyline. Do not touch `CampaignMap`.

## Complexity Tracking

Sem violações.
