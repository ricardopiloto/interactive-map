# Contract: UI — Disc portrait

**Feature**: `069-disc-portrait`  
**Surfaces**: `GraphStage` disc (`.graph-node__disc`)

## Disc content

| Condition | Interior of the 58px circle |
|-----------|-----------------------------|
| `retrato_url` empty / null | Initials (2 letters), as today |
| `retrato_url` set and image loads | Photo **covers** the circle (`object-fit: cover`, centre); nothing spills past the border |
| `retrato_url` set and image fails | Initials (never a blank disc) |

## Unchanged

| Surface | Behaviour |
|---------|-----------|
| Name + papel | Below the disc |
| Detail panel / ficha | Full image, `contain` (not disc crop) |
| Map pin | Existing portrait rendering |
| Disc size, ring layout, line anchors (067) | Unchanged |
| Edge opacity (068) | Unchanged |
| PJ/NPC border, selection halo, morto grayscale, unfocused ~28% | Apply to disc including photo |

## Asset

Same `retrato_url` string as the personagem ficha. No second URL or generated thumbnail.
