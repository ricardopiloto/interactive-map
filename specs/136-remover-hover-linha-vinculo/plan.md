# Implementation Plan: Remover destaque de hover na linha de vínculo (Relações)

**Branch**: `136-remover-hover-linha-vinculo` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/136-remover-hover-linha-vinculo/spec.md`

**Backlog**: [BKLG-025](../../docs/backlog/backlog.md#bklg-025-design--remover-destaque-ao-passar-o-mouse-sobre-uma-linha-de-vínculo-grafo-de-relações)

## Summary

Em `GraphStage`, o hit-path `graph-stage__edge-hit` seta `hoveredEdgeId` em `onPointerEnter`/`Leave`, e `midLabelVisible = highlighted || hoveredEdgeId === v.id` mostra o rótulo do tipo só por passar o mouse na linha. Remover o estado `hoveredEdgeId` e esses handlers; `midLabelVisible` passa a ser só `highlighted` (foco por selecção/preview de personagem). Manter `onClick` no hit-path intacto (FR-003).

## Technical Context

**Language/Version**: TypeScript / React 19 (frontend Vite)

**Primary Dependencies**: Nenhuma nova — remoção de estado/handlers locais em `GraphStage.tsx`

**Storage**: N/A

**Testing**: Quickstart manual (Constitution II — UI de polimento MAY)

**Target Platform**: Arestas do grafo em `/c/:slug/relacoes`

**Project Type**: Frontend web application

**Performance Goals**: N/A — menos setState em pointer move

**Constraints**: MUST NOT remover o hit-path nem o `onClick` de edição; MUST manter rótulos quando `highlighted` (selecção / preview via `hoveredId` de personagem); MUST NOT tocar no hover de token (spec 135)

**Scale/Scope**: Um ficheiro — `frontend/src/components/relacoes/GraphStage.tsx`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: PASS / N/A — sem rota API.
- **II. Testes primeiro**: PASS — UI de polimento; [quickstart.md](./quickstart.md).
- **III. Produção legada**: PASS / N/A.
- **IV. Simplicidade**: PASS — delete code; zero deps.
- **V. i18n**: PASS / N/A — sem copy nova/removida da UI de produto (rótulos de tipo já existentes).
- **VI. Migrações**: PASS / N/A.

**Post-design re-check**: Inalterado — só remoção de efeito visual local.

## Project Structure

### Documentation (this feature)

```text
specs/136-remover-hover-linha-vinculo/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── edge-hover-removed.md
└── tasks.md             # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
frontend/src/components/relacoes/GraphStage.tsx
  # Remover useState hoveredEdgeId; remover onPointerEnter/Leave do edge-hit;
  # midLabelVisible = highlighted; preservar onClick + strokeWidth hit area
```

**Structure Decision**: Mudança isolada num componente. Sem CSS novo. Sem alterações em `RelacoesPage`.

## Complexity Tracking

Nenhuma violação.
