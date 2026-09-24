# Research: Fundação de testes do backend

**Feature**: `092-fundacao-testes`  
**Date**: 2026-09-19

## 1. Runner e comando único

**Decision**: `pytest` como grupo de desenvolvimento `dev` no `backend/pyproject.toml` (`dependency-groups`). Comando documentado: `cd backend && uv run pytest` (instala o grupo se faltar). Sem script npm, sem Makefile novo.

**Rationale**: Pedido explícito da spec; Constituição IV (não há suíte Python sem runner). `uv run` já é o fluxo do README. Um comando, duas corridas seguidas (SC-001).

**Alternatives considered**: `unittest` stdlib — rejeitado (fixtures/tmp_path/monkeypatch são o núcleo). `nox`/`tox` — rejeitado (dependência extra). Pytest na raiz do repo — rejeitado (suíte é só backend; frontend fora de escopo).

## 2. Cliente de teste

**Decision**: `fastapi.testclient.TestClient` (Starlette; já vem com FastAPI). Actor jogador = pedidos sem `auth`. Actor GM = `auth=(ADMIN_USER, ADMIN_PASSWORD)` injectados na suíte. Usar `with TestClient(app) as client` para correr o `lifespan` (`init_db` + pastas de upload).

**Rationale**: Zero dependências novas além de pytest. FR-003: sem uvicorn na porta 8000.

**Alternatives considered**: `httpx.ASGITransport` assíncrono — rejeitado (`pytest-asyncio` extra). Servidor real + pedidos HTTP — rejeitado (FR-003, flaky, porta). App factory — rejeitado (FR-007: sem refactor de arquitectura).

## 3. Isolar SQLite e uploads (singleton actual)

**Decision**: Não alterar o padrão de módulo (`settings = Settings()`, `engine = create_engine(...)`). O `conftest` **muta** `settings` (url, `uploads_dir`, credenciais, `sistema`) e **recria** `app.database.engine` apontando a um ficheiro SQLite em `tmp_path` **por teste**, depois chama `SQLModel.metadata.create_all` + `_migrate_sqlite` (ou deixa o lifespan fazê-lo). `ADMIN_USER` / `ADMIN_PASSWORD` da suíte são valores fixos de teste, nunca os de produção.

Variáveis no `.env` do programador **não** podem ser o destino da suíte: a mutação de `settings` + engine novo prevalece sobre o `env_file` já lido.

**Rationale**: `Settings` e `engine` são globais hoje. Factory exigiria mudança de produção. `tmp_path` por teste cumpre corridas consecutivas sem lixo (SC-001, SC-005). O lifespan ainda faz `Path("./data").mkdir` — isso não escreve `mapa.db` se o engine já aponta ao temp.

**Alternatives considered**: `pytest_configure` + env antes do import — frágil (ordem de import, `.env` vs env). Uma BD de sessão partilhada + rollback — rejeitado (SQLModel/SQLite e `get_or_create` de grupo/escala misturam estado). Docker Compose só para testes — rejeitado (IV).

## 4. Superfícies públicas a caracterizar

**Decision**: Pedidos GET (e query de plano) contra o código **actual**, a passar hoje:

| Superfície | Método / caminho |
|------------|------------------|
| Locais | `GET /api/locais`, `GET /api/locais/{id}` |
| NPCs | `GET /api/npcs`, `GET /api/npcs/{id}` |
| Personagens | `GET /api/personagens`, `GET /api/personagens/{id}` |
| Vínculos | `GET /api/vinculos` |
| Arcos | `GET /api/arcos`, `GET /api/arcos/{id}` |
| Grupo | `GET /api/grupo` (cria default id=1 se vazio) |
| Config | `GET /api/config` (`sistema`, `modulos_ativos`, `has_map_image`) |
| Rotas | `GET /api/routes/plan` — ver §6 |

Asserções: status 2xx (ou o código já definido no caso de erro de plano) e chaves/forma do payload actual — **não** copiar dumps enormes. Base vazia: listagens `[]`, grupo default, sem 500.

**Rationale**: FR-004 / US2. `GET /api/waypoints` público existe mas **não** está em FR-004 — fora desta malha.

**Alternatives considered**: OpenAPI snapshot / schemathesis — rejeitado (dependência e ruído). Seed de `app.seed` — rejeitado (acopla a dados de demo WFRP).

## 5. Portão admin (clarificação B)

**Decision**: Caracterizar **todas** as GET admin que existem hoje, mais o portão das duas superfícies admin **sem GET**:

GET (401 sem credencial; não 401 com credencial válida; tipicamente 200):

