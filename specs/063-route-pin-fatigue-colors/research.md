# Research: Route Overnight Pins & Fatigue Segment Colors

**Feature**: `063-route-pin-fatigue-colors` | **Date**: 2026-08-07

## 1. Where to compute day→geometry→fatigue for red stretches

**Decision**: Extend `simulate_overnights_and_fatigue` (or a sibling) to also return **`dias_visuais`**: ordered day slices with `geometria` (polyline subset), `residual` (bool), `fadiga_apos` (int after that day). Attach to `RoutePlanItem`.

**Rationale**: Frontend cannot reliably re-derive mile budgets / day boundaries without duplicating overnight math; API already owns the simulation.

**Alternatives considered**: FE-only split by overnight x,y nearest point on geometria (fragile); colour whole route by `fadiga_saldo` (rejects clarifications B).

## 2. Residual-day rule (matches clarify)

**Decision**: `residual=true` when day’s overnight is `relento` **or** day is arrival with no overnight. Local overnight day → `residual=false` (green) even though +1/−1 occurred. `fadiga_apos` = saldo after processing that day’s +1 and optional −1.

**Rationale**: Locked clarification Q1 + intensity by saldo.

## 3. Red intensity scale

**Decision**: Map `fadiga_apos` clamped to 1…6 → CSS custom property or discrete classes `--fadiga-1` … `--fadiga-6` (light → darkest red). Values ≥6 use max.

**Rationale**: Spec SC-007; death = darkest only (no extra badge).

**Alternatives considered**: Continuous HSL lerp (ok later); opacity-only (weaker).

## 4. Green base / selected vs alt

**Decision**: Replace current red selected stroke with **green**. Selected = thicker/opaque green (or green with residual red slices). Alternatives = dashed lighter green, no red slices, no overnight UI.

**Rationale**: FR-004, FR-008.

## 5. Relento pin

**Decision**: Render as **HTML/CSS pin** in `CampaignMap` (same transform/zoom pattern as Local pins), small, fixed blue (`#3b82f6` or design-token blue), `title`/`aria-label` “Pernoite”. Remove SVG overnight circles from `RouteOverlay`.

**Rationale**: FR-001/002; matches pin language; smaller than 062 SVG discs.

## 6. Local overnight badge

**Decision**: When selected route has `pernoite.tipo=local` with `local_id`, add class on that Local’s pin (e.g. `campaign-map__pin--pernoite`) + tooltip “Pernoite”. No second pin. Click still `onSelectLocal`.

**Rationale**: Clarification A / FR-003/003b.

## 7. List cleanup

**Decision**: Remove `formatPernoitesSummary` usage and fadiga spans from `RoutePlannerPanel`. Keep mi/tempo/custos. Optionally delete unused helper or keep for tests.

**Rationale**: FR-009 / US4.

## 8. Segment hover hit area

**Decision**: Dual stroke: visible coloured polyline + wider transparent stroke with `pointer-events: stroke` and `title` / custom tooltip for fatigue text (“Ganho de fadiga — saldo N”).

**Rationale**: FR-007; short segments usable.

## 9. Non-goals

Change overnight/fatigue rules; digitizer; Local pin colours globally; panel death text (removed by clarify).
