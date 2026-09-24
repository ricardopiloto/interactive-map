# Contract: Create campaign API (unchanged)

Wizard MUST call the existing client helper without schema changes.

## Request

`POST /api/campanhas` (authenticated)

```json
{
  "nome": "string",
  "slug": "string",
  "sistema": "string",
  "genero": "fantasia|gotico|scifi|urbano",
  "visibilidade": "listada|so_link"
}
```

Client: `campanhasApi.criar(body)`.

**MUST NOT** send `resumo` or any new field.

## Success response (existing shape)

```json
{
  "slug": "string",
  "id": 0,
  "nome": "string",
  "sistema": "string",
  "genero": "string",
  "visibilidade": "string"
}
```

Wizard uses `slug` (+ `nome`) for the success screen and `/c/:slug` link.

## Errors

Preserve current API error semantics (validation, duplicate slug, auth). Surface as i18n message on review (or current step); do not show success screen.

## Side effects (existing)

- Appears in `GET /api/campanhas/minhas`.
- If `listada`, appears in public catalog per current rules (`GET` catalog used by `/explorar`).
