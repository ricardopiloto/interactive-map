# Contract: Digitizer visual shell (118)

**Feature**: `118-rede-rotas-entrada`  
**Visual SoT**: `frontend-next/src/components/route/RouteDigitizer.tsx` (+ `.css`)  
**Behavior SoT**: current `frontend/src/components/gm/RouteDigitizerView.tsx` (incl. intermediate points)

## Zoom controls (`DigControls`)

| Rule | Detail |
|------|--------|
| Semantics | `zoomIn` / `zoomOut` / `resetTransform` unchanged |
| Look | Match Map zoom pós-115: circular/`--radius-full`, translucent elevated fill, `--shadow-md`, ~40px hit target |
| Placement | Over map viewport (product may keep current corner; prefer consistency with prototype/map if capture allows without logic change) |
| Markup | Prefer `IconButton` + icons; presentation-only |

## Mode actions

| Control | Look | Behavior |
|---------|------|----------|
| Novo nó | Chip / chip-active when `mode === 'place-wp'` | Toggle mode + clear draft — **same handlers** |
| Traçar segmento | Chip / chip-active when `mode === 'draw-seg'` | Toggle mode + clear draft — **same handlers** |

## List + scale

| Surface | Look | Behavior |
|---------|------|----------|
| Waypoint/segment list | MapSidePanel-like: surface, soft shadow, row density, search chrome tokens | Same `DigitizerListPanel` callbacks (search, delete, focus, local link) |
| Scale field | Tokenized inputs/buttons | Same `saveScale` / validation |

## CSS tokens (replace legacy radii/shadows on digitizer chrome)

Prefer: `var(--radius-full)`, `var(--shadow-md)`, surfaces/elevated mixes already used on Map/MapSidePanel.  
Avoid leaving digitizer-only `--radius-md` / hard `4px` on **chrome** (toolbars, list rows, zoom). Map markers that are intentionally circular (`50%`) may stay.

## MUST NOT

- Change intermediate-point drawing, segment types, API calls, focus-zoom-to-element math
- Delete scale or list features to “match” simplified prototype behavior
- Reopen/restyle Map page zoom (already 115) except sharing CSS patterns by reference/reuse
