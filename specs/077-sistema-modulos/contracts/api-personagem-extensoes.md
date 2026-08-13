# Contract: API — Personagem `extensoes_mecanica`

**Feature**: `077-sistema-modulos`  
**Extends**: existing `/api/personagens` and `/api/admin/personagens`

## Fields (admin + public Read)

```json
{
  "id": 1,
  "nome": "Elara Voss",
  "tipo": "pj",
  "extensoes_mecanica": {
    "fadiga": 2
  }
}
```

| Field | Create/Update | Read |
|-------|---------------|------|
| `extensoes_mecanica` | optional object; default `{}` | object; **only keys for active modules** |

Universal fields (`nome`, `tipo`, `papel`, …) unchanged.

## Write semantics

1. Merge incoming `extensoes_mecanica` with sanitization:
   - Drop keys ∉ `modulos_ativos` **silently** (no 400).
   - Validate active keys (fadiga: int 0–6).
2. Universal field updates proceed even if payload contained inactive keys.

## Read semantics

- Omit inactive module keys from `extensoes_mecanica` in response.
- If module inactive, response may be `{}` or omit field (prefer always include `{}` for stable shape).

## Module: `fadiga`

| Key | Type | Validation |
|-----|------|--------------|
| `fadiga` | integer | `0 ≤ value ≤ 6` |

When `"fadiga" ∉ modulos_ativos`: key never in read; stripped on write.

## Migration

- Legacy DB column `npc.fadiga` (if present): migrated to `extensoes_mecanica.fadiga` before column drop (two-step deploy).

## Errors

| Condition | Code |
|-----------|------|
| Active `fadiga` not int or out of range | 422 |
| Inactive module keys in payload | *(ignored — 200)* |
