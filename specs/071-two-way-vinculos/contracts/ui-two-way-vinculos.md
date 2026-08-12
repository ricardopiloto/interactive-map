# Contract: UI — Two-way vínculos

**Feature**: `071-two-way-vinculos`  
**Surfaces**: `GraphStage`, `RelacoesDetailPanel`, `VinculoFormDialog`

## Graph — reciprocal

| State | Stroke | Labels |
|-------|--------|--------|
| Idle / mid-animation | Single tip colour; opacity 068 dim | None |
| Focus settled | Same; opacity focus | Mid label (068) |

## Graph — duas vias

| State | Stroke | Labels |
|-------|--------|--------|
| Any (idle or focus) | One line; `linearGradient` from tip colour at A’s disc to tip colour at B’s disc (fade in the middle) | Short tip labels near each end (tipo A→B by A, tipo B→A by B) |
| Opacity | Same dim / focus / dim-selected rules as 068 | Labels follow edge opacity |

Dashed if either tip is `conhecido`.

## Filters

Show edge if **any** of the two effective tipos is in the active chip set.

## Detail (selected S, neighbour O)

| Pair kind | Row content |
|-----------|-------------|
| Reciprocal | Dot + O name + one tipo + one note |
| Duas vias | Dot + O name + tipo **S→O** + note S→O; secondary line “vê-te como {tipo O→S}” (+ note O→S) |

## GM form

| Control | Behaviour |
|---------|-----------|
| Toggle / mode | Recíproco \| Duas vias |
| Recíproco | One tipo + one note (maps to `tipo_ab`, `tipo_ba=null`) |
| Duas vias | Two named fields: “{A} vê {B}” and “{B} vê {A}” (+ notes); save maps through canonical ids |
| Público | One checkbox for the pair |

Portuguese labels; no emoji.
