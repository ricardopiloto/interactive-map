# Data Model: Focus Edge Opacity

**Feature**: `068-focus-edge-opacity`  
**Date**: 2026-08-11

No persisted entities. Client visual state only:

| State | Edges drawn | Opacity |
|-------|-------------|--------|
| No selection | All role+filter visible | 0.18 |
| Selection + animating (`highlightReady=false`) | Same set (isolate may shrink) | 0.18 all |
| Selection + settled (`highlightReady=true`) | Same set | 0.90 if incident to focus, else 0.18 |
| Isolate + focus | Only edges between focus and directs | same highlight rule |
| Deselect (immediate) | All role+filter visible | 0.18 |

Personagem / Vínculo / `publico` unchanged (066).
