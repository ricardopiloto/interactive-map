# Codex da Campanha

Aplicação web self-hosted para acompanhar campanhas de RPG de mesa: **mapa** interativo, **rotas**, **rede de relações** entre personagens e **Modo GM** na mesma interface.

**Versão:** 0.19.1 — [`CHANGELOG.md`](CHANGELOG.md)  
**Produção (Campaign Codex):** [`docs/runbook-corte-campaign-codex.md`](docs/runbook-corte-campaign-codex.md) — `https://campaign-codex.1nodado.com.br/c/wfrp` e `/c/wod`

---

## Capturas de ecrã

### Mapa (Modo GM)

![Mapa da campanha em Modo GM com pins e lista de locais](assets/Screenshot_20260813_123218.png)

### Ficha de local

![Modal de leitura de um local no mapa](assets/Screenshot_20260813_123252.png)

### Calcular rota

![Planeador de rotas com opções de viagem e overlay no mapa](assets/Screenshot_20260813_123311.png)

### Rede de Relações

![Grafo de personagens e vínculos tipados](assets/Screenshot_20260813_123326.png)

### Ficha de personagem na Rede

![Personagem seleccionado com lista de vínculos e grafo focado](assets/Screenshot_20260813_123337.png)

### Filtros e legenda de vínculos

![Coluna de filtros por tipo de vínculo (8 tipos) e legenda PJ/NPC](assets/Screenshot_20260813_123346.png)

---

## Funcionalidades

### Mapa interativo

- Zoom e pan (roda suave + pinch); controlos `+` / `−` / `1:1` e **Ir ao grupo**
- Pins de locais com cor livre e convenção visual (visitado / conhecido); marcador do **grupo** (bandeira ou brasão)
- Tamanho de ecrã estável dos pins ao zoom
- Clique no pin (jogador) ou no local no menu foca a vista com pan/zoom animado
- Modal de leitura ao lado do pin (descrição em texto ou Markdown seguro)
- Hover no menu destaca o pin **sem** mover a câmara; pré-visualiza linhas de saída quando não há selecção
- Com local aberto: linhas de **saídas** no mapa
- Sem imagem de mapa na instância: a app abre directamente em **Relações**

### Locais, NPCs e História

- Menu lateral com abas Locais, NPCs, História, Rota e Grupo
- Listas com scroll e busca
- Locais agrupados por arco; NPCs com status, facção, retrato e papel
- Personagens unificados (PJ / NPC) na Rede de Relações

### Rotas e viagem

- Rede de vias (estrada / rio / trilha) digitalizada pelo GM
- **Calcular rota**: De/Para entre nós nomeados; transporte pago/próprio; ritmo; ordenação por tempo ou custo; preferência de via
- Várias alternativas no mapa (mais rápida destacada)
- Vincular nó da rede ↔ Local (o pin segue o nó)

### Rede de Relações (`/relacoes`)

- Grafo PJ/NPC com zoom (roda + pinch), pan e arrastar nós (só na sessão)
- **8 tipos** de vínculo com cor/estilo: Aliado, Vínculo de Sangue, Amizade, Inimizade, Adversário, Romance, Família, Conhecido
- Modo recíproco ou **duas vias**; qualificador opcional (ex. Mentor, Lacaio, Medo); direcção opcional (mútuo / A→B / B→A)
- Filtros por tipo, busca, isolar selecção, legenda PJ/NPC
- Painel de detalhe com ficha e lista de vínculos
- GM: criar/editar personagens e conexões; ocultar sentidos aos jogadores

### Modo GM

- Gate “Acesso restrito (GM)” na barra (ou `/?gm=1`) — sem dica de senha na UI
- CRUD de locais (cor do pin, saídas, nó da rede, Markdown), NPCs/personagens, arcos; upload de imagens; mover grupo
- Substituir a imagem do mapa; **Rede de rotas** para digitalizar waypoints/segmentos (coluna lateral / bottom sheet no mobile)
- API de escrita protegida com HTTP Basic Auth

### Multi-sistema e multi-campanha

