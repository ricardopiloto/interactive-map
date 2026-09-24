# Quickstart: Posição e formato do marcador do grupo

Run from the repository root, using disposable test campaigns only.

## Prerequisites

- Backend test environment and frontend dependencies installed.
- Two isolated campaign fixtures: campaign A owned by one master, campaign B owned by a separate master. Campaign A should also include a member without owner role.
- Product and prototype development environments available.

## Validate API behavior

1. Before changing authorization, add request-level checks for anonymous, non-member, member without owner role, and owner access to `PUT /api/c/{slug}/admin/grupo`.
2. As the owner of A, update x/y and read back `GET /api/c/{slug}/grupo`; verify persisted values.
3. Change only format through the UI and verify coordinates remain unchanged.
4. Try coordinates below zero, above one, missing coordinates, and an unsupported format. Verify rejection and unchanged persisted state.
5. Update A, then read B and confirm B's marker did not change.

Run the focused tests from `backend`, for example `uv run pytest tests/test_admin_auth_matrix.py` and the group-specific tests created for this feature.

## Validate the product interaction

1. Sign in as the owner and open the campaign map.
2. Open the shared GM tools from spec 123 and enter Move Group mode.
3. Confirm the placement hint and Cancel control are visible. Cancel and verify no position changes.
4. Start again, click a point near each map boundary, and verify the selected position stays in `[0,1]` and persists after reload.
5. Change between flag and coat of arms; verify the marker changes but its coordinates do not.
6. Trigger or simulate a failed request. Verify the saved marker stays at its prior position, an error is announced, and retry/cancel remain available.
7. Sign in as a player/member without owner role. Confirm controls are absent and direct writes are denied.

## Validate the prototype

1. Open the matching campaign and switch to master mode.
2. Use the shared tools from spec 123 to move the mock marker and change its format.
3. Verify cancel, add-local mode exclusivity, player read-only behavior and recenter-only camera behavior.
4. Check desktop/mobile and pt-BR/en labels and keyboard-accessible control names.

## Expected results

- Only the campaign owner can persist marker state; membership alone is insufficient.
- Position and format survive reads/reloads in product, and each update preserves the other field.
- Cancel and failed writes do not change the saved marker.
- The prototype mirrors the states and controls using mock data.
- No new route, migration or dependency is needed.
