# Implementation Plan: Refine Segment Stroke Weight

**Branch**: `048-refine-segment-stroke` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/048-refine-segment-stroke/spec.md`  
**Note**: Planned explicitly for `048` (not `049`).

## Summary

Second-pass thinning on **Rede de rotas** segment strokes: normal/draft and hover highlight to **~⅔ of current** widths (`1.5 → ~1.0`, `3.5 → ~2.3`). Hit-area stays wide. Campaign map overlays and lore lines unchanged. CSS-only in `RouteDigitizer.css`.

## Technical Context

**Language/Version**: CSS (SVG `stroke-width` on digitizer)

**Primary Dependencies**: `frontend/src/components/gm/RouteDigitizer.css` (`.route-digitizer__seg`, `.is-hovered`, `--draft`, type modifiers); SVG classes in `RouteDigitizerView.tsx` (no logic change expected)

**Storage**: N/A

**Testing**: Manual via [quickstart.md](./quickstart.md)

**Target Platform**: Modern browsers (GM Rede de rotas)

**Project Type**: Web application (presentation)

**Performance Goals**: N/A (CSS only)

**Constraints**:
- Digitizer only (FR-007)
- Factor ~⅔ on normal + hover (clarifications; FR-001/002/004)
- Hit `__seg-hit` unchanged (FR-005)
- Types remain distinct (FR-003); nodes/aura untouched (FR-006)

**Scale/Scope**: `RouteDigitizer.css` stroke widths only

## Constitution Check

| Gate | Status |
|------|--------|
| Clarifications closed (~⅔ normal + hover) | PASS |
| CSS presentation only | PASS |
| No API/DB | PASS |
| Campaign overlay / lore out of scope | PASS |

**Post-design re-check**: PASS — UI contract + stroke tokens; no HTTP.

## Project Structure

### Documentation (this feature)

```text
specs/048-refine-segment-stroke/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-refine-segment-stroke.md
└── tasks.md             # /speckit-tasks — not created here
```

### Source Code

```text
frontend/src/components/gm/
└── RouteDigitizer.css   # .route-digitizer__seg + .is-hovered stroke-width
```

**Structure Decision**: Multiply current digitizer segment stroke widths by ~⅔: base `1.5 → 1.0`, hover `3.5 → ~2.33` (round to `2.3`). Draft inherits base class width. Leave `__seg-hit` at `12`. Do not touch `CampaignMap` travel/connection strokes or `RouteOverlay`.

## Complexity Tracking

Sem violações.
