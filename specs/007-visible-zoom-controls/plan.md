# Implementation Plan: Controles de zoom sempre visíveis

**Branch**: `007-visible-zoom-controls` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-visible-zoom-controls/spec.md`

## Summary

Garantir que os controles de zoom (+, −, 1:1) e o botão GM “Mapa” no mesmo grupo permaneçam sempre dentro da área visível do mapa em tela cheia e no layout mobile. Abordagem: (1) fazer o container do mapa preencher e ficar limitado à área útil do `main` (`flex: 1` / `min-height: 0`); (2) ancorar `.campaign-map__controls` (e, se necessário, legenda) ao box visível do mapa, não à altura do conteúdo pan/zoom. Sem mudanças de API.

## Technical Context

**Language/Version**: TypeScript / CSS (frontend existente)

**Primary Dependencies**: React SPA; `react-zoom-pan-pinch`; `CampaignMap` / `MapPage`

**Storage**: N/A

**Testing**: Validação manual via [quickstart.md](./quickstart.md) (desktop fullscreen + mobile)

**Target Platform**: Browsers modernos (desktop fullscreen / maximizado; mobile com barra inferior)

**Project Type**: Web application (ajuste de layout/posicionamento)

**Performance Goals**: Inalterado

**Constraints**:
- Controles devem permanecer no chrome do mapa (FR-005) — fora do conteúdo transformado
- Funções +, −, 1:1 e “Mapa” (GM) intactas (FR-006 / FR-004)
- Legenda não deve tornar-se inutilizável por overlap total
- Preferir CSS/layout; sem redesenhar o mapa

**Scale/Scope**: Principalmente `CampaignMap.css` + `MapPage.css` (e markup mínimo em `MapPage.tsx` / `CampaignMap.tsx` se faltar wrapper flexível)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder. Gates informais:

| Gate | Status |
|------|--------|
| Escopo só visibilidade/layout dos controles do mapa | PASS |
| Sem mudança de auth/dados/API | PASS |
| Mantém funções de zoom existentes | PASS |

**Post-design re-check**: PASS — UI contract de posicionamento; sem contratos API.

## Project Structure

### Documentation (this feature)

```text
specs/007-visible-zoom-controls/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-zoom-controls-visibility.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/
├── components/map/
│   ├── CampaignMap.tsx      # confirmar MapControls fora de TransformComponent
│   └── CampaignMap.css      # .campaign-map__controls / legend insets; height chain
└── pages/
    ├── MapPage.tsx          # wrapper flexível do mapa se necessário
    └── MapPage.css          # .map-page__main / filho do mapa: flex:1; min-height:0
```

**Structure Decision**: Correção de layout CSS (e wrapper mínimo se a cadeia de altura quebrar). Sem novos componentes de domínio.

## Complexity Tracking

> Nenhuma violação de constituição a justificar.
