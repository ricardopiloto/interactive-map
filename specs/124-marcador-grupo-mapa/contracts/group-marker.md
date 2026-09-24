# Group Marker Contract

## UI contract

- Master actions appear in the shared map tools menu defined by spec 123; the feature must not create a second menu.
- Player mode displays the current marker but no move or format write controls.
- Move action enters an explicit placement mode. A translated hint explains that the next map click sets the position, and a visible Cancel action exits without writing.
- During placement, unrelated local selection/add actions cannot consume the click. Map coordinates are normalized and constrained to `[0,1]`.
- A successful move persists, updates the marker and exits placement mode.
- A failed move leaves the previous saved position visible, shows an actionable localized error and allows retry or cancel.
- Format control selects `bandeira` or `brasao`, persists the selected value, and preserves position.
- Recenter changes only the map camera; it never writes marker coordinates.
- New labels, hints, accessible names and errors exist in pt-BR and en.

## Existing API contract

No new route is planned.

| Method | Path | Access | Request / response |
|---|---|---|---|
| GET | `/api/c/{slug}/grupo` | Public read | Returns x, y, format and update timestamp; if absent, materializes default `(0.5,0.5,bandeira)` |
| PUT | `/api/c/{slug}/admin/grupo` | Campaign owner only | Request requires x/y in `[0,1]`; optional format is `bandeira` or `brasao`. Omitted format preserves its existing value. Response returns persisted state and update timestamp. |

The enclosing admin router already denies anonymous/non-member writes. The group write operation additionally requires the campaign owner role (`dono`); other admin operations are outside this feature's scope.

## Required verification cases

- Owner moves the group; a subsequent public read returns the new persisted coordinates.
- Owner changes format; coordinates remain unchanged and subsequent read returns the selected format.
- Invalid/missing coordinates and unsupported format are rejected without altering saved state.
- Anonymous request is 401; non-member and member without owner role are 403; owner succeeds.
- Owner update to campaign A does not change the singleton record in campaign B.
- Failed browser write does not display the candidate as saved; cancel does not call the write operation.

## Prototype contract

The prototype uses local mock state with the same bounds, formats, owner/player visibility and interaction states. It does not make backend requests or claim persistence across reloads.
