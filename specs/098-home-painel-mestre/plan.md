# Implementation Plan: Página inicial e painel do mestre

**Branch**: `098-home-painel-mestre` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/098-home-painel-mestre/spec.md`

**Release**: sem bump obrigatório (manter `0.19.1` + CHANGELOG `[Unreleased]`), salvo decisão explícita. Não corta `/opt/codex-*` (099).

**Depends on**: 094–097 Implemented — actualizar linhas Draft na spec se ainda constarem 096/097.

## Summary

Home pública em `/` (catálogo `listada`+activa) e painel autenticado em `/painel` («minhas campanhas» = só **dono**, activas). APIs: catálogo anónimo; minhas/criar/PATCH visibilidade autenticadas. FE Nocturne + i18n; pós-login → `/painel`; export/import UI via 097; cota no painel (096). Sem schema novo. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: Python ≥ 3.12; TypeScript/React (Vite)  
**Primary Dependencies**: FastAPI, SQLModel (já); React Router, i18next, stack Nocturne (já) — **sem** dep nova (IV)  
**Storage**: só leitura/escrita `control.db` (`Campanha`, `Membro`); sem Alembic novo  
**Testing**: pytest — catálogo omite `so_link`/inactivas; painel A≠B; co-mestre omitido; criar/visibilidade; FE smoke via rotas se aplicável  
**Target Platform**: API + SPA Campaign Codex; legado `/opt` intocado  
**Project Type**: web app (backend + frontend)  
**Performance Goals**: listagens leves (controlo só); SC-001 ≤ 2 cliques  
**Constraints**: sem UI super-admin/co-mestre; `/` nunca inventário privado; cota só no painel  
**Scale/Scope**: 2 páginas + 4 endpoints + header nav; copy pt-BR/en  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: catálogo sem `so_link`/inactivas; minhas = dono A sem B; matriz anónimo/A/B. **PASS** (planeado)
- **II. Testes primeiro**: catálogo, painel A/B, criar, visibilidade — falhar antes. Export/import UI chama 097. **PASS**
- **III. Produção legada**: Zero `/opt`. **PASS**
- **IV. Simplicidade**: reutilizar create CLI + 097; sem libs UI novas. **PASS**
- **V. i18n**: chaves home/painel/criar/vazios/cota/erros pt-BR+en. **PASS**
- **VI. Migrações**: N/A (sem coluna nova). **PASS**

**Post-Phase 1**: Unchanged. Contratos cobrem API + rotas FE + isolamento. Corte 099 fora.

## Project Structure

### Documentation (this feature)

```text
specs/098-home-painel-mestre/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-catalogo.md
│   ├── api-minhas-criar-visibilidade.md
│   ├── frontend-routes.md
│   └── isolation-home-painel.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/services/campanha_admin.py   # (ext) create_for_owner / list helpers
backend/app/routers/campanhas.py         # GET catalogo, GET minhas, POST /, PATCH …/visibilidade
backend/tests/test_catalogo_publico.py
backend/tests/test_painel_minhas.py
backend/tests/test_campanha_criar_http.py
backend/tests/test_visibilidade_patch.py

frontend/src/pages/HomePage.tsx (+ .css)
frontend/src/pages/PainelPage.tsx (+ .css)
frontend/src/api/campanhas.ts            # client catalogo/minhas/criar/visibilidade/export/import
frontend/src/App.tsx                     # /, /painel, /relacoes→/
frontend/src/pages/AuthPages.tsx         # default next → /painel
frontend/src/components/layout/…         # links Home / Painel / Entrar
frontend/src/locales/{pt-BR,en}/comum.json
CHANGELOG.md / backend/README.md
```

**Structure Decision**: Estender `campanhas` router (097 já tem import). FE páginas novas no padrão Auth/Nocturne. Sem FE tests automatizados obrigatórios além de quickstart; API TDD obrigatório.

## Complexity Tracking

> Sem violações — tabela vazia de propósito.