- Uma instância Campaign Codex: várias mesas (`/c/<slug>`), catálogo em `/`, painel do mestre em `/painel`
- Sistema e módulos por campanha (`control.db`); `GET /api/c/{slug}/config`
- Extensões mecânicas por personagem (ex. **fadiga** 0–6 quando o módulo está activo)
- Campanha nova: UI `/painel` ou `uv run python -m app.cli campanha criar` (os scripts `nova-campanha.sh` / `migrar-wfrp.sh` estão **aposentados**)
- Import de instância legada: `campanha importar-legado` — ver [`docs/runbook-corte-campaign-codex.md`](docs/runbook-corte-campaign-codex.md)

### Interface

- Design system **Nocturne** (tema escuro)
- Idiomas **PT-BR** e **EN** (combo-box na barra; conteúdo escrito pelo mestre não é traduzido)
- Erros da API surfaced com códigos estruturados e mensagens localizadas

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite + TypeScript + Nocturne DS + `react-i18next` |
| Backend | FastAPI + SQLModel + SQLite + HTTP Basic Auth em `/api/admin/*` |
| Infra | Docker Compose + Caddy (opcional); hub estático multi-campanha |

---

## Desenvolvimento

### Testes

Na raiz do repositório, `./scripts/test-fast.sh --frontend` executa lint e contraste do frontend, adequado para mudanças visuais simples. `./scripts/test-fast.sh --backend` executa nove testes selecionados; sem opção, roda ambos. Requer as dependências locais correspondentes já instaladas e não executa build, seed ou serviços E2E.

Selecione validações conforme o escopo: por exemplo, CSS usa o perfil `--frontend`; mudanças de lógica executam testes focados; alterações de integração usam build e jornadas Playwright afetadas. Reserve as suites completas para mudanças de alto risco, marcos de entrega e CI. O Playwright requer dados preparados pelo seed documentado em `frontend/README.md`.

### Backend

```bash
cd backend
uv sync
# Defina ADMIN_USER e ADMIN_PASSWORD no .env (obrigatório para Modo GM)
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

- `/` — catálogo público
- `/c/<slug>` — mapa da mesa (ex. `/c/wfrp`, `/c/wod`)
- `/c/<slug>/relacoes` — rede de relações
- `/painel` — minhas campanhas (mestre)
- `/login` — sessão de mestre
- `/admin` — redireciona para o mapa da mesa com Modo GM

### Docker

```bash
cp .env.example .env
# Preencha ADMIN_USER, ADMIN_PASSWORD (e ADMIN_PASSWORD_HASH para Caddy)
# Senhas com `$`: no Compose use `$$` ou aspas simples
docker compose up --build
docker compose --profile with-caddy up --build   # porta 8080
```

### Campaign Codex (uma instância)

- Criar mesa: `/painel` ou `uv run python -m app.cli campanha criar …`
- Import legado: `uv run python -m app.cli campanha importar-legado …` (ver runbook de corte)
- Snippets Caddy/Tunnel: `./scripts/imprimir-snippets-codex.sh --porta-api PORT --porta-web PORT`
- `scripts/nova-campanha.sh` e `scripts/migrar-wfrp.sh` recusam (aposentados). O hub em [`hub/`](hub/) é histórico (078).
- Runbook: [`docs/runbook-corte-campaign-codex.md`](docs/runbook-corte-campaign-codex.md)

---

## Segurança

- Leitura pública; escrita em `/api/admin/*` exige **Basic Auth** na API (fail closed sem `ADMIN_USER` / `ADMIN_PASSWORD`)
- Gate na SPA: dialog “Acesso do Mestre”
- Caddy pode reforçar rotas GM em produção
- Jogadores vêem actualizações ao **recarregar** (sem sync ao vivo)

---

## Documentação

| Recurso | Conteúdo |
|---|---|
| [`CHANGELOG.md`](CHANGELOG.md) | Histórico de versões |
| [`docs/manuais.md`](docs/manuais.md) | Índice dos manuais de uso |
| [`docs/manual-mapa.md`](docs/manual-mapa.md) | Mapa: pins, menu, fichas, grupo, calcular rotas, CRUD GM |
| [`docs/manual-rede-rotas.md`](docs/manual-rede-rotas.md) | Nós e segmentos da rede de vias (Modo GM) |
| [`docs/manual-relacoes.md`](docs/manual-relacoes.md) | Rede de Relações: grafo, tipos de vínculo, criar e visualizar |
| [`specs/`](specs/) | Specs Speckit por funcionalidade (histórico de desenho) |
| [`frontend/README.md`](frontend/README.md) · [`backend/README.md`](backend/README.md) | Detalhe por camada |
