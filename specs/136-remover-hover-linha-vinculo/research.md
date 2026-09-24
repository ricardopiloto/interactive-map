# Research: Remover destaque de hover na linha de vínculo (Relações)

Sem `[NEEDS CLARIFICATION]` — causa raiz e direcção confirmadas em [BKLG-025](../../docs/v2/backlog.md#bklg-025-design--remover-destaque-ao-passar-o-mouse-sobre-uma-linha-de-vínculo-grafo-de-relações) e na [spec.md](./spec.md).

## Decisão 1 — Apagar `hoveredEdgeId` por completo

**Decisão**: Remover `const [hoveredEdgeId, setHoveredEdgeId] = …`, os `onPointerEnter`/`onPointerLeave` do `graph-stage__edge-hit`, e qualquer referência residual. `midLabelVisible` torna-se `highlighted` (ou equivalente boolean único).

**Rationale**: O estado só existia para o rótulo mid-edge no hover. Após a remoção não há consumidores — deixar estado morto viola simplicidade.

**Alternatives considered**: Manter o estado mas nunca setar — ruído. Desactivar só via CSS `pointer-events` no hit — quebraria o clique (FR-003).

## Decisão 2 — Preservar hit-path e `onClick`

**Decisão**: O `<path className="graph-stage__edge-hit">` (stroke transparente, `strokeWidth={18}`) e o `onClick` que chama `onEdgeClick?.(v.id)` permanecem exactamente como estão.

**Rationale**: Spec e backlog separam efeito visual de hover da capacidade de clicar; a área larga de hit deve continuar.

**Alternatives considered**: Remover o hit-path e clicar só na linha visível — piora UX de clique; fora do pedido.

## Decisão 3 — `highlighted` continua a mostrar rótulo (selecção e preview de personagem)

**Decisão**: Não alterar o cálculo de `highlighted` (`previewId` / `isFocusEdge`). Rótulos mid-edge continuam quando a aresta está em foco por personagem seleccionado ou por preview (`hoveredId` da lista/token — spec 135).

**Rationale**: FR-002 e assumção: só o hover **da linha** some; foco por selecção (e o preview já existente de personagem) não é “efeito de hover na linha”.

**Alternatives considered**: Esconder rótulos também no preview — conflitaria com o mecanismo reutilizado pela 135 e com “foco” actual.

## Decisão 4 — Fora de escopo: cursor CSS / tooltips nativos

**Decisão**: Não mudar `cursor` nem title nativo no hit-path nesta spec.

**Rationale**: Assunção da spec limita o escopo ao destaque visual customizado (rótulo mid-edge via `hoveredEdgeId`).
