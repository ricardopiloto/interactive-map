# Implementation Plan: Suppress Segment Hover in Edit Modes

**Branch**: `045-suppress-hover-edit-modes` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/045-suppress-hover-edit-modes/spec.md`

## Summary

On **Rede de rotas**, when **Novo nó** (`place-wp`) or **Traçar segmento** (`draw-seg`) is active, suppress feature 044 segment-hover entirely: no tooltip, list highlight, or stroke emphasis, **and** disable wide hit targets so placement/drawing clicks are not intercepted. Clear any active hover when entering those modes. Idle restores 044 behavior. Digitizer frontend only.

## Technical Context

**Language/Version**: TypeScript / React 19 / CSS

**Primary Dependencies**: `RouteDigitizerView.tsx` (`mode`, `hoveredSegmentId`, `__seg-hit` polylines, tooltip, list highlight); optional CSS for hit disabled state

**Storage**: N/A

**Testing**: Manual via [quickstart.md](./quickstart.md)

**Target Platform**: Modern browsers (GM desktop primary)

**Project Type**: Web application (GM digitizer UX)

**Performance Goals**: Negligible — mode guard + clear on mode change

**Constraints**:
- Full suppression (UI + hit) in edit modes (FR-007 / Clarification B)
- Idle keeps 044 (FR-003, FR-008)
- Clear on mode enter (FR-004)
- No CampaignMap / planner (FR-006)

**Scale/Scope**: `frontend/src/components/gm/RouteDigitizerView.tsx` primarily (+ small CSS if needed; CHANGELOG when shipping)

## Constitution Check

| Gate | Status |
|------|--------|
| Clarification closed (UI + hit off) | PASS |
| Digitizer-only; no API/DB | PASS |
| Minimal mode-gated hover | PASS |

**Post-design re-check**: PASS — UI contract; mode/hover model; no HTTP.

## Project Structure

### Documentation (this feature)

```text
specs/045-suppress-hover-edit-modes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-suppress-hover-edit-modes.md
└── tasks.md             # /speckit-tasks — not created here
```

### Source Code

```text
frontend/src/components/gm/
├── RouteDigitizerView.tsx   # gate hover on mode === 'idle'; clear hover on mode change; omit/disable __seg-hit
└── RouteDigitizer.css       # optional: no change if hits not mounted in edit modes
```

**Structure Decision**: Derive `segmentHoverEnabled = mode === 'idle'`. When false: do not mount (or set `pointer-events: none` on) `__seg-hit` polylines; ignore enter handlers; clear `hoveredSegmentId` + `tooltipPos` via `useEffect` when `mode` leaves idle (and when toggling into place/draw from toolbar). When idle, existing 044 behavior unchanged. Prefer **not mounting** hit polylines in edit modes over CSS-only disable for reliable click-through (FR-007).

## Complexity Tracking

Sem violações.
