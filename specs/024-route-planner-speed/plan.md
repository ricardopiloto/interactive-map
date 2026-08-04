# Implementation Plan: Calculador de Rotas — Velocidade, Ritmo e Alternativas

**Branch**: `024-route-planner-speed` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/024-route-planner-speed/spec.md` (ritmo Normal/Intenso = 6/8 h/dia; velocidade média default 4 mi/h; mods rio ×1,4 / trilha ×0,8; k-caminhos por tempo; auto-seleção da mais rápida; tempo como dias+horas).

## Summary

Atualizar o planejador (backend `route_planner` + API `/api/routes/plan` + `RoutePlannerPanel`) para: (1) ritmo como **horas/dia** (normal=6, intenso=8), não mais MPH embutido; (2) **velocidade_media_mph** no pedido (default 4); (3) modificadores de tipo **rio 1,4 / trilha 0,8 / estrada 1,0**; (4) descoberta k-shortest por peso **tempo**; (5) manter arestas paralelas (MultiGraph) quando existirem estrada e rio entre os mesmos nós; (6) resposta com tempo formatado **dias + horas**; (7) UI com campos De/Para/Ritmo/Velocidade e lista numerada ordenada (auto-select índice 0).

## Technical Context

**Language/Version**: Python 3.12+ (FastAPI/SQLModel), TypeScript/React

**Primary Dependencies**: `networkx` (já em uso); `backend/app/services/route_planner.py`; `backend/app/routers/public/routes.py`; `backend/app/schemas/routes.py`; `frontend/src/components/routes/RoutePlannerPanel.tsx`; `frontend/src/api/campaign.ts`; `frontend/src/types/index.ts`

**Storage**: Sem novas tabelas; usa `RouteSegment` / `Waypoint` / `MapScale` existentes. Campo opcional `modificador_velocidade` no segmento continua podendo sobrescrever o default do tipo.

**Testing**: Validação manual [quickstart.md](./quickstart.md); smoke numérico SC-001–005

**Target Platform**: App web Codex (jogador + GM usam Calcular rota)

**Project Type**: Web application (API + UI)

**Performance Goals**: k ≤ 5 caminhos; grafo de campanha típico (dezenas/centenas de nós)

**Constraints**:
- Ritmo: `normal` | `intenso` apenas na UI/API nova
- Default `velocidade_media_mph=4`, `gt=0`
- TIPO_MOD: estrada 1.0, rio 1.4, trilha 0.8
- Ordenação e auto-select por tempo crescente
- Tempo UI: dias + horas restantes (clarificação B)
- Pathfinding por tempo (clarificação A)

**Scale/Scope**: Backend planner + schema/router; frontend panel/types/API client; sem mudança na digitalização

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder. Gates informais:

| Gate | Status |
|------|--------|
| Spec clarificada (3 Qs) | PASS |
| Sem novas entidades DB obrigatórias | PASS |
| Escopo calculador + planner | PASS |
| Constitution template placeholder | PASS (N/A) |

**Post-design re-check**: PASS — contracts API/UI; data-model só DTOs de plano; MultiGraph justificado em research.

## Project Structure

### Documentation (this feature)

```text
specs/024-route-planner-speed/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-routes-plan.md
│   └── ui-route-planner.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/
├── services/route_planner.py      # MPH editável, mods, MultiGraph, tempo_texto
├── schemas/routes.py              # Ritmo enum, RoutePlanItem fields, query params
└── routers/public/routes.py       # velocidade_media_mph + ritmo

frontend/src/
├── api/campaign.ts
├── types/index.ts
└── components/routes/
    ├── RoutePlannerPanel.tsx
    └── RoutePlanner.css           # se layout dos novos campos
```

**Structure Decision**: Evoluir o planner 021; MultiGraph se necessário para alternativas paralelas; UI no painel existente.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| MultiGraph vs Graph simples | Estrada e rio entre o mesmo par de nós devem poder gerar rotas alternativas | Graph atual descarta a aresta mais lenta e esconde a alternativa |
