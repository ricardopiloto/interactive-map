# UI Contract: Revert Pin Alignment Fixes

**Feature**: `052-revert-pin-align-fixes`  
**Date**: 2026-08-05

## Surface: Campaign map (desktop)

| Aspect | Contract |
|--------|----------|
| Viewport | Desktop (width ≥ 800 / not `map-page--mobile` success focus) |
| Altdorf | Pin anchor on print **green** target (city art) |
| Other markers | Align to art as in pré-047 baseline |
| Zoom/pan | Alignment stable |
| 047 / 049 / 051 UI behaviours | **Absent** (no left mobile nudge; no 051 stage/image shrink-wrap presentation) |

## Presentation restore checklist

| Must be restored (pré-047) | Must not remain |
|----------------------------|-----------------|
| Stage `min-height: 540px` + image `object-fit: cover` (HEAD) | 051 image-driven stage without cover |
| Pin `transform` without nudge `translateX` | `--mobile-marker-nudge-x` plumbing / mobile left nudge |
| Party transforms without shared nudge var | 049/051 comments requiring positive mobile nudge as primary fix |

## Out of contract

| Surface | Rule |
|---------|------|
| Digitizer / Rede strokes (048) | Unchanged |
| Calcular rota (050) | Unchanged |
| Spec markdown under `specs/047–051` | Keep as history |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001, FR-004, SC-004 | Full restore / no half-fix |
| FR-002, SC-001 | Desktop green |
| FR-003, SC-002 | Other pins pré-047 |
| FR-005, SC-003 | Zoom/pan |
| FR-007, SC-005 | 048/050/digitizer untouched |
