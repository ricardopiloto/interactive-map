# Contract: Gênero / capa API

**Feature**: `111-genero-identidade-campanha`  
**Base**: `/api/campanhas`

## Genre ids

`fantasia` | `gotico` | `scifi` | `urbano`

## POST `` (create)

**Auth**: authenticated master.

**Body**:

```json
{
  "nome": "string",
  "slug": "string",
  "sistema": "string",
  "genero": "fantasia",
  "visibilidade": "listada"
}
```

- `genero` **required**; invalid → `400` code `GENERO_INVALIDO`
- missing `genero` → `422` / `GENERO_OBRIGATORIO` (map to i18n)

**Response 201**: includes `genero` (and existing fields). **No** `acento_id`.

## PATCH `/{slug}/capa`

**Auth**: campaign **owner** only.

**Body**:

```json
{
  "capa_arquivo": "uuid.webp",
  "limpar_capa": false
}
```

- Same validation rules as former identidade capa (`CAPA_INVALIDA`).
- Replaces `PATCH /{slug}/identidade` (removed).

**Response 200**:

```json
{
  "slug": "…",
  "capa_arquivo": "",
  "capa_url": null
}
```

**Isolation**: anonymous / other master / co-master → deny (existing owner checks).

## Removed

- `PATCH /{slug}/identidade`
- Request/response fields `acento_id`, `sugestao_acento`
- Service `accent_palette` / `SISTEMA_ACCENT_SUGESTAO`

## Catalog / painel / public config

| Surface | Change |
|---------|--------|
| `GET /api/campanhas/catalogo` | item: `genero` instead of `acento_id` |
| `GET /api/campanhas/minhas` | item: `genero`; drop `sugestao_acento` |
| `GET /api/c/{slug}/config` (or equivalent) | expose `genero`; drop `acento_id` |

## Export manifest

New exports MUST include `"genero": "<id>"`.  
MUST NOT require `acento_id`.  
Import: see [data-model.md](../data-model.md).

## Error codes (i18n-mapped)

| Code | When |
|------|------|
| `GENERO_INVALIDO` | not in closed set |
| `GENERO_OBRIGATORIO` | missing on create |
| `CAPA_INVALIDA` | bad capa filename |
| (existing) | campanha / auth errors |
