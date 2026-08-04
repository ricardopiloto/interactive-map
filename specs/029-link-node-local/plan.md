# Implementation Plan: Vincular Nó a Local Após a Criação

**Branch**: `029-link-node-local` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/029-link-node-local/spec.md` (vínculo pós-criação na Rede e no formulário de Local; ao ligar, Local move para o nó).

## Summary

Expor edição do vínculo nó↔Local em dois sítios GM: lista de nós na Rede de rotas (`PUT` waypoint) e formulário de Local (`waypoint_id` em create/update). Ao associar/reassociar, sincronizar `Local.x/y` com o nó; desvincular só limpa `Waypoint.local_id`. Extrair helper de sync no backend para não duplicar regras de unicidade + snap.

## Technical Context

**Language/Version**: Python 3 / FastAPI + TypeScript / React

**Primary Dependencies**: `admin/waypoints`, `admin/locais`, `RouteDigitizerView`, `LocalFormDialog`, `MapPage` save local, `adminApi`

**Storage**: Sem migration — campo `Waypoint.local_id` já existe

**Testing**: Manual [quickstart.md](./quickstart.md)

**Target Platform**: App web (modo GM)

**Project Type**: Web application

**Performance Goals**: N/A

**Constraints**:
- Um Local ↔ no máximo um nó
- Snap: Local → coords do nó ao vincular; nó não se move; desvincular não reverte posição
- Manter “Novo nó” com Local opcional

**Scale/Scope**: Helper BE + 2 routers + 2 UIs (+ wiring MapPage)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Spec clarificada (2 Qs) | PASS |
| Sem migration | PASS |
| Unicidade Local↔nó preservada | PASS |
| Constitution placeholder | PASS (N/A) |

**Post-design re-check**: PASS — contratos API/UI; data-model documenta sync de coords.

## Project Structure

### Documentation (this feature)

```text
specs/029-link-node-local/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-link-node-local.md
│   └── ui-link-node-local.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/
├── services/waypoint_local_link.py   # NOVO: sync vínculo + snap
├── routers/admin/waypoints.py        # após update local_id → snap
├── routers/admin/locais.py           # waypoint_id em create/update
└── schemas/local.py                  # waypoint_id opcional

frontend/src/
├── api/admin.ts                      # LocalPayload.waypoint_id
├── components/gm/RouteDigitizerView.tsx
├── components/admin/LocalFormDialog.tsx
└── pages/MapPage.tsx                 # draft + save com waypoint_id
```

**Structure Decision**: Lógica de negócio centralizada num serviço; UIs só escolhem IDs.

## Complexity Tracking

> Sem violações a justificar.
