# Data Model: Tipo Filter Double-Click

**Feature**: `074-tipo-filter-double-click`  
**Date**: 2026-08-12

No persisted entities. Client-only UI state:

| State | Shape | Transitions |
|-------|--------|-------------|
| `activeTipos` | `Set<VinculoTipo>` | Init: all six. Single-click: add/remove one. Dblclick: `{tipo}` or full `VINCULO_TIPOS`. |

**Invariants (dblclick path)**: never leave the set empty; solo = size 1; restore = size 6 (all `VINCULO_TIPOS`).
