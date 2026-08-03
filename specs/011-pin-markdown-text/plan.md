# Implementation Plan: Texto do pin em Markdown

**Branch**: `011-pin-markdown-text` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-pin-markdown-text/spec.md` (clarificações: sem preview GM; sem imagens MD; links http/https em nova aba).

## Summary

A descrição do local (`descricao`) continua sendo uma string livre no backend; na **leitura** do pin (`PinModal`) o frontend renderiza Markdown seguro (ênfase, listas, títulos, links `http`/`https`). No formulário GM, o mesmo textarea aceita texto ou Markdown, com hint de suporte e **sem** preview. Sem migração de schema; NPC/arco inalterados.

## Technical Context

**Language/Version**: TypeScript / React (frontend); backend inalterado para esta feature

**Primary Dependencies**: React SPA; biblioteca Markdown + sanitização no cliente (ver [research.md](./research.md))

**Storage**: N/A — reutiliza `Local.descricao` (texto) já existente

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (Codex)

**Project Type**: Web application (UI + conteúdo)

**Performance Goals**: Render da descrição &lt; 2s ao abrir o modal (SC-001); payload inalterado

**Constraints**:
- Sem preview / botão pré-visualizar no form GM (FR-006)
- Sem render de imagens Markdown (FR-010)
- Links só http/https, nova aba; bloquear `javascript:` etc. (FR-011)
- Sem XSS via HTML/script (FR-007)
- Escopo: só descrição de local / PinModal (FR-009)

**Scale/Scope**: `PinModal` (+ CSS); componente reutilizável de Markdown seguro; hint em `LocalFormDialog`; dependência npm; sem mudanças API/DB

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder. Gates informais:

| Gate | Status |
|------|--------|
| Escopo só descrição do local na leitura do pin | PASS |
| Sem mudança obrigatória de schema/API | PASS |
| Segurança de render (sanitize / sem imagens / links seguros) | PASS |
| Sem preview GM (clarificação) | PASS |

**Post-design re-check**: PASS — UI contract documenta render + política de links/imagens; data-model confirma campo existente.

## Project Structure

### Documentation (this feature)

```text
specs/011-pin-markdown-text/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-pin-markdown.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/
├── package.json             # deps Markdown + sanitize
└── src/
    ├── components/
    │   ├── common/
    │   │   ├── PinModal.tsx           # usar MarkdownSafe em vez de texto cru
    │   │   ├── PinModal.css           # estilos tipográficos do conteúdo MD
    │   │   └── MarkdownSafe.tsx       # novo: parse + políticas FR-007/010/011
    │   └── admin/
    │       └── LocalFormDialog.tsx    # hint “Markdown opcional” no label
    └── (sem alteração de types — descricao já é string)
```

**Structure Decision**: Renderização só no cliente na leitura; extrair `MarkdownSafe` para isolar sanitização e facilitar testes manuais / reuso futuro (NPC fora de escopo agora).

## Complexity Tracking

> Nenhuma violação de constituição a justificar.
