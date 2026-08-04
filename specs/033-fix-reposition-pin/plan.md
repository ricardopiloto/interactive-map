# Implementation Plan: Corrigir reposicionamento visual do pin

**Branch**: `033-fix-reposition-pin` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/033-fix-reposition-pin/spec.md`

## Summary

A 032 esconde o modal e o clique actualiza `localDraft.x/y`, mas o pin no mapa continua a usar só `locais` persistidos — o GM não vê o pin mover até (ou mesmo sem) save. Correção FE-only: enquanto houver rascunho de **edição** (`localDraft` com `id`), o mapa deve renderizar esse local com as coordenadas (e opcionalmente cor) do rascunho. Cancelar edição (`localDraft = null`) restaura o pin aos dados de `locais`. Preservar overlay/Cancelar da 032. Sem API/backend.

## Technical Context

**Language/Version**: TypeScript / React (frontend existente)

**Primary Dependencies**: React SPA; `MapPage`; `CampaignMap`; `LocalFormDraft`

**Storage**: N/A (preview em estado React; persistência via save local já existente)

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (mesmo do Codex)

**Project Type**: Web application (correção de feedback visual GM)

**Performance Goals**: Inalterado (override O(n) na lista de locais)

**Constraints**:
- Pin MUST reflect draft coords after reposition click before save (FR-001, SC-001)
- Form coords MUST match pin (FR-002)
- 032 overlay + banner Cancel preserved (FR-003, FR-004)
- Cancel edit restores persisted pin (FR-005)
- Save persists; no accidental move when not repositioning (FR-006, FR-007)
- Sem mudança de API / regras de vínculo nó↔local

**Scale/Scope**: Principalmente `MapPage.tsx` (merge draft→locais para display); possível prop tipada em `CampaignMap` só se preferir override explícito em vez de lista já mesclada

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder. Gates informais:

| Gate | Status |
|------|--------|
| Escopo só preview visual do pin em edição | PASS |
| Sem mudança de auth/dados/API | PASS |
| Preserva 032 (modal oculto + Cancelar banner) | PASS |
| Cancel edição reverte preview | PASS |

**Post-design re-check**: PASS — UI state/data-model; contrato UI; sem HTTP.

## Project Structure

### Documentation (this feature)

```text
specs/033-fix-reposition-pin/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-pin-draft-position.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/
├── pages/
│   └── MapPage.tsx           # locais de display = merge com localDraft (edit); cancel → null draft
└── components/map/
    └── CampaignMap.tsx       # sem mudança obrigatória se receber lista já mesclada;
                              # verificar que clique reposition continua a actualizar draft (032)
```

**Structure Decision**: Preferir **merge em `MapPage`** antes de passar `locais` ao `CampaignMap` (um sítio, conexão/linhas e pin alinhados). Evitar segunda fonte de verdade no mapa.

## Complexity Tracking

Sem violações — override de apresentação mínimo.
