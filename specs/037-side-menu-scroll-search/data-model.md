# Data Model: Scroll e busca no menu lateral

**Feature**: `037-side-menu-scroll-search` | **Date**: 2026-08-04

Sem entidades persistidas. Modelo = estado de UI + regras de filtro derivadas.

## Entities (UI / derived)

### SideMenuChrome

| Element | Scrolls with body? | Notes |
|---------|-------------------|--------|
| Header (brand / voltar) | No | `flex-shrink: 0` |
| Tab selector | No | `flex-shrink: 0` |
| Search field | No | Visível se aba ∈ {locais, npcs, arcos} |
| Body content | Yes | `flex: 1; min-height: 0; overflow: auto` |

### FilterQuery

| Field | Type | Notes |
|-------|------|--------|
| `query` | string | Estado em `MapPage`; partilhado jogador/GM |
| Persist on tab change | yes | Não limpar em `onTabChange` |

### Filter rules by tab

| Tab | Visible items when `query` non-empty |
|-----|--------------------------------------|
| `locais` | Locais com `labelMatchesQuery(nome, query)` |
| `npcs` | NPCs com `labelMatchesQuery(nome, query)` |
| `arcos` | Arcos onde título match **ou** algum local com `arco_id` match no nome |
| `grupo` | N/A — search hidden; body still scrollable |

Empty/`trim` query → full list for that tab.

### Layout constraint (scroll)

| Node | Required |
|------|----------|
| Page grid / sidebar column | Height bounded (`100dvh` / 100%); `min-height: 0` |
| `.side-menu` | Column flex; `min-height: 0`; `height: 100%` |
| `.side-menu__body` | `flex: 1; min-height: 0; overflow: auto` |

## Validation

- Empty results: visible empty state / muted message (existing copy OK)
- Selecting a filtered item: same handlers as hoje (FR-009)
