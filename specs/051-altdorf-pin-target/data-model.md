# Data Model: Align Altdorf Pin to Map Target

**Feature**: `051-altdorf-pin-target` | **Date**: 2026-08-05

No persistent schema change for the primary presentation fix.

## Entities (presentation)

### Campaign map stage

| Attribute | Notes |
|-----------|-------|
| Box size | Must match laid-out map image (same width/height used for `%` pins) |
| Coordinate space | `x`,`y` ∈ [0,1] → `left`/`top` % of stage |

### Map image

| Attribute | Notes |
|-----------|-------|
| Display | Must not crop relative to the stage box (`object-fit: cover` against a forced aspect is the suspected bug) |
| Aspect | Prefer intrinsic / width-driven height |

### Local pin / Group marker

| Attribute | Rules |
|-----------|-------|
| Position | Existing stored `x`/`y` (unchanged in primary path) |
| Anchor | Tip/centre on `left`/`top` |
| Mobile nudge | Shared; default 0; never left/negative (047) |

### Altdorf (reference)

| Attribute | Notes |
|-----------|-------|
| Acceptance | Visual tip on green print target after fix |
| Fallback | Optional single-entity coord tweak only if presentation OK elsewhere (FR-007) |

## Relationships

```text
Local/Grupo (x,y) ──%──► stage box ══must equal══ painted image box
```

## Validation

- Mobile: Altdorf + ≥2 pins + group align to art
- Desktop: no regression
- No 047 left nudge present
