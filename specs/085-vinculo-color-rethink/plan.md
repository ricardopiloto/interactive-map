# Implementation Plan: Cores de Vínculo (Sangue, Inimizade, Adversário)

**Branch**: `085-vinculo-color-rethink` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/085-vinculo-color-rethink/spec.md`

**Release**: Codex **0.17.1** (patch — paleta visual; sem tipos nem dados novos)

## Summary

Ajustar o catálogo visual de três tipos na Rede de Relações: **Vínculo de Sangue** passa a vermelho escuro (borgonha `#9e2436`); **Inimizade** passa a magenta/fúcsia (`#d12d9a`); **Adversário** mantém cobre (`#c86b3c`). Fonte única `VINCULO_STYLES` — palco, chips, legenda e ficha já consomem o catálogo. Sem backend, sem migração. Documentar em `docs/feature-rede-relacoes.md` §6.

## Technical Context

**Language/Version**: TypeScript / React 19 / Vite 8 (frontend)  
**Primary Dependencies**: `frontend/src/components/relacoes/vinculoStyles.ts` (`VINCULO_STYLES`); consumidores `GraphStage`, `RelacoesSideColumn`, `RelacoesDetailPanel`, `vinculoDirection.ts`  
**Storage**: N/A — cor não é persistida; IDs de tipo inalterados  
**Testing**: Quickstart manual no palco (três tipos + duas vias + regressão dos cinco); `npm run build`  
**Target Platform**: Web Codex — aba Relações (fundo Nocturne `#161826`)  
**Project Type**: Frontend visual + doc de produto  
**Performance Goals**: Sem impacto — 2 strings hex no catálogo  
**Constraints**: Clarifications 2026-08-13 (2/2); só três tipos; Adversário permanece cobre; exact hex nesta research  
**Scale/Scope**: 1 ficheiro de estilo + 1 doc produto + CHANGELOG/versão 0.17.1  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (2/2): **PASS** — Inimizade magenta; Adversário cobre
- Catálogo único (sem paleta paralela): **PASS** — só `VINCULO_STYLES`
- Sem migração / sem novos tipos: **PASS** — FR-006
- Cinco tipos fora de âmbito intactos: **PASS** — FR-005
- Sem mecânicas de sistema: **PASS**

**Post-Phase 1**: Unchanged. Hex fixados em research; contrato UI lista os 8 estilos; quickstart cobre palco, chips, duas vias e doc.

## Project Structure

### Documentation (this feature)

```text
specs/085-vinculo-color-rethink/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-vinculo-palette.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/relacoes/vinculoStyles.ts   # VINCULO_STYLES hex (2 mudanças; adversario igual)
docs/feature-rede-relacoes.md                       # §6 tabela de tipos
CHANGELOG.md / README.md / frontend/package.json
backend/pyproject.toml / specs/v2/README.md        # 0.17.1
```

Consumidores **sem alteração de código** se o catálogo for a fonte única: `GraphStage.tsx`, `RelacoesSideColumn.tsx`, `RelacoesDetailPanel.tsx`, `vinculoDirection.ts`.

**Structure Decision**: Uma alteração no record `VINCULO_STYLES`; documentação de produto alinhada. Backend e enum de tipos não entram.

## Complexity Tracking

> None.
