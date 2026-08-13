# Implementation Plan: Per-Tip Qualifiers

**Branch**: `076-per-tip-qualifiers` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/076-per-tip-qualifiers/spec.md`

## Summary

Replace 075’s **pair-level** `qualificador` with **per-sense** `qualificador_ab` / `qualificador_ba` (same canonical pattern as `tipo_*` / `nota_*`). Duas vias: each tip shows `Tipo (Qual)`; mid shows **direction arrow only** (no orphan qual text). Reciprocal: single qual on `qualificador_ab`. GM form: two qualifier fields in duas vias with **per-tip** autocomplete. Migrate existing `qualificador` → both tips when duas vias, single tip when reciprocal. Direction unchanged at pair level.

## Technical Context

**Language/Version**: Python 3.12 (FastAPI/SQLModel) + TypeScript / React 19  
**Primary Dependencies**: `Vinculo` model/schemas/routers; `VinculoFormDialog`; `GraphStage`; `RelacoesDetailPanel`; `vinculoDirection` / `vinculoLabel` helpers  
**Storage**: SQLite — split `qualificador` → `qualificador_ab`, `qualificador_ba`; data migration in `database.py`  
**Testing**: Manual quickstart  
**Target Platform**: Web `/relacoes`  
**Project Type**: Monorepo web app  
**Performance Goals**: Negligible  
**Constraints**: Clarifications locked (2026-08-12); Portuguese UI; no emoji; 073 redacts qual with secret tip  
**Scale/Scope**: Model migration + API + form + graph/detail label fix + seed update + patch version  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (3/3): **PASS**
- Corrective change over 075; mirrors existing tipo/nota pattern: **PASS**
- No new subsystems: **PASS**

**Post-Phase 1**: Unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/076-per-tip-qualifiers/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-vinculos-per-tip-qualifiers.md
│   └── ui-per-tip-qualifiers.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/models/vinculo.py
backend/app/schemas/vinculo.py
backend/app/database.py
backend/app/routers/admin/vinculos.py
backend/app/routers/public/vinculos.py
backend/app/seed.py

frontend/src/types/index.ts
frontend/src/api/admin.ts
frontend/src/components/relacoes/vinculoDirection.ts   # qualFromPerspective
frontend/src/components/relacoes/VinculoFormDialog.tsx
frontend/src/components/relacoes/GraphStage.tsx
frontend/src/components/relacoes/RelacoesDetailPanel.tsx
frontend/src/pages/RelacoesPage.tsx

CHANGELOG.md / version manifests   # 0.11.1
```

**Structure Decision**: Extend 075 stack in place; drop pair-level `qualificador` after migration.

## Complexity Tracking

> None.
