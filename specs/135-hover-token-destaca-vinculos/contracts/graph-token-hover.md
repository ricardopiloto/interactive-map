# Contract: Hover no token → preview de vínculos

**Surface**: UI — tokens `.graph-node` no `GraphStage` (`/c/:slug/relacoes`).

## Prop

```ts
onHoverPersonagem?: (id: number | null) => void
```

- `id: number` — pointer entrou no token desse personagem.
- `null` — pointer saiu do token.
- Omissão da prop: tokens não disparam hover (comportamento actual até o wiring no pai).

## Comportamento obrigatório

1. `onPointerEnter` no token → `onHoverPersonagem(personagemId)`.
2. `onPointerLeave` no token → `onHoverPersonagem(null)`.
3. O pai MUST alimentar o mesmo estado que a lista lateral usa para preview (`hoveredId`).
4. O destaque visual MUST ser o já produzido por `previewId` / `isPreviewEdge` / `graph-node--preview` — sem segundo stylesheet de “hover token”.
5. Hover MUST NOT chamar `onSelect` / `onDeselect` nem alterar `selectedId`.

## Paridade

Para o mesmo `personagemId`, hover no token e hover na linha da lista MUST produzir o mesmo `hoveredId` e portanto o mesmo resultado visual no grafo.
