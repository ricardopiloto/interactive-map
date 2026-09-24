# Contract: Map camera controls & FAB (115)

**Feature**: `115-mapa-reconstrucao`

## Zoom / focus toolbar

| Control | Action (unchanged semantics) | Visual |
|---------|------------------------------|--------|
| + | zoom in | Circular / pill icon btn in translucent stack |
| − | zoom out | same |
| 1:1 / reset | reset transform | same |
| Ir ao grupo | focus group marker | same; disabled if no grupo |

**Placement**: bottom-right of map stage; above bottom nav / sheet safe area on narrow viewports.

**MUST**: Keep updating `--map-zoom` (or equivalent) so pins stay visually stable.

**MUST NOT**: Change pan/pinch library or focus animation contract beyond CSS chrome.

## FAB add local

| Rule | Detail |
|------|--------|
| Visibility | Edit Mode on only |
| Placement | Opposite corner to zoom (bottom-left) |
| Action | Enter add-pin placement; click map opens existing local create draft/dialog |

## Out of scope

- Route digitizer UI redesign (entry may move to a compact Edit Mode control).
