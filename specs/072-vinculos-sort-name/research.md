# Research: Vínculos Sort by Name

**Feature**: `072-vinculos-sort-name`  
**Date**: 2026-08-12

## 1. Where to sort

**Decision**: Sort in `RelacoesDetailPanel` when rendering the vínculo list (copy + sort), using `personagemById` to resolve the neighbour name.

**Rationale**: Panel owns the visible labels; works if `vinculos` is passed unsorted from the page. Keeps `selectedVinculos` filter logic separate.

**Alternatives considered**: Sort only in `RelacoesPage` `selectedVinculos` — also fine; slightly less reusable.

## 2. Comparator

**Decision**:

```text
1. Missing neighbour → after named rows
2. localeCompare(nomeA, nomeB, 'pt', { sensitivity: 'base' })
3. Tie → vínculo.id ascending
```

**Rationale**: Matches Assumptions (pt, case-insensitive); FR-003; stable ties (edge case). Aligns with `RoutePlannerPanel` style (`sensitivity: 'base'`).

## 3. Fallback label

**Decision**: Treat missing `personagemById` entry as “unresolved” (sort last), still display “Personagem removido” as today.

**Rationale**: FR-003.
