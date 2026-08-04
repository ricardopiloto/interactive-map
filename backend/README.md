# Mapa Campanha — API

FastAPI + SQLModel + SQLite. Versão do pacote: ver `pyproject.toml` (alinhada ao [CHANGELOG](../CHANGELOG.md)).

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
- Docs (só com `DEBUG=true`): http://localhost:8000/api/docs

## Rotas

| Prefixo | Acesso | Uso |
|---|---|---|
| `/api/*` (GET) | Público | Leitura (locais, NPCs, arcos, grupo, …) |
| `/api/admin/*` | HTTP Basic Auth (`ADMIN_USER` / `ADMIN_PASSWORD`) | Escrita / upload |
| `/uploads/*` | Público | Imagens |

Em produção o Caddy pode exigir Basic Auth **adicional** em rotas GM; a API continua fail-closed sem credenciais no ambiente.

## Modelo (notas)

- `data_sessao` nos locais é **texto livre** (rótulo), não data de calendário
- `cor_pin` nos locais é hex `#RRGGBB` (obrigatório no create); migração SQLite aplica default `#c4b5fd` em DBs antigos
- `saida_ids` nos locais lista IDs de destinos de saída (vínculo dirigido em `local_conexao`); exclusão do local remove conexões onde ele é origem ou destino
- Rede de viagem (021/028/029): `waypoint` / `route_segment` / `map_scale`; `GET /api/routes/plan?origem_waypoint_id=&destino_waypoint_id=&ritmo=`; CRUD admin em `/api/admin/waypoints`, `/route-segments`, `/map-scale`
- Locais expõem `waypoint_id` (read); create/update aceitam `waypoint_id` opcional — ao vincular, coords do Local passam às do nó (unicidade 1:1; conflito → 422)
