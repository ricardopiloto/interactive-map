# Quickstart: 001-campaign-codex-map

Guia de validação local. Modelo: [data-model.md](./data-model.md). Contratos: [contracts/openapi-outline.md](./contracts/openapi-outline.md).

## Prerequisites

- Node 22+ / npm
- Python 3.12+ com [uv](https://github.com/astral-sh/uv)
- Credenciais admin no `.env` (obrigatórias para `/admin` e `/api/admin/*`)

```bash
cp .env.example .env
# ADMIN_USER=gm
# ADMIN_PASSWORD=...   # senha em texto para a API (não commitar)
```

## 1. Backend

```bash
cd backend
uv sync
uv run python -m app.seed   # opcional, só dev
uv run uvicorn app.main:app --reload --port 8000
```

```bash
curl -s http://localhost:8000/api/health
# {"status":"ok"}

# Sem auth → 401
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/api/admin/arcos \
  -H 'Content-Type: application/json' -d '{"titulo":"x","resumo":"","ordem":1}'
# 401

# Com auth → 201
curl -s -u "$ADMIN_USER:$ADMIN_PASSWORD" -X POST http://localhost:8000/api/admin/arcos \
  -H 'Content-Type: application/json' -d '{"titulo":"Teste","resumo":"","ordem":99}'
```

## 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

http://localhost:5173 — proxy `/api` e `/uploads` → `:8000`.

## 3. Cenários de validação manual

### A. Produção vazia (visão pública)

1. Abrir `/` sem login.
2. **Esperado**: UI com paleta Nocturne (fundo `#161826`, accent blurple); placeholder do mapa se sem imagem; listas vazias ok.

### B. Leitura com dados (dev)

1. Seed ou dados via admin autenticado.
2. `/`: pins, zoom/pan, painel do local, abas Locais/NPCs/História, mobile.

### C. GM (admin) — senha obrigatória

1. Abrir `/admin` **sem** credenciais → gate de senha / não entra no shell de edição.
2. Informar usuário/senha do `.env` → shell GM libera.
3. CRUD local/NPC/arco/grupo/upload.
4. `curl` sem `-u` em `/api/admin/*` → **401**.
5. Aba anônima em `/`: recarregar e ver mudanças.

### D. Caddy (defense in depth)

```bash
docker compose --profile with-caddy up --build
```

1. `/` público.
2. `/admin` → challenge Caddy **e** API ainda valida Basic Auth.
3. Credencial inválida → negado.

### E. Paleta Nocturne

1. Comparar `/` e `/admin` com `prototype/nocturne.css` (bg, surface, text, accent).
2. Não deve permanecer tema âmbar/dourado (`#f0d060` / `#c9a227`) como accent principal.

## 4. Done quando

- [ ] POST `/api/admin/*` sem auth = 401
- [ ] `/admin` inutilizável sem senha
- [ ] UI usa tokens Nocturne
- [ ] Cenários A–C passam
