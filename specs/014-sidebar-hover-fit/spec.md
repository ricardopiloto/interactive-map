# Feature Specification: Hover no item do menu e ajuste da busca

**Feature Branch**: `014-sidebar-hover-fit`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Vamos adicionar uma outra funcionalidade, quando o usuário passar o mouse sob o local no menu lateral, dê um leve efeito de hover sob o item no menu lateral (já temos o destaque no pin). Ajuste também o input de pesquisa … ele está mais largo que o menu lateral."

## Clarifications

### Session 2026-08-03

- Q: Forma do hover “leve” no item do menu? → A: Fundo sutil (tint discreto no cartão/linha).
- Q: Onde o fundo sutil de hover é obrigatório? → A: Só itens de local na aba Locais (modo jogador / lista de cartões).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Feedback visual no item do menu ao passar o mouse (Priority: P1)

Como jogador, ao passar o mouse sobre um local na lista do menu lateral, quero um **leve destaque no próprio item da lista** (além do destaque do pin no mapa que já existe), para perceber claramente qual linha estou mirando antes de clicar.

**Why this priority**: É o pedido principal de UX; completa a ligação menu ↔ mapa com feedback no próprio menu.

**Independent Test**: Na aba Locais, passar o mouse sobre um item da lista; o item mostra um efeito de hover suave; o pin continua sendo destacado como hoje; ao sair o mouse, o efeito no item some.

**Acceptance Scenarios**:

1. **Given** a aba Locais com vários locais, **When** o usuário passa o mouse sobre um item de local na lista, **Then** esse item exibe um **fundo sutil** (tint discreto) distinto do estado em repouso.
2. **Given** o mouse sobre o local X, **When** o usuário move para o local Y, **Then** o efeito some de X e aparece em Y.
3. **Given** hover sobre um local, **When** o usuário observa o mapa, **Then** o destaque do pin correspondente **continua** ocorrendo como já implementado (esta feature não remove o hover do pin).
4. **Given** hover sobre um local, **When** o usuário não clica, **Then** o detalhe/modal **não** abre só por causa do hover.

---

### User Story 2 - Campo de busca alinhado à largura do menu (Priority: P2)

Como usuário, quero que o campo de busca do menu lateral caiba **dentro** da largura do menu, sem ultrapassar as bordas laterais, para a interface parecer alinhada e sem overflow horizontal.

**Why this priority**: Correção visual objetiva; melhora a percepção de qualidade do menu.

**Independent Test**: Em desktop, observar o campo “Buscar local…” / “Buscar NPC…”; a largura útil do input não ultrapassa a área do menu; sem barra de rolagem horizontal causada pelo input.

**Acceptance Scenarios**:

1. **Given** o menu lateral visível em desktop, **When** o usuário olha o campo de pesquisa, **Then** o campo não extravasa a largura do menu (margens laterais consistentes com o restante do painel).
2. **Given** o usuário redimensiona a janela ou usa overlay mobile do menu, **When** o campo de busca é exibido, **Then** ele permanece contido na área do menu sem forçar overflow horizontal.
3. **Given** o campo de busca corrigido, **When** o usuário digita e filtra, **Then** a busca continua funcionando como antes (sem regressão funcional).

---

### Edge Cases

- Touch / mobile sem hover: o efeito de hover no item não é obrigatório; clique/toque permanece utilizável.
- Item já selecionado: hover pode coexistir com estilo de seleção; ao sair do hover, o estado de seleção (se houver) permanece.
- Lista vazia: sem itens para hover; campo de busca ainda deve caber na largura.
- Abas NPCs / História / Modo GM: o ajuste de largura do campo de busca aplica-se sempre que o campo estiver visível (modo jogador). O fundo sutil de hover é obrigatório **apenas** nos cartões de local da aba Locais no modo jogador; NPC, arco e lista admin GM ficam fora de escopo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao passar o mouse sobre um item de **local** na lista do menu lateral em **modo jogador** (aba Locais, lista de cartões), o sistema MUST aplicar um efeito de hover **leve** nesse item na forma de **fundo sutil** (tint discreto no cartão/linha), sem deslocar o layout da lista. Hover equivalente em NPC/arco ou no painel admin GM MUST NOT ser exigido nesta feature.
- **FR-002**: Ao sair o mouse do item (sem hover em outro local), o efeito de hover no item MUST ser removido.
- **FR-003**: O hover no item do menu MUST NOT remover ou substituir o destaque do pin no mapa já existente (005); ambos MUST poder coexistir.
- **FR-004**: Hover no item MUST NOT, por si só, abrir o detalhe/modal do local.
- **FR-005**: O campo de pesquisa do menu lateral MUST ter largura contida na área do menu, sem ultrapassar as bordas laterais do painel.
- **FR-006**: O ajuste de largura do campo de busca MUST NOT quebrar a função de filtrar locais/NPCs.
- **FR-007**: Em viewports sem hover, a lista e a busca MUST permanecer utilizáveis por toque/clique.

### Key Entities

- **Item de local no menu**: linha/cartão na aba Locais que representa um local e dispara hover no pin.
- **Campo de busca do menu**: entrada de texto no topo da lista para filtrar conteúdo da aba ativa.
- **Destaque de hover no item**: estado visual temporário do item da lista sob o ponteiro (distinto do destaque do pin e da seleção por clique).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes manuais em desktop na aba Locais, o item sob o mouse mostra um fundo sutil distinto do estado em repouso.
- **SC-002**: Em 100% desses testes, o destaque do pin no mapa ao hover continua ocorrendo como antes.
- **SC-003**: Em 100% dos testes em desktop (e overlay mobile verificável), o campo de busca não extravasa a largura do menu nem provoca overflow horizontal atribuível a ele.
- **SC-004**: Em 100% dos testes, hover sozinho não abre o detalhe do local; a busca continua filtrando após o ajuste de largura.

## Assumptions

- O destaque do pin ao hover (feature 005) permanece; esta feature só adiciona feedback no item da lista.
- “Leve” significa **fundo sutil** (tint discreto), sem animação agressiva, sem contorno obrigatório e sem mudança de layout que desloque a lista.
- Escopo do hover de item: **somente** cartões de local na aba Locais do **modo jogador**. NPC, arco e painel admin GM estão fora de escopo.
- O problema do input “mais largo que o menu” é tratado como defeito de layout a corrigir no próprio menu lateral.
- Sem mudança de dados persistidos nem de API.
