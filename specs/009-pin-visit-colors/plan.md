# Implementation Plan: Seletor de cor do pin de local

**Branch**: `009-pin-visit-colors` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-pin-visit-colors/spec.md` (clarificações: seletor livre; só GM; cor obrigatória).

## Summary

Persistir `cor_pin` (hex CSS) em cada `Local`, validar como obrigatório nas APIs admin de create/update, migrar legados com default lilás sugerido, e no frontend: seletor de cor no formulário GM (com swatches vermelho/lilás), pin no mapa com `background` dinâmico, legenda com convenção sugerida. Jogadores só visualizam. Sem enum de status de visita.

## Technical Context

**Language/Version**: Python 3.12+ (FastAPI/SQLModel); TypeScript/React

**Primary Dependencies**: SQLModel/SQLite (`_migrate_sqlite`); React formulário GM; CSS de pin existente

**Storage**: SQLite — nova coluna `local.cor_pin` (string hex, NOT NULL após backfill)

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Web (Codex da Campanha)

**Project Type**: Web application (full-stack)

**Performance Goals**: Inalterado

**Constraints**:
- Cor livre + swatches sugeridos (vermelho visitado, lilás não visitado)
- GM-only write; public read inclui `cor_pin`
- Create/update sem cor → 422 / UI bloqueia
- Grupo pin intacto
- Migração legados → default lilás

**Scale/Scope**: Backend model/schema/admin+public routers/seed/migrate; frontend types, LocalFormDialog, CampaignMap pin+legend, MapPage payload

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Escopo alinhado às clarificações A/A/C | PASS |
| Auth: escrita só admin (GM) | PASS |
| Migração legados com default | PASS |

**Post-design re-check**: PASS — contratos API + UI; data-model com `cor_pin`.

## Project Structure

### Documentation (this feature)

```text
specs/009-pin-visit-colors/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-local-cor-pin.md
│   └── ui-pin-color.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/
├── database.py              # ALTER TABLE / backfill cor_pin
├── models/local.py
├── schemas/local.py
├── routers/admin/locais.py
├── routers/public/…         # LocalRead com cor_pin
└── seed.py

frontend/src/
├── types/index.ts
├── components/admin/LocalFormDialog.tsx
├── components/map/CampaignMap.tsx
├── components/map/CampaignMap.css
└── pages/MapPage.tsx        # payload create/update
```

**Structure Decision**: Campo no domínio Local ponta a ponta; UI seletor no diálogo GM existente; estilo de pin via inline `background` + legenda.

## Complexity Tracking

> Nenhuma violação a justificar.
