# Research: Posição e formato do marcador do grupo

## Decisions

### 1. Extend the existing endpoint and data model

- **Decision**: Continue using the campaign-scoped `PUT /api/c/{slug}/admin/grupo` request with normalized x/y and optional format. Keep the current Group singleton and public read route.
- **Rationale**: The model already stores bounded x/y and `bandeira|brasao`; update schema validates both and the current endpoint can persist position and format together.
- **Alternatives considered**: Add separate move and format endpoints or new columns; rejected because they duplicate the existing contract.

### 2. Require campaign owner for marker writes

- **Decision**: Apply the existing `require_dono` guard specifically to the group write operation while retaining the router's membership guard and public reads.
- **Rationale**: Spec 124 says only the master can move/change the marker, but the current admin router only requires membership; a player member can currently call the group update API. `require_dono` already verifies membership and owner role.
- **Alternatives considered**: Hide controls only in the UI; rejected because the write endpoint remains directly callable by a player. Change all admin routes to owner-only; rejected as unrelated scope.

### 3. Make move mode explicitly cancelable and persistence-aware

- **Decision**: In the product, display an active-mode hint and a clear cancel control. On click, send the selected bounded point to the API and exit mode only after success. On failure, keep the last persisted marker position, show a translated error, and permit retry or cancel.
- **Rationale**: The current map enters `move-group` but has no cancel action; the asynchronous save lacks error handling and can leave an unhandled rejection. Existing `CampaignMap` already converts map clicks to normalized coordinates and clamps them to `[0,1]`.
- **Alternatives considered**: Optimistically move the marker and silently revert; rejected because it can falsely imply persistence and does not communicate failure.

### 4. Keep format change independent from position and recenter

- **Decision**: Toggle/select `bandeira` and `brasao` using current group x/y in the existing update request. Recenter remains camera-only and cannot move the saved marker. Changing format does not change x/y.
- **Rationale**: The product already calls `updateGrupo` with current coordinates when changing format; the prototype's focus button only recenters camera.
- **Alternatives considered**: Combine recenter with position update; rejected because the controls represent distinct user intents.

### 5. Add local mock behavior to frontend-next using spec 123's menu

- **Decision**: Add the move and format actions to the shared master tools menu from spec 123; pass the action state to `MapCanvas`, update mock campaign state for demonstration, and keep player mode read-only. Use `bandeira` as default for old mock campaigns lacking format.
- **Rationale**: The prototype currently has no master tools menu and a static group marker rendered only as a flag. Spec 123 establishes the shared entry point, so 124 must consume it rather than create a competing menu.
- **Alternatives considered**: Create a standalone group toolbar in MapCanvas; rejected because it duplicates master controls and conflicts with the shared map menu.

## Repository findings

- `GrupoPosicao` is a singleton logical record (`id=1`) in each campaign database. x/y are floats constrained to `[0,1]`, format defaults to `bandeira`.
- `GrupoPosicaoUpdate` requires both coordinates and optionally accepts only `bandeira` or `brasao`. `GET /api/c/{slug}/grupo` returns current state and creates default position `(0.5, 0.5)` if missing.
- `PUT /api/c/{slug}/admin/grupo` currently updates x/y and preserves format when omitted. The enclosing admin router requires membership but not owner role; `require_dono` exists for narrow owner-only checks.
- Product `MapPage` already has both GM menu items. Move sets `placement='move-group'`, and a map click sends x/y plus current format. Format switching sends current x/y plus the new format. However, move has no explicit cancel path, and save failures are not surfaced in this path.
- Product `CampaignMap` already clamps selected coordinates to `[0,1]`, disables map panning during placement, disables pin interaction and renders the two marker forms.
- Prototype `CampaignLayout` carries GM/player mode; `MapPage` currently only has an add-local FAB; `MapCanvas` renders a static flag marker and its recenter control only changes camera position. Prototype `GrupoPosicao` currently has x/y and optional local association but no format field.
- Existing automated coverage is missing request-level success/isolation/owner-role tests for group writes. Existing admin auth matrix checks the global membership gate, not that a member without owner role cannot write the group.

## Open clarifications

None. Owner-only authorization follows the spec's definition of master; cancellation and API failure behavior are made explicit by the acceptance criteria and implementation contract.
