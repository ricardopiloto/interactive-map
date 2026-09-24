# Quickstart: Exportar / importar (097)

Validação local end-to-end. Detalhes: [contracts/](./contracts/), [data-model.md](./data-model.md).

## Pré-requisitos

- Backend com 093–096 aplicados (`control.db`, campanha de teste, auth, media ACL).
- Utilizador **dono** da campanha origem; segundo utilizador mestre para import (ou o mesmo).
- `uv` no `backend/`.

## Setup mínimo

```bash
cd backend
# controlo + campanha de teste já existentes (ver 093/095 quickstarts)
# opcional: popular arcos/NPCs/locais + 1 imagem portrait + mapa
```

## Cenários

### 1. Export (API) — só dono

```bash
# login dono → cookie
curl -sS -o /tmp/a.zip -w "%{http_code}" \
  -b cookies.txt \
  "http://127.0.0.1:8000/api/c/{slug}/admin/export"
# esperando: 200; /tmp/a.zip é zip com manifest.json + content.json
```

Mestre/jogador/anónimo → 403/401 (ver [require-dono.md](./contracts/require-dono.md)).

### 2. Round-trip CLI

```bash
uv run campaign-codex campanha exportar --slug ORIGEM --out /tmp/a.zip
uv run campaign-codex campanha importar --zip /tmp/a.zip --email outro@example.com --slug origem-copia
# listar /api/c/origem-copia/… — contagens arcos/NPCs/locais/vínculos/waypoints iguais
# IDs iguais; sistema/módulos iguais; dono = outro@example.com
```

### 3. Slug ocupado

Import sem `--slug` quando `slug_origem` já existe → erro `SLUG_OCUPADO`; zero campanha nova.

### 4. Recusas

Montar zips em `backend/tests/fixtures/packages/`:

- com `campanha.db` → `ENTRADA_PROIBIDA`
- `schema_version` inventada futura → `SCHEMA_FUTURO`
- JSON com FK partida → `CONTEUDO_INVALIDO`
- portrait referido ausente → `CONTEUDO_INVALIDO`

### 5. Suite

```bash
cd backend && uv run pytest tests/test_export_import_*.py tests/test_export_auth.py -q
```

Esperado: verde após implementação; red sob TDD antes.

## Fora deste quickstart

UI (098). Corte legado `/opt` (099).
