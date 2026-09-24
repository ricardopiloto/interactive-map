# Contract: Progressive reveal (Local / Arco visibility)

**Feature**: `113-revelacao-progressiva`  
**Base**: `/api/c/{slug}`

Additive fields and filter rules on existing endpoints. No new route prefixes.

## Shared field

On `Local` and `Arco` read/create/update bodies:

| Field | Type | Default |
|-------|------|---------|
| `visivel_para_todos` | bool | `true` |

## Public — Locais

### `GET /locais` · `GET /locais/{id}`

- Omits / 404s locais with `visivel_para_todos=false`.
- Response `saida_ids`: only ids of **visible** destination locais.
- Response `arco_id`: `null` if the linked arco is missing **or** has `visivel_para_todos=false` (do not leak hidden arco id).
- Response `npc_ids`: only visible NPCs (existing rule).

Admin `GET/POST/PUT /admin/locais` returns all locais including hidden, with `visivel_para_todos` set.

## Public — Arcos

### `GET /arcos` · `GET /arcos/{id}`

- Omits / 404s arcos with `visivel_para_todos=false`.

Admin arcos endpoints return all + flag.

## Public — NPCs / Personagens

### `GET /npcs`, `/npcs/{id}`, `/personagens`, …

- Unchanged visibility of the character itself.
- `local_ids` (or equivalent): **exclude** locais with `visivel_para_todos=false`.

## Public — Sessões

### `GET /sessoes`

- `locais` chips: omit hidden locais (same as hidden personagens today).

## Media

### `GET /media/locals/{file}`

- Anonymous: allowed only if a **visible** Local references that file.
- Campaign member: allowed (unchanged for members).

## Errors

| Code | When |
|------|------|
| `LOCAL_NAO_ENCONTRADO` | Missing or hidden from public caller |
| `ARCO_NAO_ENCONTRADO` | Missing or hidden from public caller |

## Isolation

No new cross-slug surfaces; existing matrix still applies to `/locais` and `/arcos`.
