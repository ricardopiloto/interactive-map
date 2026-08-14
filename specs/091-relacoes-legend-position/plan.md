# Implementation Plan: Legenda da Rede no mesmo sítio que no mapa

**Branch**: `091-relacoes-legend-position` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/091-relacoes-legend-position/spec.md`

**Release**: Codex **0.19.1** (patch — chave da Rede no palco, canto inferior esquerdo)

## Summary

A chave PJ/NPC + tipos de vínculo **sai da coluna** e passa a overlay **fixa** no canto inferior esquerdo do palco (`GraphStage`), o mesmo canto que a do mapa. Lista **vertical** compacta, **sem fundo**, **opacidade ~0,55**, **sem título**, `pointer-events: none` para cliques/hover/arrasto irem ao grafo. Zoom permanece à direita. Sem backend. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript / React 19 / Vite 8 (frontend)  
**Primary Dependencies**: `GraphStage`, `RelacoesSideColumn`; i18n `relacoes` + `comum.tipo.*` + `vinculoTipo`  
**Storage**: N/A  
**Testing**: Quickstart manual (`/relacoes` vs `/mapa`); `npm run build`  
**Target Platform**: Web Codex — aba Relações  
**Project Type**: Frontend UI + CSS overlay + doc  
**Performance Goals**: Overlay estática; zero impacto no layout de anéis  
**Constraints**: Clarify — vertical compacta; sem placa; opacidade reduzida; gestos atravessam; não alterar a legenda do mapa nem 088–089  
**Scale/Scope**: mover markup + CSS; manual + CHANGELOG 0.19.1  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (forma + gestos): **PASS**
- Sem migração / sem API: **PASS**
- Visibilidade GM/jogador intacta: **PASS**
- Sem mecânicas de sistema: **PASS**
- Layout 087–089 intacto: **PASS** — overlay fora de `__world`

**Post-Phase 1**: Unchanged. Markup da chave no palco (irmão do zoom); coluna perde o bloco. Sem estado novo.

## Project Structure

### Documentation (this feature)

```text
specs/091-relacoes-legend-position/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-legend-overlay.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/relacoes/GraphStage.tsx/.css   # overlay no palco
frontend/src/components/relacoes/RelacoesSideColumn.tsx/.css  # remover bloco
docs/manual-relacoes.md
CHANGELOG.md / README.md / manifests / specs/v2/README.md
```

**Structure Decision**: Renderizar a chave como irmão de `.graph-stage__zoom` (não dentro de `__world`). Remover `.relacoes-side__legend`. Reutilizar `VINCULO_TIPOS` / estilos / i18n já usados na coluna.

## Complexity Tracking

> None.
