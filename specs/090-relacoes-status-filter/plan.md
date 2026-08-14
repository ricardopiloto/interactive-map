# Implementation Plan: Filtro de estado na Rede de Relações

**Branch**: `090-relacoes-status-filter` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/090-relacoes-status-filter/spec.md`

**Release**: Codex **0.19.0** (minor — filtro de estado na coluna; palco e lista; recálculo de anéis)

## Summary

Na coluna, **junto a Isolar selecção**, um `<select>` de escolha única: **Todos** (omissão) | **Vivos** | **Mortos** | **Desconhecidos** | **Desaparecido**. Palco e lista usam só quem passa no filtro; os anéis **recalculam-se** com esse conjunto. Isolar continua a esconder no sítio por cima. Sem backend. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript / React 19 / Vite 8 (frontend)  
**Primary Dependencies**: `RelacoesPage`, `RelacoesSideColumn`, `GraphStage`; i18n `relacoes` + `comum.status.*`  
**Storage**: N/A (estado de sessão; não persiste)  
**Testing**: Quickstart manual (`/relacoes`); `npm run build`  
**Target Platform**: Web Codex — aba Relações  
**Project Type**: Frontend UI + layout + i18n + doc  
**Performance Goals**: Mesmo recálculo de anéis; conjunto típico de dezenas de fichas  
**Constraints**: Clarifications — cinco opções; recálculo sem buracos; Isolar depois do filtro; sem API  
**Scale/Scope**: helper + coluna + página + i18n + manual + CHANGELOG 0.19.0  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (cinco opções + recálculo): **PASS**
- Sem migração / sem API: **PASS**
- Visibilidade GM/jogador intacta: **PASS** — FR não revela ocultos
- Sem mecânicas de sistema: **PASS**

**Post-Phase 1**: Unchanged. Conjunto filtrado na página alimenta palco e lista; `GraphStage` não precisa de um segundo caminho de «esconder no sítio» para o estado.

## Project Structure

### Documentation (this feature)

```text
specs/090-relacoes-status-filter/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-status-filter.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/relacoes/statusFilter.ts      # tipo + matchesStatusFilter
frontend/src/pages/RelacoesPage.tsx                   # estado, conjunto visível, desseleccionar
frontend/src/components/relacoes/RelacoesSideColumn.tsx/.css
frontend/src/locales/pt-BR/relacoes.json
frontend/src/locales/en/relacoes.json
docs/manual-relacoes.md
CHANGELOG.md / README.md / manifests / specs/v2/README.md
```

**Structure Decision**: Filtrar o array na página e passá-lo ao palco e à lista. O recálculo de anéis sai de graça (`computeInitialLayout` / `computeFocusLayout` já só vêem esse array). Isolar permanece em `GraphStage`.

## Complexity Tracking

> None.
