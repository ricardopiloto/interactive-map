# Contract: UI — Per-tip qualifiers

**Feature**: `076-per-tip-qualifiers`  
**Surfaces**: `VinculoFormDialog`, `GraphStage`, `RelacoesDetailPanel`

## GM form

| Mode | Qualifier controls |
|------|-------------------|
| Recíproco | One field bound to `qualificador_ab`; suggestions from `tipo_ab` (+ Medo) |
| Duas vias | Two fields: one after each tipo block — AB qual + BA qual; suggestions **per** tipo (+ Medo), not union |

| Transition | Behaviour |
|------------|-----------|
| Recíproco → duas vias | Copy existing qual to AB field; BA empty |
| Duas vias → recíproco | Keep AB / primary sense qual; discard BA |

## Graph labels

| Edge kind | Labels |
|-----------|--------|
| Duas vias | nearA: `Tipo_ab (Qual_ab)?` · nearB: `Tipo_ba (Qual_ba)?` · mid: **`→` only** if `direcao` set (no `(Qual)` mid text) |
| Recíproco | Mid/focus: `Tipo (Qual_ab)?` + `→`? (unchanged from 075) |

Tip label visibility: same rules as tip tipos today (clarification 2026-08-12).

## Detail list

- Primary: `Tipo (Qual)` from selected personagem’s perspective (+ pair arrow on primary line if product keeps 075 detail behaviour).
- “Vê-te como…”: `Tipo (Qual)` for return sense when shown.
- Secret sense (073): hide matching qual with hidden tipo.

## Unchanged

Tipo chips; público; conhecido; duas vias tipo model; pair-level direção control.
