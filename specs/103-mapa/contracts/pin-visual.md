# Contract: Pin visual

**Feature**: `103-mapa`

## Shape → meaning

| Shape | Meaning | Rule |
|-------|---------|------|
| Filled disc/teardrop | Visitado | `data_sessao` present |
| Outline (hollow) | Conhecido | `data_sessao` empty |
| Flag / brasão | Grupo | existing party marker |

## Color

Master `cor_pin` applied to fill (visited) or stroke/border (known). Free color preserved.

## Names

| Condition | Label |
|-----------|--------|
| `scale < 1.35` and not hover/selected | Hidden |
| hover or selected | Shown for that pin |
| `scale >= 1.35` | Shown for eligible pins |

Constant `NAME_ZOOM_THRESHOLD = 1.35` in `CampaignMap.tsx`.
