# UI Contract: Lista da coluna, preview de hover e anel compacto

**Feature**: `086-relacoes-list-compact`  
**Scope**: FR-001–FR-013, US1–US3  
**Surfaces**: `RelacoesSideColumn`, `RelacoesPage`, `GraphStage`, `graphLayout`

## 1. Lista na coluna

Ordem vertical obrigatória:

1. Busca (`column.search`)
2. Chips de tipo (`column.tiposVinculo`)
3. **Lista de personagens** (novo)
4. Isolar selecção
5. Legenda

A lista **não** substitui chips nem Isolar. Não tem campo de busca próprio.

### Conteúdo

- Itens: todos os `personagens` do papel, A→Z, filtrados pela busca actual.
- Linha: nome (texto). Sem agrupamento PJ/NPC. Oculto (GM): mesmo tipo de indicação que o disco.
- Item seleccionado (`selectedId`): estado visual na linha (`aria-current="true"` ou classe `--selected`).
- Vazio: `column.listEmpty` ou `column.listEmptySearch` (quando a busca não acerta).

### Scroll

- Scroll **interno** da lista (`overflow-y: auto`).
- Chips e legenda permanecem acessíveis sem depender do scroll da lista.
- Coluna: deixar de usar o scroll da `aside` como único mecanismo quando a lista é longa.

### Gestos

| Gesto | Efeito | Proibido |
|-------|--------|----------|
| Clique no item | `selectPersonagem(id)` — paridade com o disco (toggle) | Abrir formulário; mudar Isolar |
| `pointerenter` | `hoveredId = id` | Seleccionar; abrir detalhe; pan/zoom; recalcular anéis |
| `pointerleave` | `hoveredId = null` | Limpar `selectedId` |

## 2. Preview de hover no palco

Prop nova de `GraphStage`: `hoveredId: number | null` (default `null`).

| Condição | Disco | Linhas |
|----------|-------|--------|
| `hoveredId` visível no palco | `graph-node--preview` no disco (anel accent; **sem** mudar posições) | extremos incluem `hoveredId` **e** aresta ∈ `visibleEdges` → `EDGE_OPACITY_FOCUS` + stroke 2.25 |
| `hoveredId` ≠ `selectedId` | selecção mantém `--selected`; preview no outro disco | só arestas de preview a 0.9; arestas de foco da selecção voltam ao dim enquanto o hover estiver activo |
| `hoveredId === selectedId` ou `hoveredId == null` | comportamento actual de selecção | `showEdges && isFocusEdge` como hoje |
| disco de `hoveredId` não desenhado | nada | nada |

Opacidades: reutilizar `EDGE_OPACITY_DIM` / `EDGE_OPACITY_DIM_SELECTED` / `EDGE_OPACITY_FOCUS` de `graphLayout.ts`. Não criar hex de preview.

## 3. Folga compacta

Ficheiro: `frontend/src/components/relacoes/graphLayout.ts`.

```ts
COMPACT_INNER_THRESHOLD = 6          // compactar se count > 6
COMPACT_INNER_FACTOR = 2 / 3
COMPACT_INNER_SPACING_MIN = 120
compactInnerSpacing(spacing) = max(MIN, round(spacing * FACTOR))  // 240 → 160
```

`computeFocusLayout(..., spacing, innerSpacing = spacing)`:

- anel interior (`directIds`): `innerSpacing`
- anel exterior e `outerRadius = innerRadius + NODE_H + spacing`: `spacing` padrão

`computeInitialLayout`: **não** recebe compactação.

`GraphStage` calcula `innerSpacing` com `directIds.size > COMPACT_INNER_THRESHOLD`. Vista geral e anéis com ≤6 conexões directas visíveis: folga 240 inalterada.

## 4. i18n

Chaves novas em `relacoes.json` (pt-BR e en):

| Chave | Função |
|-------|--------|
| `column.personagens` | título da lista |
| `column.listEmpty` | zero personagens visíveis |
| `column.listEmptySearch` | busca sem correspondência |

## 5. Proibições

- Backend / migração / persistir `hoveredId` ou posições.
- Compactar vista geral ou anel exterior do foco.
- Compactar com exactamente 6 conexões.
- Revelar vínculos ou personagens que o palco já esconde.
- Dependência de hover para navegar (toque = clique).
- Segunda busca, agrupamento por tipo, slider de folga, mudança de `DISC` / `NODE_W`.
