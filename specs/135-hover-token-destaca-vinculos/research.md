# Research: Hover no token do personagem destaca seus vínculos (Relações)

Sem `[NEEDS CLARIFICATION]` — causa raiz e direção confirmadas em [BKLG-024](../../docs/v2/backlog.md#bklg-024-design--hover-no-token-do-personagem-grafo-de-relações-não-destaca-os-vínculos-dele) e na [spec.md](./spec.md).

## Decisão 1 — Callback `onHoverPersonagem` no GraphStage → `setHoveredId` no pai

**Decisão**: `GraphStage` recebe `onHoverPersonagem?: (id: number | null) => void`. Nos `.graph-node`: `onPointerEnter` → `onHoverPersonagem?.(p.id)`; `onPointerLeave` → `onHoverPersonagem?.(null)`. `RelacoesPage` passa o mesmo setter já usado pela lista (`setHoveredId` ou wrapper idêntico).

**Rationale**: O estado `hoveredId` vive no pai para lista e grafo partilharem um único preview. O canvas não deve criar um segundo `useState` de hover. Espelha o padrão `onSelect` já existente.

**Alternatives considered**:
- Estado local de hover só dentro de `GraphStage` — duplicaria preview vs lista e quebraria FR-003.
- Passar `setHoveredId` com nome genérico sem prop tipada — funciona, mas callback nomeado documenta o contrato UI.

## Decisão 2 — Não alterar a prioridade `previewId` vs seleção

**Decisão**: Manter a lógica actual de `highlighted` em `GraphStage` (quando `previewId != null`, arestas usam `isPreviewEdge(previewId)`; senão, foco de selecção). Hover no token herda exactamente o mesmo comportamento que hover na lista.

**Rationale**: SC-001 exige paridade visual com a lista. Aceitação US1.3 (“selecção continua referência principal”) interpreta-se como: clique/selecção não é limpa pelo hover; o preview temporário já é o contrato actual da lista — não redesenhar prioridade nesta spec.

**Alternatives considered**: Combinar selecção + preview (união de arestas) — scope creep e divergiria da lista.

## Decisão 3 — Sem debounce; pointer events, não mouse-only

**Decisão**: Sem delay artificial. Usar `onPointerEnter`/`onPointerLeave` (igual à lista em `relacoes-page__row`), não `onMouseEnter`/`onMouseLeave`.

**Rationale**: Spec assume tempo real; paridade de API de eventos com a lista evita diferenças em dispositivos híbridos.

**Alternatives considered**: Debounce “breve destaque” literal — rejeitado pela assunção da spec.

## Decisão 4 — Fora de escopo: hover em aresta (`hoveredEdgeId`)

**Decisão**: Não tocar em `hoveredEdgeId` / label mid-edge (isso é [BKLG-025](../../docs/v2/backlog.md) / spec 136).

**Rationale**: Pedido desta feature é só token → vínculos via `hoveredId`. Misturar remoção de hover de linha aumenta risco e acopla duas specs.
