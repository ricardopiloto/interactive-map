# Contract: UI — Focus edge opacity

**Feature**: `068-focus-edge-opacity`  
**Surfaces**: `GraphStage`, `RelacoesPage`

## Idle (no selection)

| Requirement | Behaviour |
|-------------|-----------|
| Layout | PJs inner ring, NPCs outer (066) |
| Lines | All visible-to-role + active tipo chips |
| Opacity | **0.18** |
| Labels | None |

## Select / deselect

| Requirement | Behaviour |
|-------------|-----------|
| Layout animation | ~0.6s focus rings unchanged |
| During animation | All drawn lines **0.18**; no focus labels |
| After animation | Incident-to-focus lines **0.90**; others **0.18**; labels per `rotulosVinculo` on focus edges only |
| Deselect | Highlight off **immediately** (all 0.18); rings animate back; lines stay |

## Filters

| Control | Effect on dim and highlight edges |
|---------|-----------------------------------|
| Tipo chips | Hide matching edges entirely |
| Isolar | With focus: only focus + neighbour nodes/edges |
| Jogador/GM | Unchanged (`publico`) |

## Constants

`EDGE_OPACITY_DIM = 0.18`, `EDGE_OPACITY_FOCUS = 0.90`.
