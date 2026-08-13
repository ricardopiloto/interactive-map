# Data Model: Vínculo Qualifier & Direction

**Feature**: `075-vinculo-qualifier-direction`  
**Date**: 2026-08-12

## Vinculo (extends 071/073)

| Field | Type | Notes |
|-------|------|--------|
| … existing … | | `tipo_ab`/`tipo_ba`, notas, `publico`, `conhecido_*` |
| `qualificador` | str ≤80 | Default `''`; blank = absent |
| `direcao` | `null` \| `a_para_b` \| `b_para_a` | Relative to canonical a_id &lt; b_id; null = mútuo |

## Validation

- Create/Update: trim `qualificador`; empty after trim → `''`
- `direcao` only allowed values or null
- Free-text qualifier: **not** restricted to suggestion list
- Changing tipo does not clear qualifier (spec edge case)

## Migration (SQLite)

```sql
ALTER TABLE vinculo ADD COLUMN qualificador VARCHAR(80) NOT NULL DEFAULT '';
ALTER TABLE vinculo ADD COLUMN direcao VARCHAR(20);
```

Existing rows: `qualificador=''`, `direcao=NULL`.

## Display derived (not stored)

- `has_qual` = `qualificador.strip() != ''`
- `has_dir` = `direcao is not None`
- Label fragments per [research.md](./research.md) §4
