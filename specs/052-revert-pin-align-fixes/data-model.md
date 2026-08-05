# Data Model: Revert Pin Alignment Fixes

**Feature**: `052-revert-pin-align-fixes` | **Date**: 2026-08-05

No persistent data model changes.

## Entities (presentation only)

### Baseline pré-047 (CampaignMap presentation)

| Attribute | Pré-047 (restore) | Pós-051 (remove) |
|-----------|-------------------|------------------|
| Stage | `min-width` + `min-height: 540px` | shrink-wrap / no forced 540 |
| Image | `width: 100%`, `object-fit: cover` | image-driven width, no cover |
| Pin transform | `rotate` + `scale(1/zoom)` | + `translateX(nudge/zoom)` |
| Party | `scale(1/zoom)` only | shared `--mobile-marker-nudge-x` |
| Mobile left nudge | absent | 047 introduced then 049 zeroed |

### Local / Grupo coordinates

Unchanged (`x`/`y` persisted as today).

## Validation

- Desktop: Altdorf tip on print green
- No 047/049/051 presentation behaviours active
