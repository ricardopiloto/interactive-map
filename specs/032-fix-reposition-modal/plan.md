# Implementation Plan: Esconder modal ao reposicionar local

**Branch**: `032-fix-reposition-modal` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/032-fix-reposition-modal/spec.md`

## Summary

Corrigir o bug em que “Reposicionar no mapa” na edição de um local deixa o `LocalFormDialog` montado (z-index alto), bloqueando o clique no mapa. Solução FE-only: enquanto `placement === 'reposition'`, **não renderizar** o diálogo (mantendo `localDraft` em memória); após clique no mapa o fluxo actual já actualiza `x/y` e volta `placement` a `none`, reexibindo o formulário. Acrescentar **Cancelar** no banner de placement do `CampaignMap` para sair do modo sem mudar coordenadas (clarificação 2026-08-03). Sem API/backend.

## Technical Context

**Language/Version**: TypeScript / React (frontend existente)

**Primary Dependencies**: React SPA; `MapPage`; `LocalFormDialog`; `CampaignMap`

**Storage**: N/A (rascunho só em estado React; persistência via save local já existente)

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (mesmo do Codex)

**Project Type**: Web application (correção de interação UI GM)

**Performance Goals**: Inalterado

**Constraints**:
- Modal MUST ocultar durante reposicionar (FR-001)
- Rascunho MUST persistir em memória (FR-004)
- Banner MUST ter Cancelar no modo reposition (FR-005)
- Após clique / cancel: formulário reaparece com coords correctas (FR-003, FR-005)
- Sem mudança de API, vínculo nó↔local, ou regras de save além do fluxo actual (FR-006–007)

**Scale/Scope**: `MapPage.tsx`, `CampaignMap.tsx` (+ CSS mínimo do banner se necessário); sem alterações backend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder. Gates informais:

| Gate | Status |
|------|--------|
| Escopo só UX de overlay durante reposition | PASS |
| Sem mudança de auth/dados/API | PASS |
| Rascunho preservado; cancel descoberta no banner | PASS |
| Sem regressão add-pin / move-group | PASS (condicionar Cancelar ao modo reposition; ocultar só o dialog de local) |

**Post-design re-check**: PASS — UI state em data-model; contrato de UI; sem contratos HTTP.

## Project Structure

### Documentation (this feature)

```text
specs/032-fix-reposition-modal/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-local-reposition.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/
├── pages/
│   └── MapPage.tsx              # não montar LocalFormDialog se placement==='reposition'; onCancel placement
├── components/
│   ├── admin/
│   │   └── LocalFormDialog.tsx  # sem mudança funcional obrigatória (já chama onStartReposition)
│   └── map/
│       ├── CampaignMap.tsx      # Cancelar no banner quando reposition; callback onCancelPlacement
│       └── CampaignMap.css      # estilo mínimo do controlo Cancelar no banner (se preciso)
```

**Structure Decision**: Correção cirúrgica no orquestrador (`MapPage`) + banner do mapa. Preferir **não montar** o dialog durante reposition em vez de CSS `display:none` / pointer-events, para não interceptar cliques e manter a11y limpa.

## Complexity Tracking

Sem violações — mudança mínima de estado de UI.