- `/api/admin/locais`
- `/api/admin/npcs`
- `/api/admin/personagens`
- `/api/admin/vinculos`
- `/api/admin/waypoints`
- `/api/admin/route-segments`
- `/api/admin/map-scale`
- `/api/admin/session`

Sem GET de listagem (o router só tem escrita). Pin **só o portão** `verify_admin` (401 vs não 401), sem exigir 200 nem criar dados:

- `POST /api/admin/arcos` (corpo vazio → 422 autenticado)
- `PUT /api/admin/grupo` (corpo vazio/inválido → 422 autenticado)

Credencial errada: 401 (`CREDENCIAIS_INVALIDAS`). Sem `Authorization`: 401 (`AUTENTICACAO_NECESSARIA`). `POST /api/admin/uploads` fora (clarificação + spec).

**Rationale**: Clarify sessão 2026-09-19 (todas as GET de listagem/sessão). Arcos e grupo estão no texto da spec mas **não têm GET**; um GET a esses paths tende a 405 **sem** passar por `verify_admin`. O prefixo `/api/admin` já aplica `Depends(verify_admin)` a cada rota registada — POST/PUT são as rotas reais.

**Alternatives considered**: Inventar GET admin de arcos/grupo — rejeitado (mudaria a API). Só `/session` — rejeitado na clarificação.

## 6. Cálculo de rotas (clarificação C)

**Decision**: Dois pins obrigatórios.

1. **Plano com sucesso**: seed de dois `Waypoint` + um `RouteSegment` (`tipo=estrada`, `distancia_milhas > 0`) + `MapScale` default se o `get_or_create` não correr. `GET /api/routes/plan?origem_waypoint_id=…&destino_waypoint_id=…&ritmo=normal` → 200 e `rotas` com comprimento ≥ 1 (formato `RoutePlanResponse`).
2. **Rede insuficiente**: os mesmos dois waypoints **sem** segmento (ou desligados). O código actual **não** devolve 422 nesse caso: `plan_routes` devolve `[]` → HTTP **200** `{ "rotas": [] }`. Pinar isso. Ids inexistentes → 422 `ROTA_ORIGEM_INVALIDA` / `ROTA_DESTINO_INVALIDO` (já definido; pode ser teste extra, não substitui o vazio).

**Rationale**: Clarify C. «Erro já definido» no código actual do grafo vazio é lista vazia, não crash. `NetworkXNoPath` é engolido.

**Alternatives considered**: Só 422 com ids fictícios — rejeitado (não exercita o planner). Só sucesso — rejeitado na clarificação.

## 7. Visibilidade

**Decision**: Seed mínimo: um PJ/NPC `visivel_para_todos=true`, um `false`, um `Vinculo` público entre eles. Público: listagens `/personagens` e `/npcs` só o visível; detalhe do oculto → 404 `PERSONAGEM_NAO_ENCONTRADO` / `NPC_NAO_ENCONTRADO` (mesmo envelope que id inexistente). Admin GET `/api/admin/personagens` (e `/npcs`) inclui o oculto. Vínculos públicos: o código **já** filtra se algum extremo está oculto (`player_visible_with_personagens`) — o teste pinna a ausência da linha; **não** «corrigir» se algum dia divergir (hoje esconde).

**Rationale**: FR-006, US4, edge case de vínculos.

## 8. Layout dos testes e versão

**Decision**: `backend/tests/conftest.py` + módulos `test_public_reads.py`, `test_admin_auth.py`, `test_visibility.py`, `test_routes_plan.py`. `[tool.pytest.ini_options]` com `testpaths = ["tests"]` e `pythonpath = ["."]`. Sem bump SemVer (spec: testes não são release de produto). Comando e propósito no `backend/README.md` (SC-006). Linha breve no CHANGELOG `[Unreleased]` para descoberta, sem `0.19.2`.

**Rationale**: FR-007/008. Constituição III: instâncias `/opt/codex-*` não precisam de pytest.

**Alternatives considered**: Bump patch só por testes — rejeitado pela spec. Pasta `tests/` na raiz — mistura frontend.

## 9. Dependências novas

| Pacote | Justificação (IV) |
|--------|-------------------|
| `pytest` | Único runner; spec + Constituição II/IV |
| `httpx` | Transporte do `TestClient` Starlette (não vem no extra por omissão do FastAPI) |

Nada de `pytest-asyncio`, `coverage`, factory-boy. `httpx` no grupo `dev` é o transporte do `TestClient` (Starlette); não é um segundo runner.

## 10. Isolamento multi-campanha (I)

**Decision**: N/A nesta fase. Zero rotas novas, zero `control.db`, zero `/c/{slug}`. A matriz A/B fica para 094; este harness é o que 094 vai reutilizar.

**Rationale**: Spec Constitution + RFC §9.
