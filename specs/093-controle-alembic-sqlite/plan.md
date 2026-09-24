# Implementation Plan: Banco de controle e SQLite por campanha

**Branch**: `093-controle-alembic-sqlite` | **Date**: 2026-09-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/093-controle-alembic-sqlite/spec.md`

**Release**: sem bump (0.19.1). Infra multi-campanha; CHANGELOG `[Unreleased]`.

## Summary

Introduzir `control.db` (só `Campanha`) e um sítio `campanhas/<uuid>/{campanha.db,uploads/}` por mesa. Alembic dual (`render_as_batch`) para controle e conteúdo; `_migrate_sqlite` só como ponte + stamp em legado. `get_session` resolve pelo slug (`CAMPAIGN_SLUG` no HTTP até 094); cache de engines por UUID; routers de consulta intactos. CLI `campanha criar` / `listar`. Testes: isolamento A/B, legado create+copy+open, CLI, harness 092 adaptado. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: Python ≥ 3.12  
**Primary Dependencies**: FastAPI, SQLModel, SQLite; **Alembic** (nova, justificada VI); pytest/httpx (dev, 092)  
**Storage**: `{DATA_DIR}/control.db` + `{DATA_DIR}/campanhas/<uuid>/campanha.db` + uploads por sítio  
**Testing**: pytest — isolamento, legado+stamp, CLI, regressão caracterização 092 (TDD nas superfícies novas)  
**Target Platform**: Backend local / mesma imagem Docker; instâncias legadas intocadas  
**Project Type**: web-service + CLI operador  
**Performance Goals**: resolve+open em tempo local típico; cache evita reopen por pedido  
**Constraints**: Sem `/c/{slug}`; sem contas; sem ACL uploads; fail-closed sem `CAMPAIGN_SLUG`; sem `campanha_id` nas tabelas de conteúdo  
**Scale/Scope**: 1 tabela controle; 2 árvores Alembic; CLI 2 subcomandos; harness + ~3 módulos de teste novos  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: Sem rotas `/c/{slug}` — matriz HTTP N/A até 094. Isolamento via teste de resolvedor A/B (FR-012). Sem `campanha_id` partilhado. **PASS**
- **II. Testes primeiro**: Migrações Alembic, ponte+stamp e isolamento MUST ter testes a falhar antes da implementação correspondente. **PASS** (planeado)
- **III. Produção legada**: Zero requisito de mudar `/opt/codex-*`. **PASS**
- **IV. Simplicidade**: SQLite mantido; só Alembic como dependência nova de produto; CLI argparse. **PASS**
- **V. i18n**: Sem copy UI; erros por código. **PASS**
- **VI. Migrações**: Dual Alembic batch; ponte limitada + stamp; rollback = backup de ficheiro se revisão não reversível (documentar na revisão inicial se necessário). **PASS**

**Post-Phase 1**: Unchanged. Contratos cobrem CLI, resolve, legado. Config/uploads passam a seguir o sítio resolvido (ainda públicos). Contas 095.

## Project Structure

### Documentation (this feature)

```text
specs/093-controle-alembic-sqlite/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── cli-campanha.md
│   ├── session-resolve.md
│   └── legacy-bridge-stamp.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
backend/pyproject.toml                 # alembic dependency
backend/alembic_control/               # env.py + versions (Campanha)
backend/alembic_campaign/              # env.py + versions (conteúdo)
backend/app/config.py                  # DATA_DIR, CAMPAIGN_SLUG; deprecate mapa.db único
backend/app/models/campanha.py         # modelo controle
backend/app/database.py / campaign_db.py  # control engine, cache, resolve, ponte(engine)
backend/app/cli.py                     # campanha criar | listar
backend/app/services/instance_config.py  # ler da Campanha resolvida
backend/app/main.py                    # lifespan: ensure control migrated; uploads path
backend/tests/conftest.py              # DATA_DIR tmp + campanha teste + CAMPAIGN_SLUG
backend/tests/test_isolation_campaigns.py
backend/tests/test_legacy_bridge_stamp.py
backend/tests/test_cli_campanha.py
backend/README.md
CHANGELOG.md
```

**Structure Decision**: Duas árvores Alembic no `backend/`. Resolução centralizada (um módulo) usada por Depends, CLI e testes. Conteúdo SQLModel existente fica; só o engine por pedido muda. Harness 092 deixa de apontar a um `mapa.db` solto.

## Complexity Tracking

> None.
