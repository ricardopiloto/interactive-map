# Research: 012-menu-center-pin

## 1. API da biblioteca de zoom/pan

**Decision**: Usar `zoomToElement` de `react-zoom-pan-pinch` (exposto por `useControls()` / ref do `TransformWrapper`), apontando para o elemento DOM do pin.

**Rationale**: A API já anima scale + posição para centralizar um nó; evita calcular manualmente `setTransform` com bounding boxes. Assinatura tipada: `(node, scale?, animationTime?, animationType?, offsetX?, offsetY?)`.

**Alternatives considered**:
- `setTransform(x, y, scale)` com matemática própria → mais frágil com bounds/wrapper
- `centerView(scale)` → centraliza o conteúdo inteiro, não um pin
- Só `scrollIntoView` nativo → não controla a escala do transform

## 2. Nível de zoom moderado fixo

**Decision**: Constante de foco `FOCUS_SCALE = 2` (com `minScale={0.5}`, `maxScale={4}`, `initialScale={1}` atuais). Sempre passar essa escala a `zoomToElement`, independentemente do zoom atual.

**Rationale**: Clarificação B; 2× é claramente “aproximado” sem ir ao máximo (4). Ajustável num único lugar se o QA pedir.

**Alternatives considered**:
- `1.5` / `2.5` → ok; 2 é o default do plano
- Zoom relativo (+step) → rejeitado (não é nível fixo)

## 3. Animação

**Decision**: `animationTime` ~400 ms e `animationType` `easeOut` (ou `easeOutCubic` se disponível no mapa de animações da lib).

**Rationale**: Clarificação A; SC-003 (&lt; 3 s).

**Alternatives considered**: 0 ms → rejeitado; &gt;1 s → lento demais.

## 4. Como identificar o pin no DOM

**Decision**: Atribuir `id={`map-pin-${local.id}`}` (ou `data-pin-id` + `querySelector`) em cada botão `.campaign-map__pin`.

**Rationale**: `zoomToElement` aceita `HTMLElement | string` (id).

**Alternatives considered**: refs map por id → mais verboso; coordenadas % + setTransform → mais complexo.

## 5. Disparar foco só a partir do menu

**Decision**: Em `MapPage`, o `SideMenu` recebe um wrapper `selectLocalFromMenu` que chama `selectLocal(id)` e depois incrementa um pedido de foco (`focusRequest: { localId, nonce }`) passado a `CampaignMap`. O `onSelectLocal` do mapa (clique no pin) chama só `selectLocal` **sem** novo pedido de foco.

**Rationale**: Spec fala do menu; evitar zoom forçado quando o usuário já clicou o pin sob o cursor. Hover continua só `onLocalHover` (sem foco).

**Alternatives considered**:
- Focar em todo `selectedLocalId` change → também no clique do pin; possível mas menos fiel ao pedido
- Método no SideMenu sem passar pelo MapPage → acopla SideMenu ao mapa

## 6. Placement GM

**Decision**: Reutilizar o early-return de `selectLocal` (`if (isGm && placement !== 'none') return`). Se a seleção não ocorre, o wrapper de menu também não deve emitir foco (chamar foco só após seleção bem-sucedida / dentro do mesmo guard).

**Rationale**: FR-004 / US2 cenário 3.

## 7. Mapa indisponível / pin ausente

**Decision**: Se não houver nó do pin ou o transform não estiver pronto, no-op silencioso (try/guard); sem throw.

**Rationale**: FR-007.

## 8. Backend

**Decision**: Nenhuma mudança.

**Rationale**: Só vista.
