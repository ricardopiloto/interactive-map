# Codex — API

FastAPI + SQLModel + SQLite.  
Versão do pacote: ver `pyproject.toml` (alinhada ao [CHANGELOG](../CHANGELOG.md)).

## Multi-campanha (ficheiro)

Cada campanha tem o seu SQLite e pasta de uploads sob `DATA_DIR/campanhas/<uuid>/`. O catálogo vive em `DATA_DIR/control.db`. A API HTTP resolve a campanha pelo **slug na URL** (`/api/c/{slug}/…`). `CAMPAIGN_SLUG` é opcional e só para CLI/seed/scripts — **nunca** fallback de pedidos HTTP.

```bash
# Criar campanha (schema vazio) e listar
uv run python -m app.cli campanha criar --slug minha-campanha --nome "Minha Campanha" --sistema wfrp4e
uv run python -m app.cli campanha listar

# Arranque (HTTP não precisa de CAMPAIGN_SLUG)
uv run uvicorn app.main:app --reload --port 8000
# Ex.: GET /api/c/minha-campanha/config
# Mídia: GET /api/c/minha-campanha/media/map/…

# Seed (script) — passar slug via env ou argumento conforme o seed
CAMPAIGN_SLUG=minha-campanha uv run python -m app.seed
```

Variáveis relevantes: `DATA_DIR` (default `./data`), `PUBLIC_BASE_URL`, `TRUSTED_PROXY`, `COOKIE_SECURE`; `CAMPAIGN_SLUG` só para ferramentas locais. `ADMIN_USER`/`ADMIN_PASSWORD` são legado e **não** autenticam admin.

## Contas e sessão (spec 095)

```bash
# Convidar mestre (imprime URL /convite/{token})
uv run python -m app.cli usuario criar --email mestre@exemplo.com

# Reset / desactivar
uv run python -m app.cli usuario reset --email mestre@exemplo.com
uv run python -m app.cli usuario desactivar --email mestre@exemplo.com

# Dono da campanha (substitui o anterior)
uv run python -m app.cli campanha atribuir-dono --slug minha-campanha --email mestre@exemplo.com

# Recalcular cota a partir do disco
uv run python -m app.cli campanha reconciliar-cota --slug minha-campanha

# Exportar / importar pacote zip (spec 097)
uv run python -m app.cli campanha exportar --slug minha-campanha --out /tmp/mesa.zip
uv run python -m app.cli campanha importar --zip /tmp/mesa.zip --email mestre@exemplo.com --slug mesa-copia

# Importar instância legada (árvore mapa.db + uploads; spec 099)
uv run python -m app.cli campanha importar-legado \
  --origem /caminho/instancia --slug wfrp --sistema wfrp4e --nome "WFRP" \
  --email mestre@exemplo.com --relatorio /tmp/rel-wfrp.json
```

Snippets de corte (stdout; não escreve Caddy): `../scripts/imprimir-snippets-codex.sh --porta-api PORT --porta-web PORT`. Runbook: [`docs/runbook-corte-campaign-codex.md`](../docs/runbook-corte-campaign-codex.md).

Autenticação HTTP: cookie `codex_session` (HttpOnly, SameSite=Lax). Endpoints:

| Método | Path | Notas |
|---|---|---|
| `POST` | `/api/auth/login` | email + password → Set-Cookie |
| `POST` | `/api/auth/logout` | revoga sessão |
| `GET` | `/api/auth/me` | sessão actual |
| `POST` | `/api/auth/convite/aceitar` | token + password |
| `POST` | `/api/auth/reset/confirmar` | token + password |

Mutações exigem `Origin`/`Referer` na allowlist `CORS_ORIGINS` (CSRF). Com `TRUSTED_PROXY=true`, o IP de lockout usa `CF-Connecting-IP` ou o primeiro hop de `X-Forwarded-For`.

## Desenvolvimento

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000

# Suíte de testes do backend
uv sync --group dev
uv run pytest
```

Para feedback rápido a partir da raiz do repositório, execute `./scripts/test-fast.sh --backend`; ele roda nove testes selecionados. Escolha testes focados pelo escopo; mantenha a suíte completa para mudanças de alto risco, marcos de entrega e CI.

- Health: http://localhost:8000/api/health
- Docs OpenAPI (só com `DEBUG=true`): http://localhost:8000/api/docs
- Frontend: http://localhost:5173/ (catálogo); painel em `/painel`; mesa em `/c/&lt;slug&gt;`; login em `/login`

## Rotas

| Prefixo | Acesso | Uso |
|---|---|---|
| `GET /api/campanhas/catalogo` | Público | Campanhas `listada`+activas (nome, sistema, slug) |
| `GET /api/campanhas/minhas` | Cookie | Só campanhas activas de que o user é **dono** (+ cota) |
| `POST /api/campanhas` | Cookie | Criar campanha (default visibilidade `listada`); user vira dono |
| `PATCH /api/campanhas/{slug}/visibilidade` | Cookie + **dono** | `listada` ↔ `so_link` |
| `GET /api/c/{slug}/*` | Público | Leitura (locais, NPCs/personagens, arcos, grupo, vínculos, rotas, config, …) |
| `GET /api/c/{slug}/media/{categoria}/{arquivo}` | Público (mapa/locais); retratos com ACL | Mídia da campanha (`map` \| `portraits` \| `locals`) |
| `GET /api/c/{slug}/admin/export` | Cookie + **dono** | Download zip (`manifest.json` + `content.json` + imagens) |
| `POST /api/campanhas/import` | Cookie (qualquer sessão activa) | Cria campanha nova a partir do zip; importador vira dono |
| `/api/c/{slug}/admin/*` | Cookie de sessão + membership | Escrita / upload (cota 10 GiB) |
| `/api/auth/*` | Público (login) / cookie | Contas |
| `/uploads/…` | — | **404** (legado; usar `/media/`) |
| `GET /api/health` | Público | Health (sem slug) |

Caminhos antigos sem slug (`/api/locais`) → 404.

**Mídia / cota (spec 096):** retratos ocultos → 404 anónimo; membro sempre acede. Mapa versionado em `Campanha.mapa_arquivo`. Upload recusa com `COTA_EXCEDIDA` se o uso resultante ultrapassar `cota_bytes`; aviso `aviso_cota` ≥ 90%.

Erros surfaced na UI usam `detail: { erro, detalhes }` (ver `app/errors.py`).

## Modelo (notas)

- `data_sessao` nos locais é **texto livre** (rótulo), não data de calendário
- `cor_pin` nos locais é hex `#RRGGBB`
- `saida_ids` / `local_conexao`: saídas dirigidas entre locais
- Rede de viagem: `waypoint` / `route_segment` / `map_scale`; `GET /api/routes/plan?...`; CRUD admin de waypoints e segmentos
- Locais expõem `waypoint_id` (vínculo 1:1 com nó; conflito → 422)
- Personagens: `tipo` pj/npc, `extensoes_mecanica` (JSON; chaves de módulos inactivos ignoradas)
- Vínculos: `tipo_ab` / `tipo_ba` (enum com 8 valores), qualificadores, `direcao` opcional, flags de visibilidade por sentido
- `GET /api/config`: `sistema`, `modulos_ativos`, `has_map_image`, `mapa_arquivo`, `map_url`

## Config de instância

Variáveis típicas no `.env` (ver `.env.example` na raiz): `DATA_DIR`, `PUBLIC_BASE_URL`, `TRUSTED_PROXY`, `CORS_ORIGINS`, `CAMPAIGN_SLUG` (só scripts).
