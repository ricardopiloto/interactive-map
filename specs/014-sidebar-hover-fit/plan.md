# Implementation Plan: Hover no item do menu e ajuste da busca

**Branch**: `014-sidebar-hover-fit` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-sidebar-hover-fit/spec.md` (fundo sutil nos cartões Locais jogador; busca contida na largura do menu).

## Summary

No modo jogador, cartões da aba Locais ganham **hover com fundo sutil** (sem alterar o destaque do pin). O campo `.side-menu__search` é corrigido para não extravasar a largura do menu. CSS-only / markup mínimo em `SideMenu`; sem backend.

## Technical Context

**Language/Version**: TypeScript / React

**Primary Dependencies**: `SideMenu` + `SideMenu.css`; tokens Nocturne (`.card`, `.input`)

**Storage**: N/A

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (Codex)

**Project Type**: Web application (UX do menu lateral)

**Performance Goals**: Hover instantâneo (&lt; 100 ms percebido); sem jank de layout

**Constraints**:
- Fundo sutil só em cartões Locais (jogador)
- Pin hover (005) permanece
- Busca contida na largura do painel
- Sem API/dados

**Scale/Scope**: `SideMenu.css` (+ ajuste pontual em `SideMenu.tsx` se wrapper for necessário)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Escopo só UX do menu lateral | PASS |
| Sem schema/API | PASS |
| Preserva hover do pin e busca funcional | PASS |
| GM admin fora do hover de cartão | PASS |

**Post-design re-check**: PASS — UI contract; data-model só estado visual CSS/hover.

## Project Structure

### Documentation (this feature)

```text
specs/014-sidebar-hover-fit/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-sidebar-hover-fit.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/
├── components/sidebar/
│   ├── SideMenu.tsx    # cartões Locais (já com onMouseEnter pin); wrapper busca se preciso
│   └── SideMenu.css    # :hover fundo sutil; layout do search
└── styles/
    └── nocturne.css    # .input width 100% — não quebrar globalmente; override local
```

**Structure Decision**: Preferir regras em `SideMenu.css` (`.side-menu__card-btn.card:hover` / `.side-menu__search`); evitar mudar `.input` global.

## Complexity Tracking

> Nenhuma violação a justificar.
