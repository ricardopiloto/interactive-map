# Data Model: Known Direction Vínculos

**Feature**: `073-known-direction-vinculos`  
**Date**: 2026-08-12

## Vinculo (extends 071)

| Field | Type | Notes |
|-------|------|--------|
| `id` | int | PK |
| `personagem_a_id` / `personagem_b_id` | int | Canonical `a < b` on write |
| `tipo_ab` | VinculoTipo | How A sees B (required in DB / create) |
| `tipo_ba` | VinculoTipo \| null | Null ⇒ reciprocal |
| `nota_ab` / `nota_ba` | str ≤500 | |
| `publico` | bool | Master switch (clarification A) |
| `conhecido_ab` | bool | Default `true` — tip A→B revealable when público |
| `conhecido_ba` | bool | Default `true` — tip B→A; ignored when reciprocal |

**Derived (server/GM)**:

- `duas_vias` = `tipo_ba is not None and tipo_ba != tipo_ab`
- Player-visible tip AB = `publico and (not duas_vias or conhecido_ab)` — for reciprocal, whole edge if `publico`
- Player-visible tip BA = `publico and duas_vias and conhecido_ba`
- Include on public list iff `publico and (not duas_vias or conhecido_ab or conhecido_ba)`

## Validation

- Create/update: same tipo normalize as 071; when collapsing to reciprocal, clear `nota_ba`; `conhecido_*` may remain true (ignored).
- Reciprocal: UI does not edit `conhecido_*`.
- New duas vias / convert to duas vias: both `conhecido_*=true` unless GM clears before save (FR-010).

## Migration (SQLite)

1. `ALTER TABLE vinculo ADD COLUMN conhecido_ab BOOLEAN NOT NULL DEFAULT 1`
2. `ALTER TABLE vinculo ADD COLUMN conhecido_ba BOOLEAN NOT NULL DEFAULT 1`
3. Existing rows → both true (FR-009). No backfill from `publico` needed for flags; private pairs simply stay off public list.

## Player-facing projection (not stored)

After load for public API:

- Unknown tip → `tipo_*=null`, `nota_*=""` in JSON Read
- Stored DB values unchanged for GM
