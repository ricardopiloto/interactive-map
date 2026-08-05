# Data Model: Fix Mobile Marker Alignment

**Feature**: `049-fix-mobile-marker-align` | **Date**: 2026-08-05

## Overview

No persisted entities change. Presentation-only.

## Logical concepts (UI)

| Concept | Role | Persistence |
|---------|------|-------------|
| Local pin | Campaign-map marker | Unchanged `x`/`y` |
| Group pin | Party marker | Unchanged position |
| Campaign-map node | If ever shown | Unchanged coords |
| Mobile layout | `map-page--mobile` | Ephemeral |
| 047 nudge | Incorrect left offset to remove | N/A (CSS) |

## Validation rules

| Rule | Constraint |
|------|------------|
| Direction | Eliminate excess **left** offset on mobile; no further left nudge |
| Scope | Locais + grupo (+ nodes if present) on campaign map mobile |
| Desktop | No regression |
| Data | No write of presentation fix into DB |

## State transitions

| From | To | Presentation |
|------|-----|----------------|
| Mobile + 047 left nudge | Mobile corrected | No excess left offset |
| Mobile | Desktop | Desktop alignment unchanged |
