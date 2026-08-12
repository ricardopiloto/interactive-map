# Contract: API — Two-way vínculos

**Feature**: `071-two-way-vinculos`  
**Supersedes field shape of** `066` `api-vinculos.md` (paths unchanged)

**Auth**: Public read filtered by `publico`; admin CRUD = HTTP Basic

## Read shape

```json
{
  "id": 10,
  "personagem_a_id": 1,
  "personagem_b_id": 5,
  "tipo_ab": "aliado",
  "tipo_ba": "romance",
  "nota_ab": "Companheiros de estrada desde Bögenhafen",
  "nota_ba": "Marcus vê mais do que amizade",
  "publico": true
}
```

Reciprocal:

```json
{
  "id": 11,
  "personagem_a_id": 2,
  "personagem_b_id": 3,
  "tipo_ab": "amizade",
  "tipo_ba": null,
  "nota_ab": "Respeito entre cultos",
  "nota_ba": "",
  "publico": true
}
```

Ids remain canonical (`a < b`). Clients interpret directions relative to those ids.

## Endpoints

| Method | Path | Behaviour |
|--------|------|-----------|
| GET | `/api/vinculos` | Only `publico: true` |
| GET | `/api/admin/vinculos` | All |
| POST | `/api/admin/vinculos` | Create; `publico` default false |
| PUT | `/api/admin/vinculos/{id}` | Update fields / endpoints (re-canonicalize) |
| DELETE | `/api/admin/vinculos/{id}` | **204** |

## Create / Update body

```json
{
  "personagem_a_id": 1,
  "personagem_b_id": 5,
  "tipo_ab": "aliado",
  "tipo_ba": "romance",
  "nota_ab": "…",
  "nota_ba": "…",
  "publico": false
}
```

- Omit `tipo_ba` or send `null` ⇒ reciprocal  
- If `tipo_ba == tipo_ab`, server normalizes to reciprocal (`tipo_ba=null`, prefer `nota_ab`)

## Validation

- Both ids exist; reject `a == b`; reject duplicate pair (409)
- `tipo_ab` required; tipos ∈ six enums
- Público is per pair only

## Visibility

| Client | Source |
|--------|--------|
| Player | `GET /api/vinculos` — sees both perspectives when pair is public |
| GM | `GET /api/admin/vinculos` |
