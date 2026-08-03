# Research: 013-modal-beside-pin

## 1. Como posicionar o painel relativo ao pin

**Decision**: Em `PinModal`, medir `document.getElementById(\`map-pin-${local.id}\`)` com `getBoundingClientRect()` e aplicar `position: fixed` no `.pin-modal` (`top`/`left` ou `transform`) com gap lateral. Backdrop permanece `position: fixed; inset: 0` com dim; o conteúdo do dialog **não** usa mais `place-items: center` para este modal (override em `.pin-modal-backdrop`).

**Rationale**: Os pins já têm ids estáveis de 012; ancoragem viewport-fixed alinha com o backdrop e não depende do transform interno do zoom. Evita reimplementar coordenadas % do mapa.

**Alternatives considered**:
- Callout/popover ancorado no stage do mapa (dentro do TransformWrapper) → escala com zoom; mais frágil
- Só CSS (`margin` no grid) sem medir o pin → não garante “ao lado do pin” após foco
- Offset via `zoomToElement(..., offsetX)` só no mapa → move o pin, não o modal; complementar possível mas fora do pedido

## 2. Lado preferido (oposto ao menu)

**Decision**: Preferência **direita do pin** no layout desktop atual (menu à esquerda). Se `right + panelWidth + gap` ultrapassar a viewport (ou invadir área do menu à esquerda no flip), fazer flip para a **esquerda** do pin. Gap ~12–16 px; vertical: alinhar topo do painel próximo ao centro vertical do pin, clamp para caber em `vh`.

**Rationale**: Clarificação B; menu à esquerda → lado oposto = direita. Flip cobre bordas (FR-004).

**Alternatives considered**:
- Sempre mais espaço livre → ok, mas menos previsível que “oposto ao menu”
- Só direita sem flip → falha perto da borda direita

## 3. Timing com animação de foco (012)

**Decision**: Posicionar no mount (`useLayoutEffect`) e **recalcular** após ~`FOCUS_ANIM_MS` (400 ms) e em `resize`. Opcional: 1–2 frames `requestAnimationFrame` no início. Se o nó do pin não existir, fallback centrado (comportamento atual).

**Rationale**: Após clique no menu, o pin ainda anima; um único layout no open deixaria o painel desalinhado. Recalcular pós-animação cobre o caso principal sem observer contínuo.

**Alternatives considered**:
- `ResizeObserver` no pin → overkill
- Esperar só o fim da animação antes de mostrar o modal → atrasa a leitura (pior SC-003)

## 4. Backdrop e bloqueio do mapa

**Decision**: Manter `.dialog-backdrop` com dim atual e `onClick` → fechar. Não tornar o mapa interativo sob o backdrop. Clique no painel `stopPropagation` (já existe).

**Rationale**: Clarificações A (bloqueio) e A (dim). FR-006 / FR-007.

**Alternatives considered**: Backdrop transparente / mapa panável → rejeitados nas clarificações.

## 5. Clique no pin no mapa vs menu

**Decision**: Mesma lógica de ancoragem para qualquer abertura do `PinModal` (menu ou pin). Sem prop especial obrigatória.

**Rationale**: FR-003; consistência.

## 6. Viewport estreita / mobile

**Decision**: Se a largura útil &lt; ~640 px **ou** não houver espaço lateral mínimo para painel + pin + gap, usar **fallback centrado** (restaurar `place-items: center` / omitir offsets). Conteúdo continua scrollável e fechável.

**Rationale**: FR-005; assumption mobile.

**Alternatives considered**: Bottom sheet → mais trabalho; centrado reutiliza CSS existente.

## 7. Backend

**Decision**: Nenhuma mudança.

**Rationale**: Só layout de UI.
