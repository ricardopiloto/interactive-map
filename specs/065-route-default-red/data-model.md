# Data Model: Route Default Red

**Feature**: `065-route-default-red` | **Date**: 2026-08-07

No data model changes. Colour mapping is presentation-only over existing `dias_visuais` / selection state.

## Visual mapping (client)

| Condition | Style token |
|-----------|-------------|
| Selected, non-residual day / normal ritmo | `--selected` → red base `#e5484d` |
| Selected, residual day with `fadiga_apos` ≥ 1 | `--fadiga-N` where N = min(6, fadiga_apos) |
| Non-selected route | `--alt` → lighter dashed red |

Entities from 063 (`DiaVisual.residual`, `fadiga_apos`) unchanged.
