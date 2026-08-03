# Implementation Plan: Conexões entre locais no mapa

**Branch**: `017-location-connections` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/017-location-connections/spec.md` (saídas dirigidas; linhas só no foco; cadastro no formulário do local; linha simples).

## Summary

Persistir conexões **dirigidas** origem→destino entre locais; o GM gerencia `saida_ids` no formulário do local; o mapa desenha linhas simples **somente** quando um local está selecionado/aberto, ligando esse pin aos destinos. Sem setas, sem overlay permanente, sem modo de ligar pins no mapa.

## Technical Context

**Language/Version**: Python 3.12 (FastAPI/SQLModel) + TypeScript / React

**Primary Dependencies**: SQLModel link table; schemas/routers de `Local`; `LocalFormDialog`; `CampaignMap` (SVG/HTML overlay no stage); `MapPage` (`selectedLocalId`)

**Storage**: SQLite — nova tabela de vínculo dirigido `local_conexao` (`origem_id`, `destino_id`); campo de leitura/escrita `saida_ids: number[]` no contrato de Local

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Codex (browser + API local/Docker)

**Project Type**: Web application (monorepo frontend + backend)

**Performance Goals**: Desenhar hub com ≥5 saídas sem bloquear clique em pins; linhas com `pointer-events: none`

**Constraints**:
- Linhas só com local em foco (clarificação A)
- Cadastro só no formulário do local (clarificação A)
- Linha simples, sem seta/rótulo (clarificação B)
- Auto-conexão e duplicatas proibidas; exclusão de local remove vínculos
- Auth escrita: Basic Auth admin (inalterado)

**Scale/Scope**: Campanha típica (&lt;100 locais; hubs &lt;20 saídas); 1 overlay por origem focada

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Spec clarificada (visibilidade, cadastro, desenho) | PASS |
| Reusa Local + admin auth existentes | PASS |
| Sem escopo fora (setas, overlay permanente, clique-mapa) | PASS |
| Constitution template placeholder — sem gates rígidos aplicáveis | PASS (N/A) |

**Post-design re-check**: PASS — data-model + contracts alinhados às clarificações; SVG no stage sem alterar auth.

## Project Structure

### Documentation (this feature)

```text
specs/017-location-connections/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-local-saidas.md
│   └── ui-map-connection-lines.md
└── tasks.md              # /speckit-tasks (não neste comando)
```

### Source Code (repository root)

```text
backend/app/
├── models/links.py              # + LocalConexaoLink
├── models/local.py              # relationship saídas (opcional)
├── schemas/local.py             # saida_ids
├── routers/public/locais.py     # _to_read inclui saida_ids
├── routers/admin/locais.py      # sync saida_ids no create/update
├── database.py                  # create_all cobre nova tabela
└── seed.py                      # opcional: 1–2 conexões de exemplo

frontend/src/
├── types/index.ts               # Local.saida_ids
├── api/admin.ts                 # payload saida_ids
├── components/admin/LocalFormDialog.tsx  # multi-select destinos
├── components/map/CampaignMap.tsx        # overlay de linhas
├── components/map/CampaignMap.css
└── pages/MapPage.tsx            # draft/save saida_ids
```

**Structure Decision**: Monorepo existente; estender Local (padrão `npc_ids`) + overlay no `campaign-map__stage`.

## Complexity Tracking

> Sem violações a justificar.
