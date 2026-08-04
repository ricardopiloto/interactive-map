# Implementation Plan: Zoom Suave com a Roda do Mouse

**Branch**: `026-smooth-wheel-zoom` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/026-smooth-wheel-zoom/spec.md` (roda mais fina ≈ botões +/−; mapa + Rede de rotas; digitalização ≤ ~15 s até ao máximo).

## Summary

Reduzir `wheel.step` em `CampaignMap` e `RouteDigitizerView` para valores próximos do default da `react-zoom-pan-pinch` (`0.015`), de modo que um tick de scroll tenha a mesma ordem de magnitude que um clique em `zoomIn()`/`zoomOut()` (step default `0.5`, modo smooth exponencial). Não alterar `minScale`/`maxScale` nem o passo dos botões. Reverte o `wheel.step: 0.2` introduzido em 022 na digitalização (velocidade até ao máximo relaxada para ≤ ~15 s).

## Technical Context

**Language/Version**: TypeScript / React

**Primary Dependencies**: `react-zoom-pan-pinch` (^4.0.3) — `TransformWrapper` `wheel.step`, `zoomIn`/`zoomOut`

**Storage**: N/A

**Testing**: Validação manual [quickstart.md](./quickstart.md)

**Target Platform**: Browsers do Codex (mouse wheel + trackpad)

**Project Type**: Web application (ajuste de props de zoom)

**Performance Goals**: Mapa ≤ 8 s e Rede de rotas ≤ ~15 s do zoom inicial ao máximo com scroll contínuo

**Constraints**:
- Escopo: `CampaignMap.tsx` + `RouteDigitizerView.tsx`
- `maxScale` intacto (4 / 12)
- Botões +/− mantêm step default da lib (`0.5`)
- Tick de roda ≈ clique +/− (mesma ordem de magnitude)

**Scale/Scope**: 2 ficheiros; 1 prop cada (`wheel.step`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Spec clarificada (3 Qs) | PASS |
| Sem API/schema | PASS |
| Escopo só props de zoom | PASS |
| Constitution placeholder | PASS (N/A) |

**Post-design re-check**: PASS — UI contract; data-model N/A; research resolve fórmula wheel vs botão.

## Project Structure

### Documentation (this feature)

```text
specs/026-smooth-wheel-zoom/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-smooth-wheel-zoom.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/components/map/
└── CampaignMap.tsx          # wheel.step: 0.1 → ~0.01

frontend/src/components/gm/
└── RouteDigitizerView.tsx   # wheel.step: 0.2 → ~0.01 (mesmo valor)
```

**Structure Decision**: Mudança cirúrgica nas props `wheel` dos dois `TransformWrapper`; sem constantes partilhadas obrigatórias (YAGNI — dois call sites). Opcional: constante `WHEEL_ZOOM_STEP = 0.01` num util se preferir DRY.

## Complexity Tracking

> Sem violações a justificar.
