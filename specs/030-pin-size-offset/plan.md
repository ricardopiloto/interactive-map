# Implementation Plan: Tamanho e alinhamento dos pins

**Branch**: `030-pin-size-offset` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/030-pin-size-offset/spec.md` (clarificações: alinhamento em todos os viewports; redução móvel ~15–25%).

## Summary

Corrigir o desvio lateral dos pins de local e do marcador do grupo em **todos** os viewports (âncora visual = coordenadas), e reduzir modestamente o tamanho dos pins no breakpoint móvel da app (~15–25%). Alteração apenas de apresentação CSS no mapa de campanha; sem API, dados ou digitizer.

## Technical Context

**Language/Version**: TypeScript / CSS (frontend existente)

**Primary Dependencies**: React SPA; `CampaignMap.css` (+ eventual ajuste mínimo em `CampaignMap.tsx` só se necessário)

**Storage**: N/A (coordenadas inalteradas)

**Testing**: Validação visual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (desktop + móvel / DevTools)

**Project Type**: Web application (ajuste visual do mapa)

**Performance Goals**: Inalterado

**Constraints**:
- Alinhamento tip/âncora em todos os viewports (clarificação)
- Móvel: redução ~15–25%; toque preservado
- Breakpoint alinhado a `MOBILE_BP` (800) em `MapPage.tsx`, não ao media 720px só de controles/legenda
- Hover/seleção com scale não deve reintroduzir desvio lateral
- Fora de escopo: nós da Rede de rotas; redução obrigatória da legenda

**Scale/Scope**: Principalmente `frontend/src/components/map/CampaignMap.css`; possível constante CSS compartilhada

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder. Gates informais:

| Gate | Status |
|------|--------|
| Escopo só apresentação do mapa (pins + grupo) | PASS |
| Sem mudança de auth/dados/API | PASS |
| Clarificações respeitadas (all viewports; 15–25%) | PASS |
| YAGNI — sem refactor do motor de zoom | PASS |

**Post-design re-check**: PASS — UI contract + research; sem data model; quickstart cobre SC.

## Project Structure

### Documentation (this feature)

```text
specs/030-pin-size-offset/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-pin-size-offset.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/map/
├── CampaignMap.css          # âncora + tamanhos desktop/móvel (pins + party)
└── CampaignMap.tsx          # sem mudança esperada (left/top % já corretos)

frontend/src/pages/MapPage.tsx   # referência MOBILE_BP=800 (não editar salvo se extrair token partilhado)
```

**Structure Decision**: CSS cirúrgico no mapa; JSX só se for preciso expor variável/classe — preferir media query.

## Complexity Tracking

> Nenhuma violação de constituição a justificar.
