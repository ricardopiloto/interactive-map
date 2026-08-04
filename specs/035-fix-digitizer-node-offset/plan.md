# Implementation Plan: Corrigir offset dos nós ao traçar segmentos

**Branch**: `035-fix-digitizer-node-offset` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/035-fix-digitizer-node-offset/spec.md`

## Summary

Na **Rede de rotas** (Traçar segmento / Colocar nó), os marcadores de nó aparecem desalinhados do mapa — o utilizador associa ao offset tipo 030. A 034 só reverteu pins no `CampaignMap`. No digitizer, os nós já usam âncora centrada (`margin: -7px`), mas o **palco** usa `aspect-ratio` fixo + `object-fit: cover` na imagem, enquanto o mapa da campanha dimensiona o stage pela imagem. Isso pode desalinear arte do mapa vs coordenadas 0–1. Objectivo: unificar o espaço de coordenadas do digitizer com a imagem visível (clique, marcador e linhas no mesmo referencial), sem reactivar 030 no mapa principal e sem reescrever coords na BD.

## Technical Context

**Language/Version**: TypeScript / React / CSS (frontend)

**Primary Dependencies**: `RouteDigitizerView.tsx`, `RouteDigitizer.css`; `react-zoom-pan-pinch`

**Storage**: N/A (sem migration; coords de waypoint inalteradas)

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos

**Project Type**: Web application (alinhamento visual GM digitizer)

**Performance Goals**: Inalterado

**Constraints**:
- Nós alinhados em Traçar segmento + Colocar nó / idle (FR-001–002)
- Zoom/pan OK (FR-003)
- Sem rewrite em massa de `x/y` (FR-004)
- Segmentos/rascunhos coerentes (FR-005)
- Campaign pins / 034 intactos (FR-007)

**Scale/Scope**: `frontend/src/components/gm/RouteDigitizerView.tsx`, `RouteDigitizer.css` (+ quickstart); não tocar `CampaignMap` salvo regressão

## Constitution Check

| Gate | Status |
|------|--------|
| Só apresentação / layout digitizer | PASS |
| Sem alterar dados persistidos | PASS |
| Não reactivar visual 030 na campanha | PASS |
| Clique e marcador no mesmo referencial | PASS |

**Post-design re-check**: PASS — UI contract; data-model = referencial de coords; sem API.

## Project Structure

### Documentation (this feature)

```text
specs/035-fix-digitizer-node-offset/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-digitizer-node-align.md
└── tasks.md
```

### Source Code

```text
frontend/src/components/gm/
├── RouteDigitizerView.tsx   # clique relativo; possível medir caixa da imagem
└── RouteDigitizer.css       # stage/imagem/wp — alinhar espaço visual às coords
```

**Structure Decision**: Corrigir o **referencial** stage↔imagem no digitizer (causa provável). Manter marcadores centrados; não copiar âncora de pin da campanha.

## Complexity Tracking

Sem violações. Se `object-fit: cover` + aspect fixo for a causa, a correção é CSS/layout (+ ajuste de hit-test se a caixa útil mudar).
