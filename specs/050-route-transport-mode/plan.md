# Implementation Plan: Route Transport Mode (Paid vs Own)

**Branch**: `050-route-transport-mode` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/050-route-transport-mode/spec.md`

## Summary

Replace the free optional “velocidade média” control on **Calcular rota** with an explicit **Transporte pago | Transporte próprio** choice. **Pago** uses the existing table speeds and Dentro/Fora tariffs (omit mph override). **Próprio** uses user speed (default **4** mi/h) with **passage costs forced to 0**, and shows the speed field only in that mode. Mode change with valid De/Para auto-recalculates (like ordenação); editing speed alone does not. Each panel open resets to **pago**.

## Technical Context

**Language/Version**: Python 3.12+ (FastAPI backend); TypeScript / React 19 (frontend)

**Primary Dependencies**: `route_planner.plan_routes` / `build_graph`; `GET /api/routes/plan`; `RoutePlannerPanel.tsx` + `campaignApi.planRoute`

**Storage**: N/A (no schema/DB change; session-only UI state)

**Testing**: Manual via [quickstart.md](./quickstart.md); optional pytest for planner cost-zero path if present elsewhere

**Target Platform**: Web (campaign map route planner panel)

**Project Type**: Web application (FastAPI + SPA)

**Performance Goals**: Same as current plan endpoint (negligible change)

**Constraints**:
- Clarifications: auto-recalc on mode; no auto-recalc on speed edit; always open as pago (FR-010–012)
- Próprio costs must be **0** in API response and in barata sort weights (not FE-only masking)
- Pago must not accept user speed override
- Digitizer / segment model out of scope
- Preserve ritmo + ordenação

**Scale/Scope**: Small — planner service + public routes query + RoutePlannerPanel UI/CSS

## Constitution Check

| Gate | Status |
|------|--------|
| Spec clarifications closed (mode recalc, speed recalc, open default) | PASS |
| No unjustified stack expansion | PASS |
| Presentation/API change scoped to Calcular rota | PASS |
| Segment/DB model unchanged | PASS |

**Post-design re-check (Phase 1)**: PASS — `research.md` resolves mode/API/cost mapping; `data-model.md` is request/UI-only; contracts cover API + UI; `quickstart.md` maps SC/FR scenarios.

## Project Structure

### Documentation (this feature)

```text
specs/050-route-transport-mode/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-route-transport-mode.md
│   └── ui-route-transport-mode.md
└── tasks.md                 # /speckit-tasks (not this command)
```

### Source Code

```text
backend/app/
├── routers/public/routes.py          # query: modo_transporte; wire to planner
├── schemas/routes.py                 # enum ModoTransporte if needed
└── services/route_planner.py         # zero costs when próprio; require mph

frontend/src/
├── api/campaign.ts                   # planRoute(..., modo, mph)
└── components/routes/
    ├── RoutePlannerPanel.tsx         # mode UI, defaults, recalc rules
    └── RoutePlannerPanel.css         # optional fieldset styles
```

**Structure Decision**:
1. Backend: add `modo_transporte=pago|proprio` (default `pago`). Próprio → apply `velocidade_media_mph` (default **4** if omitted) and force segment costs / `peso_barata` cost component to **0**. Pago → ignore mph override (table mode even if client sends mph).
2. Frontend: replace free speed field with mode radios; show speed only for próprio (init `"4"`); reset to pago on each `open` transition; auto-recalc on mode change; keep ordenação auto-recalc; speed changes wait for Calcular / mode / ordenação.
3. No DB migrations.

## Complexity Tracking

Sem violações.
