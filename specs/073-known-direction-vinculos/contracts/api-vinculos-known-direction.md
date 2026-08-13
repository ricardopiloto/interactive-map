# Contract: API — Known direction vínculos

**Feature**: `073-known-direction-vinculos`  
**Extends**: `specs/071-two-way-vinculos/contracts/api-vinculos-two-way.md`

## Admin `VinculoRead` / Create / Update

Additive fields:

```json
{
  "conhecido_ab": true,
  "conhecido_ba": false
}
```

- Create/Update: optional booleans, default `true` if omitted.
- Admin list/get: always full `tipo_ab`, `tipo_ba`, notes, `conhecido_*`, `publico`.

## Public `GET /api/vinculos`

**Filter**: `publico == true` AND (reciprocal OR `conhecido_ab` OR `conhecido_ba`).

**Redaction** (before response):

| Stored | Public JSON tips |
|--------|------------------|
| Reciprocal | `tipo_ab` set, `tipo_ba: null` |
| Both known | Both tipos/notas as stored |
| Only AB known | `tipo_ba: null`, `nota_ba: ""`; AB kept |
| Only BA known | `tipo_ab: null`, `nota_ab: ""`; BA kept |

- `tipo_ab` on public Read is **optional** (null when AB secret).
- Do not require `conhecido_*` on public payload (omit or ignore).
- Clients MUST treat null tip as “not visible to this viewer”.

## Errors

Unchanged from 071 (self-link, missing pair, etc.).
