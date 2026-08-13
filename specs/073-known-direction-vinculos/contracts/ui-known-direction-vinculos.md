# Contract: UI — Known direction vínculos

**Feature**: `073-known-direction-vinculos`  
**Surface**: `/relacoes` — GraphStage, RelacoesDetailPanel, VinculoFormDialog

## GM form (duas vias)

| Control | Behaviour |
|---------|-----------|
| Per sense “Conhecido pelos jogadores” | Checkbox; default on; maps to `conhecido_ab` / `conhecido_ba` by named endpoints |
| Recíproco mode | No per-sense checkboxes |
| Público | Unchanged master switch |

## Graph (player vs GM)

| Viewer / data | Edge look |
|---------------|-----------|
| GM, duas vias | 071 fade + end labels (ignore known flags for drawing) |
| Player, both tips present | 071 fade + end labels |
| Player, exactly one tip present | Reciprocal-like: one colour, 068 label rules; **no** dual fade |
| Player, no tips / not in list | No edge |

## Detail panel (player)

| Forward tip | Reverse tip | Row |
|-------------|-------------|-----|
| Present | Absent | Primary tipo/note only; no “vê-te como…” |
| Absent | Present | No primary tipo; show “vê-te como {reverse}” (+ note); do not invent forward |
| Present | Present | 071 both |
| Absent | Absent | Row not shown (edge not in list) |

GM: always full 071 rows for duas vias.

## Filters

Player chips: match only **present** tips on the payload. GM: either tip as today.
