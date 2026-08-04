# Implementation Plan: Título da Rota pelo Tipo de Via

**Branch**: `025-route-type-title` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/025-route-type-title/spec.md` (título = tipo(s); sem “Rota N”; sem linha secundária de tipos; duplicados → “Estrada (2)”).

## Summary

Ajuste só de UI em `RoutePlannerPanel`: título de cada item derivado de `r.tipos` (rótulos PT capitalizados); remover linha `route-planner__tipos`; desambiguar títulos repetidos na mesma lista com `(2)`, `(3)`, …; manter sufixo/estilo “mais rápida” na primeira sem usar “Rota N”. Sem backend.

## Technical Context

**Language/Version**: TypeScript / React

**Primary Dependencies**: `frontend/src/components/routes/RoutePlannerPanel.tsx` (+ CSS se necessário)

**Storage**: N/A

**Testing**: Validação manual [quickstart.md](./quickstart.md)

**Target Platform**: Browsers do Codex

**Project Type**: Web application (ajuste de lista)

**Performance Goals**: N/A (lista ≤5 itens)

**Constraints**:
- Título ≠ “Rota N”
- Sem linha secundária de tipos
- Sufixo só em duplicados do mesmo título base
- Cálculo/API 024 inalterados

**Scale/Scope**: 1 componente (+ helper local opcional)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Spec clarificada (2 Qs) | PASS |
| Sem API/schema | PASS |
| Escopo só lista Calcular rota | PASS |
| Constitution placeholder | PASS (N/A) |

**Post-design re-check**: PASS — UI contract; data-model N/A.

## Project Structure

### Documentation (this feature)

```text
specs/025-route-type-title/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-route-type-title.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/components/routes/
├── RoutePlannerPanel.tsx    # títulos + dedupe; remover linha tipos
└── RoutePlanner.css         # limpar .route-planner__tipos se unused
```

**Structure Decision**: Mudança cirúrgica no painel de rotas; helper de título no mesmo ficheiro ou util mínimo.

## Complexity Tracking

> Sem violações a justificar.
