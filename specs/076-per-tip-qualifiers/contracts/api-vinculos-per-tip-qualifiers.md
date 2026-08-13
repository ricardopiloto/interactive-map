# Contract: API — Per-tip qualifiers

**Feature**: `076-per-tip-qualifiers`  
**Extends**: 075 vínculo payloads (replaces pair-level `qualificador`)

## Fields (admin + public Read)

```json
{
  "qualificador_ab": "Medo",
  "qualificador_ba": "Admiração",
  "direcao": "a_para_b"
}
```

| Field | Create/Update | Read |
|-------|---------------|------|
| `qualificador_ab` | optional string ≤80; default `""` | always string |
| `qualificador_ba` | optional string ≤80; default `""`; ignored/cleared when reciprocal | always string |
| `direcao` | unchanged from 075 | unchanged |

**Breaking change**: `qualificador` removed from API; clients must use `qualificador_ab` / `qualificador_ba`.

## Semantics

- Canonical storage vs `personagem_a_id` / `personagem_b_id` (a_id < b_id).
- Form-order swap flips `qualificador_ab` ↔ `qualificador_ba` with tipos (same as `_to_canonical_fields`).
- Reciprocal: `tipo_ba = null` ⇒ `qualificador_ba` MUST be `""` on write; read may omit empty ba.
- Public read: when 073 redacts `tipo_ab` or `tipo_ba`, matching qual field redacted to `""`.

## Migration response

- Existing DB rows: legacy `qualificador` migrated per [data-model.md](../data-model.md) before column drop.

## Errors

- Qualifier longer than 80 → 422
- Invalid `direcao` → 422 (unchanged)
