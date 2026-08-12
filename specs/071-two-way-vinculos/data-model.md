# Data Model: Two-Way Vínculos

**Feature**: `071-two-way-vinculos`  
**Date**: 2026-08-12

## Entity: Vínculo (pair)

One row = one unordered pair of personagens.

| Field | Type | Rules |
|-------|------|--------|
| `id` | int PK | |
| `personagem_a_id` | FK npc | Canonical: `a_id < b_id` |
| `personagem_b_id` | FK npc | |
| `tipo_ab` | VinculoTipo | Required — how A sees B |
| `tipo_ba` | VinculoTipo \| null | Null ⇒ reciprocal (same as `tipo_ab`) |
| `nota_ab` | str ≤500 | Default `""`; sole note when reciprocal |
| `nota_ba` | str ≤500 | Default `""`; used when duas vias |
| `publico` | bool | Default `false`; applies to whole pair |

**Unique**: `(personagem_a_id, personagem_b_id)`  
**Derived**: `duas_vias = tipo_ba is not None and tipo_ba != tipo_ab`  
**Effective tipo B→A**: `tipo_ba if tipo_ba is not None else tipo_ab`

### VinculoTipo (unchanged)

`aliado` \| `amizade` \| `inimizade` \| `romance` \| `familia` \| `conhecido`

## Validation

- Reject `a == b`
- Reject duplicate pair
- Both personagem ids must exist
- Duas vias create/update: both tipos required (non-null `tipo_ba` different from `tipo_ab`, or accept equal and normalize to reciprocal)
- Reciprocal: `tipo_ba` null (or equal → normalize)

## Migration (existing DBs)

1. If column `tipo` exists and `tipo_ab` missing: `ADD tipo_ab`, copy `tipo` → `tipo_ab`, then drop/ignore `tipo` (SQLite: keep `tipo` unused or recreate table only if needed; prefer ADD + backfill and stop writing `tipo`)
2. `ADD tipo_ba` nullable
3. `ADD nota_ba` with default `''`; rename/copy `nota` → `nota_ab` if renaming

Fresh `create_all`: only new columns.

## State (client)

| Mode | Graph | Detail |
|------|-------|--------|
| Reciprocal idle | One colour, no label (068) | One tipo |
| Reciprocal focus | One colour, mid label | One tipo |
| Duas vias idle | Gradient fade + two end labels (dim opacity) | — |
| Duas vias focus | Same geometry, focus opacity | S→O + O→S |
