# Implementation Plan: Anel de foco mais aberto (≤3 conexões)

**Branch**: `089-relacoes-few-spread` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/089-relacoes-few-spread/spec.md`

**Release**: Codex **0.18.3** (patch — folga interior de foco ≤3: 240→312; 4–6 e >6 intactos)

## Summary

Com personagem seleccionado e **≤3** conexões directas visíveis, a folga do anel interior passa a **130%** da padrão (**240 → 312**). Casos **4–6** continuam 240; **>6** continua a compactação 088; vista geral 087 (120) e anel exterior (240) **não mudam**. Sem backend. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript / React 19 / Vite 8 (frontend)  
**Primary Dependencies**: `graphLayout.ts` (nova `focusInnerSpacing` / `sparseInnerSpacing`), `GraphStage.tsx` (escolher `innerSpacing`)  
**Storage**: N/A  
**Testing**: Quickstart manual (`/relacoes`); `npm run build`  
**Target Platform**: Web Codex — aba Relações  
**Project Type**: Frontend layout + doc  
**Performance Goals**: Mesmo recálculo de anéis; só muda `innerSpacing` quando `directIds.size` está em 1–3  
**Constraints**: +30% da folga padrão de foco; não tocar em 4–6, compactação >6, vista geral, anel exterior  
**Scale/Scope**: 1 função de layout + 1 chamada + manual + CHANGELOG 0.18.3  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (≤3 / +30% / 4–6 / >6): **PASS**
- Sem migração / sem API: **PASS**
- Vista geral / 087 intacta: **PASS** — FR-004
- Compactação 088 intacta: **PASS** — FR-003
- Sem mecânicas de sistema: **PASS**

**Post-Phase 1**: Unchanged. `focusInnerSpacing` ramifica ≤3 / 4–6 / >6; `OVERVIEW_SPACING` 120; `compactInnerSpacing` não se altera; quickstart cobre 2 vs 5 vs 8.

## Project Structure

### Documentation (this feature)

```text
specs/089-relacoes-few-spread/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-focus-sparse-spacing.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/relacoes/graphLayout.ts    # SPARSE_* + focusInnerSpacing
frontend/src/components/relacoes/GraphStage.tsx    # innerSpacing = focusInnerSpacing(...)
docs/manual-relacoes.md
CHANGELOG.md / README.md / frontend/package.json
backend/pyproject.toml / specs/v2/README.md       # 0.18.3
```

**Structure Decision**: Um selector de folga interior no cliente. Não passar 312 para `computeInitialLayout` nem para o anel exterior.

## Complexity Tracking

> None.
