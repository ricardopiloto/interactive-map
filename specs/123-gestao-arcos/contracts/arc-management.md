# Arc Management Contract

## User interface contract

- Arc management is available from the master tools while the campaign map is open.
- Player mode has no create, update, reorder, visibility or delete controls.
- Master list is ordered by `ordem` (ascending), then ID as stable tie-breaker.
- Create/edit supports title, summary, order and visibility for all.
- Local assignment is available through the existing Local editor; manager list/grouping shows which Arc a Local belongs to.
- Local may be unassigned. The Local editor in both product and prototype offers “Sem arco”; a non-null association must identify an Arco in the active campaign.
- Hidden Arcos remain available to the master and are visibly marked as hidden.
- Delete requires confirmation that Locals are kept and become unassigned. Cancel has no side effect.
- Empty, loading, validation, success and failure states are understandable and translated in pt-BR/en.
- The prototype and product implement the same user-visible flow. Arco content authored by the GM is not translated.

## Existing campaign API surface

No new endpoint is planned. The existing routes are relative to the active campaign scope:

| Method | Path | Access | Contract |
|---|---|---|---|
| GET | `/api/c/{slug}/admin/arcos` | Campaign member | Returns master list ordered by `ordem,id`, including hidden Arcos |
| POST | `/api/c/{slug}/admin/arcos` | Campaign member | Creates Arco; title 1–200 chars, summary max 5000, order >= 0, visibility default true; returns 201 |
| PUT | `/api/c/{slug}/admin/arcos/{id}` | Campaign member | Partial update of title, summary, order or visibility |
| DELETE | `/api/c/{slug}/admin/arcos/{id}` | Campaign member | Returns 204; preserves related Locals and clears their `arco_id` |
| GET | `/api/c/{slug}/arcos` | Public read | Returns only Arcos visible to all, ordered by `ordem,id` |
| GET | `/api/c/{slug}/arcos/{id}` | Public read | Returns visible Arco; hidden or missing IDs return 404 `ARCO_NAO_ENCONTRADO` |

Existing Local create/update accepts `arco_id` or null. Public Local read hides an `arco_id` when its Arco is hidden; a hidden Arco does not by itself hide a public Local.

## Security and isolation

- All writes are protected by the existing campaign-membership authorization and scoped to the campaign database identified by `slug`; the UI's GM/player mode is not an authorization boundary.
- Anonymous writes are denied.
- An ID from another campaign cannot be read or changed through the active campaign's API.
- A Local write with a non-null Arco ID must be rejected if that Arco does not exist in the active campaign. Confirm enforcement with a regression check; add minimal validation if the existing database constraint does not reject it.
- Regression tests cover campaign A/B isolation, member/anonymous access, public hidden Arco filtering, hidden ID redaction, and delete-unassign behavior.

## Prototype data

Prototype-only Arcos should carry a visibility state for rendering and interaction. Prototype Local Arco associations are nullable and include an unassigned state. Prototype edits are mock state only and do not call the production API.
