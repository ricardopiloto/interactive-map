# Contract: API — Personagens

**Feature**: `066-relationship-network`  
**Auth**: Public read; admin write = HTTP Basic (`/api/admin`)

## Public

| Method | Path | Behaviour |
|--------|------|-----------|
| GET | `/api/personagens?q=` | List all; optional name filter; includes PJs and NPCs |
| GET | `/api/personagens/{id}` | One personagem + `local_ids` |

**Read shape** (JSON):

```json
{
  "id": 1,
  "nome": "Elara",
  "tipo": "pj",
  "papel": "Caçadora de Recompensas",
  "descricao": "...",
  "faccao": null,
  "status": "vivo",
  "retrato_url": "/media/...",
  "local_ids": []
}
```

## Admin

| Method | Path | Behaviour |
|--------|------|-----------|
| POST | `/api/admin/personagens` | Create; body: nome, tipo, papel?, descricao?, faccao?, status?, retrato_url? |
| PUT | `/api/admin/personagens/{id}` | Update same fields |
| DELETE | `/api/admin/personagens/{id}` | **204**; cascade delete all vínculos; remove from map (entity gone) |

`local_ids` remain owned by Local admin (`npc_ids`), not this write API.

## Compatibility

| Legacy | Behaviour |
|--------|-----------|
| `/api/npcs`, `/api/admin/npcs` | Same handlers or thin aliases during migration |

## Errors

- 404 unknown id
- 400 validation (empty nome, invalid tipo/status)
- 401/503 admin auth (existing pattern)
