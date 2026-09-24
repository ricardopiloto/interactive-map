# Implementation Plan: Gênero como identidade da campanha

**Branch**: `111-genero-identidade-campanha` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/111-genero-identidade-campanha/spec.md`

## Summary

Substituir o **acento solto** (108) por **género** obrigatório e imutável (`fantasia|gotico|scifi|urbano`): coluna + migração com backfill, tokens `data-genre` (4 paletas do protótipo), criação no Painel com cards + pré-visualização ao vivo, cartões home/painel com género, export/import com `genero` (pacotes antigos via mapeamento). Capa passa a PATCH dedicado. Mesa gótico/sci-fi/urbano força escuro.

## Technical Context

**Language/Version**: Python 3.12 (FastAPI/SQLModel/Alembic) + TypeScript/React

**Primary Dependencies**: existentes; copy de referência `frontend-next` genres / NovoCodexWizard (sem nova lib)

**Storage**: SQLite `control.db` — coluna `genero` NOT NULL; remover `acento_id`

**Testing**: pytest (migração, criar, imutabilidade, capa PATCH, export/import, isolamento); `test:contrast` para 4 géneros × modos aplicáveis; smoke UI criação

**Target Platform**: browser + API actual

**Project Type**: web app (backend + frontend)

**Performance Goals**: N/A além de tokens CSS

**Constraints**: género imutável; 4 ids só; sistema livre; MUST NOT tocar `/opt`; SemVer bump não pedido nesta fase UX

**Scale/Scope**: model/schemas/routers/services export-import; `tokens.css` + theme helper; Painel/Home; i18n; Alembic control `005_*`

## Constitution Check

- **I. Isolamento**: `PATCH …/capa` + criação com género — matriz dono/anónimo/outro. **PASS** (planear testes)
- **II. Testes primeiro**: migração, criar sem género, imutabilidade, import antigo/novo, isolamento capa. **PASS**
- **III. Produção legada**: só controlo Codex + FE. **PASS**
- **IV. Simplicidade**: enum fechado; aposentar `accent_palette.py`; sem dependências novas. **PASS**
- **V. i18n**: rótulos/taglines/erros pt-BR+en. **PASS**
- **VI. Migrações**: Alembic control `render_as_batch` + backfill + drop `acento_id`. **PASS**

Post-design: unchanged. **PASS**

## Clarifications → design

| Topic | Choice |
|-------|--------|
| Pacote | `genero` no manifesto; antigos com `acento_id` → mapeamento migração |
| Capa | `PATCH /api/campanhas/{slug}/capa` (substitui identidade) |
| Claro × género | Mesa gotico/scifi/urbano força escuro |

## Project Structure

```text
backend/alembic_control/versions/005_genero.py
backend/app/models/campanha.py              # genero; drop acento_id
backend/app/services/genre_palette.py       # GENRE_IDS + map_from_legacy (substitui accent_palette)
backend/app/services/campanha_admin.py      # criar + set_capa; remover set_identidade/acento
backend/app/schemas/campanhas.py            # Criar+genero; CapaRequest; catalogo/painel
backend/app/routers/campanhas.py
backend/app/services/campaign_export.py | campaign_import.py | package_schema.py
backend/app/schemas/config.py               # genero na config pública
backend/tests/…                             # migração, API, import

frontend/src/styles/tokens.css              # data-genre × 4; data-theme light só fantasia (+ shell)
frontend/src/theme/campaignGenre.ts         # aplica data-genre; aposenta campaignAccent
frontend/src/theme/genres.ts                # ids, labels, taglines, suggestedSystems, swatch (i18n keys)
frontend/src/pages/PainelPage.tsx|.css      # cards + live preview; capa; sem acentos
frontend/src/pages/HomePage.tsx             # badge género
frontend/src/api/…                          # criar+genero; patchCapa
frontend/src/locales/pt-BR.json | en.json
frontend/scripts/check-contrast.mjs         # amostrar 4 géneros

specs/111-…/contracts/genero-api.md
```

## Complexity Tracking

Nenhuma violação.
