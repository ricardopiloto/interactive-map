# Feature Specification: Deselecionar pin no modo GM

**Feature Branch**: `010-gm-deselect-pin`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Vamos ajustar a seleção do pin como GM, quando o GM seleciona o pin ele fica \"selecionado\" porém eu não consigo \"deselecionar\", adicione a funcionalidade do GM clica \"fora do pin\" para deselecionar o pin selecionado."

## Clarifications

### Session 2026-08-03

- Q: Ao deselecionar por clique fora, o que mais deve limpar além do destaque do pin? → A: Limpa seleção visual e fecha o detalhe/ficha do local associado (se estiver aberto); não cancela formulários GM de edição abertos por outros fluxos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - GM deseleciona pin clicando fora (Priority: P1)

Como mestre (GM), após selecionar um pin de local no mapa, quero clicar em uma área vazia do mapa (fora de qualquer pin) para limpar a seleção, para poder continuar trabalhando no mapa sem um pin permanecer visualmente selecionado.

**Why this priority**: Corrige um bloqueio de fluxo no modo GM; sem deseleção, o estado “selecionado” fica preso e atrapalha a edição/navegação.

**Independent Test**: Em modo GM, selecionar um pin (confirmação visual de seleção), clicar fora do pin na área do mapa; a seleção desaparece. Não depende de criar/editar locais.

**Acceptance Scenarios**:

1. **Given** o usuário está em modo GM e um pin de local está selecionado (com ou sem ficha/detalhe desse local aberto), **When** ele clica na área do mapa fora de qualquer pin de local, **Then** nenhum pin permanece selecionado, a indicação visual de seleção some e a ficha/detalhe associada a esse pin fecha se estiver aberta.
2. **Given** o usuário está em modo GM e um pin está selecionado, **When** ele clica em outro pin de local, **Then** o pin clicado passa a ser o selecionado (em vez de apenas limpar a seleção).
3. **Given** o usuário está em modo GM e nenhum pin está selecionado, **When** ele clica na área vazia do mapa, **Then** nada muda de forma disruptive (sem erro e sem abrir fluxos de posicionamento não solicitados).
4. **Given** o usuário está em modo GM com um formulário de edição de local aberto por fluxo administrativo (não a ficha de seleção do mapa) e um pin selecionado, **When** ele deseleciona clicando fora no mapa, **Then** a seleção/ficha de mapa limpa, mas o formulário administrativo permanece aberto.

---

### User Story 2 - Deseleção não interfere em fluxos de posicionamento (Priority: P2)

Como GM, quando estou no meio de um fluxo que pede clique no mapa (novo local, reposicionar local ou mover grupo), quero que esse clique continue servindo ao posicionamento — e não seja interpretado apenas como “deselecionar”.

**Why this priority**: Evita regressão nos fluxos GM já existentes de colocação no mapa.

**Independent Test**: Ativar “adicionar pin” (ou reposicionar / mover grupo) com ou sem pin previamente selecionado; um clique no mapa deve completar o posicionamento, não apenas limpar seleção de forma ambígua.

**Acceptance Scenarios**:

1. **Given** o modo de posicionamento de novo local (ou reposicionar / mover grupo) está ativo, **When** o GM clica no mapa, **Then** o sistema trata o clique como posicionamento daquele fluxo.
2. **Given** um pin estava selecionado e o GM inicia um fluxo de posicionamento, **When** o posicionamento termina ou é cancelado conforme o fluxo atual, **Then** o comportamento de seleção/deseleção volta a seguir a regra de “clique fora deseleciona” fora desses modos.

---

### Edge Cases

- Clique em controles do mapa (zoom, botão de mapa, etc.), legenda ou menus laterais **não** deve ser tratado como “clique fora no mapa” para deselecionar.
- Pan/zoom com arraste ou roda do mouse **não** deve, por si só, deselecionar o pin.
- Clique no ícone do grupo (posição do grupo) **não** seleciona um local; também **não** precisa deselecionar o pin local a menos que o clique seja na área vazia do mapa — default: só a área vazia do mapa deseleciona.
- Em modo jogador, o fechamento da ficha/modal do local permanece o caminho para limpar a seleção; esta feature não exige o mesmo gesto “clique fora” para jogadores.
- Formulários GM de edição abertos pela lista/admin **não** são cancelados pela deseleção por clique fora (apenas seleção + ficha associada à seleção).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Em modo GM, com um pin de local selecionado, o sistema MUST limpar essa seleção quando o usuário clicar na área vazia do mapa (fora de pins de local).
- **FR-002**: Em modo GM, clicar em um pin de local MUST selecionar esse pin (incluindo trocar a seleção de um pin para outro).
- **FR-003**: A limpeza da seleção MUST remover a indicação visual de pin selecionado no mapa.
- **FR-004**: Em modo GM, ao deselecionar por clique fora, o sistema MUST também fechar a ficha/detalhe do local associada à seleção, se estiver aberta.
- **FR-005**: Deseleção por clique fora MUST NOT cancelar formulários GM de criação/edição de local abertos por fluxos administrativos distintos da ficha de seleção do mapa.
- **FR-006**: Enquanto um fluxo de posicionamento no mapa estiver ativo (novo pin, reposicionar local, mover grupo), o clique no mapa MUST priorizar esse fluxo em relação à deseleção.
- **FR-007**: Gestos de navegação do mapa (pan/zoom) MUST NOT deselecionar o pin apenas por ocorrerem.
- **FR-008**: Cliques em UI fora da área do mapa (menu, diálogos, controles flutuantes) MUST NOT ser tratados como deseleção por esta regra, salvo se já existirem ações próprias de fechar/cancelar.
- **FR-009**: Esta capacidade de “clique fora deseleciona” é exigida no modo GM; o modo jogador MAY continuar usando o fechamento da ficha/detalhe do local para limpar a seleção.

### Key Entities

- **Seleção de pin (local)**: Estado transitório de qual local, se algum, está destacado/selecionado no mapa durante a sessão de uso; não é um dado persistido da campanha.
- **Modo GM**: Sessão autenticada do mestre na interface do mapa, com ferramentas de edição ativas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em modo GM, um mestre consegue deselecionar um pin selecionado com um único clique na área vazia do mapa, em menos de 2 segundos após perceber a seleção.
- **SC-002**: Em 100% dos testes manuais do fluxo P1, após o clique fora, nenhum pin permanece com indicação de selecionado e nenhuma ficha/detalhe daquele local permanece aberta por causa da seleção.
- **SC-003**: Fluxos de posicionamento (novo local / reposicionar / mover grupo) continuam concluíveis com um clique no mapa sem passo extra de “deselecionar primeiro”.
- **SC-004**: Pan e zoom não limpam involuntariamente a seleção em uso normal (verificar em sessão curta de navegação com pin selecionado).

## Assumptions

- O problema reportado ocorre no **modo GM**; jogadores já limpam a seleção ao fechar o detalhe do local.
- “Fora do pin” significa a **área do mapa sem pin de local**, não a página inteira.
- Controles, legenda e menus não contam como área de deseleção.
- Não é necessário um botão dedicado “Limpar seleção” nesta entrega; o clique fora é o gesto pedido.
- Em modo GM atual, a ficha de jogador pode não aparecer ao selecionar pin; FR-004 aplica-se quando essa ficha/detalhe existir aberta ligada à seleção.
- Selecionar outro pin continua sendo a forma de trocar o foco; não é necessário clique fora entre trocas.
- Nenhuma mudança de dados persistidos (locais, cores, posições) é necessária para esta feature.
