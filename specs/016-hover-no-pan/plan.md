# Implementation Plan: Hover no menu sem pan/zoom

**Branch**: `016-hover-no-pan` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-hover-no-pan/spec.md` (vista do mapa fixa no hover; destaque local do pin ok).

## Summary

Garantir que hover na aba Locais **não** altere pan/zoom da vista do mapa — só destaque do pin (e do cartão). Hipótese principal: re-execução de `PinFocusController` quando `hoveredLocalId` causa re-render e `zoomToElement` muda de identidade. Clique (menu/mapa) continua focando. Sem backend.

## Technical Context

**Language/Version**: TypeScript / React

**Primary Dependencies**: `MapPage` (`hoveredLocalId` vs `focusRequest`); `CampaignMap` (`PinFocusController`, `useControls`); CSS de pin hover

**Storage**: N/A

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (Codex)

**Project Type**: Web application (bugfix UX)

**Performance Goals**: Hover sem jank de vista; destaque &lt; 150 ms

**Constraints**:
- Vista do mapa imutável no hover (clarificação A)
- Destaque local do pin (scale/glow) permitido
- Clique → foco intacto (012/015)
- Sem API/dados

**Scale/Scope**: `CampaignMap.tsx` (estabilizar efeito de foco); verificar `MapPage` / `SideMenu` não setam `focusRequest` no hover

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Escopo só corrigir hover vs vista | PASS |
| Sem schema/API | PASS |
| Preserva destaque pin + foco por clique | PASS |

**Post-design re-check**: PASS — UI contract; data-model só invariantes de sessão.

## Project Structure

### Documentation (this feature)

```text
specs/016-hover-no-pan/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-hover-no-pan.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/
├── pages/MapPage.tsx                 # onLocalHover → só hoveredLocalId
├── components/map/CampaignMap.tsx    # PinFocusController deps; pin --hovered
├── components/map/CampaignMap.css    # scale/glow local ok
└── components/sidebar/SideMenu.tsx   # mouseEnter/Leave hover
```

**Structure Decision**: Separar estritamente `hoveredLocalId` (visual) de `focusRequest` (pan/zoom); tornar o efeito de foco dependente só do nonce/id, não de identidades instáveis de `useControls`.

## Complexity Tracking

> Nenhuma violação a justificar.
