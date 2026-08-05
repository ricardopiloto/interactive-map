# Implementation Plan: Mobile Left Offset for Nodes and Locals

**Branch**: `047-mobile-left-offset` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/047-mobile-left-offset/spec.md`

## Summary

On the **campaign map only**, when the app is in **mobile layout** (`map-page--mobile` / `innerWidth < 800`), shift **local pins** (and any campaign-map **node** markers if present) ~**8px screen-left** (within 6–10px). Desktop unchanged. **Group pin**, route polylines, and **RouteDigitizer** are out of scope. Visual CSS only — no persisted coordinates, no backend.

## Technical Context

**Language/Version**: TypeScript / React 19; CSS

**Primary Dependencies**: `MapPage` (`MOBILE_BP = 800`, `map-page--mobile`); `CampaignMap.tsx` / `CampaignMap.css` (`.campaign-map__pin` transforms + `--map-zoom` counter-scale)

**Storage**: N/A

**Testing**: Manual via [quickstart.md](./quickstart.md)

**Target Platform**: Web (player + GM campaign map on phone / narrow viewport)

**Project Type**: Web application (SPA; frontend-only change)

**Performance Goals**: Negligible — CSS class/transform only

**Constraints**:
- Mobile only (FR-003/007); same criterion as existing `isMobile`
- ~6–10 screen px left (clarification; target **8px**)
- Campaign map only; digitizer untouched (FR-008)
- No group pin / route geometry nudge (FR-005/006)
- Visual only (FR-004); preserve click/touch usability
- Combine with existing `rotate` + `scale(1/--map-zoom)` without breaking tip anchor

**Scale/Scope**: `CampaignMap.css` (+ optional tiny markup class if needed); do **not** change `RouteDigitizer*`

## Constitution Check

| Gate | Status |
|------|--------|
| Clarifications closed (magnitude; campaign-only) | PASS |
| Visual-only; no data model / API | PASS |
| Digitizer / grupo / routes excluded | PASS |
| Minimal surface (CSS under existing mobile class) | PASS |

**Post-design re-check**: PASS — UI contract only; no backend; research resolves screen-px under zoom.

## Project Structure

### Documentation (this feature)

```text
specs/047-mobile-left-offset/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-mobile-left-offset.md
└── tasks.md             # /speckit-tasks — not created here
```

### Source Code

```text
frontend/src/
├── pages/
│   └── MapPage.tsx              # already sets map-page--mobile (no change expected)
└── components/map/
    ├── CampaignMap.css          # mobile nudge on pins (+ node class if any)
    └── CampaignMap.tsx          # only if a shared class hook is needed
```

**Structure Decision**: Prefer pure CSS under `.map-page--mobile .campaign-map__pin` (and a shared node selector if campaign-map nodes exist). Encode screen-constant left shift as `translateX(calc(-8px / var(--map-zoom, 1)))` in the existing transform chain so parent zoom + counter-scale yield ~8 CSS pixels on screen. Leave `.campaign-map__party`, travel/connection SVGs, and all `RouteDigitizer` styles alone.

## Complexity Tracking

Sem violações.
