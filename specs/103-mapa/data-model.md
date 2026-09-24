# Data Model: Mapa

**Feature**: `103-mapa`  
**Date**: 2026-09-21

Sem alterações de schema. Entidades visuais só no cliente.

## PinVisualState

| Field | Derivation |
|-------|------------|
| shape | `visited` se `local.data_sessao` trim não-vazio; senão `known` |
| color | `local.cor_pin` ou fallback token |
| labelVisible | `scale >= NAME_ZOOM_THRESHOLD` \|\| hovered \|\| selected |

## MapChromeUI

| Field | Rules |
|-------|--------|
| controlsCorner | bottom-right |
| legendCorner | bottom-left |
| legendOpen | default `false` |
| popoverOpen | tied to `selectedLocalId` |

## Transitions

- Toggle legend → flip `legendOpen`
- Select local → open popover; Esc / outside / close → clear selection
- Zoom change → recompute label visibility
