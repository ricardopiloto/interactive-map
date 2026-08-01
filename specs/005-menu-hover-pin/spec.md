# Feature Specification: Destacar pin ao passar o mouse no menu

**Feature Branch**: `005-menu-hover-pin`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Nova funcionalidade para que, quando o usuário passar o mouse em cima do nome da localidade no menu lateral, nós vamos destacar qual é o pin relacionado."

## Clarifications

### Session 2026-08-01

- Q: Onde o hover deve destacar o pin? → A: Apenas nomes na aba Locais (jogador e lista GM de locais)

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Encontrar o pin pelo nome no menu (Priority: P1)

Um jogador percorre a lista de locais no menu lateral, passa o mouse sobre o nome de um local e vê imediatamente no mapa qual pin corresponde àquele nome (destaque visual temporário), sem precisar clicar nem abrir o modal.

**Why this priority**: É o valor central do pedido — ligação visual menu ↔ mapa.

**Independent Test**: Com pelo menos dois pins no mapa, hover no nome de um local na aba Locais e confirmar que só o pin correspondente fica destacado; ao sair o mouse, o destaque some.

**Acceptance Scenarios**:

1. **Given** a aba Locais com vários locais e pins no mapa, **When** o usuário passa o mouse sobre o nome de um local, **Then** o pin daquele local fica visualmente destacado de forma clara em relação aos demais.
2. **Given** um local em destaque por hover, **When** o usuário move o mouse para fora do nome (ou para outro local), **Then** o destaque do pin anterior some; se o mouse for para outro local, o pin desse outro passa a ser o destacado.
3. **Given** hover sobre um local, **When** o usuário não clica, **Then** o modal/detalhe do pin **não** abre só por causa do hover (hover ≠ seleção/clique).
4. **Given** um local cujo pin está fora da área visível atual do mapa (após pan/zoom), **When** o usuário faz hover no nome, **Then** o pin correspondente fica destacado se estiver renderizado; o mapa **não** é obrigado a recentrar só pelo hover.

---

### Edge Cases

- Lista vazia / local sem coordenadas inválidas: sem destaque (nada a fazer).
- Touch / mobile sem hover: a feature não atrapalha o clique/toque existente; em dispositivos sem hover, o destaque por hover simplesmente não ocorre.
- Modo GM com lista admin de locais: o mesmo comportamento de hover→destaque aplica-se aos nomes de local na lista lateral quando o GM está na aba Locais (consistência).
- Pin já “selecionado” (modal aberto ou seleção ativa): o hover pode reforçar ou usar o mesmo estilo de destaque; ao sair do hover, permanece o estado de seleção se ainda houver seleção — o hover não limpa a seleção por clique.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao passar o mouse sobre o nome de um local na lista do menu lateral **somente na aba Locais** (visão jogador ou lista GM de locais), o sistema MUST destacar visualmente o pin correspondente no mapa.
- **FR-007**: Hover em nomes/chips de local nas abas História ou NPCs MUST NOT ser exigido nesta feature (fora de escopo).
- **FR-002**: Ao sair o mouse do nome do local (sem hover em outro local da lista), o destaque causado pelo hover MUST ser removido.
- **FR-003**: Hover sobre o nome de um local MUST NOT, por si só, abrir o modal/painel de detalhes do pin.
- **FR-004**: O destaque de hover MUST identificar de forma inequívoca um único pin — o do local sob o ponteiro.
- **FR-005**: O clique no nome do local MUST continuar com o comportamento atual (ex.: abrir detalhes / focar conforme já implementado); hover e clique são interações distintas.
- **FR-006**: Em viewports sem hover (ex.: toque), a experiência existente de toque/clique MUST permanecer utilizável sem depender desta feature.

### Key Entities

- **Local**: item da lista lateral com nome e pin no mapa (posição x/y).
- **Destaque de hover**: estado visual temporário do pin ligado ao local sob o ponteiro no menu; distinto da seleção por clique.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste com ≥3 locais, um avaliador identifica corretamente o pin correspondente em ≤2 segundos após iniciar o hover no nome.
- **SC-002**: Em 100% dos casos de hover em um nome válido na aba Locais, exatamente um pin fica em destaque de hover (o relacionado).
- **SC-003**: Em 100% dos testes, sair o mouse do nome remove o destaque de hover (salvo seleção por clique ainda ativa, que pode manter seu próprio estilo).
- **SC-004**: Hover sozinho não abre o modal em 100% dos testes (modal só após clique/gesto de abertura já existente).

## Assumptions

- Escopo **fechado** na aba **Locais** (jogador e lista GM de locais) — decisão da clarificação; História/NPC ficam para eventual feature futura.
- Em Modo GM, a lista de locais na lateral segue o mesmo hover→destaque para consistência.
- O destaque visual pode reutilizar ou aproximar-se do estilo de pin selecionado, desde que hover e clique permaneçam comportamentos distintos.
- Hover não recentra nem altera zoom do mapa (evita movimento inesperado ao varrer a lista).
- Fora de escopo: busca por teclado sem mouse; destaque ao focar via acessibilidade por teclado pode ser melhoria futura, não requisito desta entrega.
