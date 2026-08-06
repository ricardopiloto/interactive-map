# Data Model: Route Type Coverage in Alternatives

**Feature**: `056-route-type-coverage` | **Date**: 2026-08-05

No persisted schema changes. Conceptual entities for planner assembly only.

## Entities

### PureTypeCandidate

| Field | Description |
|-------|-------------|
| `tipo` | `estrada` \| `rio` \| `trilha` |
| `item` | `RoutePlanItem` with `tipos == [tipo]` |
| `exists` | True iff type-restricted graph connects origem→destino |

### MixedCandidatePool

| Field | Description |
|-------|-------------|
| `items` | Up to k node-paths × edge variants from current mixed discovery |
| `seen` | Set of segment-id signatures |

### ResultAssembly

| Slot rule | Rule |
|-----------|------|
| Overall best | Top of full sort; never dropped |
| Coverage | One best pure per `tipo` with `exists` |
| Fill | Remaining sorted mixes until ≤ `K_MAX` (6) |
| Drop order | Lowest-ranked mixes that are not #1 and not sole coverage for a tipo |

## Relationships

```text
Network segments → parallels (by node pair)
                 → mixed graph (all tipos)
                 → type-restricted graph per tipo
Mixed discovery + pure searches → candidate bag → assembled ≤6 RoutePlanItem list
```

## Validation

- Pure item MUST have exactly one entry in `tipos`.
- MUST NOT emit a pure tipo when type-restricted graph has no path.
- Final list length ∈ [0, 6]; empty only when no mixed path (unchanged).
- Dedup by segment signature before assembly.

## State / transitions

N/A (stateless request).
