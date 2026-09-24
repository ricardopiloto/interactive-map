# Implementation Plan: Linha do Tempo vertical da campanha

**Branch**: `141-linha-tempo-eventos` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/141-linha-tempo-eventos/spec.md`

**Backlog**: [BKLG-030](../../docs/v2/backlog.md#bklg-030-produto--linha-do-tempo-vertical-da-campanha-novo-menu-ao-lado-de-sessões)

## Summary

Introduzir a entidade **Evento** (cadastro manual do mestre) e a superfície **Linha do Tempo** — item de menu ao lado de Sessões, coluna vertical scrollável ordenada por `ano` ascendente (desempate `id`). Espelhar o padrão Sessão: modelo + tabelas de link N:N, serviço público/admin com `visivel_para_todos`, chips filtrados via `is_visivel_para_jogador`, rotas `/api/c/{slug}/…` e página React no estilo `SessoesPage`. Export/import ZIP **não** incluem Evento nesta versão.

## Technical Context

**Language/Version**: Python 3.12+ (uv / FastAPI), TypeScript / React 19 (frontend Vite)

**Primary Dependencies**: Existentes — SQLModel, Alembic (`alembic_campaign`), React Router, i18next. Sem deps novas.

**Storage**: SQLite por campanha — tabelas `evento`, `evento_local`, `evento_npc` (+ FK opcional `sessao_id` → `sessao`). Migração `004_*` após `003_visibilidade_local_arco`.

**Testing**: pytest obrigatório (Constitution II) — isolamento, auth matrix, CRUD, visibilidade/redação de chips; quickstart manual para UI.

**Target Platform**: Web — `/c/:slug/linha-do-tempo` (mestre e jogador membros)

**Project Type**: Web application (backend + frontend)

**Performance Goals**: N/A — listas pequenas por campanha; SC-001 &lt;10s após página utilizável

**Constraints**: Sem calendário/tipo de evento; sem export Evento; redigir refs ocultas sem esconder o evento; i18n pt-BR+en; isolamento entre campanhas

**Scale/Scope**: 1 entidade nova + 2 link tables + serviço/routers/schemas + 1 página + nav; espelho deliberado de Sessões

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: PASS — rotas sob `/api/c/{slug}`; testes tipo `test_sessoes_isolation.py` obrigatórios.
- **II. Testes primeiro**: PASS — plan exige testes a falhar antes de modelo/CRUD/migração.
- **III. Produção legada**: PASS / N/A — só DB de campanhas novas/migradas no Codex; sem tocar `/opt`.
- **IV. Simplicidade**: PASS — reutiliza padrão Sessão; zero deps novas.
- **V. i18n**: PASS — chaves `comum.nav.*` + namespace `linhaTempo` (ou equivalente) pt-BR/en.
- **VI. Migrações**: PASS — Alembic campaign `004_evento` com `downgrade` reversível / `render_as_batch` se necessário.

**Post-design re-check**: PASS — contratos, data-model e quickstart alinhados; export omitido documentado.

## Project Structure

### Documentation (this feature)

```text
specs/141-linha-tempo-eventos/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── eventos-api.md
└── tasks.md             # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
backend/
├── alembic_campaign/versions/004_evento.py
├── app/models/evento.py              # Evento
├── app/models/links.py               # EventoLocalLink, EventoNpcLink (extend)
├── app/schemas/evento.py
├── app/services/evento_service.py    # mirror sessao_service
├── app/routers/public/eventos.py
├── app/routers/admin/eventos.py
└── tests/
    ├── test_eventos_isolation.py
    ├── test_eventos_visibility.py
    └── test_eventos_crud.py          # or fold into auth matrix

frontend/src/
├── components/layout/campaignNav.ts  # tab ao lado de sessoes
├── pages/LinhaTempoPage.tsx (+ .css)
├── api/campaign.ts / admin.ts        # list/create/update/delete eventos
├── App.tsx                           # route /c/:slug/linha-do-tempo
└── locales/{pt-BR,en}/comum.json + linhaTempo.json (ou chave em comum)
```

**Structure Decision**: Espelhar Sessões end-to-end (modelo → API → página → nav). Não alterar `campaign_export` / `campaign_import` nesta feature.

## Complexity Tracking

Nenhuma violação.
