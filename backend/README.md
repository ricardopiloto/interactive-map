# Codex — API

FastAPI + SQLModel + SQLite.  
Versão do pacote: ver `pyproject.toml` (alinhada ao [CHANGELOG](../CHANGELOG.md)).

## Desenvolvimento

```bash
cd backend
uv sync
# ADMIN_USER e ADMIN_PASSWORD obrigatórios para /api/admin/*
uv run uvicorn app.main:app --reload --port 8000

# Seed de exemplo (dev/teste)
uv run python -m app.seed
```

- Health: http://localhost:8000/api/health
- Docs OpenAPI (só com `DEBUG=true`): http://localhost:8000/api/docs

## Rotas

| Prefixo | Acesso | Uso |
|---|---|---|
| `GET /api/*` | Público | Leitura (locais, NPCs/personagens, arcos, grupo, vínculos, rotas, config, …) |
| `/api/admin/*` | HTTP Basic Auth (`ADMIN_USER` / `ADMIN_PASSWORD`) | Escrita / upload |
| `/uploads/*` | Público | Imagens |

Em produção o Caddy pode exigir Basic Auth **adicional** em rotas GM; a API continua fail-closed sem credenciais no ambiente.

Erros surfaced na UI usam `detail: { erro, detalhes }` (ver `app/errors.py`).

## Modelo (notas)

- `data_sessao` nos locais é **texto livre** (rótulo), não data de calendário
- `cor_pin` nos locais é hex `#RRGGBB`
- `saida_ids` / `local_conexao`: saídas dirigidas entre locais
- Rede de viagem: `waypoint` / `route_segment` / `map_scale`; `GET /api/routes/plan?...`; CRUD admin de waypoints e segmentos
- Locais expõem `waypoint_id` (vínculo 1:1 com nó; conflito → 422)
- Personagens: `tipo` pj/npc, `extensoes_mecanica` (JSON; chaves de módulos inactivos ignoradas)
- Vínculos: `tipo_ab` / `tipo_ba` (enum com 8 valores), qualificadores, `direcao` opcional, flags de visibilidade por sentido
- `GET /api/config`: `sistema`, `modulos_ativos`, `has_map_image`

## Config de instância

Variáveis típicas no `.env` (ver `.env.example` na raiz): `SISTEMA`, `MODULOS_ATIVOS`, credenciais admin, caminho do mapa.
