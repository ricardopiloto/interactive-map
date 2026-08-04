# Implementation Plan: Scroll e busca no menu lateral

**Branch**: `037-side-menu-scroll-search` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/037-side-menu-scroll-search/spec.md`

## Summary

Corrigir o scroll do corpo do menu lateral em todas as abas (cadeia flex/grid que impede `overflow: auto`) e expor filtro de busca em Locais, NPCs e História para jogador **e** GM. Match case/accent-insensitive (reutilizar `labelMatchesQuery`); em História, arco visível se o título **ou** um local ligado corresponder. Grupo: scroll sim, busca oculta. Texto do filtro persiste ao mudar de aba.

## Technical Context

**Language/Version**: TypeScript / React 19 / CSS

**Primary Dependencies**: `SideMenu`, listas GM (`LocalAdminList`, `NpcAdminList`, `ArcoAdminList`), `MapPage` layout; helper `textMatch` (já em `routes/`)

**Storage**: N/A

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (desktop + overlay móvel)

**Project Type**: Web application (UX sidebar)

**Performance Goals**: Filtragem em memória sobre listas da campanha (dezenas–centenas)

**Constraints**:
- Scroll fiável + chrome fixo (FR-001–002)
- Busca em listas; ocultar em Grupo (FR-003, FR-011)
- História: título ∨ locais ligados (FR-010)
- Persistência do query entre abas (FR-006)
- Jogador + GM (FR-007)
- Sem API nova; sem alterar selecção/mapa (FR-009)

**Scale/Scope**: `frontend/src/components/sidebar/*`, `MapPage.css` / `MapPage.tsx`, admin lists (filtro via props ou arrays filtrados); opcional extrair `textMatch` para `utils/`

## Constitution Check

| Gate | Status |
|------|--------|
| UI/layout local, sem backend | PASS |
| Clarifications fechadas | PASS |
| Reutilizar match existente (036) | PASS |
| Sem novas deps npm | PASS |

**Post-design re-check**: PASS — UI contract; data-model de filtro UI; sem HTTP.

## Project Structure

### Documentation (this feature)

```text
specs/037-side-menu-scroll-search/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-side-menu-scroll-search.md
└── tasks.md
```

### Source Code

```text
frontend/src/
├── pages/MapPage.tsx          # filtrar listas GM; query partilhado
├── pages/MapPage.css          # min-height:0 na coluna sidebar se necessário
├── components/sidebar/
│   ├── SideMenu.tsx           # search visibility; filter locais/npcs/arcos; accent match
│   └── SideMenu.css           # flex min-height:0; body overflow
├── components/admin/
│   ├── LocalAdminList.tsx     # (se receber lista já filtrada, sem mudança)
│   ├── NpcAdminList.tsx
│   └── ArcoAdminList.tsx
└── components/routes/textMatch.ts  # reutilizar ou mover para utils/
```

**Structure Decision**: Corrigir layout scroll na sidebar; unificar busca (mostrar excepto Grupo); filtrar player em `SideMenu` e GM em `MapPage` (ou prop `query` nas listas). Reutilizar `labelMatchesQuery`.

## Complexity Tracking

Sem violações.
