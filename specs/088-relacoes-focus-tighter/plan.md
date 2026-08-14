# Implementation Plan: Anel de foco ainda mais compacto (>6 conexões)

**Branch**: `088-relacoes-focus-tighter` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/088-relacoes-focus-tighter/spec.md`

**Release**: Codex **0.18.2** (patch — folga interior de foco >6: 160→112; vista geral e ≤6 intactos)

## Summary

Com personagem seleccionado e **>6** conexões directas visíveis, a folga do anel interior passa a **70%** da compactação 086 (**160 → 112**). Discos, nomes e **textos dos vínculos** nas linhas têm de continuar legíveis; se 112 os tapar, sobe-se a folga (FR-003). Vista geral (087, 120) e anel interior com ≤6 (240) **não mudam**. Sem backend. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript / React 19 / Vite 8 (frontend)  
**Primary Dependencies**: `graphLayout.ts` (`compactInnerSpacing`), `GraphStage.tsx` (já chama a função)  
**Storage**: N/A  
**Testing**: Quickstart manual (`/relacoes`); `npm run build`  
**Target Platform**: Web Codex — aba Relações  
**Project Type**: Frontend layout + doc  
**Performance Goals**: Mesmo recálculo de anéis; só muda o valor de `innerSpacing` quando `directIds.size > 6`  
**Constraints**: Clarification 2026-08-14 — −30% da folga compacta 086; textos de vínculo legíveis; não tocar na vista geral nem no anel exterior  
**Scale/Scope**: 1 função de layout + manual + CHANGELOG 0.18.2  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (−30% + textos de vínculo): **PASS**
- Sem migração / sem API: **PASS**
- Vista geral / 087 intacta: **PASS** — FR-004
- Limiar >6 e ≤6 intactos: **PASS** — FR-002 / FR-005
- Sem mecânicas de sistema: **PASS**

**Post-Phase 1**: Unchanged. `compactInnerSpacing` → 112 sem clamp a 120; `OVERVIEW_SPACING` permanece 120; contrato e quickstart cobrem 4 vs 8 vs 12 conexões e leitura dos rótulos nas linhas.

## Project Structure

### Documentation (this feature)

```text
specs/088-relacoes-focus-tighter/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-focus-inner-spacing.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/relacoes/graphLayout.ts    # compactInnerSpacing * 0.7 → 112
frontend/src/components/relacoes/GraphStage.tsx    # sem mudança de chamada (já usa compactInnerSpacing)
docs/manual-relacoes.md
CHANGELOG.md / README.md / frontend/package.json
backend/pyproject.toml / specs/v2/README.md       # 0.18.2
```

**Structure Decision**: Apertar só o retorno de `compactInnerSpacing`. Não passar 112 para `computeInitialLayout` nem para o anel exterior do foco.

## Complexity Tracking

> None.
