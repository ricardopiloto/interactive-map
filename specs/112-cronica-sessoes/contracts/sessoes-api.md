# Contract: Sessões API

**Feature**: `112-cronica-sessoes`  
**Base**: `/api/c/{slug}`

## Public

### `GET /sessoes`

Anonymous OK (subject to campaign visibility rules already in place for the slug).

**Response**: `{ "sessoes": SessaoPublic[] }` ordered by `numero` DESC.

`SessaoPublic`:

```json
{
  "id": 1,
  "numero": 3,
  "titulo": "O assalto ao porto",
  "data_rotulo": "Sessão 3 — março",
  "resumo": "markdown…",
  "locais": [{ "id": 10, "nome": "Porto" }],
  "personagens": [{ "id": 5, "nome": "Elara", "tipo": "pj" }]
}
```

- Omits sessions with `visivel_para_todos=false`.
- `personagens` omits NPCs with `visivel_para_todos=false`.

### `GET /sessoes/{id}`

Same visibility rules; 404 if missing or hidden from caller.

## Admin (`/api/c/{slug}/admin`, `require_membro`)

### `GET /sessoes`

All sessions (including hidden), same shape plus `"visivel_para_todos": bool`.

### `GET /sessoes/proximo-numero`

`{ "numero": 5 }` — suggestion only.

### `POST /sessoes`

Body:

```json
{
  "numero": 5,
  "titulo": "…",
  "data_rotulo": "…",
  "resumo": "…",
  "visivel_para_todos": true,
  "local_ids": [1, 2],
  "personagem_ids": [3]
}
```

- Duplicate `numero` → `400` `{ "erro": "NUMERO_DUPLICADO" }`
- Unknown local/npc id → `400` / `404` as elsewhere

### `PATCH /sessoes/{id}`

Partial update; replacing link lists when `local_ids` / `personagem_ids` sent.

### `DELETE /sessoes/{id}`

`204`; cascades links.

## Isolation

Requests for slug A never return rows from B (covered by DB binding + suite).

## Error codes

| Code | When |
|------|------|
| `NUMERO_DUPLICADO` | unique violation |
| `SESSAO_NAO_ENCONTRADA` | missing id |
| (existing) | auth / campanha |
