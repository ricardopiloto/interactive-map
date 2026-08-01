# Research: 005-menu-hover-pin

## 1. Estado de hover vs seleção

**Decision**: Introduzir `hoveredLocalId: number | null` em `MapPage`, independente de `selectedLocalId`. `CampaignMap` aplica classe de destaque quando `local.id === hoveredLocalId` (e pode combinar com selected se ambos forem o mesmo id).

**Rationale**: Spec exige hover sem abrir modal e sem limpar seleção por clique.

**Alternatives considered**:
- Reutilizar `selectedLocalId` no hover → abriria/confundiria modal e seleção
- Estado só dentro do SideMenu → mapa não recebe o id sem elevação

## 2. Escopo de handlers

**Decision**: `onLocalHover(id | null)` a partir de:
- Lista jogador na aba Locais (`SideMenu`)
- Lista GM de locais (`LocalAdminList` / painel admin na aba Locais)

Não ligar handlers em História/NPCs.

**Rationale**: Clarificação A / FR-007.

**Alternatives considered**: Hover em todas as abas → fora de escopo.

## 3. Estilo visual

**Decision**: Classe dedicada (ex. `campaign-map__pin--hovered`) com escala/anel semelhante ao selected, mas que possa coexistir; selected permanece para clique/modal. Se hovered === selected, um estilo composto é aceitável.

**Rationale**: SC-001 (reconhecimento rápido); FR-005 (clique distinto).

**Alternatives considered**: Só `selected` no hover → viola separação hover/clique.

## 4. Pan/zoom

**Decision**: Não chamar center/focus no hover.

**Rationale**: Assumption da spec; evita mapa “saltando” ao varrer a lista.

**Alternatives considered**: Auto-center no hover → rejeitado pela spec.

## 5. Mobile

**Decision**: Sem polyfill de hover; `onMouseEnter`/`Leave` simplesmente não disparam de forma útil no toque.

**Rationale**: FR-006.
