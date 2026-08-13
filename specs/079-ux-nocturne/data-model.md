# Data Model: UX Nocturne & Débitos

**Feature**: `079-ux-nocturne`  
**Date**: 2026-08-13

> Sem alterações de backend ou persistência. Este documento descreve **estado de UI** e **tokens visuais** relevantes para implementação e testes.

## UI state — digitalização (`RouteDigitizerView`)

| State | Type | Default | Notes |
|-------|------|---------|-------|
| `query` | string | `""` | Filtro busca waypoints + arestas |
| `waypointsOpen` | boolean | `true` | Secção colapsável Waypoints |
| `segmentsOpen` | boolean | `true` | Secção colapsável Arestas |
| `focusedWaypointId` | number \| null | `null` | Highlight pin + scroll lista |
| `focusedSegmentId` | number \| null | `null` | Highlight polyline + row |
| `listSheetOpen` | boolean | `false` (≤800px) | Bottom sheet retrátil |
| `hoveredSegmentId` | number \| null | existing | Mantido para hover mapa↔lista |

### Transitions

- `query` change → listas filtradas instantaneamente (client-side).
- Click waypoint row → `focusedWaypointId` set → map pan/zoom → classe `is-focused` no pin.
- Click segment row → `focusedSegmentId` set → map centra segmento → highlight SVG.
- Viewport ≤800px → layout coluna→bottom sheet; toggle `listSheetOpen`.

## UI state — Rede (`GraphStage`)

| State | Type | Default | Notes |
|-------|------|---------|-------|
| `scale` | number | `1` | Partilhado wheel + pinch |
| `pan` | `{x,y}` | `{0,0}` | Inalterado |
| `pinchSession` | ref | null | Ponteiros activos; max 2 |

### Transitions

- `wheel` → `scale *= 0.9 \| 1.1` (clamp 0.35–2.5).
- Pinch distance delta → `scale *= ratio` (mesmo clamp).
- 3+ pointers → ignorar novos; não corromper pan.

## Visual tokens (CSS custom properties)

| Token | Role | Applied to |
|-------|------|------------|
| `--elevation-column` | Separação coluna fixa vs palco | SideMenu, RelacoesSideColumn, digitizer column |
| `--elevation-panel` | Overlay flutuante secundário | RelacoesDetailPanel, PinModal |
| `--elevation-modal` | Diálogos GM | `.dialog` + backdrop |
| `--shadow-sm/md/lg` | Base existente | Retuned se hairline pesado |

## Entities unchanged (explicit)

- `Waypoint`, `RouteSegment`, `Personagem`, `Vinculo`, `Local`, `NPC`, `Arco` — schema API intacto.
- Protocolos: clique mapa criar nó/segmento, modos `place-wp` / `draw-seg` — inalterados.

## Breakpoints

| Name | Query | Behaviour |
|------|-------|-----------|
| `narrow` | `max-width: 800px` | Digitizer bottom sheet; Relações coluna fixa inferior (layout unchanged) |
| `desktop` | `> 800px` | Coluna lateral 236px fixa |
