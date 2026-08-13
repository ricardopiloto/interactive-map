# Contract: UI — Tipo filter double-click

**Feature**: `074-tipo-filter-double-click`  
**Surface**: `RelacoesSideColumn` → section **Tipos de vínculo** chips

| Gesture | Effect |
|---------|--------|
| Single click | Toggle that tipo in `activeTipos` (current behaviour) |
| Double-click | If that tipo is the **only** active → activate **all** tipos; else → activate **only** that tipo |
| Double-click other chip while solo | Switch solo to the new tipo |

## Interaction quality

- Pending single-click MUST be cancelled when a double-click is recognized (no zero-tipos flash on restore).
- Graph / filters update from the same `activeTipos` set (existing `edgeMatchesTipos`).

## Unchanged

- Isolate seleção checkbox; search; legend; chip styling beyond active state.
