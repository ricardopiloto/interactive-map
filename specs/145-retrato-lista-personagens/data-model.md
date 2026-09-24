# Data Model: Retratos nas listas de personagens

## Existing entity: Personagem

| Field | Existing type | Use in this feature | Validation/change |
| --- | --- | --- | --- |
| `id` | Number | Keeps each row tied to the correct character | None |
| `nome` | String | Remains the visible and accessible identity beside the avatar; supplies the initials fallback | None |
| `retrato_url` | Nullable string | Supplies the optional character portrait | Reuse as-is; null or load failure displays initials |
| `tipo`, `papel`, `status`, `visivel_para_todos` | Existing character attributes | Continue to drive existing metadata and visibility behavior | None |

## Relationships

- Map list rows use the character records already supplied to `MapPage`.
- Relations list rows use the existing `Personagem` records in `RelacoesPage`.
- The portrait belongs to the character record represented by its row; this feature introduces no new relation or entity.

## Persistence and API

No persistence, schema, endpoint, or API contract changes. The existing `retrato_url` is read-only in these lists.
