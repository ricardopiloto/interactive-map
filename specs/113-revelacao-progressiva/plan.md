# Implementation Plan: Revelação progressiva (Local e Arco)

**Branch**: `113-revelacao-progressiva` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/113-revelacao-progressiva/spec.md`

## Summary

Estender o padrão `visivel_para_todos` de NPC para **Local** e **Arco**: migração campaign `003_*` (default `true`), helper de visibilidade partilhado, filtros em leituras públicas (lista/detalhe/saídas/`arco_id` redigido, `local_ids` de NPC, chips de sessão, média de locais), UI de Modo edição com o mesmo badge «oculto» dos NPCs + toggle nos formulários.

## Technical Context

**Language/Version**: Python 3.12 (FastAPI/SQLModel/Alembic) + TypeScript/React

**Primary Dependencies**: existentes (schemas Local/Arco/NPC, `media_acl`, formulários Local/Arco, badge NPC)

**Storage**: SQLite `campanha.db` — colunas novas em `local` e `arco`

**Testing**: pytest (migração default, vazamento zero SC-001/002, admin vê tudo, export round-trip, matriz isolamento se afectada)

**Target Platform**: browser + API actual

**Project Type**: web app

**Performance Goals**: N/A (filtros em memória sobre dezenas/centenas de linhas)

**Constraints**: MUST NOT cascata-ocultar locais ao ocultar arco; MUST NOT tocar `/opt`; SemVer de pacote inalterado (campo novo com default)

**Scale/Scope**: 1 migration, generalize visibility helper, touch public routers + media ACL + sessao chips + FE forms/lists/mapa

## Constitution Check

- **I. Isolamento**: sem rotas novas de slug; reforçar asserts públicos de locais/arcos na matriz se útil. **PASS**
- **II. Testes primeiro**: migration + leak matrix + admin visibility. **PASS**
- **III. Produção legada**: só Codex. **PASS**
- **IV. Simplicidade**: um flag + helper; sem libs. **PASS**
- **V. i18n**: pt-BR+en para «Sem arco» / toggle / badge reuse. **PASS**
- **VI. Migrações**: `003_visibilidade_local_arco.py` `render_as_batch`, `server_default=true`. **PASS**

Post-design: unchanged. **PASS**

## Project Structure

```text
backend/alembic_campaign/versions/003_visibilidade_local_arco.py
backend/app/models/local.py | arco.py
backend/app/services/visibility.py          # shared is_visivel_para_jogador
backend/app/services/personagem_visibility.py  # re-export / thin wrapper
backend/app/routers/public/locais.py | arcos.py | npcs.py | personagens.py
backend/app/services/sessao_service.py      # omit hidden locais in public chips
backend/app/services/media_acl.py           # locals/ category vs hidden Local
backend/app/schemas/local.py | arco.py
backend/tests/test_visibility_local_arco.py (+ extend test_visibility / isolation)

frontend/src/types/index.ts
frontend/src/components/admin/LocalFormDialog.tsx | LocalAdminList.tsx
frontend/src/components/admin/ArcoFormDialog.tsx | ArcoAdminList.tsx
frontend/src/pages/MapPage.tsx / sidebar / pin UI (badge oculto)
frontend/src/locales/{pt-BR,en}/mapa.json | admin.json | comum.json
```

## Complexity Tracking

Nenhuma violação.
