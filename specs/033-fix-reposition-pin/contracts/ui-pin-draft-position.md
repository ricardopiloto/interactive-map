# UI Contract: Pin reflects edit draft position

**Feature**: 033-fix-reposition-pin  
**Surface**: GM — mapa + edição de local

## Display rule

When an **edit** draft is active (`localDraft` with existing local `id`, not new):

- The map pin for that `id` MUST be drawn at `localDraft.x` / `localDraft.y`.
- Other pins MUST use persisted list coordinates.
- Narrative connection lines that depend on that local’s position MUST use the same coordinates as the pin.

When draft is cleared (cancel edit) or absent: all pins use persisted coordinates only.

## Reposition flow (with 032)

| Step | Modal | Pin position |
|------|-------|--------------|
| Edit open | Visible | Draft (= persisted until moved) |
| Reposition started | Hidden | Still draft (unchanged yet) |
| Map click | Reappears | Draft updated → pin at click |
| Banner Cancel | Reappears | Unchanged |
| Dialog Cancel | Closed | Persisted (pre-edit) |
| Save success | Closed | Persisted (new) |

## Non-goals

- Cursor-following ghost before click
- Moving linked waypoints
- Changing add-pin / move-group beyond no regression
- Backend contract changes

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001, SC-001 | Pin at click before save |
| FR-002, SC-002 | Form coords match pin |
| FR-003–004, SC-004 | 032 modal + banner cancel |
| FR-005, SC-003 | Cancel edit restores pin |
| FR-006 | Save keeps pin at new spot |
| FR-007 | No move without reposition mode |
