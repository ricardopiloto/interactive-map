# Implementation Plan: Deselecionar pin no modo GM

**Branch**: `010-gm-deselect-pin` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-gm-deselect-pin/spec.md`

## Summary

Em modo GM, um pin de local selecionado permanece destacado sem forma de limpar a seleção (a ficha `PinModal` só aparece para jogadores). Hoje `handleStageClick` em `CampaignMap` só reage quando `placementMode !== 'none'`. Estender o clique na área vazia do stage (fora de pins) para limpar `selectedLocalId` quando o GM não está em posicionamento — sem cancelar `localDraft`/formulários admin e sem alterar API/backend.

## Technical Context

**Language/Version**: TypeScript / React (frontend existente)

**Primary Dependencies**: React SPA; `CampaignMap` + `react-zoom-pan-pinch`; `MapPage` (estado `selectedLocalId`)

**Storage**: N/A (estado de UI em memória)

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (mesmo do Codex)

**Project Type**: Web application (correção / UX de interação)

**Performance Goals**: Inalterado; deseleção síncrona no clique

**Constraints**:
- Clique vazio no mapa em GM limpa seleção + fecha ficha associada se existir (FR-001, FR-003, FR-004)
- Não cancela formulários admin (`localDraft`) (FR-005)
- Placement tem prioridade sobre deseleção (FR-006)
- Pan/zoom não deselecionam por si (FR-007)
- Controles/legenda/menu não disparam deseleção (FR-008)
- Jogador: gesto não exigido (FR-009)

**Scale/Scope**: `CampaignMap.tsx` (handler de clique no stage) + `MapPage.tsx` (limpar seleção); CSS só se necessário; zero backend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder. Gates informais:

| Gate | Status |
|------|--------|
| Escopo só interação de seleção no mapa (GM) | PASS |
| Sem mudança de auth/dados/API | PASS |
| Placement / upload mapa / formulários admin preservados | PASS |
| Sem regressão no modo jogador (modal continua fechando seleção) | PASS |

**Post-design re-check**: PASS — UI contract documenta prioridade placement > deselect; data-model só estado de sessão; sem persistência.

## Project Structure

### Documentation (this feature)

```text
specs/010-gm-deselect-pin/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-gm-pin-deselect.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/
├── components/map/
│   └── CampaignMap.tsx      # stage click: deselect quando idle; stopPropagation no grupo se necessário
└── pages/
    └── MapPage.tsx          # callback limpa selectedLocalId (não localDraft)
```

**Structure Decision**: Correção cirúrgica no clique do stage + orquestração em `MapPage`. Sem novos componentes.

## Complexity Tracking

> Nenhuma violação de constituição a justificar.
