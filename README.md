# Mapa Interativo da Campanha (WFRP4e)

Aplicação web self-hosted para acompanhar a campanha: mapa com pins, NPCs, arcos e Modo GM in-page.

**Versão:** 0.6.3 — [`CHANGELOG.md`](CHANGELOG.md)  
**Produção:** [`docs/plano-producao.md`](docs/plano-producao.md) (`/var/www/interactive-map`)

## Funcionalidades

- Mapa com zoom/pan (roda suave), pins de locais coloridos e marcador do grupo (bandeira ou brasão); pins/grupo com tamanho de ecrã estável ao zoom
- Controlo **Ir ao grupo** no cluster de zoom (+/−/1:1) para recentrar o pin do grupo
- Menu lateral (Locais, História, NPCs) com scroll nas listas e busca em Locais/NPCs/História; modal de leitura ao lado do pin (jogador)
- Clique no local no menu (ou no pin, jogador) foca a vista no pin com pan/zoom animado
- Descrição do local em texto livre ou Markdown (renderizada com segurança na leitura do pin)
- Hover na aba Locais destaca o pin no mapa e tint no cartão — **sem** mover pan/zoom da vista
- Sem seleção: hover no menu (ou lista GM) também pré-visualiza as **linhas de saída** daquele local
- Ao selecionar/abrir um local, linhas simples mostram as **saídas** cadastradas (vermelho claro, translúcidas, com sombra suave)
- **Calcular rota**: De/Para entre nós **com nome** (nome do nó ou Local ligado), ritmo de viagem, várias rotas por tempo (mais rápida destacada; alternativas tracejadas); nós sem nome só como passagem
- Modo GM: vista **Rede de rotas** para digitalizar nós/segmentos (estrada/rio/trilha); vincular nó↔Local na lista ou no formulário de Local (pin do Local segue o nó)
- Modais longos cabem na tela (corpo rola; botões de ação ficam no rodapé)
- Modo GM na mesma tela: canto “Acesso restrito (GM)” ou `/?gm=1`
  - CRUD de locais (inclui cor do pin, saídas e nó da rede), NPCs, arcos; upload de imagens; mover grupo
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
| [`008-smooth-wheel-zoom`](specs/008-smooth-wheel-zoom/spec.md) | Zoom suave na roda (superseded por [`026`](specs/026-smooth-wheel-zoom/spec.md)) |
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
| [`021-route-generation`](specs/021-route-generation/spec.md) | Rede de vias + cálculo de rotas / tempo de viagem |
| [`022-digitizer-max-zoom`](specs/022-digitizer-max-zoom/spec.md) | Zoom máximo maior na Rede de rotas |
| [`023-segment-finish-zone`](specs/023-segment-finish-zone/spec.md) | Zona menor para fechar segmento no digitizer |
| [`024-route-planner-speed`](specs/024-route-planner-speed/spec.md) | Ritmo / velocidade e alternativas no calculador |
| [`025-route-type-title`](specs/025-route-type-title/spec.md) | Título da rota pelo tipo de via |
| [`026-smooth-wheel-zoom`](specs/026-smooth-wheel-zoom/spec.md) | Zoom suave com a roda (mapa + Rede) |
| [`027-undo-segment-point`](specs/027-undo-segment-point/spec.md) | Botão direito desfaz ponto ao traçar segmento |
| [`028-route-any-waypoint`](specs/028-route-any-waypoint/spec.md) | Calcular rota entre quaisquer nós (não só Locais) |
| [`029-link-node-local`](specs/029-link-node-local/spec.md) | Vincular nó ↔ Local após a criação (snap do pin) |
| [`030-pin-size-offset`](specs/030-pin-size-offset/spec.md) | Pins móveis + âncora (**Deferred / Staged**; revertido por [`034`](specs/034-revert-pin-offset/spec.md)) |
| [`031-route-travel-cost`](specs/031-route-travel-cost/spec.md) | Custo Dentro/Fora (bp) e velocidade opcional nas rotas |
| [`032-fix-reposition-modal`](specs/032-fix-reposition-modal/spec.md) | Esconder modal ao reposicionar local |
| [`033-fix-reposition-pin`](specs/033-fix-reposition-pin/spec.md) | Pin reflecte rascunho ao reposicionar |
| [`034-revert-pin-offset`](specs/034-revert-pin-offset/spec.md) | Reverter visual 030; alinhar pin ao ponto |
| [`035-fix-digitizer-node-offset`](specs/035-fix-digitizer-node-offset/spec.md) | Alinhar stage/nós do digitizer à imagem do mapa |
| [`036-route-endpoint-search`](specs/036-route-endpoint-search/spec.md) | Combobox/busca De/Para no Calcular rota |
| [`037-side-menu-scroll-search`](specs/037-side-menu-scroll-search/spec.md) | Scroll + busca no menu lateral |
| [`038-fixed-marker-size`](specs/038-fixed-marker-size/spec.md) | Pins/nós menores com tamanho fixo no zoom |
| [`039-focus-group-pin`](specs/039-focus-group-pin/spec.md) | Botão para centralizar o pin do grupo |
| [`040-named-route-endpoints`](specs/040-named-route-endpoints/spec.md) | De/Para só com nós nomeados |

- Spec ativa: [`specs/040-named-route-endpoints`](specs/040-named-route-endpoints/spec.md)
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
