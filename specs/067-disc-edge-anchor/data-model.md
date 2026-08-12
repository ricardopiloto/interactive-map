# Data Model: Disc Edge Anchor

**Feature**: `067-disc-edge-anchor`  
**Date**: 2026-08-11

No persisted entities. Client-only geometry:

| Concept | Role |
|---------|------|
| **Layout point** | Centre of node box (172×112); used for ring placement and node `transform` |
| **Disc centre** | Layout point + offset `(0, paddingTop + DISC/2 − NODE_H/2)`; used only for vínculo lines and label midpoint |
| **Drag offset** | Session-only delta added to layout point before both paint and disc-centre derivation |

Personagem / Vínculo schemas unchanged (066).
