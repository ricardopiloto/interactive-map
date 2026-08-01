# Mapa Campanha — API

FastAPI + SQLModel + SQLite.

## Desenvolvimento

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000

# Seed de exemplo (dev/teste)
uv run python -m app.seed
```

- Health: http://localhost:8000/api/health
- Docs (só com `DEBUG=true`): http://localhost:8000/api/docs

## Rotas

| Prefixo | Acesso | Uso |
|---|---|---|
| `/api/*` (GET) | Público | Leitura |
| `/api/admin/*` | Protegido no Caddy | Escrita |
| `/uploads/*` | Público | Imagens |

`data_sessao` nos locais é **texto livre** (rótulo), não data de calendário.
