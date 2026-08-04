# UI Contract: Suppress Segment Hover in Edit Modes

**Feature**: `045-suppress-hover-edit-modes`  
**Surface**: Rede de rotas (`RouteDigitizerView`)  
**Date**: 2026-08-04

## Scope

Gate feature 044 segment-hover by digitizer tool mode. No HTTP. No campaign map / planner.

## Mode rules

| Mode | Segment-hover UI | Segment-hover hit |
|------|------------------|-------------------|
| Idle | On (044) | On |
| Novo nó (`place-wp`) | Off | Off |
| Traçar segmento (`draw-seg`) | Off | Off |

## Transitions

| Aspect | Contract |
|--------|----------|
| Enter edit mode | Clear any active tooltip, list highlight, stroke emphasis |
| Clicks in edit mode near segments | Serve place/draw (not consumed by hover hits) |
| Return to idle | 044 hover fully restored |

## Non-goals

| Aspect | Contract |
|--------|----------|
| Change 044 idle hover content/size | Unchanged |
| CampaignMap / Calcular rota | Unchanged |
| Snap / node aura | Unchanged |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001, FR-002, SC-001, SC-002 | No UI in edit modes |
| FR-003, FR-008, SC-003 | Idle 044 intact |
| FR-004, SC-004 | Clear on enter |
| FR-005 | All surfaces together |
| FR-007, SC-005 | Hits disabled |
| FR-006 | Lore/planner untouched |
