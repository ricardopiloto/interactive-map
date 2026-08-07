# Quickstart: Route Overnight Stops (Pernoites)

**Feature**: `062-route-pernoites`  
**Contracts**: [api-routes-plan-pernoites.md](./contracts/api-routes-plan-pernoites.md), [ui-route-pernoites.md](./contracts/ui-route-pernoites.md)  
**Data model**: [data-model.md](./data-model.md)

## Prerequisites

- Backend + frontend running (see root README).
- Network with enough distance for multi-day trips at current ritmo/modo (seed or campaign graph).
- At least one mid-path Waypoint linked to a Local for “pernoite em Local” cases; a long segment without mid Locals for “ao relento”.

## A. API — multi-day overnights

1. `GET /api/routes/plan?...&ritmo=normal` for a long pair.
2. Expect each multi-day route: `pernoites` length = march days − 1; items have `tipo` `local` or `relento`.
3. Short one-day route: `pernoites: []`.
4. Switch `ritmo=intenso`: same geometry/distance; fatigue fields populated; `fadiga_saldo` / `fadiga_pico` ≥ 0; `fadiga_aviso` only if saldo > 1; `fadiga_morte` only if pico ≥ 6.

## B. UI — list + markers

1. Open **Calcular rota**, pick long De/Para, calcular.
2. Every multi-day row shows overnight text; one-day rows do not.
3. Select a multi-day route → map shows overnight markers matching `pernoites`.
4. Switch selection → markers follow active route.

## C. Fatigue soft warn vs death

1. Intenso + mostly Local overnights → often saldo 1, **no** soft warn.
2. Intenso + ≥1 relento that pushes final saldo > 1 → soft warn on that row.
3. (If graph allows) force many consecutive relento / long intenso days until pico ≥ 6 → **death** alert visible; row still selectable; map still highlights.

## D. Normal ritmo

1. Same long route with `ritmo=normal` → no fatigue numbers/alerts; pernoites still present if multi-day.

## E. Regression

1. Distance, `tempo_texto`, costs, overlays for non-overnight behaviour unchanged vs pre-feature baseline for the same inputs.
2. Digitizer / admin routes screens untouched.
