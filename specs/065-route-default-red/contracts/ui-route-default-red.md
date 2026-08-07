# Contract: UI — selected route default red

**Feature**: `065-route-default-red`  
**Surfaces**: Travel overlay (`RouteOverlay` + `CampaignMap.css`)

## Selected route

| Day / condition | Colour |
|-----------------|--------|
| Non-residual / normal pace | Solid **red** base (`#e5484d` family), selected thickness |
| Residual fatigue day (`fadiga_apos` ≥ 1) | Red intensity level `min(6, fadiga_apos)` — darker as saldo rises |
| Hover on residual | Existing fatigue title/tooltip |

## Non-selected routes

| Condition | Colour |
|-----------|--------|
| Any | Dashed / lighter red; no fadiga level classes |

## Non-goals

- Changing which days are residual
- Changing overnight pins/badges
- Changing side-tab overlay gating (064)
