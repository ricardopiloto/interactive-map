# Data Model: Per-Tip Qualifiers

**Feature**: `076-per-tip-qualifiers`  
**Date**: 2026-08-13

## Vinculo (extends 075)

| Field | Type | Notes |
|-------|------|--------|
| … existing … | | `tipo_ab`/`tipo_ba`, notas, `publico`, `conhecido_*`, `direcao` |
| `qualificador_ab` | str ≤80 | Default `''`; qual for canonical A→B sense |
| `qualificador_ba` | str ≤80 | Default `''`; qual for B→A sense (duas vias only) |
| ~~`qualificador`~~ | — | **Removed** after migration from 075 |

## Semantics

- **Recíproco** (`tipo_ba` null): use `qualificador_ab`; `qualificador_ba` always `''`.
- **Duas vias**: independent optional strings per sense.
- Empty after trim → `''` (absent in UI).

## Validation

- Create/Update: trim both fields; reciprocal forces `qualificador_ba = ''`.
- Free text OK (no server enum).
- Mode switch duas vias → recíproco: persist primary `qualificador_ab` only (FR-009).

## Migration (SQLite)

```sql
-- Step 1: add columns
ALTER TABLE vinculo ADD COLUMN qualificador_ab VARCHAR(80) NOT NULL DEFAULT '';
ALTER TABLE vinculo ADD COLUMN qualificador_ba VARCHAR(80) NOT NULL DEFAULT '';

-- Step 2: data (application logic in database.py)
-- IF tipo_ba IS NOT NULL AND tipo_ba != tipo_ab:
--   qualificador_ab = qualificador; qualificador_ba = qualificador;
-- ELSE:
--   qualificador_ab = qualificador; qualificador_ba = '';

-- Step 3: drop legacy column (optional rebuild)
-- ALTER TABLE vinculo DROP COLUMN qualificador;  -- or leave orphaned, stop reading
```

## Display derived (not stored)

- `qualForTip(v, tipSide)` → `qualificador_ab` or `qualificador_ba` by canonical side
- `qualFromPerspective(v, personagemId)` → mirrors `tipoFromPerspective`
- Label: `formatVinculoTipoLabel(tipoLabel, qual[, direcao])` — direcao only on reciprocal mid / detail primary when pair-level arrow applies
