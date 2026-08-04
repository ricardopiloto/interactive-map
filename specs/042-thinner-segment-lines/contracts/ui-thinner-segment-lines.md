# UI Contract: Thinner Segment Lines

**Feature**: `042-thinner-segment-lines`  
**Surface**: Rede de rotas segment polylines  
**Date**: 2026-08-04

## Scope

Digitizer saved + draft strokes only. No CampaignMap overlay or lore connections.

## Stroke

| Aspect | Contract |
|--------|----------|
| Width | ≤ ~60% of previous 2.5 (target **1.5**) |
| Cap/join | Remain round |
| Types | Same colors; dashes may scale slightly |
| Draft | Same thinness family as saved |

## Non-goals

| Aspect | Contract |
|--------|----------|
| Travel plan overlay | Unchanged |
| Lore exit lines | Unchanged |
| Node/aura | Unchanged |
| Geometry data | Unchanged |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001–002, SC-001–002 | Thinner digitizer strokes |
| FR-003, SC-003 | Types distinct |
| FR-004, SC-004 | Flows intact |
| FR-005–006 | Nodes + other maps untouched |
