# Feature Specification: Seleção de personagem no Mapa e em Relações

**Feature Branch**: `147-selecao-personagem`

**Created**: 2026-09-24

**Status**: Draft

**Input**: User description: "BUG-001: selecionar um personagem deve abrir sua ficha no Mapa; em Relações, deve selecionar o nó correspondente no grafo e exibir os detalhes do personagem no painel."

## Constitution *(constraints; not implementation)*

- Isolation: a seleção deve permanecer restrita à campanha atualmente aberta; não deve expor personagens de outra campanha.
- Legacy production MUST keep running unchanged until the cutover spec.
- UI strings are PT-BR and EN; text written by the GM is not translated.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Abrir ficha pelo Mapa (Priority: P1)

Como usuário da campanha, quero selecionar um personagem no Mapa e abrir sua ficha para consultar seus dados sem procurá-lo em outra área.

**Why this priority**: A seleção sem resposta impede o acesso à informação principal do personagem nessa tela.

**Independent Test**: Na tela do Mapa, selecionar um personagem disponível e confirmar que a ficha exibida corresponde a ele.

**Acceptance Scenarios**:

1. **Given** que o usuário está no Mapa e há personagens disponíveis, **When** seleciona um personagem, **Then** a ficha desse personagem é aberta.
2. **Given** que a ficha de um personagem está aberta, **When** o usuário seleciona outro personagem, **Then** a ficha passa a apresentar o personagem recém-selecionado.

### User Story 2 - Selecionar personagem em Relações (Priority: P1)

Como usuário da campanha, quero selecionar um personagem em Relações e ver tanto o nó correspondente selecionado no grafo quanto os detalhes desse personagem no painel.

**Why this priority**: A seleção precisa conectar a navegação no grafo aos detalhes apresentados, para que o usuário saiba qual personagem está consultando.

**Independent Test**: Em Relações, selecionar um personagem e confirmar que o nó correspondente fica selecionado e que o painel apresenta os dados do mesmo personagem.

**Acceptance Scenarios**:

1. **Given** que o usuário está em Relações e há personagens disponíveis, **When** seleciona um personagem, **Then** o nó correspondente fica selecionado e o painel mostra os detalhes desse personagem.
2. **Given** que um personagem está selecionado em Relações, **When** o usuário seleciona outro personagem, **Then** a seleção do grafo e os detalhes do painel passam a corresponder ao novo personagem.
3. **Given** que o usuário seleciona um nó de personagem diretamente no grafo, **When** a seleção é concluída, **Then** o painel mostra os detalhes do mesmo personagem.

### Edge Cases

- Se o personagem selecionado não tiver algum dado opcional, sua ficha ou painel continua acessível e apresenta os dados disponíveis.
- A troca de personagem não deve deixar a ficha, o painel e a seleção do grafo apontando para personagens diferentes.
- Personagens pertencentes a outra campanha não devem aparecer como resultado da seleção na campanha atual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: No Mapa, selecionar um personagem MUST abrir a ficha correspondente.
- **FR-002**: Em Relações, selecionar um personagem MUST selecionar o nó correspondente no grafo e apresentar os detalhes do personagem no painel.
- **FR-003**: Em Relações, selecionar um nó diretamente no grafo MUST apresentar no painel os detalhes do personagem desse nó.
- **FR-004**: Ao trocar a seleção, a ficha ou os detalhes exibidos MUST corresponder ao personagem mais recentemente selecionado.
- **FR-005**: A seleção e os dados apresentados MUST permanecer restritos à campanha atualmente aberta.
- **FR-006**: A ausência de dados opcionais MUST NOT impedir a abertura da ficha ou dos detalhes disponíveis.

### Key Entities

- **Personagem**: personagem da campanha e dados associados usados em sua ficha, no nó do grafo e no painel de detalhes.
- **Personagem selecionado**: personagem atualmente em foco na tela; em Relações, a identidade selecionada no grafo e a exibida no painel devem corresponder.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em todos os casos de seleção verificados no Mapa, a ficha aberta corresponde ao personagem selecionado.
- **SC-002**: Em todos os casos de seleção verificados em Relações, o nó selecionado e os detalhes exibidos correspondem ao mesmo personagem.
- **SC-003**: Após selecionar um segundo personagem, nenhuma informação de seleção anterior permanece apresentada como se pertencesse ao personagem atual.
- **SC-004**: A seleção não apresenta personagens nem detalhes de outra campanha.

## Assumptions

- O usuário tem acesso à campanha e às telas Mapa e Relações.
- “Selecionar personagem” inclui a seleção por uma entrada de personagem disponível na tela; em Relações, inclui também a seleção direta do nó no grafo.
- A ficha e o painel reutilizam os dados existentes do personagem; esta funcionalidade não altera nem amplia os dados cadastrados.
- A especificação trata do comportamento funcional e não requer alteração visual.
