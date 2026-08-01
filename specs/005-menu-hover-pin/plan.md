# Implementation Plan: Destacar pin ao passar o mouse no menu

**Branch**: `005-menu-hover-pin` | **Date**: 2026-08-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-menu-hover-pin/spec.md` (clarificação: só aba Locais).

## Summary

Ao passar o mouse sobre o nome de um local na aba **Locais** do menu lateral (jogador ou lista GM), destacar temporariamente o pin correspondente no mapa. Hover não abre modal nem recentra o mapa; clique permanece como hoje.

## Technical Context

**Language/Version**: TypeScript / React 19 (SPA existente)

**Primary Dependencies**: React state/handlers; CSS no mapa

**Storage**: N/A

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Desktop com ponteiro (hover); mobile sem hover = no-op

**Project Type**: Web application (UI interaction)

**Performance Goals**: Destaque imediato ao hover (&lt;100ms percebido); sem re-fetch

**Constraints**:
- Só aba Locais (FR-007)
- Hover ≠ abrir modal; não obrigar pan/zoom
- Separar estado de hover do de seleção/clique

**Scale/Scope**: `MapPage`, `SideMenu` (Locais + lista GM), `CampaignMap` (+ CSS)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Escopo limitado à aba Locais | PASS |
| Sem mudança de API/dados | PASS |
| Clique existente preservado | PASS |

**Post-design re-check**: PASS — UI contract e estado local documentados; sem contratos HTTP.

## Project Structure

### Documentation (this feature)

```text
specs/005-menu-hover-pin/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-hover-pin.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/
├── pages/MapPage.tsx              # estado hoveredLocalId; wire SideMenu ↔ CampaignMap
├── components/sidebar/SideMenu.tsx  # onMouseEnter/Leave nos itens Locais (+ GM list)
├── components/admin/LocalAdminList.tsx  # hover nos cards de nome (Modo GM)
├── components/map/CampaignMap.tsx   # prop hoveredLocalId + classe CSS
└── components/map/CampaignMap.css   # estilo pin--hovered (≠ só selected)
```

**Structure Decision**: Estado de UI em `MapPage`; sem backend.

## Complexity Tracking

> Nenhuma violação a justificar.
