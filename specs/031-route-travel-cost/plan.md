# Implementation Plan: Custo de viagem nas rotas

**Branch**: `031-route-travel-cost` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/031-route-travel-cost/spec.md` (ambos os custos Dentro/Fora; velocidade opcional; defaults coach 6 / balsa 8; override V com mods 1.4/0.8).

## Summary

Estender o planejador de rotas para (1) calcular **custo_dentro_bp** e **custo_fora_bp** por rota (tarifas Coach/Balsa da tabela; trilha = 0); (2) tornar `velocidade_media_mph` **opcional** — ausente → velocidades absolutas estrada **6** / rio **8** / trilha **6×0,8**; presente **V** → estrada **V**, rio **V×1,4**, trilha **V×0,8**; (3) UI do calculador com velocidade vazia por omissão e ambos os custos na lista. Ordenação por tempo (mais rápida primeiro) mantém-se.

## Technical Context

**Language/Version**: Python 3.12 (FastAPI) + TypeScript/React (frontend)

**Primary Dependencies**: `route_planner.py`, `GET /api/routes/plan`, `RoutePlannerPanel`, schemas `RoutePlanItem`

**Storage**: N/A (sem novas tabelas; tarifas e velocidades default em constantes)

**Testing**: Validação via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers + API pública existente

**Project Type**: Web application (extensão do calculador 024/028)

**Performance Goals**: Inalterado (K≤5 rotas)

**Constraints**:
- Custos sempre tarifas default (independentes da velocidade)
- Velocidade omitida/vazia ≠ default 4 antigo; usar tabela 6/8
- Velocidade inválida (≤0) → 422 / erro FE; não calcular
- Waypoints (028), não locais, no pedido

**Scale/Scope**: Backend planner + schema + router; FE panel + types + `campaignApi.planRoute`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Clarificações da spec respeitadas | PASS |
| Sem auth/dados novos | PASS |
| YAGNI — constantes no planner, não config UI de tarifas | PASS |

**Post-design re-check**: PASS — contratos API/UI + research; sem migration.

## Project Structure

### Documentation (this feature)

```text
specs/031-route-travel-cost/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-routes-plan-cost.md
│   └── ui-route-planner-cost.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/services/route_planner.py   # speeds + cost aggregation
backend/app/schemas/routes.py           # custo_* on RoutePlanItem
backend/app/routers/public/routes.py    # optional velocidade_media_mph

frontend/src/types/index.ts
frontend/src/api/campaign.ts
frontend/src/components/routes/RoutePlannerPanel.tsx
frontend/src/components/routes/RoutePlanner.css   # optional layout for costs
```

**Structure Decision**: Extensão do fluxo 024/028; sem novos endpoints.

## Complexity Tracking

> Nenhuma violação a justificar.
