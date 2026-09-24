# Implementation Plan: Crônica de sessões

**Branch**: `112-cronica-sessoes` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/112-cronica-sessoes/spec.md`

## Summary

Adicionar entidade **Sessão** em `campanha.db` (número único, título, rótulo de data livre, resumo Markdown, `visivel_para_todos`, N:N com Local e NPC), API pública filtrada + admin CRUD, página `/c/:slug/sessoes` com lista cronológica e chips (deep-link Mapa/Relações), item de nav Sessões no chrome. Tokens 110+; padrão de visibilidade como NPC.

## Technical Context

**Language/Version**: Python 3.12 (FastAPI/SQLModel/Alembic) + TypeScript/React

**Primary Dependencies**: existentes (Drawer, MarkdownSafe/MarkdownField, ConfirmDialog, Toast, i18n)

**Storage**: SQLite `campanha.db` — tabelas `sessao`, `sessao_local`, `sessao_npc`

**Testing**: pytest (CRUD, unicidade, visibilidade pública, isolamento A/B); smoke UI opcional

**Target Platform**: browser + API actual

**Project Type**: web app

**Performance Goals**: listagem tipicamente dezenas de sessões — N/A especial

**Constraints**: sem sync realtime; não migrar `Local.data_sessao`; MUST NOT tocar `/opt`

**Scale/Scope**: 1 migration campaign, models/links, public+admin routers, 1 page FE + nav, i18n

## Constitution Check

- **I. Isolamento**: rotas `/api/c/{slug}/sessoes` (+ admin) na matriz. **PASS**
- **II. Testes primeiro**: isolamento, ocultas, CRUD, `NUMERO_DUPLICADO`. **PASS**
- **III. Produção legada**: só Codex. **PASS**
- **IV. Simplicidade**: reutilizar UI kit; sem libs novas. **PASS**
- **V. i18n**: pt-BR+en. **PASS**
- **VI. Migrações**: Alembic campaign `002_*` `render_as_batch` / create_table. **PASS**

Post-design: unchanged. **PASS**

## Clarifications → design

| Topic | Choice |
|-------|--------|
| Nav | Tab Sessões no CodexHeader + CampaignBottomNav |
| Número | UNIQUE por DB de campanha |
| Visibilidade vs local/NPC | Só endpoints de sessão; chips omitem NPC ocultos |

## Project Structure

```text
backend/alembic_campaign/versions/002_sessao.py
backend/app/models/sessao.py
backend/app/models/links.py              # SessaoLocalLink, SessaoNpcLink
backend/app/models/__init__.py
backend/app/schemas/sessao.py
backend/app/services/sessao_service.py   # next_numero, visibility filter
backend/app/routers/public/sessoes.py
backend/app/routers/admin/sessoes.py
backend/app/routers/public/__init__.py | admin/__init__.py
backend/tests/test_sessoes_*.py

frontend/src/pages/SessoesPage.tsx|.css
frontend/src/App.tsx                     # route
frontend/src/components/layout/CodexHeader.tsx | CampaignBottomNav.tsx
frontend/src/pages/MapPage.tsx           # ?local=
frontend/src/pages/RelacoesPage.tsx      # ?personagem=
frontend/src/api/…                       # public + admin sessao
frontend/src/locales/{pt-BR,en}/comum.json | sessoes.json (or comum)
```

## Complexity Tracking

Nenhuma violação.
