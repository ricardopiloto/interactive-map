# Implementation Plan: Hover no token do personagem destaca seus vínculos (Relações)

**Branch**: `135-hover-token-destaca-vinculos` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/135-hover-token-destaca-vinculos/spec.md`

**Backlog**: [BKLG-024](../../docs/v2/backlog.md#bklg-024-design--hover-no-token-do-personagem-grafo-de-relações-não-destaca-os-vínculos-dele)

## Summary

A infra de destaque por hover já existe: `hoveredId` em `RelacoesPage` → prop `hoveredId` em `GraphStage` → `previewId` / `isPreviewEdge` / `graph-node--preview`. Hoje só a lista lateral chama `setHoveredId`. Esta feature adiciona `onPointerEnter`/`onPointerLeave` nos tokens (`.graph-node`) e um callback opcional (ex. `onHoverPersonagem`) ligado ao mesmo `setHoveredId` — sem novo efeito visual nem estado paralelo.

## Technical Context

**Language/Version**: TypeScript / React 19 (frontend Vite)

**Primary Dependencies**: Nenhuma nova — reaproveita `hoveredId` / `previewId` já em `RelacoesPage.tsx` + `GraphStage.tsx`

**Storage**: N/A

**Testing**: Quickstart manual (Constitution II — UI de polimento MAY)

**Target Platform**: Canvas do grafo em `/c/:slug/relacoes` (desktop pointer; touch sem hover = N/A, igual à lista)

**Project Type**: Frontend web application

**Performance Goals**: N/A — setState de hover em tempo real, sem debounce (paridade com a lista)

**Constraints**: MUST reutilizar o mesmo estado/mecanismo da lista (FR-001/003); MUST NOT inventar segundo canal de preview; hover no token MUST NOT quebrar seleção clicada de forma diferente do que o hover da lista já faz

**Scale/Scope**: `GraphStage` (handlers + prop) + wiring em `RelacoesPage` (uma linha)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: PASS / N/A — sem rota API.
- **II. Testes primeiro**: PASS — UI de polimento; [quickstart.md](./quickstart.md).
- **III. Produção legada**: PASS / N/A.
- **IV. Simplicidade**: PASS — um callback + dois handlers; zero deps novas.
- **V. i18n**: PASS / N/A — sem copy nova.
- **VI. Migrações**: PASS / N/A.

**Post-design re-check**: Inalterado — só gatilho UI sobre mecanismo existente.

## Project Structure

### Documentation (this feature)

```text
specs/135-hover-token-destaca-vinculos/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── graph-token-hover.md
└── tasks.md             # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
frontend/src/
├── pages/RelacoesPage.tsx
│   # Plugar onHoverPersonagem={setHoveredId} (ou wrapper) no <GraphStage />
└── components/relacoes/GraphStage.tsx
    # Prop onHoverPersonagem?; onPointerEnter/Leave em .graph-node
```

**Structure Decision**: Mudança mínima em dois ficheiros já ligados. Sem helper novo salvo se o tipo do callback precisar de export partilhado (não esperado).

## Complexity Tracking

Nenhuma violação.
