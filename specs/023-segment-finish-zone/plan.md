# Implementation Plan: Zona Menor de Finalização de Segmento

**Branch**: `023-segment-finish-zone` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/023-segment-finish-zone/spec.md` (finalização ≈⅓ da captura atual; origem mantém zona atual; clique no marcador fecha sempre).

## Summary

Em `RouteDigitizerView`, `nearestWaypoint` usa hoje um único `maxDist = 0.03` (coords normalizadas 0–1) tanto para escolher origem quanto para fechar no destino. Separar raios: **origem `0.03`** (inalterado) e **finalização `0.01`** (≈⅓). Cliques no botão do nó (`.route-digitizer__wp`) continuam fechando sem depender do raio do mapa. Opcional: afinar a dica de UI (US3). Sem backend.

## Technical Context

**Language/Version**: TypeScript / React (frontend existente)

**Primary Dependencies**: `RouteDigitizerView.tsx` (`nearestWaypoint`, `onStageClick` em modo `draw-seg`); botões de nó existentes

**Storage**: N/A

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (Codex); GM desktop

**Project Type**: Web application (ajuste pontual de hit-testing)

**Performance Goals**: Inalterado (O(n) sobre waypoints já existente)

**Constraints**:
- Finalização: `maxDist ≈ 0.03 / 3 = 0.01`
- Origem: `maxDist = 0.03` inalterado
- Distâncias em coordenadas de mapa normalizadas (independentes do zoom visual — alinhado à US1 cenário 3)
- Sem mudar API, seed, planner, CSS de pin salvo se necessário para clareza (fora do foco)

**Scale/Scope**: 1 arquivo principal (`RouteDigitizerView.tsx`); possível microajuste de texto de dica no mesmo arquivo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder. Gates informais:

| Gate | Status |
|------|--------|
| Spec clarificada (⅓; origem intacta) | PASS |
| Sem API/schema | PASS |
| Escopo só hit-test Traçar segmento | PASS |
| Constitution template placeholder | PASS (N/A) |

**Post-design re-check**: PASS — UI contract + data-model N/A; sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/023-segment-finish-zone/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-segment-finish-zone.md
└── tasks.md              # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/gm/
└── RouteDigitizerView.tsx   # nearestWaypoint raios distintos; dica opcional
```

**Structure Decision**: Mudança cirúrgica no hit-test de `draw-seg`; sem novos componentes nem backend.

## Complexity Tracking

> Sem violações a justificar.
