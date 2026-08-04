# Implementation Plan: Geração de rotas de viagem

**Branch**: `021-route-generation` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/021-route-generation/spec.md` (PRD §12; clarificações: overlay A+alternativas; segmentos bidirecionais; vista GM dedicada; auto-seleção da mais rápida).

## Summary

Adicionar uma **rede de navegação** (waypoints + segmentos estrada/rio/trilha) desacoplada das saídas narrativas (017). O GM digitaliza numa **vista dedicada do Modo GM**; o jogador, na mesma tela do mapa, calcula **k rotas** por tempo (ritmo + modificadores), vê lista ordenada e overlay (mais rápida destacada; alternativas tracejadas).

## Technical Context

**Language/Version**: Python 3.12 (FastAPI/SQLModel) + TypeScript/React

**Primary Dependencies**: FastAPI, SQLModel, SQLite; **networkx** (k-shortest simple paths); React + `react-zoom-pan-pinch`; overlay SVG no stage (padrão 017)

**Storage**: SQLite — tabelas `waypoint`, `route_segment` (+ JSON/pontos intermediários); config de escala (tabela singleton ou settings)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); testes de serviço de rota opcionais no plano de tasks se pedido

**Target Platform**: App web existente (desktop + mobile)

**Project Type**: Web application (full-stack)

**Performance Goals**: Grafo de dezenas de nós; cálculo típico sob 200ms; overlay sem bloquear pins

**Constraints**:
- Segmentos **bidirecionais** (MVP)
- k ≈ 3–5 rotas; ritmos cauteloso/normal/arriscado
- Digitalização: vista GM dedicada (sem pins de lore)
- Overlay de viagem ≠ linhas `saida_ids` (017)
- Auth escrita = Basic Auth admin existente
- Sem Alembic — `create_all` + modelos novos

**Scale/Scope**: Backend models/routers/serviço de plan; frontend vista digitização + painel “Calcular rota” + overlay de polilinhas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Spec clarificada (4 decisões) | PASS |
| Separação public read / admin write | PASS |
| Escopo MVP (sem clima/veículos/fog) | PASS |
| Constitution template placeholder | PASS (N/A) |

**Post-design re-check**: PASS — data-model + API/UI contracts alinhados; networkx justificado pelo k-paths.

## Project Structure

### Documentation (this feature)

```text
specs/021-route-generation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-routes.md
│   └── ui-route-overlays.md
└── tasks.md              # /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/
├── models/waypoint.py, route_segment.py, map_scale.py   # novos
├── schemas/routes.py
├── services/route_planner.py                            # grafo + networkx
├── routers/public/routes.py                             # GET /api/routes/plan
├── routers/admin/waypoints.py, route_segments.py        # CRUD
└── routers/public/waypoints.py                          # leitura seletiva p/ seletor

frontend/src/
├── types/index.ts                                       # Waypoint, RouteSegment, RoutePlan
├── api/admin.ts, api/campaign.ts                        # endpoints
├── components/routes/RoutePlannerPanel.tsx              # De/Para/ritmo + lista
├── components/routes/RouteOverlay.tsx                   # polilinhas no stage
├── components/gm/RouteDigitizerView.tsx                 # vista GM dedicada
├── components/map/CampaignMap.tsx                       # slot overlay viagem; modo digitizer
└── pages/MapPage.tsx                                    # entrada GM “Rotas”; painel jogador
```

**Structure Decision**: Full-stack; serviço de plan no backend (fonte única de tempo/distância); frontend só renderiza e digitaliza.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Dependência networkx | k caminhos simples ordenados (Yen) | Dijkstra só-mínimo não cumpre FR-007 (múltiplas rotas) |
| Vista GM dedicada | Spec/clarificação — sem poluir lore | Aba no mesmo mapa com pins — rejeitada (clarificação ≠ C) |
