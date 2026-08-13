# Implementation Plan: Known Direction Vínculos

**Branch**: `073-known-direction-vinculos` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/073-known-direction-vinculos/spec.md`

## Summary

Extend 071 duas vias with per-sense **conhecido** flags (`conhecido_ab` / `conhecido_ba`). Pair **`publico`** remains the master switch. GM (admin API) always sees full asymmetry. Public API lists only `publico` pairs with ≥1 known sense and **redacts** unknown tip tipo/nota (null) so secrets never reach players. Player UI: 0 known → hidden; 1 known → reciprocal-looking edge + partial detail (“vê-te como…” only if reverse known); 2 known → full 071. Reciprocals unchanged (flags ignored). Defaults: both known on create / migrate.

## Technical Context

**Language/Version**: Python 3.12 (FastAPI/SQLModel) + TypeScript / React 19  
**Primary Dependencies**: existing vínculo model/schemas/routers; `vinculoDirection.ts`; `GraphStage`; `RelacoesDetailPanel`; `VinculoFormDialog`  
**Storage**: SQLite — ADD `conhecido_ab`, `conhecido_ba` BOOLEAN NOT NULL DEFAULT 1  
**Testing**: Manual quickstart (GM vs player)  
**Target Platform**: Web Relações `/relacoes`  
**Project Type**: Monorepo web app  
**Performance Goals**: Negligible (same edge count)  
**Constraints**: Clarifications locked; Portuguese UI; no emoji; no secret leak on public API  
**Scale/Scope**: Model + public redact + FE helpers/form/graph/detail + seed example + patch/minor version  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (4/4): **PASS**
- Público master + per-sense known: **PASS**
- Security: public payload must not expose secret tip types: **PASS** (design gate — see research)

**Post-Phase 1**: Unchanged — additive columns + redaction; reciprocal path preserved.

## Project Structure

### Documentation (this feature)

```text
specs/073-known-direction-vinculos/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-vinculos-known-direction.md
│   └── ui-known-direction-vinculos.md
└── tasks.md   # /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/models/vinculo.py
backend/app/schemas/vinculo.py
backend/app/database.py                    # migrate ADD conhecido_*
backend/app/routers/public/vinculos.py     # filter + redact
backend/app/routers/admin/vinculos.py      # CRUD fields
backend/app/seed.py                        # Tomas/Lila or adjust demo pair

frontend/src/types/index.ts
frontend/src/api/admin.ts
frontend/src/components/relacoes/vinculoDirection.ts
frontend/src/components/relacoes/GraphStage.tsx
frontend/src/components/relacoes/RelacoesDetailPanel.tsx
frontend/src/components/relacoes/VinculoFormDialog.tsx
frontend/src/pages/RelacoesPage.tsx

CHANGELOG.md / version manifests           # 0.10.0
```

**Structure Decision**: Extend 071 stack in place; player/GM split already via `/api/vinculos` vs `/api/admin/vinculos`.

## Complexity Tracking

> None.
