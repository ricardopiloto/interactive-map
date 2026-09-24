# Implementation Plan: Botão "1:1" ajusta a tela pra mostrar todos os tokens (Relações)

**Branch**: `139-zoom-fit-grafo-relacoes` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/139-zoom-fit-grafo-relacoes/spec.md`

**Backlog**: [BKLG-028](../../docs/v2/backlog.md#bklg-028-bugdesign--botão-11-no-grafo-de-relações-não-ajusta-a-tela-para-mostrar-todos-os-tokens)

## Summary

`resetView()` hoje faz `setScale(1)` + `setPan({0,0})` — reset literal, não “caber tudo”. Substituir por fit-to-view: bounding box dos tokens **visíveis** (`isVisible` + `NODE_W`/`NODE_H`), escala = `min(usableW/contentW, usableH/contentH)` com padding, `clampScale` entre `MIN_SCALE`/`MAX_SCALE`, **sem zoom-in acima de 1** (só afasta se preciso), e `pan = -scale * contentCenter` dado o transform actual `translate(viewportCenter + pan) scale(scale)` com origem `(0,0)`. Rótulo hardcoded `"1:1"` → chave i18n que reflicta “ajustar vista”.

## Technical Context

**Language/Version**: TypeScript / React 19 (frontend Vite)

**Primary Dependencies**: Nenhuma nova — geometria local; `NODE_W`/`NODE_H` já em `graphLayout.ts`

**Storage**: N/A

**Testing**: Quickstart manual (Constitution II — UI de polimento MAY); helper puro de fit MAY ter asserts manuais/snippet no quickstart

**Target Platform**: Canvas `.graph-stage` em `/c/:slug/relacoes` (respeitando área útil vs painel flutuante)

**Project Type**: Frontend web application

**Performance Goals**: N/A — O(n) sobre tokens visíveis no clique

**Constraints**: Só tokens visíveis (FR-002); respeitar `MIN_SCALE`/`MAX_SCALE` (FR-003); 0/1 token sem erro (FR-004); copy nova pt-BR+en (constituição V)

**Scale/Scope**: `GraphStage.tsx` (+ opcional helper em `graphLayout.ts`); locales `relacoes.json` pt-BR/en

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: PASS / N/A — sem rota API.
- **II. Testes primeiro**: PASS — UI de polimento; [quickstart.md](./quickstart.md).
- **III. Produção legada**: PASS / N/A.
- **IV. Simplicidade**: PASS — geometria local; zero deps.
- **V. i18n**: GATE — rótulo/aria do botão MUST ter chaves pt-BR e en (deixa de ser `"1:1"` literal).
- **VI. Migrações**: PASS / N/A.

**Post-design re-check**: PASS — contrato UI + chaves i18n documentados; sem schema/deps.

## Project Structure

### Documentation (this feature)

```text
specs/139-zoom-fit-grafo-relacoes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── fit-view-control.md
└── tasks.md             # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
frontend/src/
├── components/relacoes/GraphStage.tsx   # fitView substitui resetView; botão i18n
├── components/relacoes/graphLayout.ts   # (opcional) fitScalePan / bbox helpers puros
└── locales/{pt-BR,en}/relacoes.json     # graph.fitView (+ aria)
```

**Structure Decision**: Preferir helper puro em `graphLayout.ts` (bbox + scale/pan) testável/reutilizável; `GraphStage` só mede a área útil (reutilizar a mesma lógica do `measureUsableCenter` / painel) e aplica `setScale`/`setPan`.

## Complexity Tracking

Nenhuma violação.
