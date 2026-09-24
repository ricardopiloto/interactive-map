# Implementation Plan: Diminuir a distância entre tokens no grafo de Relações

**Branch**: `138-diminuir-distancia-tokens` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/138-diminuir-distancia-tokens/spec.md`

**Backlog**: [BKLG-027](../../docs/backlog/backlog.md#bklg-027-design--diminuir-a-distância-entre-os-tokens-no-grafo-de-relações-em-30)

## Summary

A folga entre tokens vem de duas bases numéricas: `OVERVIEW_SPACING` / `COMPACT_INNER_SPACING_MIN` (**120**, vista geral) e o default `espacamento` em `GraphStage` (**240**, anel de foco e input de `focusInnerSpacing`). Reduzir ambas em **~30%** (alvos: **84** e **168**) preserva a razão 1∶2 e os factores relativos 086–089 (`COMPACT_INNER_FACTOR`, `COMPACT_INNER_TIGHTEN`, `SPARSE_INNER_FACTOR`) sem os recalibrar. `ringMinRadius` continua a impedir sobreposição de caixas `NODE_W`×`NODE_H`.

## Technical Context

**Language/Version**: TypeScript / React 19 (frontend Vite)

**Primary Dependencies**: Nenhuma nova — só constantes em `graphLayout.ts` + default prop em `GraphStage.tsx`

**Storage**: N/A

**Testing**: Quickstart visual (Constitution II — UI de polimento MAY); opcional sanity aritmética dos helpers `focusInnerSpacing` / `compactInnerSpacing` / `sparseInnerSpacing`

**Target Platform**: Grafo em `/c/:slug/relacoes` (overview + foco)

**Project Type**: Frontend web application

**Performance Goals**: N/A — layout já O(n) em anéis

**Constraints**: ~30% na base (FR-001); não alterar factores relativos (FR-002); sem sobreposição de tokens (FR-003); não mexer em `MIN_SCALE`/`MAX_SCALE` (edge case zoom); valor final pode afinar ± poucos px após QA visual (assunção da spec)

**Scale/Scope**: 1–2 ficheiros (`graphLayout.ts`, `GraphStage.tsx`); sem backend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: PASS / N/A — sem rota API.
- **II. Testes primeiro**: PASS — UI de polimento; [quickstart.md](./quickstart.md).
- **III. Produção legada**: PASS / N/A.
- **IV. Simplicidade**: PASS — só constantes; zero deps.
- **V. i18n**: PASS / N/A.
- **VI. Migrações**: PASS / N/A.

**Post-design re-check**: Inalterado — design numérico local, sem schema/copy/deps.

## Project Structure

### Documentation (this feature)

```text
specs/138-diminuir-distancia-tokens/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── token-spacing-base.md
└── tasks.md             # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
frontend/src/components/relacoes/
├── graphLayout.ts    # COMPACT_INNER_SPACING_MIN / OVERVIEW_SPACING 120 → ~84
└── GraphStage.tsx    # default espacamento 240 → ~168
```

**Structure Decision**: Mudança concentrada nas constantes de espaçamento já centralizadas. Não reabrir specs 086–089 além de actualizar comentários que citam os valores antigos (120/240/312) se ficarem incorrectos.

## Complexity Tracking

Nenhuma violação.
