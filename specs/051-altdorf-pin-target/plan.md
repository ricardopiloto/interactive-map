# Implementation Plan: Align Altdorf Pin to Map Target

**Branch**: `051-altdorf-pin-target` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/051-altdorf-pin-target/spec.md`

## Summary

On the **campaign map in mobile layout**, all pins (and the group marker) sit systematically **left of** the map art — Altdorf lands on Altdorf Flats instead of the city (green reference in the print). Specs **047** (left nudge) and **049** (remove nudge / optional ±8px) did not fix it. This feature finds and fixes the **real presentation cause** (likely map stage vs image aspect / `object-fit: cover` cropping on narrow viewports), keeps 047 undone, preserves 049’s pin+group parity, and does **not** treat mass coordinate rewrites as the primary fix. Desktop must not regress.

## Technical Context

**Language/Version**: TypeScript / React 19; CSS

**Primary Dependencies**: `MapPage` (`map-page--mobile`, `MOBILE_BP` 800); `CampaignMap.tsx` / `CampaignMap.css` (stage, image, pins, party, `--map-zoom`); `react-zoom-pan-pinch`

**Storage**: N/A for primary path; optional single-local Altdorf `x`/`y` only if FR-007 fallback after presentation fix

**Testing**: Manual via [quickstart.md](./quickstart.md) vs print (Altdorf green target); desktop spot-check

**Target Platform**: Web campaign map, width &lt; 800 (`map-page--mobile`)

**Project Type**: Web application (SPA; frontend layout/CSS, possible tiny TS for image load sizing)

**Performance Goals**: Negligible

**Constraints**:
- Mobile-only systematic presentation (clarifications); desktop OK (FR-004)
- MUST NOT restore 047 left nudge (FR-008)
- MUST NOT stop at “nudge = 0” / ±8px-only if print still fails (FR-010)
- Locais + grupo same correction (FR-009)
- Digitizer / 048 / 050 out of scope
- Prefer presentation over bulk DB coord edits (FR-007)

**Scale/Scope**: Primarily `CampaignMap.css` (+ optional `CampaignMap.tsx` if stage must sync to natural image aspect); no API/schema for primary path

## Constitution Check

| Gate | Status |
|------|--------|
| Clarifications closed (all pins mobile; mobile-only) | PASS |
| Prior art 047 rejected / 049 baseline retained | PASS |
| Presentation-first; no unjustified stack expansion | PASS |
| Digitizer / route stroke out of scope | PASS |

**Post-design re-check (Phase 1)**: PASS — research names cover/aspect root cause; UI contract + quickstart map SC-001–007; data-model presentation-only.

## Project Structure

### Documentation (this feature)

```text
specs/051-altdorf-pin-target/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-altdorf-pin-target.md
└── tasks.md                 # /speckit-tasks
```

### Source Code

```text
frontend/src/
├── pages/
│   ├── MapPage.tsx                 # map-page--mobile already (verify only)
│   └── MapPage.css                 # only if layout wrapper forces wrong aspect
└── components/map/
    ├── CampaignMap.css             # stage/image fit; pin/party; never negative nudge
    └── CampaignMap.tsx             # optional: size stage from natural image aspect
```

**Structure Decision**:
1. **Diagnose & fix stage↔image coupling**: stop mobile from forcing a box aspect that `object-fit: cover` crops horizontally relative to `%` pin coordinates (see research). Prefer image-driven stage size (`height: auto`, no cover crop) so `left`/`top` % match painted map pixels on mobile and desktop.
2. **Keep 049 baseline**: `--mobile-marker-nudge-x` default `0`; never set negative/left; pin + party share the same horizontal rule. Optional small **positive** nudge only as a residual polish after aspect fix — not the primary fix.
3. **Do not** reintroduce 047’s `-8px` mobile left nudge.
4. **FR-007 fallback**: if Altdorf still misses green after presentation fix, GM-reposition / data fix for that local only — document in quickstart; do not mass-edit coords.
5. Leave `RouteDigitizer*`, travel overlay strokes, and Calcular rota alone.

## Complexity Tracking

Sem violações. Investigating aspect/`object-fit` is required by FR-010 (beyond 049), not scope creep.
