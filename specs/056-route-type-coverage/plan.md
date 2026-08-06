# Implementation Plan: Route Type Coverage in Alternatives

**Branch**: `056-route-type-coverage` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/056-route-type-coverage/spec.md`

## Summary

Ensure Calcular rota’s ≤6 alternatives **cover each pure via-type** (estrada / rio / trilha) that exists as a continuous path on the network — even when that path is not among the first k mixed simple paths (root cause of Altdorf→Ubersreik missing “Estrada” under Mais rápida). Approach: keep current mixed discovery, then **explicitly compute the best pure path per tipo** on a type-restricted graph, merge into the candidate set, and assemble the final top-6 while preserving the overall #1 by `ordenacao` and soft `preferencia_via` ranking.

## Technical Context

**Language/Version**: Python 3.12+ (FastAPI backend)  
**Primary Dependencies**: NetworkX (`shortest_path` / `shortest_simple_paths`), existing `route_planner.plan_routes`  
**Storage**: N/A (no schema change)  
**Testing**: Manual quickstart + API curls (Altdorf=1, Ubersreik=5)  
**Target Platform**: Local/self-hosted web app  
**Project Type**: Web application (backend planner change; frontend verification only)  
**Performance Goals**: Same latency class; ≤3 extra Dijkstra runs on type-filtered subgraphs (~campaign graph size)  
**Constraints**: ≤6 results; keep #1 by ordenação; preferência soft only; no API shape change; digitizer untouched  
**Scale/Scope**: `backend/app/services/route_planner.py` primarily; optional thin regression helper/test

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder — Spec Kit norms.

- Clarified coverage rules (Q1–Q3): **PASS**
- No hard preferência filter: **PASS**
- No UI redesign required: **PASS**

**Post-Phase 1**: Unchanged — behavioral contract on existing plan endpoint.

## Project Structure

### Documentation (this feature)

```text
specs/056-route-type-coverage/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api-route-type-coverage.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/services/route_planner.py   # pure-type search + assemble ≤6 with coverage
# Optional:
# backend/tests/… or scripts smoke — prefer quickstart curls if no existing suite pattern
```

**Structure Decision**: Backend-only planner assembly change; frontend already displays `tipos` / titles (025/055). No new query params.

## Complexity Tracking

> None.
