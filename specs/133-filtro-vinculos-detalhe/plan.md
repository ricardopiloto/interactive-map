# Implementation Plan: Filtro de tipo de vínculo no painel de detalhe (Relações)

**Branch**: `133-filtro-vinculos-detalhe` | **Date**: 2026-09-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/133-filtro-vinculos-detalhe/spec.md`

## Summary

`PersonagemDetailBody` (componente que renderiza o painel de detalhe de um personagem selecionado) recebe `vinculos` já prontos do pai e monta `sortedVinculos` só ordenando, sem filtro. A correção: um filtro por tipo **local** a `PersonagemDetailBody`, reaproveitando `VINCULO_TIPOS`/`getVinculoTipoLabel`/`vinculoStyle` já existentes — sem tocar em `activeTipos` (o filtro do grafo geral, que vive no componente pai `RelacoesPage`). Pra satisfazer FR-004 (resetar ao trocar de personagem) sem lógica extra, o call site de `PersonagemDetailBody` ganha `key={personagem.id}` — React remonta o componente ao trocar de pessoa, e um `useState` local começa sempre limpo, de graça.

## Technical Context

**Language/Version**: TypeScript/React 19

**Primary Dependencies**: Nenhuma nova — reaproveita `VINCULO_TIPOS`, `getVinculoTipoLabel`, `vinculoStyle`, `SegmentedControl`/`Chip` já existentes em `components/ui`

**Storage**: N/A

**Testing**: Quickstart manual (Constitution II permite pra UI de polimento)

**Target Platform**: Frontend web, painel de detalhe de personagem em `/c/:slug/relacoes`

**Project Type**: Frontend web application

**Performance Goals**: N/A — filtragem em memória sobre uma lista já pequena (vínculos de uma pessoa)

**Constraints**: Filtro MUST ser estado independente de `activeTipos` (FR-002); MUST resetar ao trocar de personagem (FR-004); vínculo duas-vias MUST contar como visível se qualquer um dos dois sentidos bater com o filtro (FR-006)

**Scale/Scope**: Um componente (`PersonagemDetailBody`, dentro de `RelacoesPage.tsx`), um estado novo, um controle de UI novo

## Constitution Check

- **I. Isolamento**: PASS / N/A.
- **II. Testes primeiro**: PASS. UI de polimento — quickstart manual é suficiente.
- **III. Produção legada**: PASS / N/A.
- **IV. Simplicidade**: PASS. Reaproveita tipos/labels/estilos já existentes; sem dependência nova.
- **V. i18n**: GATE — se o controle de filtro precisar de rótulo próprio (ex. "Filtrar por tipo"), a chave nova MUST existir em pt-BR e en. Os nomes dos tipos em si já são traduzidos (`getVinculoTipoLabel`).
- **VI. Migrações**: PASS / N/A.

## Project Structure

### Documentation (this feature)

```text
specs/133-filtro-vinculos-detalhe/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md                    # Created by speckit-tasks, not this phase
```

### Source Code (repository root)

```text
frontend/src/
├── pages/RelacoesPage.tsx           # PersonagemDetailBody ganha filtro local; call site ganha key={personagem.id}
└── locales/{pt-BR,en}/relacoes.json # rótulo do controle de filtro, se precisar de texto novo
```

**Structure Decision**: Mudança concentrada em `PersonagemDetailBody` (dentro de `RelacoesPage.tsx`) — nenhum outro arquivo de lógica muda. `activeTipos`/o filtro do grafo geral permanecem exatamente como estão, sem nenhuma leitura cruzada.

## Complexity Tracking

Nenhuma violação de constituição, nenhuma dependência nova.
