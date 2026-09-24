# Implementation Plan: Roteamento por campanha

**Branch**: `094-roteamento-campanha` | **Date**: 2026-09-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/094-roteamento-campanha/spec.md`

**Release**: sem bump (0.19.1). CHANGELOG `[Unreleased]`. Não é veículo de corte em produção (aguarda 095).

## Summary

Prefixar toda a API de conteúdo e admin com `/api/c/{slug}/…`, resolvendo a sessão pelo slug do path (093). Uploads estáticos sob `/uploads/c/{slug}/…`. Frontend: `/c/:slug` e `/c/:slug/relacoes`; cache de config e base API por slug; `/` e `/relacoes` → ecrã «não encontrado». Caminhos antigos de conteúdo → 404. Inactivo = desconhecido (404 opaca). Basic Auth admin transitório. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: Python ≥ 3.12; TypeScript (React 18 + Vite)  
**Primary Dependencies**: FastAPI, SQLModel, React Router; **sem** dependência nova de produto  
**Storage**: inalterado (093: `control.db` + `campanhas/<uuid>/`)  
**Testing**: pytest — caracterização 092 adaptada ao prefixo; matriz HTTP isolamento A/B (API + ficheiro); so_link; 404 opaca; paths antigos 404  
**Target Platform**: backend + SPA; instâncias legadas intocadas  
**Project Type**: web app (API + frontend)  
**Performance Goals**: resolve por pedido via cache 093; config cache client por slug  
**Constraints**: Sem contas/home/ACL uploads; HTTP sem fallback `CAMPAIGN_SLUG`; sem schema Alembic  
**Scale/Scope**: remount routers + StaticFiles; FE router + api client + config cache; i18n 2 locales; ~1 módulo teste isolamento HTTP  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: Rotas `/api/c/{slug}/…` e `/uploads/c/{slug}/…` na matriz A/B (anónimo + Basic Auth). Sem `campanha_id`. **PASS**
- **II. Testes primeiro**: Matriz isolamento HTTP + adaptação 092 MUST falhar antes da implementação. **PASS** (planeado)
- **III. Produção legada**: Zero mudança em `/opt/codex-*`; feature não corta produção antes de 095. **PASS**
- **IV. Simplicidade**: Sem deps novas; reusa resolvedor 093; uploads = path por slug. **PASS**
- **V. i18n**: Copy nova (campanha não encontrada / peça link) pt-BR + en. **PASS**
- **VI. Migrações**: N/A — sem schema. **PASS**

**Post-Phase 1**: Unchanged. Contratos cobrem API prefix, uploads path, FE routes, erros opacos. Contas 095; ACL mídia 096.

## Project Structure

### Documentation (this feature)

```text
specs/094-roteamento-campanha/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-campaign-prefix.md
│   ├── uploads-slug-path.md
│   ├── frontend-campaign-routes.md
│   └── isolation-http-matrix.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/routers/public/__init__.py   # prefix /api/c/{slug}
backend/app/routers/admin/__init__.py    # prefix /api/c/{slug}/admin
backend/app/database.py / campaign_db.py # get_session(slug from Path); opaque 404
backend/app/main.py                      # mount /uploads/c/{slug}; health fica /api/health
backend/app/services/uploads.py          # URLs devolvidas com /uploads/c/{slug}/…
backend/app/services/instance_config.py  # já Campanha; garantir por slug do pedido
backend/tests/conftest.py                # paths com slug; sem CAMPAIGN_SLUG HTTP
backend/tests/test_*                     # 092 prefix; isolation HTTP; uploads A/B; opaque
backend/README.md

frontend/src/App.tsx                     # /c/:slug, /c/:slug/relacoes; / e /relacoes → NotFound
frontend/src/api/client.ts + campaign.ts # base /api/c/{slug}/…
frontend/src/hooks/useInstanceConfig.ts  # cache Map por slug
frontend/src/pages/*                     # Map/Relacoes sob slug; CampaignMissingPage
frontend/src/locales/{pt-BR,en}/…        # copy nova
CHANGELOG.md
```

**Structure Decision**: Um router pai FastAPI com `{slug}` inclui public + admin; handlers existentes mantêm paths relativos (`/locais`, …). FE obtém slug de `useParams` e compõe API + uploads. Sem app factory nova.

## Complexity Tracking

> None.
