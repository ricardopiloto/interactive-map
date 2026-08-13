# UI Contract: Gestos de zoom — Rede de Relações

**Feature**: `079-ux-nocturne`  
**Component**: `GraphStage` (+ optional `usePinchZoom` hook)

## Unified zoom state

| Input | Handler | Scale factor |
|-------|---------|--------------|
| Mouse wheel | `handleWheel` (existing) | ×0.9 / ×1.1 per event |
| Pinch (2 fingers) | `usePinchZoom` → `setScale` | distance ratio between frames |
| Zoom buttons (+/−/1:1) | existing controls | unchanged |

**Single state**: `scale` (default `1`, clamp `0.35`–`2.5`).

## Pinch behaviour

| Rule | Requirement |
|------|-------------|
| Pointers tracked | Max 2 for pinch; ignore additional touches |
| 3+ fingers | No crash; pan/zoom remain stable |
| During pinch | Suspend pan/node-drag initiation |
| After pinch ends | Resume pan/drag normally |
| Switch wheel↔pinch | No scale reset — continues from current level |

## Touch target

- Entire `.graph-stage` canvas area (not just nodes).

## CSS

- `touch-action: none` on stage (already present) — maintain.

## Map verification (FR-005a)

| Surface | Library | Expected |
|---------|---------|----------|
| `CampaignMap` | `react-zoom-pan-pinch` | Pinch works out of box; fix in 079 if not |
| `RouteDigitizerView` | `react-zoom-pan-pinch` | Same as map |
| `GraphStage` | Custom transform | **Must implement** pinch this feature |

## Success criterion

- SC-002: pinch works on 3/3 touch devices (notebook/tablet/phone).

## Out of scope

- Pinch on relationship **detail panel** or side column scroll areas.
- Changing min/max scale constants without product request.
