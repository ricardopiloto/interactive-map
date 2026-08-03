# Mapa Interativo da Campanha (WFRP4e)

Aplicação web self-hosted para acompanhar a campanha: mapa com pins, NPCs, arcos e Modo GM in-page.

**Versão:** 0.5.0 — [`CHANGELOG.md`](CHANGELOG.md)  
**Produção:** [`docs/plano-producao.md`](docs/plano-producao.md) (`/var/www/interactive-map`)

## Funcionalidades

- Mapa com zoom/pan, pins de locais coloridos e marcador do grupo (bandeira ou brasão)
- Menu lateral (Locais, História, NPCs); modal de leitura ao lado do pin (jogador)
- Clique no local no menu (ou no pin, jogador) foca a vista no pin com pan/zoom animado
- Descrição do local em texto livre ou Markdown (renderizada com segurança na leitura do pin)
- Hover na aba Locais destaca o pin no mapa e tint no cartão — **sem** mover pan/zoom da vista
- Sem seleção: hover no menu (ou lista GM) também pré-visualiza as **linhas de saída** daquele local
- Ao selecionar/abrir um local, linhas simples mostram as **saídas** cadastradas (vermelho claro, translúcidas, com sombra suave)
- Modais longos cabem na tela (corpo rola; botões de ação ficam no rodapé)
- Modo GM na mesma tela: canto “Acesso restrito (GM)” ou `/?gm=1`
  - CRUD de locais (inclui cor do pin e saídas para outros locais), NPCs, arcos; upload de imagens; mover grupo
  - Substituir mapa pelo botão **Mapa** nos controles
  - Clique na área vazia do mapa deseleciona o pin selecionado
  - Clique no pin seleciona sem foco automático da câmera
- API de escrita protegida com HTTP Basic Auth

## Specs

| Spec | Descrição |
|---|---|
| [`001-campaign-codex-map`](specs/001-campaign-codex-map/spec.md) | Codex base (mapa, entidades, auth na borda) |
| [`002-hide-map-placeholder`](specs/002-hide-map-placeholder/spec.md) | Placeholder do mapa |
| [`003-align-prototype-ui`](specs/003-align-prototype-ui/spec.md) | Alinhamento visual com o protótipo Nocturne |
| [`004-group-pin-border`](specs/004-group-pin-border/spec.md) | Borda escura no pin do grupo |
| [`005-menu-hover-pin`](specs/005-menu-hover-pin/spec.md) | Hover no menu → destaque do pin |
| [`006-fix-gm-map-click`](specs/006-fix-gm-map-click/spec.md) | Clique no mapa não abre upload; botão explícito |
| [`007-visible-zoom-controls`](specs/007-visible-zoom-controls/spec.md) | Controles de zoom sempre na área útil |
| [`008-smooth-wheel-zoom`](specs/008-smooth-wheel-zoom/spec.md) | Zoom suave na roda (planejado; ainda não implementado) |
| [`009-pin-visit-colors`](specs/009-pin-visit-colors/spec.md) | Cor livre do pin + convenção visitado/conhecido |
| [`010-gm-deselect-pin`](specs/010-gm-deselect-pin/spec.md) | GM deseleciona pin com clique fora |
| [`011-pin-markdown-text`](specs/011-pin-markdown-text/spec.md) | Descrição do pin com Markdown opcional |
| [`012-menu-center-pin`](specs/012-menu-center-pin/spec.md) | Clique no menu → focar pin no mapa |
| [`013-modal-beside-pin`](specs/013-modal-beside-pin/spec.md) | Modal de leitura ao lado do pin |
| [`014-sidebar-hover-fit`](specs/014-sidebar-hover-fit/spec.md) | Tint no hover do cartão + busca ajustada |
| [`015-map-pin-focus`](specs/015-map-pin-focus/spec.md) | Clique no pin (jogador) → focar vista |
| [`016-hover-no-pan`](specs/016-hover-no-pan/spec.md) | Hover no menu não move pan/zoom da vista |
| [`017-location-connections`](specs/017-location-connections/spec.md) | Linhas de saída entre locais (no foco) |
| [`018-modal-viewport-fit`](specs/018-modal-viewport-fit/spec.md) | Modais cabem na viewport (corpo rolável) |
| [`019-connection-line-style`](specs/019-connection-line-style/spec.md) | Estilo vermelho claro / sombra / opacidade das linhas |
| [`020-menu-hover-connections`](specs/020-menu-hover-connections/spec.md) | Hover no menu pré-visualiza linhas (sem seleção) |

- Spec ativa: [`specs/020-menu-hover-connections`](specs/020-menu-hover-connections/spec.md)
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

Detalhes: [`backend/README.md`](backend/README.md)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

http://localhost:5173 — proxy `/api` e `/uploads` → `:8000`

Detalhes: [`frontend/README.md`](frontend/README.md)

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
