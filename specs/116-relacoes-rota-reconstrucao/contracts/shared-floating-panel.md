# Contract: Shared floating panel reuse (116)

**Feature**: `116-relacoes-rota-reconstrucao`  
**Depends on**: [map-panel.md](../../115-mapa-reconstrucao/contracts/map-panel.md) (spec 115)

## Rule

Relações (`/c/:slug/relacoes`) and Rota (`/c/:slug/rota`) MUST mount the **same** floating panel shell as the Map page (geometry, inset, radius, shadow, mobile sheet + `expanded` behaviour).

| MUST | MUST NOT |
|------|----------|
| Import/reuse MapSidePanel (or renamed shared export from 115) | Fork a second shell with divergent CSS |
| Same ~860px breakpoint and grabber pattern | Restore flush side columns |
| Pass page-specific `head` + body slots | Embed PinModal / RelacoesDetailPanel as second chrome |

## Visual parity check

Side-by-side with Map after 115: panel width, corner radius, shadow, left inset (desktop) and bottom sheet (mobile) match without eye-detectable drift.
