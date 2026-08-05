# Implementation Plan: Fix Mobile Marker Alignment (after 047)

**Branch**: `049-fix-mobile-marker-align` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/049-fix-mobile-marker-align/spec.md`

## Summary

On the **campaign map in mobile layout**, markers sit **too far left**. Feature **047** added an 8px left nudge on pins and made this worse. This feature **removes that nudge** and aligns **locais + group** (and campaign-map nodes if present) so tips/centers match map points on mobile. Desktop unchanged. Presentation-only CSS; no digitizer/overlay stroke work; no persisted coords.

## Technical Context

**Language/Version**: TypeScript / React 19; CSS

**Primary Dependencies**: `MapPage` (`map-page--mobile`); `CampaignMap.css` (`.campaign-map__pin` `--mobile-marker-nudge-x: -8px` under mobile; `.campaign-map__party--*`); no campaign-map waypoint discs today

**Storage**: N/A

**Testing**: Manual via [quickstart.md](./quickstart.md) vs attached print / mobile viewport

**Target Platform**: Web (campaign map, width &lt; 800)

**Project Type**: Web application (SPA; frontend CSS)

**Performance Goals**: Negligible

**Constraints**:
- Mobile only; desktop must not regress (FR-004)
- Must **not** add more left nudge (FR-005); reverse/remove 047
- Locais + grupo (+ nós if/when on campaign map) (FR-001–003)
- Digitizer / route overlay out of scope (FR-007)
- Visual only (FR-008)

**Scale/Scope**: `CampaignMap.css` primarily; optional tiny shared class hook in `CampaignMap.tsx` only if a node marker appears

## Constitution Check

| Gate | Status |
|------|--------|
| Clarifications closed (too far left; locais+nós+grupo) | PASS |
| Undo/replace 047 left nudge | PASS |
| Visual-only; no API/DB | PASS |
| Digitizer out of scope | PASS |

**Post-design re-check**: PASS — UI contract; research: remove 047 then QA right-nudge if residual.

## Project Structure

### Documentation (this feature)

```text
specs/049-fix-mobile-marker-align/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-fix-mobile-marker-align.md
└── tasks.md
```

### Source Code

```text
frontend/src/
├── pages/MapPage.tsx                 # map-page--mobile already (verify only)
└── components/map/
    ├── CampaignMap.css               # remove 047 left nudge; align party if needed
    └── CampaignMap.tsx               # only if node class hook needed
```

**Structure Decision**:
1. **Remove** `.map-page--mobile .campaign-map__pin { --mobile-marker-nudge-x: -8px; }` (and clean up the translateX plumbing if nudge stays at 0 everywhere — optional simplify).
2. **Party**: ensure group markers use the same mobile horizontal correction as pins (047 did not touch party; if residual left offset remains after step 1 for pins **and** party, introduce a shared **rightward** screen-px nudge under `.map-page--mobile` for pin + party, not more left).
3. Do not invent campaign-map node discs; document FR-002 as apply-when-present.
4. Leave `RouteDigitizer*` and travel-route SVG alone.

## Complexity Tracking

Sem violações. Possible two-step QA (remove 047 → optional shared right nudge) is required by FR-005, not scope creep.
