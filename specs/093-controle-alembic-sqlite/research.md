# Research: Banco de controle e SQLite por campanha

**Feature**: `093-controle-alembic-sqlite`  
**Date**: 2026-09-19

## 1. Layout em disco e paths de configuração

**Decision**: Seguir RFC §2.1 sob um root configurável (`DATA_DIR`, omissão `./data`):

```text
{DATA_DIR}/control.db
{DATA_DIR}/campanhas/<uuid>/campanha.db
{DATA_DIR}/campanhas/<uuid>/uploads/{map,portraits,locals}/
```

`Campanha.caminho` guarda o segmento relativo `campanhas/<uuid>` (nunca o slug). Remover o uso de `DATABASE_URL` → `mapa.db` único e de `uploads_dir` global como destino de conteúdo de campanha; o HTTP resolve uploads pelo sítio da campanha activa (slug de ambiente).

**Rationale**: Clarificações + FR-002; isolamento por ficheiro.

**Alternatives considered**: Manter `mapa.db` em paralelo até 094 — rejeitado (clarificação A: sem fallback). Paths absolutos no registo — rejeitado (dificulta mover `DATA_DIR` em testes).

## 2. Fonte do slug até 094

**Decision**: Setting `campaign_slug` (`CAMPAIGN_SLUG`). `get_session()` (e o resolvedor de uploads) lê **só** este valor no HTTP. Ausente / slug desconhecido / `activa=false` → erro estruturado (`CAMPAIGN_SLUG_AUSENTE`, `CAMPANHA_NAO_ENCONTRADA`, `CAMPANHA_INACTIVA`), sem fallback. CLI e testes A/B passam o slug explicitamente à API de resolução.

**Rationale**: Clarificação sessão 2026-09-19.

**Alternatives considered**: «Única campanha activa» implícita — rejeitado. Ficheiro único antigo até 094 — rejeitado.

## 3. Gestor de engines e `get_session`

**Decision**:

1. Engine de **controle** (singleton do processo) em `control.db`.
2. Cache de engines de **campanha** keyed por UUID (`dict[str, Engine]`), com `check_same_thread=False`.
3. `resolve_campaign_session(slug: str) -> Session`: lookup em controle → valida activa → `ensure_campaign_db(uuid)` (migrate/stamp) → `Session(engine)`.
4. FastAPI `get_session` Depends: `resolve_campaign_session(settings.campaign_slug)` (fail-closed se slug vazio).
5. Routers existentes **não** mudam de assinatura: continuam `Session = Depends(get_session)`.

Ao abrir: se `alembic_version` ausente ou revisão desconhecida → tratar como legado: `_migrate_sqlite` **nesse** engine → `alembic stamp` head da árvore de campanha. Se já na head → só `upgrade` no-op / ensure head. Campanha nova (CLI): criar ficheiro, `upgrade` até head (sem ponte).

**Rationale**: FR-003–006; singletons (grupo id=1) por ficheiro.

**Alternatives considered**: Engine por pedido sem cache — rejeitado (FR-004). App factory completa — desnecessário se cache + settings mutáveis nos testes.

## 4. Alembic dual (controle + campanha)

**Decision**: Duas árvores Alembic no backend:

- `backend/alembic_control/` — metadata só do modelo `Campanha` (e futuras tabelas 095+).
- `backend/alembic_campaign/` — metadata dos modelos de conteúdo actuais (local, npc, …).

Ambas com `render_as_batch=True`. Revisão inicial de campanha = schema actual (equivalente a `create_all` + estado pós-`_migrate_sqlite` completo). Dependência de produto: `alembic` no `pyproject.toml` (não só dev).

**Rationale**: Constituição VI; schemas distintos no mesmo processo.

**Alternatives considered**: Uma única árvore com dois `version_table` — mais frágil. Só `create_all` sem Alembic — viola VI.

## 5. Ponte `_migrate_sqlite`

**Decision**: Extrair a lógica actual para aceitar um `Engine` (ou connection) explícito, não o singleton global. Chamada **apenas** no caminho legado (sem `alembic_version` válida). Depois `stamp` head. Remover a chamada de `_migrate_sqlite` do `lifespan` / `init_db` normal de campanhas novas.

**Rationale**: FR-006; ensaio de 099.

**Alternatives considered**: Correr ponte sempre — rejeitado (US4 cenário 2/3).

## 6. Modelo Campanha e imutabilidade

**Decision**: Tabela só em `control.db`. Campos: `id` (PK), `slug` (unique), `nome`, `sistema`, `modulos_ativos` (JSON), `visibilidade` (`listada`|`so_link`), `caminho`, `mapa_arquivo` (default `""`), `cota_bytes` (default 10 GiB), `bytes_usados` (0), `activa` (True). Sem UPDATE permitido a `slug` / `sistema` / `modulos_ativos` na camada de serviço (rejeitar). CLI não desactiva (`activa` só testes / fases futuras).

Slug: `^[a-z][a-z0-9-]{1,47}$` + proibir `--` + lista reservada RFC §2.3.

Defaults de módulos: reutilizar `DEFAULT_MODULOS_BY_SISTEMA` (`wfrp4e`→`["fadiga"]`, `wod`→`[]`).

**Rationale**: Spec FR-007–011 + clarificação `activa`.

## 7. CLI super-admin

**Decision**: `python -m app.cli` (ou `uv run python -m app.cli`) com subcomandos `campanha criar` e `campanha listar`. Stdlib `argparse` (sem Typer/Click — IV). Criar: gera UUID, pasta, `campanha.db` na head, registo no controle; falha → limpar pasta órfã. Listar: slug, nome, sistema, visibilidade (e opcionalmente activa).

**Rationale**: FR-011; sem dependência extra.

**Alternatives considered**: Typer — rejeitado (IV). HTTP de gestão — fora de escopo.

## 8. `GET /api/config` e uploads

**Decision**: Com slug resolvido, `sistema` / `modulos_ativos` / `has_map_image` vêm da **Campanha** + ficheiro em `{site}/uploads/map/` (mesmo critério de nome `campaign-map.*` até 096). Basic Auth continua de `ADMIN_*` no `.env` da instância (095 troca). `StaticFiles` / serviços de upload apontam ao `uploads/` do sítio resolvido (ainda público — ACL 096).

**Rationale**: Evitar `.env` por campanha; 092 suite cria campanha wfrp4e+fadiga → mesmos asserts.

**Alternatives considered**: Manter SISTEMA no `.env` para HTTP — rejeitado (diverge do RFC e do registo).

## 9. Harness 092

**Decision**: `conftest` cria `DATA_DIR` em `tmp_path`, sobe `control.db`, cria campanha de teste via API interna/CLI helper, define `CAMPAIGN_SLUG`, corre upgrade head. Caracterizações existentes MUST passar (SC-006). Novos testes: isolamento A/B, legado create+copy+open, CLI criar/listar, slug inválido/reservado/inactivo.

**Rationale**: FR-012–015; Constituição II (testes de migração/isolamento antes ou com a implementação, a falhar primeiro onde for código novo).

## 10. Isolamento HTTP (I)

**Decision**: N/A para matriz `/api/c/{slug}` (094). Em 093: teste de resolvedor A/B obrigatório (FR-012). Sem rotas novas.

**Rationale**: Spec Constitution I + clarificações.

## 11. Dependências e release

**Decision**: `alembic` em dependencies do backend. Sem bump SemVer (infra). CHANGELOG `[Unreleased]`. Instâncias `/opt/codex-*` intocadas (III).

**Alternatives considered**: Alembic só em dev — rejeitado (runtime migrate-on-open).
