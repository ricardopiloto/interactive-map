# Implementation Plan: Zoom fluido na rolagem do mouse

**Branch**: `008-smooth-wheel-zoom` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-smooth-wheel-zoom/spec.md` (clarificações C e B).

## Summary

Reduzir a sensibilidade brusca da rolagem (`wheel.step: 0.1` hoje) e calibrar o passo pela **cobertura relativa** (tamanho da imagem ÷ área visível do mapa). Botões +/− usam passo de clique **maior** que a rolagem. Implementação em `CampaignMap`: medir dimensões da imagem e da viewport, derivar `wheelStep` / `buttonStep` com limites (clamp), passar `wheel={{ step: wheelStep }}` ao `TransformWrapper` e `zoomIn(buttonStep)` / `zoomOut(buttonStep)`. Manter `minScale`/`maxScale` atuais (0.5–4). Sem API/backend.

## Technical Context

**Language/Version**: TypeScript / React

**Primary Dependencies**: `react-zoom-pan-pinch` (`TransformWrapper` `wheel.step`; `useControls().zoomIn/Out(step?)`)

**Storage**: N/A

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Desktop mouse wheel + trackpad scroll (browsers modernos)

**Project Type**: Web application (ajuste de interação no mapa)

**Performance Goals**: Recalcular passo em load da imagem / resize da viewport; sem custo contínuo por frame

**Constraints**:
- FR-001/002/SC-003: passo menor que 0.1 atual, mas ~3–15 ticks na faixa útil
- FR-003: cobertura relativa imagem↔viewport
- FR-007: buttonStep > wheelStep
- FR-004: manter min/max scale existentes salvo afinação mínima

**Scale/Scope**: `CampaignMap.tsx` (+ helper puro opcional em `frontend/src/components/map/` ou `utils/`); sem mudanças de CSS obrigatórias

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Escopo só sensibilidade de zoom no mapa | PASS |
| Sem auth/dados/API | PASS |
| Clarificações C (cobertura) e B (botão > roda) respeitadas | PASS |

**Post-design re-check**: PASS — UI contract de passos; data-model descreve métricas de calibração.

## Project Structure

### Documentation (this feature)

```text
specs/008-smooth-wheel-zoom/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-wheel-zoom-steps.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/map/
├── CampaignMap.tsx          # medir imagem/viewport; wheel.step dinâmico; zoomIn/Out(step)
├── zoomSteps.ts             # (opcional) pure fn: coverage → { wheelStep, buttonStep }
└── CampaignMap.css          # sem mudança esperada
```

**Structure Decision**: Lógica de calibração no mapa; helper puro preferível para testabilidade manual/razão clara.

## Complexity Tracking

> Nenhuma violação de constituição a justificar.
