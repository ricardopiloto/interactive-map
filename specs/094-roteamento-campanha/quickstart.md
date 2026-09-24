# Quickstart: Roteamento por campanha

**Feature**: `094-roteamento-campanha`  
**Purpose**: Validar prefixo API, uploads por slug, FE deep link e isolamento ([contracts/](./contracts/), [spec.md](./spec.md)).

## Prerequisites

- 093 Implemented (`control.db`, CLI campanha, resolvedor).
- `uv` + Node para frontend.
- `ADMIN_USER` / `ADMIN_PASSWORD` para admin. **Não** é necessário `CAMPAIGN_SLUG` para HTTP.

## Setup

```bash
cd backend
uv sync
uv run python -m app.cli campanha criar --slug mesa-a --nome "Mesa A" --sistema wfrp4e
uv run python -m app.cli campanha criar --slug mesa-b --nome "Mesa B" --sistema wod
uv run uvicorn app.main:app --reload --port 8000

# noutro terminal
cd frontend && npm run dev
```

Abrir: `http://localhost:5173/c/mesa-a` e `/c/mesa-a/relacoes`.

## Scenarios

### 1. API por slug

1. `GET /api/c/mesa-a/config` → sistema wfrp4e (da Campanha).
2. `GET /api/c/mesa-b/config` → sistema wod.
3. `GET /api/config` ou `GET /api/locais` → 404.
4. `GET /api/health` → ok.

### 2. Isolamento (automatizado)

```bash
cd backend && uv run pytest
```

Inclui matriz [isolation-http-matrix.md](./contracts/isolation-http-matrix.md) e pins 092 com prefixo.

### 3. Uploads

1. Com Basic Auth, `POST /api/c/mesa-a/admin/uploads` → `url` começa por `/uploads/c/mesa-a/`.
2. `GET` dessa url → 200; mesma relative sob `mesa-b` → 404 se o ficheiro só existe em A.
3. `GET /uploads/map/...` (sem slug) → 404.

### 4. Frontend

1. `/c/mesa-a` carrega mapa; pedidos Network mostram `/api/c/mesa-a/…`.
2. Navegar para relações mantém slug.
3. `/` e `/relacoes` → ecrã peça link (pt e en).
4. `/c/nao-existe` → ecrã indisponível.
5. Abrir A depois B: config/módulos correctos por mesa.

### 5. Opaco + so_link

1. Marcar uma campanha `activa=false` no controle → pedidos HTTP iguais a slug inexistente.
2. Campanha `so_link` activa → `/c/{slug}` e config OK.

## Não validar

- Login/contas (095), home listada (098), ACL/cota (096), deploy produção.
