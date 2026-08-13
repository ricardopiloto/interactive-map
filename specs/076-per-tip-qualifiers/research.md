# Research: Per-Tip Qualifiers

**Feature**: `076-per-tip-qualifiers`  
**Date**: 2026-08-13

## 1. Persistence shape

**Decision**:

| Field | Storage |
|-------|---------|
| `qualificador_ab` | `VARCHAR(80)` NOT NULL DEFAULT `''` — qual for A→B sense (canonical `personagem_a_id`) |
| `qualificador_ba` | `VARCHAR(80)` NOT NULL DEFAULT `''` — qual for B→A sense when duas vias |
| ~~`qualificador`~~ | **Removed** after one-shot migration |

Reciprocal (`tipo_ba` null): only `qualificador_ab` used; `qualificador_ba` forced to `''`.

**Rationale**: Mirrors `tipo_ab`/`tipo_ba` and `nota_ab`/`nota_ba`; FR-001 per-sense model.

**Alternatives considered**: Keep pair-level column + JSON map — rejected (inconsistent with 071).

## 2. Migration from 075 `qualificador`

**Decision** (clarification 2026-08-12):

1. `ALTER TABLE` add `qualificador_ab`, `qualificador_ba`.
2. For each row with non-empty legacy `qualificador`:
   - If `tipo_ba IS NOT NULL AND tipo_ba != tipo_ab` (**duas vias**): copy to **both** `qualificador_ab` and `qualificador_ba`.
   - Else (**recíproco**): copy to `qualificador_ab` only; `qualificador_ba = ''`.
3. Drop column `qualificador` (SQLite table rebuild if needed, or leave column unused — prefer copy-then-ignore in ORM; drop via migration step).

**Rationale**: FR-007; duas-vias-only copy-both rule.

## 3. Canonical mapping

**Decision**: Extend `_to_canonical_fields` to swap `qualificador_ab` ↔ `qualificador_ba` when form personagem order is flipped (same as tipos/notas/conhecido). Reciprocal collapse: keep `qualificador_ab` from primary surviving sense; clear `qualificador_ba`.

**Rationale**: Clarification Q2 (duas vias → recíproco); consistent with 071.

## 4. Autocomplete (form)

**Decision**:

- **Recíproco**: one field → `suggestionsForTipos(tipo_ab)`.
- **Duas vias**: two fields — AB suggestions from `tipo_ab`, BA from `tipo_ba` (+ Medo each). **No union.**

**Rationale**: Spec FR-005; reverses 075 union behaviour.

## 5. Graph / detail labels

**Decision** (clarification Q3 + spec FR-002):

- **Duas vias**: tip labels = `formatVinculoTipoLabel(tipo, qualificador_for_that_tip)` at nearA/nearB; visibility same as tip tipos today. **Remove** mid `(Qual)` text from 075; mid shows **only** `→` when `direcao` set.
- **Recíproco**: mid/focus unchanged — `formatVinculoTipoLabel(tipo, qualificador_ab, direcao)`.
- **Detail**: `qualFromPerspective(v, id)` parallel to `tipoFromPerspective`; primary + “Vê-te como…” both use `Tipo (Qual)`.

**Rationale**: User request; SC-001.

## 6. Public API / 073 redaction

**Decision**: Expose `qualificador_ab` / `qualificador_ba` on reads. When a tip is redacted (tipo null), redact matching qual to `''` (same visibility as secret tipo).

**Rationale**: FR-008; avoids leaking secret qual on hidden sense.

## 7. Version

**Decision**: Patch **0.11.1** (corrective presentation within qualifier feature).

**Rationale**: No new user-facing capability beyond fixing 075 duas-vias display; semver patch.
