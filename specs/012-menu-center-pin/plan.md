# Implementation Plan: Centralizar pin ao clicar no menu

**Branch**: `012-menu-center-pin` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-menu-center-pin/spec.md` (zoom moderado fixo + animação suave).

## Summary

Ao clicar um local na lista do menu (aba Locais), manter a seleção atual e **animar** o mapa para centralizar o pin com um **zoom moderado fixo**. Implementação no cliente via `react-zoom-pan-pinch` (`zoomToElement` no botão do pin). Clique no pin do mapa continua só selecionando (sem forçar o mesmo foco, a menos que compartilhe o handler — ver research: foco só a partir do menu). Sem backend.

## Technical Context

**Language/Version**: TypeScript / React

**Primary Dependencies**: `react-zoom-pan-pinch` (já em uso em `CampaignMap`); `SideMenu` / `MapPage`

**Storage**: N/A

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (Codex)

**Project Type**: Web application (UX do mapa)

**Performance Goals**: Transição &lt; 3s (SC-003); tipicamente ~300–500 ms

**Constraints**:
- Zoom alvo fixo moderado (entre `minScale`/`maxScale`, abaixo do máximo)
- Animação suave pan+zoom
- Hover não foca (FR-005)
- Placement GM: sem foco se `selectLocal` já bloqueia
- Sem mudança de API/dados

**Scale/Scope**: `CampaignMap.tsx` (IDs nos pins + helper de foco); `MapPage.tsx` (disparar foco só no caminho do menu); possível constante compartilhada de escala

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Escopo só interação mapa/menu | PASS |
| Sem schema/API | PASS |
| Preserva seleção/modal existentes | PASS |
| Respeita bloqueio de seleção em placement | PASS |

**Post-design re-check**: PASS — UI contract; data-model só estado de sessão de foco.

## Project Structure

### Documentation (this feature)

```text
specs/012-menu-center-pin/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-menu-focus-pin.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/
├── components/map/
│   └── CampaignMap.tsx      # id estável nos pins; FocusOnLocal / zoomToElement
├── components/sidebar/
│   └── SideMenu.tsx         # sem mudança obrigatória se MapPage passar handler focado
└── pages/
    └── MapPage.tsx          # selectLocal vs selectLocalFromMenu (+ request focus)
```

**Structure Decision**: Disparar foco apenas no handler usado pelo `SideMenu`; `CampaignMap` executa `zoomToElement` quando recebe um pedido de foco (prop `focusRequest` ou similar).

## Complexity Tracking

> Nenhuma violação a justificar.
