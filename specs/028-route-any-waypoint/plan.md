# Implementation Plan: Calcular Rota entre Quaisquer Nós da Rede

**Branch**: `028-route-any-waypoint` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/028-route-any-waypoint/spec.md` (calculador só por nós; rótulo nó→Local→“Nó {id}”; sem exigir vínculo a Local).

## Summary

Trocar a entrada de `GET /api/routes/plan` de `origem_local_id`/`destino_local_id` para `origem_waypoint_id`/`destino_waypoint_id`. No frontend, o `RoutePlannerPanel` lista **todos** os waypoints (`listWaypoints(false)`), com rótulos FR-008, e chama o plano por IDs de nó. Pathfinding (`plan_routes`) e ritmo/velocidade permanecem iguais.

## Technical Context

**Language/Version**: Python 3 / FastAPI + TypeScript / React

**Primary Dependencies**: `backend/app/routers/public/routes.py`, `frontend` `campaignApi`, `RoutePlannerPanel`, `MapPage`

**Storage**: Sem migration — `Waypoint.local_id` continua opcional

**Testing**: Manual [quickstart.md](./quickstart.md) + curl do novo query string

**Target Platform**: App web do Codex

**Project Type**: Web application (API pública + painel de rotas)

**Performance Goals**: N/A (listas pequenas de nós)

**Constraints**:
- Corte limpo: sem aceitar Local IDs no plan
- UI não lista Locais como origem/destino
- `plan_routes` já trabalha com waypoint IDs — só mudar o router
- Rótulo: `nome` → Local.nome via `local_id` + lista de locais no FE → `Nó {id}`

**Scale/Scope**: 1 endpoint público, 1 API client, 1 painel (+ wiring MapPage); docs README se mencionarem query antiga

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Spec clarificada (2 Qs) | PASS |
| Sem mudança de schema DB | PASS |
| Pathfinding intacto | PASS |
| Constitution placeholder | PASS (N/A) |

**Post-design re-check**: PASS — contratos API + UI; data-model = uso de Waypoint existente.

## Project Structure

### Documentation (this feature)

```text
specs/028-route-any-waypoint/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-routes-plan-waypoints.md
│   └── ui-route-planner-waypoints.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/routers/public/
└── routes.py                 # query params waypoint_id; get by PK

frontend/src/
├── api/campaign.ts           # planRoute(origemWp, destinoWp, …)
├── components/routes/
│   └── RoutePlannerPanel.tsx # options = waypoints; labels FR-008
└── pages/MapPage.tsx         # listWaypoints(false); props do painel
```

**Structure Decision**: Resolução de rótulo no cliente (já tem `locais`); sem campo novo em `WaypointRead` nesta entrega (YAGNI).

## Complexity Tracking

> Sem violações a justificar.
