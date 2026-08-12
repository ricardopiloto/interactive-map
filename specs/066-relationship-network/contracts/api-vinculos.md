# Contract: API — Vínculos

**Feature**: `066-relationship-network`  
**Auth**: Public read filtered; admin full CRUD = HTTP Basic

## Public

| Method | Path | Behaviour |
|--------|------|-----------|
| GET | `/api/vinculos` | Only rows with `publico: true` |

**Read shape**:

```json
{
  "id": 10,
  "personagem_a_id": 1,
  "personagem_b_id": 5,
  "tipo": "amizade",
  "nota": "Salvou a vida dela em Bögenhafen",
  "publico": true
}
```

Ids are canonical (`a < b`); clients treat the edge as undirected.

## Admin

| Method | Path | Behaviour |
|--------|------|-----------|
| GET | `/api/admin/vinculos` | All vínculos (public + private) |
| POST | `/api/admin/vinculos` | Create; `publico` defaults **false** if omitted |
| PUT | `/api/admin/vinculos/{id}` | Update tipo, nota, publico, and/or endpoints (re-canonicalize) |
| DELETE | `/api/admin/vinculos/{id}` | **204** |

**Create/Update body**:

```json
{
  "personagem_a_id": 1,
  "personagem_b_id": 5,
  "tipo": "inimizade",
  "nota": "Dívida não admitida",
  "publico": false
}
```

## Validation

- Both personagem ids must exist
- Reject `a == b`
- Reject duplicate undirected pair (409 or 400)
- `tipo` ∈ {aliado, amizade, inimizade, romance, familia, conhecido}

## Visibility rule (product)

| Client | Vinculos source |
|--------|-----------------|
| Player (`isGm` false) | `GET /api/vinculos` |
| GM (`isGm` true) | `GET /api/admin/vinculos` |
