# Contract: Campaign section routes (114)

**Feature**: `114-cabecalho-navegacao`  
**Base**: browser paths under `/c/:slug`

| Path | Page shell | Notes |
|------|------------|--------|
| `/c/:slug` | Map (existing) | Unchanged behaviour |
| `/c/:slug/relacoes` | Relacoes (existing) | Unchanged |
| `/c/:slug/sessoes` | Sessoes (existing) | Unchanged |
| `/c/:slug/rota` | **RotaPage (new, minimal)** | Hosts existing route planner UI; no new API |

## RotaPage minimal

- MUST render campaign chrome (`CodexHeader` with same props pattern as siblings).
- MUST mount existing planner panel with campaign waypoints/locais (read-only of map pick OK).
- MUST NOT require new backend endpoints.
- Full floating-panel redesign: out of scope (spec 116).

## Active tab detection

| Path pattern | Active tab |
|--------------|------------|
| exact `/c/:slug` (no trailing section) | Mapa |
| `…/relacoes` | Relações |
| `…/rota` | Rota |
| `…/sessoes` | Sessões |

## Permissions

- No change to admin/session probes.
- Edit Mode visibility remains `canEdit` from existing provider.
