# Implementation Plan: Relationship Network

**Branch**: `066-relationship-network` | **Date**: 2026-08-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/066-relationship-network/spec.md`

## Summary

Add a second Codex screen **Relações** (`/relacoes`): ring-layout relationship graph (PJs inner / NPCs outer; lines only after focus + animation). Unify existing **NPC** into **Personagem** (`tipo` pj|npc + `papel`); new **Vínculo** entity (symmetric, `publico` default false). Players see all nodes but only public edges; GM (Basic Auth) CRUD + full edges. Shared top nav Mapa | Relações; drag positions session-only.

## Technical Context

**Language/Version**: TypeScript/React 19; Python 3.12 (FastAPI / SQLModel)  
**Primary Dependencies**: Existing Codex stack; React Router; Nocturne CSS tokens; no new graph library (custom SVG/HTML rings)  
**Storage**: SQLite via SQLModel — evolve `npc` table (+ columns); new `vinculo` table; `local_npc` M2M retained against same PK  
**Testing**: Manual quickstart (player vs GM visibility, select animation, CRUD, cascade delete, portrait share)  
**Target Platform**: Web desktop + mobile (coluna fixa; detalhe bottom sheet)  
**Project Type**: Monorepo frontend + backend  
**Performance Goals**: Selection animation ~0.6s; nav Mapa↔Relações &lt;3s perceived; seed ~11 nodes / ~15 edges smooth  
**Constraints**: Clarifications locked (unify, session drag, public flag, default privado, delete cascade); Portuguese UI; no emoji chrome; Nocturne only  
**Scale/Scope**: One new page + shared header; Personagem API surface; Vinculo CRUD; seed Ubersreik; map SideMenu “NPCs” reads Personagem tipo=npc  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clarifications complete (5/5): **PASS**
- Constitution file is placeholder — follow established repo patterns (SQLModel + admin Basic Auth + public/admin routers + seed opt-in): **PASS**
- Scope matches spec (no geographic map on Relações; no unilateral links; no server-side node positions): **PASS**

**Post-Phase 1**: Unchanged — contracts + data-model stay within existing monorepo patterns; migration via `create_all` + `_migrate_sqlite` ALTER (no Alembic).

## Project Structure

### Documentation (this feature)

```text
specs/066-relationship-network/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-personagens.md
│   ├── api-vinculos.md
│   └── ui-relacoes.md
└── tasks.md   # /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/models/npc.py              # → Personagem fields: tipo, papel (+ keep locais M2M)
backend/app/models/vinculo.py          # New symmetric edge table
backend/app/models/links.py            # local_npc unchanged (FK to same id space)
backend/app/schemas/personagem.py      # Create/Update/Read (ex-npc + tipo/papel)
backend/app/schemas/vinculo.py
backend/app/routers/public/personagens.py  # list/get; keep /npcs aliases or migrate FE
backend/app/routers/public/vinculos.py     # list only publico=true
backend/app/routers/admin/personagens.py   # CRUD + cascade vínculos on DELETE
backend/app/routers/admin/vinculos.py      # CRUD; default publico=false
backend/app/database.py                # ALTER ADD COLUMN tipo, papel
backend/app/seed.py                    # PJs + NPCs + ~15 vínculos (mix público)

frontend/src/App.tsx                   # Route /relacoes → RelacoesPage
frontend/src/components/layout/CodexHeader.tsx  # Shared Mapa | Relações + GM actions
frontend/src/pages/MapPage.tsx         # Use shared header; NPC list = Personagem npc
frontend/src/pages/RelacoesPage.tsx    # Orchestrator
frontend/src/components/relacoes/      # GraphStage, SideColumn, DetailPanel, dialogs
frontend/src/api/campaign.ts / admin.ts
frontend/src/types/index.ts            # Personagem, Vinculo, VinculoTipo
CHANGELOG.md / version manifests
```

**Structure Decision**: Backend owns Personagem unification + Vinculo + visibility filter; frontend owns `/relacoes` page, ring layout/animation, and GM dialogs; map keeps consuming the same Personagem rows for NPC pins/modals.

## Complexity Tracking

> None.
