# Contract: API — Qualifier & direction

**Feature**: `075-vinculo-qualifier-direction`  
**Extends**: 071/073 vínculo payloads

## Fields (admin + public Read)

```json
{
  "qualificador": "Mentor",
  "direcao": "a_para_b"
}
```

| Field | Create/Update | Read |
|-------|---------------|------|
| `qualificador` | optional string ≤80; default `""` | always string |
| `direcao` | optional `null` \| `"a_para_b"` \| `"b_para_a"`; omit/`null` = mútuo | same |

## Semantics

- `direcao` is always interpreted against **stored** `personagem_a_id` / `personagem_b_id` (canonical).
- Clients sending form-order ids MUST let the server flip `direcao` when ids are reordered (same as tipos).
- Public list: include fields on redacted tip payloads; do not strip qualifier/direcao.

## Errors

- Invalid `direcao` string → 422
- Qualifier longer than 80 → 422
