# Implementation Plan: Evitar diálogo de mapa ao clicar em modo GM

**Branch**: `006-fix-gm-map-click` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-fix-gm-map-click/spec.md`

## Summary

Corrigir o bug em que qualquer clique na área do mapa em modo GM abre o seletor de arquivo. Causa: `CampaignMap` renderiza `ImageSlot` com `editable` quando `mapEditable` (ligado ao modo GM), e o slot trata **todo** clique na imagem como upload. Solução: mapa carregado deixa de abrir o file picker no clique genérico; upload/substituição fica em ação explícita (controle dedicado) e/ou no estado vazio/falha do mapa. Sem mudanças de API ou backend.

## Technical Context

**Language/Version**: TypeScript / React (frontend existente)

**Primary Dependencies**: React SPA; `ImageSlot`; `CampaignMap` / `MapPage`

**Storage**: N/A (reutiliza upload admin `category=map` já existente)

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (mesmo do Codex)

**Project Type**: Web application (correção de interação UI)

**Performance Goals**: Inalterado

**Constraints**:
- Clique genérico no mapa com imagem carregada MUST NOT abrir file picker (FR-001)
- Fluxos de posicionamento (add-pin / reposition / move-group) MUST continuar (FR-002)
- GM MUST poder substituir o mapa de forma explícita (FR-003)
- Estado sem mapa / imagem falha: GM ainda carrega mapa (FR-004)
- Modo jogador inalterado (FR-005)

**Scale/Scope**: Principalmente `CampaignMap.tsx` (+ CSS mínimo se houver botão); possível ajuste fino em `ImageSlot` só se necessário e sem regressão em portraits/locais; `MapPage` só se o controle de substituir mapa for orquestrado fora do mapa

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder. Gates informais:

| Gate | Status |
|------|--------|
| Escopo só interação de upload do mapa em GM | PASS |
| Sem mudança de auth/dados/API | PASS |
| Mantém capacidade de substituir mapa (ação explícita) | PASS |
| Sem regressão em ImageSlot usado em portraits/locais | PASS (mudança preferencialmente isolada no mapa) |

**Post-design re-check**: PASS — sem contratos API; UI contract documenta gatilhos de file picker; data-model descreve estados de apresentação.

## Project Structure

### Documentation (this feature)

```text
specs/006-fix-gm-map-click/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-map-upload-triggers.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/
├── components/map/
│   ├── CampaignMap.tsx      # deixar de usar ImageSlot editável como superfície clicável quando há mapa
│   └── CampaignMap.css      # estilo do controle “Substituir mapa” (se aplicável)
├── components/media/
│   └── ImageSlot.tsx        # só se precisar de prop (ex. clickToUpload) — preferir não mudar se o mapa deixar de usá-lo no caminho carregado
└── pages/
    └── MapPage.tsx          # mapEditable / onMapUploaded; possível botão no chrome GM
```

**Structure Decision**: Correção cirúrgica no mapa (`CampaignMap` + controle explícito). Preferir não alterar o comportamento global de `ImageSlot` usado em formulários de NPC/local.

## Complexity Tracking

> Nenhuma violação de constituição a justificar.
