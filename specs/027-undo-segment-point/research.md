# Research: 027-undo-segment-point

## 1. Onde ligar o gesto

**Decision**: `onContextMenu` em:
1. `.route-digitizer__stage` (mapa / imagem / SVG de rascunho)
2. Cada botão `.route-digitizer__wp` (nós), com `preventDefault` + `stopPropagation` + mesma lógica de undo

**Rationale**: Cliques esquerdos nos nós já usam `stopPropagation` e não bubblam para o stage; o direito no nó **não** chegaria ao stage. Clarificação A exige undo também sobre o nó.

**Alternatives considered**: Só no stage — falha sobre nós; captura no `TransformWrapper` — mais frágil e pode afetar controlos de zoom.

## 2. Lógica de desfazer

**Decision**: Função única (ex. `undoDraftPoint`):

```
if mode !== 'draw-seg' → return (opcional: ainda preventDefault só em draw-seg)
if busy → preventDefault only / return (não mutar a meio do save)
if draftMids.length > 0 → setDraftMids(m => m.slice(0, -1))
else if draftA != null → setDraftA(null); setDraftMids([])
else → no-op
mode permanece 'draw-seg'
```

**Rationale**: Espelha FR-001–FR-004; clarificação B (limpar origem).

**Alternatives considered**: Sair do modo ao limpar origem — rejeitado; desfazer após save — out of scope.

## 3. Menu de contexto do browser

**Decision**: Sempre `e.preventDefault()` no handler quando `mode === 'draw-seg'` (mesmo no-op sem rascunho), na área de traçado e nos nós.

**Rationale**: FR-005 / SC-003.

**Alternatives considered**: Só preventDefault quando há algo a desfazer — rejeitado (menu ainda apareceria com modo ativo sem origem).

## 4. Hint de UI

**Decision**: Atualizar o texto de `route-digitizer__hint` em `draw-seg` para mencionar botão direito (ex.: “Botão direito: desfazer último ponto.”). Opcional mas barato; recomendado no plano.

**Rationale**: Descoberta do gesto; deferred na clarify como opcional — inclui-se como polish mínimo.

**Alternatives considered**: Sem hint — válido mas pior UX.

## 5. Backend / persistência

**Decision**: Nenhuma mudança de API.

**Rationale**: Rascunho é só `draftA` + `draftMids` em React state.
