# Data Model: Detail Portrait Layout

**Feature**: `070-detail-portrait-layout`  
**Date**: 2026-08-11

No persisted entities. Layout-only client state:

| Surface | Constraint |
|---------|------------|
| `.relacoes-detail` | Existing 300px sheet; column flex; scrolls when content exceeds height |
| Portrait slot | Must not shrink when description/vínculos overflow; img `contain` up to 220px |
| Description | Full text; wrap long tokens; does not widen the sheet |
| Map NPC card | Unchanged (out of scope) |

Personagem / `retrato_url` / `descricao` fields unchanged.
