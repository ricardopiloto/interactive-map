# Mapa Interativo da Campanha (WFRP4e)

Aplicação web self-hosted para acompanhar a campanha: mapa com pins, NPCs, arcos e Modo GM in-page.

**Changelog:** [`CHANGELOG.md`](CHANGELOG.md)  
**Produção:** [`docs/plano-producao.md`](docs/plano-producao.md) (`/var/www/interactive-map`)

## Funcionalidades

- Mapa com zoom/pan, pins de locais e marcador do grupo (bandeira ou brasão)
- Menu lateral (Locais, História, NPCs) e modal ao clicar no pin
- Hover na aba Locais destaca o pin correspondente no mapa (sem abrir o modal)
- Modo GM na mesma tela: canto “Acesso restrito (GM)” ou `/?gm=1`
- API de escrita protegida com HTTP Basic Auth

## Specs

| Spec | Descrição |
|---|---|
| [`001-campaign-codex-map`](specs/001-campaign-codex-map/spec.md) | Codex base (mapa, entidades, auth na borda) |
| [`002-hide-map-placeholder`](specs/002-hide-map-placeholder/spec.md) | Placeholder do mapa |
| [`003-align-prototype-ui`](specs/003-align-prototype-ui/spec.md) | Alinhamento visual com o protótipo Nocturne |
| [`004-group-pin-border`](specs/004-group-pin-border/spec.md) | Borda escura no pin do grupo |
| [`005-menu-hover-pin`](specs/005-menu-hover-pin/spec.md) | Hover no menu → destaque do pin |

- Spec ativa: [`specs/005-menu-hover-pin`](specs/005-menu-hover-pin/spec.md)
- Protótipo (fonte visual): `prototype/`

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite + TypeScript + Nocturne DS |
| Backend | FastAPI + SQLModel + SQLite + HTTP Basic Auth em `/api/admin/*` |
| Infra | Docker Compose + Caddy (camada extra em produção) |

## Desenvolvimento

### Backend

```bash
cd backend
uv sync
# Defina ADMIN_USER e ADMIN_PASSWORD no .env (obrigatório para Modo GM)
# Rode a partir da pasta onde o .env está (raiz ou backend, conforme seu setup)
uv run uvicorn app.main:app --reload --port 8000

# Seed opcional (só dev/teste)
uv run python -m app.seed
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

http://localhost:5173 — proxy `/api` e `/uploads` → `:8000`

- `/` — Codex (jogador + Modo GM in-page via canto “Acesso restrito (GM)”)
- `/admin` — redireciona para `/?gm=1` (abre o gate de senha; **sem** dica de senha na UI)
- Credenciais: senha = `ADMIN_PASSWORD`; usuário Basic = `ADMIN_USER` / `VITE_ADMIN_USER` (default `gm`)

### Docker

```bash
cp .env.example .env
# Preencha ADMIN_USER, ADMIN_PASSWORD (e ADMIN_PASSWORD_HASH para Caddy)
docker compose up --build
docker compose --profile with-caddy up --build   # porta 8080
```

## Segurança

- Leitura pública; escrita em `/api/admin/*` exige **Basic Auth na API** (fail closed sem `ADMIN_USER`/`ADMIN_PASSWORD`)
- Gate na SPA: dialog “Acesso do Mestre” (senha; usuário Basic = `ADMIN_USER` / `VITE_ADMIN_USER` default `gm`)
- Caddy pode reforçar `/admin*` e escritas em produção
- Jogadores veem updates ao **recarregar** (sem sync ao vivo)
