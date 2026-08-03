# Feature Specification: Centralizar pin ao clicar no menu

**Feature Branch**: `012-menu-center-pin`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Vamos adicionar uma funcionalidade nova, quando o usuário clicar em um local no menu lateral, nós vamos centralizar o pin no mapa, com um zoom simples."

## Clarifications

### Session 2026-08-03

- Q: Qual o comportamento do zoom ao focar pelo menu? → A: Sempre ir para um zoom moderado fixo e centralizar o pin (mesmo se o zoom atual já for maior ou menor).
- Q: A transição do foco deve ser animada? → A: Animação suave e curta até o pin centrado no zoom moderado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Encontrar o pin no mapa a partir do menu (Priority: P1)

Como jogador ou mestre, ao clicar no nome de um local na aba Locais do menu lateral, quero que o mapa centralize aquele pin e aplique um zoom simples, para eu localizar rapidamente o lugar sem procurar à mão no mapa.

**Why this priority**: É o núcleo do pedido; entrega o valor completo em um único gesto.

**Independent Test**: Com o mapa em posição/zoom qualquer, clicar um local na lista; o pin correspondente fica visível ao centro (ou próximo) com zoom aumentado de forma moderada. Não depende de criar locais novos.

**Acceptance Scenarios**:

1. **Given** a lista de locais está visível e o mapa está afastado ou panado para longe de um local X, **When** o usuário clica em X no menu, **Then** o mapa move o pin de X para a região central da área do mapa e aplica o **mesmo** nível de zoom moderado fixo usado em todo foco pelo menu.
2. **Given** o usuário já está com zoom maior ou menor que o zoom moderado de foco, **When** ele clica em X no menu, **Then** o mapa recentraliza X e **ajusta** o zoom para esse nível moderado fixo (não preserva o zoom anterior).
3. **Given** o usuário clica em outro local Y após ter focado X, **When** o clique em Y ocorre, **Then** o mapa centraliza o pin de Y com o mesmo zoom moderado fixo.

---

### User Story 2 - Seleção e foco convivem com o comportamento atual (Priority: P2)

Como usuário, ao clicar no local no menu, quero manter o que já acontece hoje (seleção / destaque / abertura do detalhe quando aplicável), além do novo foco no mapa, para não perder o fluxo de leitura ou edição.

**Why this priority**: Evita regressão; o foco no mapa é complemento, não substituto da seleção.

**Independent Test**: Clicar um local no menu e verificar que o pin fica selecionado/destacado e, no modo jogador, o detalhe do pin continua abrindo como antes; o mapa também centraliza.

**Acceptance Scenarios**:

1. **Given** o usuário está em modo jogador, **When** clica um local no menu, **Then** o detalhe do local abre (comportamento existente) **e** o mapa centraliza o pin com zoom simples.
2. **Given** o usuário está em Modo GM (sem fluxo de posicionamento ativo), **When** clica um local no menu, **Then** o pin fica selecionado no mapa **e** o mapa centraliza com zoom simples.
3. **Given** o Modo GM está em fluxo de posicionamento no mapa (novo pin / reposicionar / mover grupo), **When** o usuário clica um local no menu, **Then** o foco no mapa **não** inicia se a seleção de local pelo menu já estiver bloqueada nesse fluxo (mesmo critério do comportamento atual de seleção).

---

### Edge Cases

- Local sem coordenadas inválidas: se x/y estiverem fora do intervalo esperado do mapa, o foco não deve travar a interface (degradação graciosa).
- Mapa sem imagem / placeholder: se o mapa não estiver exibível, o clique no menu não deve gerar erro bloqueante; o foco pode ser no-op.
- Mobile com menu overlay: após clicar o local, o mapa ainda deve poder mostrar o pin centrado (mesmo se o painel fechar, conforme UX mobile atual).
- Zoom “simples”: um **nível moderado fixo** (não o máximo); ao focar pelo menu, o zoom é sempre definido para esse nível, além de centralizar.
- Hover no menu (destaque sem clique) **não** precisa centralizar o mapa — só o clique.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao clicar um local na lista do menu lateral (aba Locais), o sistema MUST centralizar o pin correspondente na área visível do mapa.
- **FR-002**: No mesmo clique, o sistema MUST definir o zoom do mapa para um **nível moderado fixo** (previsível e abaixo do zoom máximo), além de centralizar — não apenas pan, e não preservar o zoom anterior se for diferente desse alvo.
- **FR-003**: O foco MUST atualizar ao clicar outro local (o mapa passa a centrar o novo pin).
- **FR-004**: O clique no menu MUST preservar o comportamento de seleção já existente (destaque do pin; detalhe do local no modo jogador), salvo restrições já existentes (ex.: posicionamento GM).
- **FR-005**: Hover sobre o nome do local no menu MUST NOT, por si só, centralizar ou alterar o zoom do mapa.
- **FR-006**: O foco pelo menu MUST usar uma transição animada suave e curta (pan + zoom juntos) até o pin centrado no zoom moderado fixo; a transição MUST completar em poucos segundos e não deixar o mapa em estado quebrado.
- **FR-007**: Se o mapa não puder ser focado (sem superfície válida), o clique no menu MUST NOT gerar falha bloqueante na interface.

### Key Entities

- **Local (pin)**: Entidade com posição no mapa e entrada na lista do menu.
- **Foco de mapa**: Ajuste transitório de pan/zoom da vista do mapa para destacar um pin específico após ação do usuário.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes manuais com mapa carregado e local válido, após clicar o local no menu o pin fica visível na região central do mapa (não fora da área útil).
- **SC-002**: Em 100% desses mesmos testes, após o clique o zoom do mapa fica no nível moderado fixo de foco (o mesmo valor entre cliques), abaixo ou no máximo igual ao zoom máximo permitido, e distinto de um estado “totalmente afastado” usado no teste.
- **SC-003**: O usuário reconhece o pin focado em menos de 3 segundos após o clique no menu, incluindo a animação suave de pan/zoom.
- **SC-004**: Nenhuma regressão: no modo jogador, o detalhe do local continua abrindo ao clicar no menu; hover continua só destacando sem focar o mapa.

## Assumptions

- O gesto aplica-se ao clique na lista de **locais** do menu lateral (não a NPCs/arcos).
- “Zoom simples” significa um **nível moderado fixo** aplicado em todo foco pelo menu (sempre o mesmo alvo), não zoom máximo nem “só pan”.
- O comportamento vale para jogador e GM (quando a seleção de local pelo menu já é permitida).
- Não é obrigatório um botão separado “Ir para o pin”; o clique na lista dispara o foco.
- A transição de foco é **animada** (suave e curta), não um salto instantâneo.
- Durante fluxo de posicionamento GM, o foco pelo menu segue a mesma restrição já usada para seleção de local (não inicia foco se a seleção estiver bloqueada).
- Pan/zoom manuais depois do foco continuam disponíveis; o foco não “trava” o mapa.
- A feature não altera dados persistidos da campanha.
