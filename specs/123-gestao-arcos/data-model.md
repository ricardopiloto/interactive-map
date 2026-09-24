# Data Model: Gestão de arcos

This feature does not add persisted entities or fields. It uses current campaign-scoped data.

## Arco (existing)

| Field | Type | Validation / behavior |
|---|---|---|
| `id` | integer | Campaign-local identifier |
| `titulo` | string | Required; 1–200 characters |
| `resumo` | string | Optional; empty by default; max 5000 characters |
| `ordem` | integer | Non-negative; list sorts by order then ID |
| `visivel_para_todos` | boolean | Defaults true; false hides Arco from public Arco list/detail |

Arco belongs to the campaign database selected by the current campaign slug. It has zero or more Locals through the existing nullable Local association. There is no cross-campaign relationship.

## Local (existing association)

| Field | Type | Validation / behavior |
|---|---|---|
| `arco_id` | integer or null | Optional reference to an Arco in the same campaign; null means unassigned |
| `visivel_para_todos` | boolean | Independent visibility; hiding an Arco does not hide a public Local |

When an Arco is hidden from players, the public Arco endpoints omit it and the public Local representation redacts the hidden `arco_id`. Deleting an Arco preserves its Locals and sets their association to null.

The prototype's corresponding `Local.arcoId` must also be nullable. Its editor must offer “Sem arco” so mock behavior can represent an unassigned Local, matching the existing product contract. A non-null association must refer to an Arco in the active campaign; the implementation must verify that the current persistence boundary rejects missing Arco IDs and add minimal validation if it does not.

## Transient management view state

The UI may hold the active list, selected Arco draft, selected action, validation errors, loading/error state and delete-confirmation target. These are ephemeral interaction state and are not persisted separately.

## State transitions

- **Create**: unsaved draft → validated create request → persisted Arco → refreshed ordered list.
- **Edit**: persisted Arco → draft edits → partial update → refreshed ordered list.
- **Reorder**: edit the Arco order value → update that Arco → list re-sorts by `ordem,id`. Each write is per Arco; no atomic batch operation is defined.
- **Unassign Local**: select “Sem arco” → save Local with `arco_id=null` → Local appears in the unassigned group.
- **Visibility**: toggle `visivel_para_todos` → update Arco → master list retains it; player list/detail and Local association output apply existing redaction rules.
- **Delete**: selected Arco → confirmation → existing delete behavior preserves Locals with `arco_id=null` → refreshed list. Cancel leaves all data unchanged.

No migration or data backfill is planned.
