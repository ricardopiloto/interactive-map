# Implementation Plan: Two-Way Vínculos

**Branch**: `071-two-way-vinculos` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/071-two-way-vinculos/spec.md`

## Summary

Extend the undirected vínculo pair so each endpoint can have its own tipo (and note). Reciprocal = same nature both ways (default / migration of existing rows). Duas vias = distinct tipos: one SVG stroke with a linearGradient fade between the two tip colours, short labels at each end (visible even when idle), and the detail sheet showing “eu vejo X” + “X vê-me como Y”. Público stays one flag per pair. GM form toggles recíproco vs duas vias.

## Technical Context

**Language/Version**: Python 3.12 / FastAPI + TypeScript / React 19  
**Primary Dependencies**: SQLModel `Vinculo`, SQLite `_migrate_sqlite`, `GraphStage` SVG edges, `VinculoFormDialog`, `RelacoesDetailPanel`  
**Storage**: SQLite — evolve `vinculo` table (ALTER + backfill); no Alembic  
**Testing**: Manual quickstart; seed Elara↔Marcus as duas vias (aliado / romance)  
**Target Platform**: Web Codex Relações  
**Project Type**: Monorepo full-stack feature  
**Performance Goals**: Same ~15–30 edges; one gradient def per asymmetric edge  
**Constraints**: Clarifications — one line + fade + end labels; público por par; reciprocal default; six existing tipos; Portuguese UI; no emoji  
**Scale/Scope**: Model/schema/API + GraphStage + detail + GM form + seed  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clarifications 2/2 locked (visual + público): **PASS**
- One pair per couple (unique a&lt;b) preserved: **PASS**
- Constitution placeholder — follow 066/068 patterns: **PASS**

**Post-Phase 1**: Unchanged — additive fields + UI; visibility rule same as 066.

## Project Structure

### Documentation (this feature)

```text
specs/071-two-way-vinculos/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-vinculos-two-way.md
│   └── ui-two-way-vinculos.md
└── tasks.md   # /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/models/vinculo.py
backend/app/schemas/vinculo.py
backend/app/routers/public/vinculos.py
backend/app/routers/admin/vinculos.py
backend/app/database.py                 # ALTER tipo_ab/tipo_ba/nota_*
backend/app/seed.py                     # Elara↔Marcus duas vias

frontend/src/types/index.ts
frontend/src/api/admin.ts               # create/update payload
frontend/src/components/relacoes/GraphStage.tsx   # gradient + dual labels
frontend/src/components/relacoes/RelacoesDetailPanel.tsx
frontend/src/components/relacoes/VinculoFormDialog.tsx
frontend/src/pages/RelacoesPage.tsx     # draft/save wiring
CHANGELOG.md / version manifests        # 0.9.0
```

**Structure Decision**: Evolve the existing single `vinculo` row (do not split into two directed rows). Keep canonical `personagem_a_id < personagem_b_id`.

## Complexity Tracking

> None.
