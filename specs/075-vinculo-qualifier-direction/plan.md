# Implementation Plan: Vínculo Qualifier & Direction

**Branch**: `075-vinculo-qualifier-direction` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/075-vinculo-qualifier-direction/spec.md`

## Summary

Add pair-level optional **`qualificador`** (short free text + autocomplete by tipo, Medo on all tipos; union of lists in duas vias) and optional **`direcao`** (`null` | `a_para_b` | `b_para_a`) to every vínculo. Propagate to GM form, detail list (`Tipo (Qual) →`), and graph labels: reciprocal = mid/focus `Tipo (Qual)[+seta]`; duas vias = tip tipos at ends + mid qual/seta only (clarification B). Distinct from 071 tip asymmetry and 073 known-sense flags. Migrate existing rows to empty qual / null direção.

## Technical Context

**Language/Version**: Python 3.12 (FastAPI/SQLModel) + TypeScript / React 19  
**Primary Dependencies**: `Vinculo` model/schemas/routers; `VinculoFormDialog`; `GraphStage`; `RelacoesDetailPanel`; `vinculoDirection` / label helpers  
**Storage**: SQLite — ADD `qualificador`, `direcao`  
**Testing**: Manual quickstart  
**Target Platform**: Web `/relacoes`  
**Project Type**: Monorepo web app  
**Performance Goals**: Negligible  
**Constraints**: Clarifications locked; Portuguese UI; no emoji; pair-level fields only  
**Scale/Scope**: Model + API + form autocomplete + graph/detail labels + seed demo + minor version  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (2/2): **PASS**
- Additive fields; no unjustified complexity: **PASS**

**Post-Phase 1**: Unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/075-vinculo-qualifier-direction/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-vinculos-qualifier-direction.md
│   └── ui-qualifier-direction.md
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
frontend/src/components/relacoes/qualificadorSuggestions.ts   # NEW
frontend/src/components/relacoes/vinculoLabel.ts              # NEW helpers
frontend/src/components/relacoes/VinculoFormDialog.tsx
frontend/src/components/relacoes/GraphStage.tsx
frontend/src/components/relacoes/RelacoesDetailPanel.tsx
frontend/src/pages/RelacoesPage.tsx

CHANGELOG.md / version manifests   # 0.11.0
```

**Structure Decision**: Extend 071/073 vínculo stack; FE suggestion table as static module.

## Complexity Tracking

> None.
