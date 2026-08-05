# UI Contract: Refine segment stroke weight

**Feature**: `048-refine-segment-stroke`  
**Surface**: Rede de rotas (`RouteDigitizer`) segment polylines  
**Date**: 2026-08-05

## Scope

Saved + draft + hover stroke widths. Hit-area width unchanged. No campaign overlay / lore lines.

## Stroke

| Aspect | Contract |
|--------|----------|
| Normal / draft width | ~**⅔** of pre-change (target **1.0** from 1.5) |
| Hover width | ~**⅔** of pre-change hover (target **~2.3** from 3.5) |
| Hit stroke | Unchanged (**12**) |
| Cap/join | Remain round |
| Types | Same colors; dashes optional minor scale |

## Must not

| Aspect | Contract |
|--------|----------|
| Travel plan overlay | Unchanged |
| Lore exit lines | Unchanged |
| Node / aura size | Unchanged |
| Geometry data | Unchanged |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001–002, SC-001–002 | Thinner normal/draft |
| FR-004, SC-004 | Hover scaled ~⅔, still stronger than normal |
| FR-005 | Hit area stays usable |
| FR-003, SC-003 | Types distinct |
| FR-006–008, SC-005 | Nodes/other maps/data untouched; flows OK |
