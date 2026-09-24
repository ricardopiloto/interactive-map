# Research: Gestão de arcos narrativos

## Decisions

### 1. Treat this as an experience-completion feature, not a new data/API feature

- **Decision**: Reuse existing campaign-scoped Arco routes, fields, authorization and Local association. Only change backend contracts if implementation uncovers a verified gap.
- **Rationale**: Current model and schemas already represent title, summary, order and visibility. Admin endpoints already list/create/update/delete Arcos; public endpoints filter hidden Arcos. Local create/update already accept `arco_id`.
- **Alternatives considered**: Add new management endpoints or schema fields; rejected because the existing contract already covers the spec's required state.

### 2. Make Arco management discoverable from the map's GM tools

- **Decision**: Add a "manage arcs" action to the existing master map tools and open a map-context list/form surface. Keep it hidden from player mode and do not add a primary navigation tab.
- **Rationale**: The current product's master menu already exposes "new arc". The backlog places this as map support, and both current UI and prototype are map-centered.
- **Alternatives considered**: Create a separate Arcs navigation page; rejected because arcs organize map locations and are not a player-facing destination like Sessions.

### 3. Use the existing ordered list/form concepts; update order per arc

- **Decision**: Reuse the current `ArcoAdminList` and `ArcoFormDialog` behavior where appropriate, and mirror the resulting user flow in the prototype. An edit may change an Arco's non-negative `ordem`; the list sorts by `ordem`, then stable ID. No batch-reorder API is introduced in this feature.
- **Rationale**: The backend accepts `ordem` in create/update, and existing UI components already expose an order field. A new endpoint is unnecessary for the specified outcome.
- **Alternatives considered**: Add a transactional reorder endpoint and rank normalization; deferred unless usability or collision behavior proves the current per-record contract insufficient.

### 4. Preserve the current delete outcome and make it clear before confirmation

- **Decision**: Confirm deletion with a message that assigned Locals are preserved and become unassigned. Do not cascade-delete Locals.
- **Rationale**: The current admin delete endpoint sets each related Local's `arco_id` to null and deletes only the Arco.
- **Alternatives considered**: Cascade-delete associated Locals or force reassignment before deletion; rejected because either changes existing content semantics and could destroy data.

### 5. Extend the frontend-next prototype as the design reference

- **Decision**: Add mock Arco management state to a discoverable map-context master action and represent list, empty, edit/create, hidden marker, order and delete confirmation. Extend Arco data with visibility. Extend Local's Arco association to allow null and add a “Sem arco” option.
- **Rationale**: Prototype CampaignLayout has only a visual GM/player mode, MapPage displays arcs, but there is no master management UI. Prototype Arco omits `visivel_para_todos`, and its Local form always chooses an Arco even though product Locals can remain unassigned.
- **Alternatives considered**: Treat the current product as its own visual reference; rejected because the backlog explicitly identifies missing prototype design.

### 6. Make campaign isolation and visibility regression checks blocking

- **Decision**: Add/extend backend tests for anonymous write denial, member access, successful Arco CRUD, campaign A/B isolation, hidden Arco list/detail filtering, Local `arco_id` redaction, invalid/missing Arco associations, and delete-unassign preservation before changing data behavior.
- **Rationale**: Constitution principles I and II apply to campaign data and membership-gated writes. Existing tests cover public visibility/redaction and generic admin gates, but no complete Arco CRUD/delete-unassign test or Arco-specific cross-campaign API case was found.
- **Alternatives considered**: Rely only on manual UI checks; rejected because authorization and cross-campaign data isolation are security requirements.

### 7. Keep Local-to-Arco assignment valid and nullable

- **Decision**: A Local may be unassigned (`arco_id = null`) or refer to an existing Arco in the active campaign. Test the invalid-ID case; add the smallest validation needed if the current SQLite relationship does not reject it.
- **Rationale**: Product Local create/update supports null, while the prototype currently makes `arcoId` mandatory and defaults to the first Arco. The model declares a foreign key but the campaign engine does not visibly enable SQLite foreign-key enforcement, and the Local admin route has no explicit Arco lookup.
- **Alternatives considered**: Keep the prototype's mandatory assignment; rejected because it cannot represent an existing product state. Rely on an unverified SQLite FK setting; rejected until the invalid-ID case is proven to fail safely.

## Repository findings

- `backend/app/models/arco.py`: fields are `id`, `titulo` (max 200), `resumo` (default empty, max 5000), `ordem` (default 0), and `visivel_para_todos` (default true); Arco has a Local relationship.
- `backend/app/schemas/arco.py`: create requires a 1–200 character title and supports summary/order/visibility; update supports partial updates; order is non-negative.
- `backend/app/routers/admin/arcos.py`: campaign-admin GET list, POST create, PUT partial update and DELETE. List orders by `ordem,id`; delete sets associated `Local.arco_id` to null and preserves Local records. Campaign member auth is applied by the parent admin router.
- `backend/app/routers/public/arcos.py`: public list/detail filters hidden Arcos; hidden/missing details return `ARCO_NAO_ENCONTRADO`.
- `backend/app/routers/public/locais.py`: public Local output redacts `arco_id` when its Arco is hidden. Hiding an Arco does not hide an otherwise public Local.
- `backend/tests/test_visibility_local_arco.py`: covers hidden Arco filtering/redaction, admin visibility and persistence of visibility changes. `test_admin_auth_matrix.py` checks anonymous denial across admin routes; generic campaign isolation tests exist, but no direct Arco delete-unassign or Arco-specific two-campaign HTTP CRUD case was found.
- `frontend/src/pages/MapPage.tsx`: GM tools currently expose "new arc" only and the save flow calls existing create/update API. Full list/edit/delete/order is not wired there.
- `frontend/src/components/admin/ArcoAdminList.tsx`: existing but currently unmounted list UI includes create, edit, visibility indicator and delete confirmation. `ArcoFormDialog` includes title, summary, order and visibility fields.
- `frontend/src/components/admin/LocalAdminList.tsx` groups Locals by Arco/order; `LocalFormDialog` already allows assigning/unassigning a Local to an Arco.
- `frontend-next/src/pages/CampaignLayout.tsx` has a visual GM/player mode; `MapPage.tsx` displays Arco names but has no management surface. Prototype `Arco` omits `visivel_para_todos`. Prototype `Local.arcoId` is required and `LocalFormModal` has no “Sem arco” option, unlike the product Local editor.
- Admin Arco routes use the existing campaign-membership dependency. The UI's GM/player mode is not an authorization boundary; prototype interactions are mock-only and product writes must continue to use server authorization.
- `Local.arco_id` declares a foreign key to `arco.id`, but the inspected campaign engine has no explicit SQLite `PRAGMA foreign_keys=ON`, and the Local admin handler does not look up the Arco. Plan a regression check for a nonexistent `arco_id`; do not assume the database rejects it.
- No new database migration, public route or dependency is required by the known design.

## Open clarifications

None. A per-Arco order edit is the default based on the current contract; a batch reordering endpoint is explicitly deferred unless implementation discovery proves it necessary.
