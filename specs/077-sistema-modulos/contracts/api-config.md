# Contract: API — Instance config

**Feature**: `077-sistema-modulos`

## GET /api/config

**Auth**: None (public read-only)

**Response** `200 application/json`:

```json
{
  "sistema": "wfrp4e",
  "modulos_ativos": ["fadiga"],
  "has_map_image": true
}
```

| Field | Type | Semantics |
|-------|------|-----------|
| `sistema` | string | Deploy-fixed RPG system id |
| `modulos_ativos` | string[] | Resolved active mechanics modules (defaults applied) |
| `has_map_image` | boolean | True if server has `campaign-map.*` under uploads/map |

**Errors**: None expected (always 200 if app healthy).

**Caching**: Optional `Cache-Control: public, max-age=60`.

## Environment mapping

| Env var | Config field |
|---------|----------------|
| `SISTEMA` | `sistema` |
| `MODULOS_ATIVOS` | influences `modulos_ativos` (see research §1) |
| *(filesystem)* | `has_map_image` |

## Consumers

- Frontend boot: landing route (`has_map_image`)
- `PersonagemFormDialog`: module widgets (`modulos_ativos`)
- `useInstanceConfig` hook: GM unimplemented-module banner
