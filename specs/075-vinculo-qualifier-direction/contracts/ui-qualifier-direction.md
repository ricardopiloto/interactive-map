# Contract: UI — Qualifier & direction

**Feature**: `075-vinculo-qualifier-direction`  
**Surfaces**: `VinculoFormDialog`, `GraphStage`, `RelacoesDetailPanel`

## GM form

| Control | Behaviour |
|---------|-----------|
| Qualificador | Text input + datalist/suggestions; free text OK |
| Suggestions | Reciprocal: list for current tipo + Medo. Duas vias: union of both tipos’ lists + Medo, deduped |
| Direção | Radio/select: Mútuo · `{nameA} → {nameB}` · `{nameB} → {nameA}` → maps to null / a_para_b / b_para_a after canonicalization |
| Tipo change | Refresh suggestions; keep typed qualifier |

## Graph labels

| Edge kind | Labels |
|-----------|--------|
| Recíproco | Mid/focus: `Tipo` + ` (Qual)`? + ` →`? |
| Duas vias | Ends: tip tipos only. Mid: `(Qual)`? and/or ` →`? |

Arrow orientation: from “from” endpoint to “to” per `direcao` vs disc positions.

## Detail list

- Primary tipo line: `Tipo (Qualificador)` when qual present; append sense arrow when `direcao` set (readable as from selected toward other or absolute A→B — prefer: arrow indicates stored direction using names in title attribute if needed; visible glyph `→` after the tipo block).
- “Vê-te como…” unchanged (no qualifier duplicate).

## Unchanged

Tipo chips; público; conhecido por sentido; duas vias tip model.
