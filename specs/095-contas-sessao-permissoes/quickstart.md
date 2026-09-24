# Quickstart: Contas de mestre, sessão e permissões

**Feature**: `095-contas-sessao-permissoes`  
**Purpose**: Validar CLI, login/cookie, membership e matriz admin ([contracts/](./contracts/), [spec.md](./spec.md)).

## Prerequisites

- 094 Implemented (rotas `/api/c/{slug}`, FE `/c/:slug`).
- `PUBLIC_BASE_URL=http://localhost:5173` (ou similar) para links CLI.
- `ADMIN_USER`/`PASSWORD` já **não** são o portão após a feature.

## Setup

```bash
cd backend && uv sync
uv run python -m app.cli campanha criar --slug mesa-a --nome "A" --sistema wfrp4e
uv run python -m app.cli campanha criar --slug mesa-b --nome "B" --sistema wod
uv run python -m app.cli usuario criar --email mestre-a@example.com
# copiar link /convite/... ; aceitar na UI ou via API
uv run python -m app.cli campanha atribuir-dono --slug mesa-a --email mestre-a@example.com
uv run uvicorn app.main:app --reload --port 8000
# frontend: npm run dev → /login
```

## Scenarios

### 1. Convite → login → escrita (SC-002)

1. Aceitar convite; login em `/login`.
2. Abrir `/c/mesa-a?gm=1` (ou next); criar um local (admin).
3. Logout; escrita falha.

### 2. Isolamento membership (SC-001)

```bash
cd backend && uv run pytest
```

Matriz: todas as rotas admin — anónimo e mestre-B em slug A falham.

### 3. Reset e desactivar

1. `usuario reset --email …` → `/reset/…` → nova senha; cookie antigo inválido.
2. `usuario desactivar` → login falha.

### 4. Lockout

1. 5 POSTs login com senha errada → 6.º (mesmo correcta) → `LOGIN_BLOQUEADO` dentro de 15 min.

### 5. Caddy / Basic

1. Confirmar templates `deploy/` sem `basicauth` GM.
2. Upload só com cookie.

## Não validar

- Home listada (098), ACL mídia (096), SMTP, UI super-admin, `/opt/codex-*`.
