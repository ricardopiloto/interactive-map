# Research: 020-menu-hover-connections

## 1. Qual ID usa o overlay de linhas

**Decision**: Origem efetiva das linhas:

```text
connectionOriginId =
  selectedLocalId != null ? selectedLocalId : hoveredLocalId
```

Desenhar se `connectionOriginId != null` e o local correspondente tem `saida_ids` resolvíveis (mesma geometria/estilo da 017/019).

**Rationale**: Clarificação C — com seleção, hover não troca linhas; sem seleção, hover pré-visualiza. Uma expressão cobre US1+US2 sem estado extra.

**Alternatives considered**:
- Hover sempre prevalece — rejeitado (clarificação C)
- Union selected+hovered — rejeitado (ruído visual)
- Só SideMenu, ignorar `hoveredLocalId` genérico — desnecessário; GM e jogador já compartilham o mesmo state

## 2. Superfícies de hover

**Decision**: Não mudar SideMenu/LocalAdminList se já chamam `onLocalHover` → `setHoveredLocalId` em MapPage. Verificar que MapPage passa `hoveredLocalId` ao `CampaignMap` (já passa hoje).

**Rationale**: Clarificação A (paridade GM); wiring já existe para destaque de pin (016).

**Alternatives considered**: Prop separado `previewLocalId` — YAGNI.

## 3. Atualizar contrato 017 vs contrato 020

**Decision**: Documentar a nova regra em `contracts/ui-menu-hover-connections.md` desta feature (supersede parcial da linha “Não desenhar por hoveredLocalId” da 017). Não reescrever artifacts históricos da 017 além de referência cruzada se útil no README após implement.

**Rationale**: Specs são append-only por feature; implementers leem o contrato 020 + código.

## 4. 016 (sem pan/zoom)

**Decision**: Não tocar `PinFocusController` / `focusRequest`. Hover continua sem emitir focus.

**Rationale**: FR-004 / SC-004; regressão seria crítica.

## 5. Estilo

**Decision**: Reutilizar `.campaign-map__connection-line` (019). Sem CSS novo salvo se necessário para distinção hover vs selection (não pedido).

**Rationale**: FR-007 / assumptions.
