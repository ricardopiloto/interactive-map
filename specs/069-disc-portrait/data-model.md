# Data Model: Disc Portrait

**Feature**: `069-disc-portrait`  
**Date**: 2026-08-11

No new persisted entities. Disc content is derived from existing Personagem:

| Field | Source | Disc behaviour |
|-------|--------|----------------|
| `retrato_url` | Personagem / NPC (066) | If non-empty and image loads → fill disc (cover crop). Else → initials. |
| `nome` | Personagem | Initials (2 letters) as fallback layer; label under disc unchanged. |
| `tipo` | `pj` \| `npc` | Disc border (existing). |
| `status` | e.g. `morto` | Disc grayscale + name strike (existing). |

## Client-only

| State | Meaning |
|-------|---------|
| Image error (per disc) | Hide `<img>`; initials remain visible. Not persisted. |

Personagem / Vínculo / `publico` / layout geometry unchanged.
