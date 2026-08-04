# UI Contract: Digitizer Node Hit Aura

**Feature**: `041-digitizer-node-aura`  
**Surface**: Rede de rotas (`RouteDigitizerView`)  
**Date**: 2026-08-04

## Scope

GM digitizer node pick zone + aura. No HTTP. No campaign map pins/party.

## Pick zone

| Aspect | Contract |
|--------|----------|
| Radius | Single `NODE_SNAP` for origin and finish |
| Magnitude | ≤ ~70% of former origin snap (0.03); recommend ~0.01 |
| Nearest | Unchanged nearest-within-max algorithm |
| Button hit | Covers aura extent (or snap matches visible aura at typical zoom) |

## Aura

| Aspect | Contract |
|--------|----------|
| When | Always visible on placed nodes |
| What | Halo/ring around node disk showing pick zone |
| Zoom | Counter-scaled with node (`--map-zoom`) so it stays with the disk |
| Active | Origin-in-progress still clearly different (stronger fill/ring) |
| Palette | Subtle vs map; quieter than active highlight |

## Non-goals

| Aspect | Contract |
|--------|----------|
| CampaignMap pins/party | Unchanged |
| Route planner De/Para | Unchanged |
| Segment stroke width | Unchanged except if incidental |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001, SC-001 | Smaller `NODE_SNAP` |
| FR-003, FR-003a | Unified snap = aura |
| FR-002, FR-004, SC-002 | Always-on aura |
| FR-005, SC-004 | Active distinct |
| FR-006, SC-003 | Flows work; inside/outside clicks |
| FR-007 | Lore map untouched |
