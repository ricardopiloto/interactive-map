# Implementation Plan: Vista geral mais compacta (Relações)

**Branch**: `087-relacoes-overview-compact` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/087-relacoes-overview-compact/spec.md`

**Release**: Codex **0.18.1** (patch — folga da vista geral 240→120; foco intacto)

## Summary

Na vista **sem selecção**, PJs e NPCs usam folga **120** (chão de não-sobreposição já usado na 086). O anel de NPCs aproxima-se dos PJs e o grafo típico cabe no zoom mínimo. O layout de **foco** continua com `espacamento` 240 e compactação interior >6. Sem backend. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript / React 19 / Vite 8 (frontend)  
**Primary Dependencies**: `graphLayout.ts` (`computeInitialLayout`), `GraphStage.tsx`  
**Storage**: N/A  
**Testing**: Quickstart manual (`/relacoes`); `npm run build`  
**Target Platform**: Web Codex — aba Relações  
**Project Type**: Frontend layout + doc  
**Performance Goals**: Mesmo recálculo de anéis; só muda o `spacing` da vista geral  
**Constraints**: Clarification 2026-08-14 — não-sobreposição prevalece sobre caber no ecrã; não baixar `MIN_SCALE`; não tocar no foco  
**Scale/Scope**: 2 ficheiros de layout + manual + CHANGELOG 0.18.1  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (chão de não-sobreposição): **PASS**
- Sem migração / sem API: **PASS**
- Foco / 086 intactos: **PASS** — FR-004
- Dois anéis PJ/NPC: **PASS** — FR-005
- Sem mecânicas de sistema: **PASS**

**Post-Phase 1**: Unchanged. `OVERVIEW_SPACING = 120` fixado; contrato separa vista geral vs foco; quickstart cobre 12 NPCs, overlap e regressão 4/8 conexões.

## Project Structure

### Documentation (this feature)

```text
specs/087-relacoes-overview-compact/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-overview-spacing.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/relacoes/graphLayout.ts    # OVERVIEW_SPACING
frontend/src/components/relacoes/GraphStage.tsx    # computeInitialLayout(..., OVERVIEW_SPACING)
docs/manual-relacoes.md
CHANGELOG.md / README.md / frontend/package.json
backend/pyproject.toml / specs/v2/README.md       # 0.18.1
```

**Structure Decision**: Uma constante e uma chamada. Backend não entra.

## Complexity Tracking

> None.
