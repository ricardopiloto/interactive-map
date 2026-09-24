# Implementation Plan: Paridade de clique no filtro do painel de detalhe (Relações)

**Branch**: `134-paridade-clique-filtro-detalhe` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/134-paridade-clique-filtro-detalhe/spec.md`

**Backlog**: [BKLG-023](../../docs/backlog/backlog.md#bklg-023-bugdesign--filtro-do-painel-de-detalhe-relações-não-tem-paridade-de-clique-com-o-filtro-do-grafo-geral)

## Summary

O filtro de tipos do painel de detalhe (`PersonagemDetailBody`, spec 133) hoje faz `onClick → toggleDetailTipo` imediato, sem delay nem `onDoubleClick`. O filtro do grafo geral já usa `CHIP_CLICK_DELAY_MS` (280 ms) + `handleChipClick` / `handleChipDoubleClick` / `soloOrRestoreTipo`. Esta feature extrai essa mecânica para um helper/hook partilhado e liga os chips do detalhe à mesma API de interação — estados `activeTipos` e `activeDetailTipos` continuam independentes (FR-002 da 133).

## Technical Context

**Language/Version**: TypeScript / React 19 (frontend Vite)

**Primary Dependencies**: Nenhuma nova — reaproveita handlers já em `RelacoesPage.tsx` (`CHIP_CLICK_DELAY_MS`, delay + solo/restore)

**Storage**: N/A

**Testing**: Quickstart manual (Constitution II — UI de polimento MAY)

**Target Platform**: `/c/:slug/relacoes` — chips do grafo geral e chips do painel de detalhe

**Project Type**: Frontend web application (monorepo `frontend/` + `backend/`; só `frontend` muda)

**Performance Goals**: N/A — timers locais de 280 ms; limpeza no unmount

**Constraints**: Mesmo delay e mesma lógica isolar/restaurar nos dois filtros (FR-001–003); trocar personagem cancela clique pendente (FR-004); sem copy nova; sem API/schema

**Scale/Scope**: Um padrão de interação partilhado; dois call sites de chips em `RelacoesPage.tsx` (+ eventual ficheiro helper sob `components/relacoes/`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: PASS / N/A — sem rota API nova; só UI local.
- **II. Testes primeiro**: PASS — UI de polimento; validação por [quickstart.md](./quickstart.md).
- **III. Produção legada**: PASS / N/A — não toca instâncias pré-099.
- **IV. Simplicidade**: PASS — extrai mecânica já existente; zero dependência npm/Python nova.
- **V. i18n**: PASS / N/A — nenhuma copy nova (rótulos de tipo já via `getVinculoTipoLabel`).
- **VI. Migrações**: PASS / N/A — sem schema.

**Post-design re-check**: Inalterado — design não adiciona rotas, deps, copy nem migrações.

## Project Structure

### Documentation (this feature)

```text
specs/134-paridade-clique-filtro-detalhe/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── tipo-chip-click.md
└── tasks.md             # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
frontend/src/
├── pages/RelacoesPage.tsx
│   # Grafo: deixa de inline-ar delay/dblclick; usa helper partilhado
│   # PersonagemDetailBody: chips passam a onClick/onDoubleClick com a mesma mecânica
└── components/relacoes/   # (opcional) useVinculoTipoChipClicks.ts ou tipoChipClicks.ts
```

**Structure Decision**: Mudança concentrada em Relações. Preferir extrair helper/hook para `frontend/src/components/relacoes/` se o corpo de `RelacoesPage.tsx` já estiver saturado; senão, funções partilhadas no mesmo ficheiro desde que os dois call sites usem a mesma API. Sem backend.

## Complexity Tracking

Nenhuma violação; tabela vazia de propósito.
