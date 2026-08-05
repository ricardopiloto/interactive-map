# Data Model: Mobile Left Offset

**Feature**: `047-mobile-left-offset` | **Date**: 2026-08-05

## Overview

No persisted entities change. This feature is **presentation-only**.

## Logical concepts (UI)

| Concept | Role | Persistence |
|---------|------|-------------|
| **Local pin** | Campaign-map marker for a `Local` | Unchanged `x`/`y` / DB |
| **Campaign-map node** (if visible) | Node marker on campaign map only | Unchanged waypoint coords |
| **Group pin** | Party marker | Unchanged; **no** nudge |
| **Mobile layout** | `map-page--mobile` when width &lt; 800 | Ephemeral client state |

## Validation rules (presentation)

| Rule | Constraint |
|------|------------|
| Nudge magnitude | ~6–10 screen px left; plan target **8px** |
| When | Only under mobile page layout |
| Where | Campaign map local pins (+ campaign-map nodes if any) |
| Not | Digitizer nodes, group pin, route geometries, stored coordinates |

## State transitions

| From | To | Presentation |
|------|-----|----------------|
| Desktop layout | Mobile layout | Apply left nudge |
| Mobile layout | Desktop layout | Remove left nudge |

No server lifecycle.
