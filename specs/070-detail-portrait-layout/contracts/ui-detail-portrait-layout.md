# Contract: UI — Relações detail portrait layout

**Feature**: `070-detail-portrait-layout`  
**Surface**: `RelacoesDetailPanel` only

## Portrait slot

| Condition | Behaviour |
|-----------|-----------|
| Has `retrato_url` | Full image visible (`contain`), width of the sheet, height ≤ 220px, **not** squashed by description or vínculos |
| No portrait | Placeholder “Sem retrato” keeps its box; not flattened by long text |
| User scrolls the ficha | Portrait keeps that size (may scroll out of view with the panel; not sticky) |

## Description

| Condition | Behaviour |
|-----------|-----------|
| Long / many paragraphs | Fully readable; panel scrolls |
| Short / empty | No extra scrollbar; “Sem descrição.” unchanged |
| Unbroken long token | Wraps inside the 300px sheet; sheet width unchanged |

## Out of scope

Map sidebar NPC portrait, graph disc (069), crop/fit of the ficha image (stays contain), truncating lore.
