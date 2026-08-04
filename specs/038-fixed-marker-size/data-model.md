# Data Model: Marcadores menores com tamanho fixo no zoom

**Feature**: `038-fixed-marker-size` | **Date**: 2026-08-04

Sem entidades persistidas. Modelo = tokens de apresentação + estado de zoom de UI.

## Entities (UI)

### MapZoomState

| Field | Type | Notes |
|-------|------|--------|
| `scale` | number | Zoom actual do `TransformWrapper` (≥ minScale, ≤ maxScale) |
| CSS `--map-zoom` | number | Espelha `scale` no stage (default `1`) |

**Transitions**: Qualquer pan/zoom/wheel/botão/focus → actualizar `scale` e a variável CSS.

### MarkerVisualSpec (targets)

| Kind | Base size (screen px @ zoom 1 after change) | Anchor | Selected/hover |
|------|-----------------------------------------------|--------|----------------|
| Local pin | ~18×18 (was 24) | Tip (margins tip-anchored) | Extra scale ~1.2–1.3 on top of counter-scale |
| Party | ~0.775 × current | Tip/center as today | N/A or subtle if any |
| Digitizer wp | ~10–11 px circle, center margins | Center | Active state distinguishable (color/ring; scale OK) |

### Invariants

- Screen size of **base** marker ≈ constant across zoom (SC-003).
- Geographic `left`/`top` % unchanged (FR-005, FR-008).
- Counter-scale uses `1/scale` so zoom-in shrinks CSS inverse of content scale.

## Validation

- Measure pin width in DevTools at min vs max zoom → Δ &lt; 10%.
- Area @ default zoom ≤ 60% of pre-change (compare to known 24px → ≤ ~18.6 linear).
