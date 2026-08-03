# Research: 016-hover-no-pan

## 1. Causa provável do pan/zoom no hover

**Decision**: Investigar e corrigir re-disparo de `zoomToElement` quando o mapa re-renderiza por `hoveredLocalId`.

Hoje `onLocalHover={setHoveredLocalId}` **não** chama `setFocusRequest`. Porém `PinFocusController` tem:

```ts
useEffect(() => { … zoomToElement(el, …) }, [focusRequest, zoomToElement])
```

Se `zoomToElement` (de `useControls`) mudar de referência a cada render do wrapper (comum em contextos), **qualquer** re-render — inclusive o causado por hover — re-executa o effect com o `focusRequest` ainda setado e **reaplica** pan/zoom no último pin focado. Isso se sente exatamente como “hover faz zoom/pan”.

**Fix preferido** (uma ou combinação):
1. Dependências do effect: `focusRequest?.localId` + `focusRequest?.nonce` apenas; guardar `zoomToElement` em ref.
2. Após aplicar o foco, limpar `focusRequest` (`null`) no pai ou marcar “consumed” para o effect não reaplicar.
3. Confirmar que nenhum handler de hover seta `focusRequest`.

**Rationale**: Explica o bug sem contradizer o código atual de hover; clarificação A (vista fixa, destaque local ok).

**Alternatives considered**:
- Remover destaque do pin → rejeitado (clarificação / 005)
- Desabilitar `zoomToElement` → quebra clique/menu

## 2. Destaque local do pin

**Decision**: Manter `.campaign-map__pin--hovered` com scale/glow CSS; isso **não** é pan/zoom da vista.

**Rationale**: Clarificação A.

## 3. Clique continua focando

**Decision**: Não alterar `selectLocalFromMenu` / `selectLocalFromMap`; só impedir re-foco espúrio no hover.

**Rationale**: FR-004 / US2.

## 4. Backend

**Decision**: Nenhuma mudança.

**Rationale**: Só UI.
