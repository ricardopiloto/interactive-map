# Research: Route Default Red

**Feature**: `065-route-default-red` | **Date**: 2026-08-07

## 1. Selected base colour

**Decision**: Change `.campaign-map__travel-route--selected` from `#2f9e44` (green) back to `#e5484d` (visited/travel red family used before 063).

**Rationale**: Spec FR-001 — restore default selected route colour to red.

**Alternatives considered**: Keep green (rejected by user); orange base (out of scope).

## 2. Fatigue darkening

**Decision**: Leave `.campaign-map__travel-route--fadiga-1` … `--fadiga-6` and `RouteOverlay` residual logic unchanged (already red intensity by `fadiga_apos`).

**Rationale**: Spec FR-003/004 — keep darkening rule; no backend or day-eligibility changes.

**Alternatives considered**: Remap fatigue to a different hue (rejected).

## 3. Alt vs selected vs fatigue contrast

**Decision**: Keep alts as dashed lighter red (`color-mix` of `#e5484d`). Selected base = solid `#e5484d` thicker. Fatigue levels start lighter-than-or-equal mid reds and go darker than base (existing scale: `#f0a0a4` → `#7a1018`). If selected solid and fadiga-1 are too close visually, nudge fadiga-1 slightly or ensure residual days always use fadiga classes (already true when residual && fadiga_apos ≥ 1).

**Rationale**: US3 — distinguish selected / alt / fatigue without reintroducing green.

**Alternatives considered**: Blue alts (out of scope); green alts (conflicts with “all red family” preference).

## 4. Non-goals

Change `dias_visuais` / overnight math; side menu Rota tab behaviour; pin colours.
