# Contract: Sem hover visual na aresta de vínculo

**Surface**: UI — hit-path `graph-stage__edge-hit` em `GraphStage` (`/c/:slug/relacoes`).

## Removido

- Estado `hoveredEdgeId`
- `onPointerEnter` / `onPointerLeave` no hit-path que setavam esse estado
- Qualquer ramo `midLabelVisible` que dependa só de hover na linha

## Preservado

| Comportamento | Contrato |
|---------------|----------|
| Hit area | Path transparente com stroke largo (hoje `strokeWidth={18}`) permanece clicável |
| Clique | `onClick` → `onEdgeClick?.(vinculoId)` com `stopPropagation` — inalterado |
| Rótulo mid-edge | Visível **somente** quando a aresta está `highlighted` (foco por selecção de personagem relacionado e/ou preview de personagem via `hoveredId`) |
| Estilo da linha (cor, dash, double) | Inalterado |

## Garantia negativa

Passar o pointer sobre uma aresta **não** highlighted MUST NOT alterar opacidade, espessura, nem visibilidade do rótulo mid-edge.
