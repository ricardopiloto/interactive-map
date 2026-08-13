# Implementation Plan: Sistema & Módulos de Mecânica

**Branch**: `077-sistema-modulos` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/077-sistema-modulos/spec.md`

**Release**: Codex v2.0.0 — Frente A (version bump **0.12.0** na implementação; tag **2.0.0** quando 077–080 fecharem, per [specs/v2/README.md](../v2/README.md))

## Summary

Introduzir **configuração por deploy** (`SISTEMA`, `MODULOS_ATIVOS` com defaults por sistema), endpoint público **`GET /api/config`** (`sistema`, `modulos_ativos`, `has_map_image`), coluna **`extensoes_mecanica`** JSON em `npc`, filtragem de chaves por módulo activo, **FadigaWidget** condicional na ficha de personagem, aviso GM para módulos sem widget, e **landing em `/relacoes`** quando `has_map_image: false`. Migração WFRP em **dois passos** (copiar → validar → remover legado se existir).

**Nota de codebase**: fadiga de **viagem** (specs 062–063, `RoutePlanItem.fadiga_*`) permanece **universal** — não é módulo de personagem. O módulo `fadiga` v2 cobre **nível de fadiga na ficha** (`extensoes_mecanica.fadiga`); hoje essa coluna/campo **não existe** no repo — migração legada é no-op até produção confirmar coluna.

## Technical Context

**Language/Version**: Python 3.12 (FastAPI/SQLModel) + TypeScript / React 19 / Vite  
**Primary Dependencies**: `pydantic-settings`, SQLModel/SQLite migrations em `database.py`, React Router  
**Storage**: SQLite — nova coluna `extensoes_mecanica TEXT` (JSON) em `npc`; leitura de ficheiro `uploads/map/campaign-map.*`  
**Testing**: Manual quickstart + `tsc --noEmit`; smoke `GET /api/config`  
**Target Platform**: Web (mapa `/`, relações `/relacoes`)  
**Project Type**: Monorepo web app (`backend/`, `frontend/`)  
**Performance Goals**: Config cacheável no cliente; landing redirect sem flash prolongado (SC-004)  
**Constraints**: Clarifications 2026-08-13 locked; produção WFRP não pode perder dados; dois passos migração; rotas mph universais  
**Scale/Scope**: ~15 ficheiros; 1 módulo implementado (`fadiga`); extensível via registry  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (5/5): **PASS**
- Opção 1 RFC (flags + JSON), sem plugin dinâmico: **PASS**
- Entidades universais intactas (FR-002): **PASS**
- Migração produção em dois passos: **PASS**

**Post-Phase 1**: Unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/077-sistema-modulos/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-config.md
│   ├── api-personagem-extensoes.md
│   └── ui-modulos-personagem.md
└── tasks.md                    # /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/config.py                          # SISTEMA, MODULOS_ATIVOS, defaults, has_map_image helper
backend/app/models/npc.py                        # extensoes_mecanica JSON field
backend/app/schemas/personagem.py                # extensoes_mecanica on Create/Update/Read
backend/app/schemas/config.py                    # InstanceConfigRead
backend/app/services/mecanica.py                 # filter/sanitize extensoes; module schemas
backend/app/services/instance_config.py          # resolve modulos_ativos, has_map_image
backend/app/routers/public/config.py             # GET /api/config
backend/app/routers/public/__init__.py
backend/app/routers/admin/personagens.py         # sanitize on write
backend/app/routers/public/personagens.py        # filter on read
backend/app/database.py                          # migration + optional legacy fadiga copy

frontend/src/types/index.ts                      # InstanceConfig, extensoes_mecanica
frontend/src/api/config.ts                       # fetchInstanceConfig
frontend/src/hooks/useInstanceConfig.ts          # cache + GM unimplemented warning
frontend/src/modules/fadiga/FadigaWidget.tsx      # first module widget
frontend/src/modules/registry.ts                 # componentesPorModulo + IMPLEMENTED_MODULES
frontend/src/components/relacoes/PersonagemFormDialog.tsx
frontend/src/pages/RelacoesPage.tsx
frontend/src/App.tsx                             # landing redirect from has_map_image
frontend/src/pages/MapPage.tsx                   # optional: consume config

.env.example / README.md / CHANGELOG.md          # SISTEMA, MODULOS_ATIVOS docs; 0.12.0
```

**Structure Decision**: Extend monorepo in place; módulos de UI em `frontend/src/modules/`; lógica de filtragem centralizada em `services/mecanica.py`.

## Complexity Tracking

> None.
