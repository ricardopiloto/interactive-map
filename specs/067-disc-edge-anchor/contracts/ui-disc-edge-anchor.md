# Contract: UI — Disc-centre edge anchors

**Feature**: `067-disc-edge-anchor`  
**Surfaces**: `GraphStage`, `graphLayout`

## Edge geometry

| Requirement | Behaviour |
|-------------|-----------|
| Endpoints | SVG `<line>` `x1,y1` / `x2,y2` = **disc centres**, not node-box centres |
| Hit target | Transparent hit-line uses the same disc-centre segment |
| Labels | Midpoint = average of the two disc centres |
| Clip / gap | None — segment runs through disc centre |
| Z-order | Edges under discs and selection halo |

## Layout (unchanged)

| Requirement | Behaviour |
|-------------|-----------|
| Rings | Still computed from node-box size / spacing |
| Node transform | Still `translate(pos.x − NODE_W/2, pos.y − NODE_H/2)` |
| Drag | Offset applied to layout `pos`; disc centre derived from that |

## Helper

`discCenterFromNodePos(pos)` (name flexible) in `graphLayout.ts` is the single source of the offset so GraphStage does not hard-code `-25`.
