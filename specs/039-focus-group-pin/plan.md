# Implementation Plan: Focus Group Pin

**Branch**: `039-focus-group-pin` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/039-focus-group-pin/spec.md`

## Summary

Add a map control next to zoom (+/−/1:1) that recenters the viewport on the party/group pin with the same pan+zoom comfort as menu-driven location focus. Reuse `zoomToElement` + `FOCUS_SCALE` / `FOCUS_ANIM_MS`. Give the party marker a stable DOM id. Hide the button when `grupo` is null. Frontend-only; no API/DB changes.

## Technical Context

**Language/Version**: TypeScript / React 19 / CSS

**Primary Dependencies**: `react-zoom-pan-pinch` (`useControls().zoomToElement`); existing `CampaignMap` focus path (`PinFocusController`, `FOCUS_SCALE=2`, `FOCUS_ANIM_MS=400`)

**Storage**: N/A (uses existing `GrupoPosicao` already loaded for the map)

**Testing**: Manual validation via [quickstart.md](./quickstart.md)

**Target Platform**: Modern browsers (desktop + mobile)

**Project Type**: Web application (map UI chrome)

**Performance Goals**: Focus animation completes in ≤ ~1s (spec SC-001; current anim 400ms)

**Constraints**:
- Control in zoom control cluster only (clarification)
- Hide when no group (clarification; not disabled)
- View-only recenter — no modal / forced side-tab (FR-006)
- Player + GM when group exists (FR-004)
- No-op if party DOM missing (e.g. `hideLorePins`)

**Scale/Scope**: Primarily `CampaignMap.tsx` (+ minor CSS if button needs icon spacing); optionally thin wiring from `MapPage` only if focus state is lifted. No backend.

## Constitution Check

| Gate | Status |
|------|--------|
| Spec clarifications closed (placement + hide) | PASS |
| Frontend presentation only; no new persistence | PASS |
| Reuses existing focus pattern (no parallel zoom stack) | PASS |

**Post-design re-check**: PASS — UI contract; UI data-model for focus request; no HTTP contracts.

## Project Structure

### Documentation (this feature)

```text
specs/039-focus-group-pin/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-focus-group-pin.md
└── tasks.md             # /speckit-tasks (not this command)
```

### Source Code

```text
frontend/src/components/map/
├── CampaignMap.tsx   # MapControls button; party id; extend focus controller
└── CampaignMap.css   # optional: control spacing / icon button for “Ir ao grupo”
```

**Structure Decision**: Keep focus entirely inside `CampaignMap` when possible: `MapControls` receives `canFocusGroup` + `onFocusGroup` (or calls into shared focus request state local to the map). Prefer generalizing the existing focus request/controller over a second ad-hoc `zoomToElement` path. Party element gets a stable id (e.g. `map-party`) for `zoomToElement`.

## Complexity Tracking

Sem violações. Alternativa “só no menu Grupo” rejeitada pela clarification A (zoom cluster).
