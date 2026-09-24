# Implementation Plan: Uploads com acesso controlado e cota por campanha

**Branch**: `096-uploads-cota` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/096-uploads-cota/spec.md`

**Release**: sem bump obrigatório (manter `0.19.1` + CHANGELOG `[Unreleased]`), salvo decisão explícita. Não corta `/opt/codex-*` (099).

## Summary

Substituir a leitura pública de `/uploads/c/{slug}/…` por `GET /api/c/{slug}/media/{categoria}/{arquivo}` com ACL: mapa e locais públicos; retratos só se existir personagem **dessa** campanha com esse `retrato_url` e `visivel_para_todos` (membro da campanha sempre acede). Mapa versionado em `Campanha.mapa_arquivo` (ponte única `campaign-map.*`); cota 10 GB com `bytes_usados`, aviso 90% no upload, bloqueio com uso resultante > teto (substituição de mapa usa delta líquido). FE e APIs passam a URLs de mídia; `/uploads` → 404. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: Python ≥ 3.12; TypeScript (React + Vite)  
**Primary Dependencies**: FastAPI, SQLModel, Alembic (já) — **sem** dependência nova (IV)  
**Storage**: ficheiros em `DATA_DIR/campanhas/<uuid>/uploads/{map,portraits,locals}/`; metadados `mapa_arquivo` / `cota_bytes` / `bytes_usados` em `control.db` (já 093)  
**Testing**: pytest — TDD ACL retrato, cota (incl. substituição mapa), reconciliação, isolamento A/B no endpoint de mídia; actualizar matriz 094  
**Target Platform**: backend + SPA; Campaign Codex no repo; legado `/opt` intocado  
**Project Type**: web app (API + frontend + CLI operador)  
**Performance Goals**: servir ficheiro local; ACL = lookup personagem na `campanha.db` do slug; reconciliação CLI sob demanda  
**Constraints**: Sem CDN/proxy; sem GC de órfãos; sem banner permanente de cota; sem alterar `cota_bytes` na UI; cache `private, no-store` em retratos  
**Scale/Scope**: 1 router/serviço de mídia; upload + contador; stamp ponte mapa; rewrite URLs na leitura; CLI reconciliar; FE helpers de URL + aviso no ImageSlot  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: Endpoint `/api/c/{slug}/media/…` na matriz A/B (anónimo + membro); ACL de retrato só consulta personagens da campanha do slug. **PASS** (planeado; FR-014 / SC-003)
- **II. Testes primeiro**: ACL mídia, cota, reconciliação, isolamento — testes a falhar antes. **PASS** (planeado)
- **III. Produção legada**: Zero requisito de mudar `/opt/codex-*`. **PASS**
- **IV. Simplicidade**: SQLite + pasta UUID já existentes; zero deps novas. **PASS**
- **V. i18n**: Aviso/recusa de cota pt-BR + en; códigos de API mapeáveis. **PASS**
- **VI. Migrações**: N/A — só usar colunas 093; sem schema novo. **PASS**

**Post-Phase 1**: Unchanged. Contratos cobrem mídia GET, upload/cota, cache, rewrite de URLs, CLI reconciliar, isolamento. GC/painel 098 fora.

## Project Structure

### Documentation (this feature)

```text
specs/096-uploads-cota/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── media-api.md
│   ├── upload-quota.md
│   ├── cache-headers.md
│   ├── url-rewrite.md
│   ├── isolation-media.md
│   └── cli-reconcile.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/routers/public/… ou media.py   # GET /api/c/{slug}/media/{categoria}/{arquivo}
backend/app/services/uploads.py            # quota, mapa versionado, URLs /media/, bytes_usados
backend/app/services/media_acl.py          # regras retrato / público / membro
backend/app/services/instance_config.py    # has_map_image via mapa_arquivo + ponte stamp
backend/app/services/url_rewrite.py        # /uploads/c/… → /api/c/…/media/… na leitura
backend/app/schemas/config.py              # mapa_arquivo ou map_url (sem bytes públicos)
backend/app/main.py                        # remover serve /uploads/c (404)
backend/app/cli.py                         # campanha reconciliar-cota --slug
backend/tests/test_media_acl.py            # retrato oculto/visível/membro
backend/tests/test_quota.py                # cota + substituição mapa
backend/tests/test_isolation_http.py       # apontar a /media/
frontend/src/api/campaignSlug.ts           # media URL helpers; defaultMapUrl
frontend/src/components/media/ImageSlot.tsx # aviso 90% / erro cota
frontend/src/locales/{pt-BR,en}/…          # copy cota
CHANGELOG.md / backend/README.md
```

**Structure Decision**: Mídia sob o prefixo de campanha já existente (094); ACL reutiliza sessão/membership da 095 e `campanha.db` do slug para `visivel_para_todos`. Contador e mapa no registo `Campanha` do controlo. Sem object storage.

## Complexity Tracking

> Sem violações — tabela vazia de propósito.
