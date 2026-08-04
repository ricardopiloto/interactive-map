# Implementation Plan: Thinner Segment Lines

**Branch**: `042-thinner-segment-lines` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/042-thinner-segment-lines/spec.md`

## Summary

Reduce Rede de rotas segment polyline stroke width (saved + draft) to ≤ ~60% of current `2.5`, so the GM can align traces to map art more easily. Type colors/dashes stay; no overlay/lore/CampaignMap changes.

## Technical Context

**Language/Version**: CSS (SVG stroke on digitizer)

**Primary Dependencies**: `RouteDigitizer.css` (`.route-digitizer__seg`, `--draft`, type modifiers); SVG in `RouteDigitizerView.tsx` (no logic change expected)

**Storage**: N/A

**Testing**: Manual via [quickstart.md](./quickstart.md)

**Target Platform**: Modern browsers (GM digitizer)

**Project Type**: Web application (presentation)

**Performance Goals**: N/A (CSS only)

**Constraints**:
- Digitizer only (clarification A / FR-006)
- Stroke ≤ ~60% of 2.5 → target **~1.4–1.5** (SC-001)
- Types remain distinct (FR-003)
- Nodes/aura untouched (FR-005)

**Scale/Scope**: `frontend/src/components/gm/RouteDigitizer.css` (+ optional dasharray tweak). Not `RouteOverlay` / `CampaignMap` connection lines.

## Constitution Check

| Gate | Status |
|------|--------|
| Clarification closed (digitizer-only) | PASS |
| CSS presentation only | PASS |
| No API/DB | PASS |

**Post-design re-check**: PASS — UI contract; stroke token in data-model; no HTTP.

## Project Structure

### Documentation (this feature)

```text
specs/042-thinner-segment-lines/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-thinner-segment-lines.md
└── tasks.md
```

### Source Code

```text
frontend/src/components/gm/
└── RouteDigitizer.css   # .route-digitizer__seg stroke-width (+ optional dash scale)
```

**Structure Decision**: Change shared `.route-digitizer__seg { stroke-width }` so saved types and draft inherit thinness. Optionally scale `--trilha` / `--draft` `stroke-dasharray` slightly so dashes do not look oversized relative to the thinner stroke. Leave TSX untouched unless a stroke attribute is hardcoded (today it is CSS-class driven).

## Complexity Tracking

Sem violações.
