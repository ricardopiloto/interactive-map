# Implementation Plan: Marcadores menores com tamanho fixo no zoom

**Branch**: `038-fixed-marker-size` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/038-fixed-marker-size/spec.md`

## Summary

Reduzir pins (locais + grupo) e nós do digitizer para ~≤60% da área de ecrã actual, e **compensar o zoom** de `react-zoom-pan-pinch` para o tamanho aparente no ecrã ficar estável. Ênfase seleccionado/hover mantém `scale` relativo ao novo base. Linhas de rota/segmento podem continuar a escalar (já usam `vectorEffect` onde aplicável). Sem alterações de dados.

## Technical Context

**Language/Version**: TypeScript / React 19 / CSS

**Primary Dependencies**: `react-zoom-pan-pinch` (`CampaignMap`, `RouteDigitizerView`); CSS de pins/party/`__wp`

**Storage**: N/A

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (desktop + móvel)

**Project Type**: Web application (apresentação de mapa)

**Performance Goals**: Actualizar variável de zoom no evento de transform sem jank perceptível

**Constraints**:
- Área base ≤ ~60% da actual (FR-001–003)
- Tamanho ecrã estável no zoom (FR-004, SC-003)
- Mapa + digitizer (FR-009)
- Selecção/hover com scale perceptível no base novo (FR-006, FR-010)
- Sem rewrite de coordenadas (FR-008)

**Scale/Scope**: `CampaignMap.tsx`/`.css`, `RouteDigitizerView.tsx`/`RouteDigitizer.css`; legendas opcionais; não alterar `RouteOverlay` (só linhas)

## Constitution Check

| Gate | Status |
|------|--------|
| Só apresentação / CSS+hook de zoom | PASS |
| Clarifications fechadas | PASS |
| Sem API/BD | PASS |

**Post-design re-check**: PASS — UI contract; data-model de tokens/zoom; sem HTTP.

## Project Structure

### Documentation (this feature)

```text
specs/038-fixed-marker-size/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-fixed-marker-size.md
└── tasks.md
```

### Source Code

```text
frontend/src/components/map/
├── CampaignMap.tsx      # publicar --map-zoom (ou similar) a partir do transform
└── CampaignMap.css      # base menor + counter-scale nos pins/party

frontend/src/components/gm/
├── RouteDigitizerView.tsx
└── RouteDigitizer.css   # __wp menor + counter-scale
```

**Structure Decision**: Counter-scale via CSS variable alimentada pelo estado de zoom do `TransformWrapper` (mapa e digitizer). Reduzir dimensões base (~0.775 linear ≈ 60% área). Manter `scale(1.2/1.3)` de hover/selected **depois** da compensação de zoom.

## Complexity Tracking

Sem violações. Alternativa “markers fora do TransformComponent” rejeitada por complexidade de hit-testing/posicionamento.
