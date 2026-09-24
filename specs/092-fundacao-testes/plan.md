# Implementation Plan: Fundação de testes do backend

**Branch**: `092-fundacao-testes` | **Date**: 2026-09-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/092-fundacao-testes/spec.md`

**Release**: sem bump (0.19.1 permanece). Infra de testes; sem mudança de produto. CHANGELOG `[Unreleased]` só para descoberta.

## Summary

Criar a suíte pytest do backend: SQLite + uploads em `tmp_path`, `TestClient` (jogador / GM), um comando `uv run pytest`. Caracterizar o comportamento **actual** das GET públicas (incluindo plano de rotas com sucesso **e** `rotas: []` sem rede), o portão Basic Auth em **todas** as GET admin existentes (+ POST arcos / PUT grupo só para 401), e a filtragem `visivel_para_todos`. Sem alterar API, schema, auth nem frontend. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: Python ≥ 3.12 (`requires-python` do backend)  
**Primary Dependencies**: FastAPI, SQLModel, Starlette `TestClient`; **pytest** + **httpx** (grupo `dev`; httpx é o transporte do TestClient)  
**Storage**: SQLite temporário por teste; pasta uploads temporária; **não** `./data/mapa.db`  
**Testing**: pytest; caracterização HTTP (não TDD de comportamento novo)  
**Target Platform**: CLI do contribuidor / agente no repo (`backend/`)  
**Project Type**: web-service (API FastAPI); só camada de testes  
**Performance Goals**: suíte local em segundos (dezenas de pedidos in-process); sem meta de CI nesta fase  
**Constraints**: FR-007/008 — zero mudança de contrato/arquitectura/frontend; Constituição I N/A (sem rotas novas); III — legado intacto  
**Scale/Scope**: ~4 módulos de teste + `conftest`; 8 GET admin + 2 verbos de portão; superfícies públicas FR-004  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: N/A — esta fase não adiciona rotas nem segundo banco. Matriz A/B em 094; o harness é o pré-requisito. **PASS**
- **II. Testes primeiro**: a entrega **é** a malha de caracterização (auth actual, visibilidade). Sem migração/import novos. **PASS**
- **III. Produção legada**: pytest só no repo; instâncias WFRP/WoD não precisam da suíte. **PASS**
- **IV. Simplicidade**: uma dependência (`pytest`). SQLite mantido. Sem app factory. **PASS**
- **V. i18n**: sem copy de UI. Erros de API continuam códigos. **PASS**
- **VI. Migrações**: schema intocado; testes chamam `create_all` + `_migrate_sqlite` no temp. **PASS**

**Post-Phase 1**: Unchanged. Contratos documentam o HTTP actual (incluindo arcos/grupo sem GET e plano com `rotas: []`). Sem rotas novas, sem Alembic.

## Project Structure

### Documentation (this feature)

```text
specs/092-fundacao-testes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── characterization-public.md
│   ├── characterization-admin-auth.md
│   └── characterization-routes-plan.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
backend/pyproject.toml          # pytest no grupo dev + tool.pytest.ini_options
backend/tests/conftest.py       # tmp sqlite/uploads, settings+engine, clientes
backend/tests/test_public_reads.py
backend/tests/test_admin_auth.py
backend/tests/test_visibility.py
backend/tests/test_routes_plan.py
backend/README.md               # comando único
CHANGELOG.md                    # [Unreleased] — suíte, sem versão
```

**Structure Decision**: testes **dentro de `backend/`** (pythonpath `.`). `conftest` recicla `settings` + `engine` globais em vez de factory. Seed mínimo em fixtures SQLModel, não `app.seed`.

## Complexity Tracking

> None.
