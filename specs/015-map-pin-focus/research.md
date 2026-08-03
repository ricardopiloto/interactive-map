# Research: 015-map-pin-focus

## 1. Como disparar o foco no clique do pin

**Decision**: Em `MapPage`, criar `selectLocalFromMap(id)` (ou equivalente): chama a lógica de seleção existente e, se `!isGm`, faz `setFocusRequest({ localId: id, nonce: Date.now() })`. Passar esse handler a `CampaignMap.onSelectLocal`. Manter `selectLocalFromMenu` como está (já foca).

**Rationale**: `PinFocusController` + `zoomToElement` + `FOCUS_SCALE` / `FOCUS_ANIM_MS` já resolvem o pan/zoom (012). O gap atual é só o mapa chamar `selectLocal` sem `focusRequest`. Clarificação: reaplicar a cada clique → novo nonce mesmo se o id for o mesmo.

**Alternatives considered**:
- Focar dentro de `CampaignMap` no click do pin → acopla mapa a política jogador/GM
- Sempre focar em qualquer mudança de `selectedLocalId` → também no GM e em fluxos indesejados
- Offset especial no zoom por causa do modal → desnecessário se o pin fica centrado e o modal ao lado (013)

## 2. Escopo só jogador

**Decision**: `if (isGm) { selectLocal(id); return }` sem `focusRequest`; se `!isGm`, select + focusRequest.

**Rationale**: Clarificação A.

**Alternatives considered**: Focar no GM quando placement === 'none' → rejeitado.

## 3. Pin fora da vista / modal acompanhando

**Decision**: Tratar como falta de foco no clique do mapa; após `zoomToElement`, o pin fica na vista e o `PinModal` (013) recalcula posição (~400 ms). Não inventar segundo sistema de zoom.

**Rationale**: Spec + observação do usuário; 013 já ancora ao `#map-pin-{id}`.

## 4. Backend

**Decision**: Nenhuma mudança.

**Rationale**: Só wiring de UI.
