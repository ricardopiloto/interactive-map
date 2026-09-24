# Feature Specification: Retratos nas listas de personagens

**Feature Branch**: `145-retrato-lista-personagens`  
**Created**: 2026-09-24  
**Status**: Draft  
**Input**: User description: "Na lista de personagens, tanto no mapa como no mapa de relações, ao invés de aparecer a inicial do personagem nós devemos mostrar a imagem do personagem, similar ao que é feito no token dentro do mapa de relações."

## Constitution *(constraints; not implementation)*

- Isolamento entre campanhas: nenhuma informação de outra campanha pode aparecer; esta alteração somente apresenta retratos já disponíveis na campanha atual e não adiciona superfícies de dados.
- Produção legada: nenhuma alteração em instâncias legadas é necessária.
- Simplicidade: reaproveitar os retratos de personagem e o comportamento de imagem já conhecido nos tokens do mapa de relações.
- Interface PT-BR e EN: nenhuma copy visível nova é necessária; o nome do personagem continua identificando cada linha.
- Migrações: nenhuma alteração de dados ou schema é necessária.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reconhecer personagens pela imagem no mapa (Priority: P1)

Como usuário do mapa, quero ver o retrato dos personagens na lista lateral, para reconhecê-los visualmente sem depender de suas iniciais.

**Why this priority**: A lista do mapa é uma das superfícies principais de consulta dos personagens e deve refletir os retratos que já foram cadastrados.

**Independent Test**: Abrir o mapa de uma campanha com personagens com e sem retrato e verificar os avatares na lista lateral.

**Acceptance Scenarios**:

1. **Given** um personagem com retrato disponível, **When** aparece na lista de personagens do mapa, **Then** seu retrato é mostrado no avatar ao lado do nome.
2. **Given** um personagem sem retrato disponível, **When** aparece na lista do mapa, **Then** a lista mantém um avatar de fallback identificável usando as iniciais atuais.
3. **Given** um retrato que não pode ser carregado, **When** o personagem aparece na lista do mapa, **Then** o avatar retorna ao fallback de iniciais sem quebrar ou ocultar a linha.

### User Story 2 - Reconhecer personagens pela imagem no mapa de relações (Priority: P1)

Como usuário do mapa de relações, quero ver os retratos dos personagens na lista lateral, com o mesmo padrão de imagem usado nos tokens do grafo, para reconhecer os personagens também ao navegar pela lista.

**Why this priority**: A lista e o grafo apresentam os mesmos personagens; usar seus retratos nas duas superfícies mantém a identificação visual consistente.

**Independent Test**: Abrir o mapa de relações com personagens com e sem retrato e comparar as miniaturas da lista com os retratos correspondentes nos tokens do grafo.

**Acceptance Scenarios**:

1. **Given** um personagem com retrato disponível, **When** aparece na lista do mapa de relações, **Then** a lista mostra o mesmo retrato usado no token correspondente.
2. **Given** um personagem sem retrato disponível, **When** aparece na lista do mapa de relações, **Then** o avatar de fallback baseado nas iniciais permanece visível.
3. **Given** um personagem oculto ou filtrado segundo as regras existentes, **When** a lista é exibida, **Then** as mesmas regras de visibilidade e filtragem continuam determinando se sua linha aparece; o retrato não revela personagens que não seriam listados.

### Edge Cases

- Retratos quadrados, altos ou largos mantêm o formato do avatar e não distorcem a imagem.
- Falha de carregamento do retrato usa o fallback de iniciais e não deixa imagem quebrada visível.
- Nome vazio ou formado somente por espaços mantém o fallback seguro já usado pela lista.
- A atualização ou remoção de retrato deve refletir-se nas listas sem associar a imagem ao personagem errado.
- Em larguras estreitas, a miniatura não deve comprimir o texto nem provocar rolagem horizontal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A lista de personagens do mapa MUST mostrar o retrato cadastrado do personagem em seu avatar quando a imagem estiver disponível.
- **FR-002**: A lista de personagens do mapa de relações MUST mostrar o retrato cadastrado do personagem em seu avatar quando a imagem estiver disponível.
- **FR-003**: O tratamento visual dos retratos nas duas listas MUST corresponder ao padrão de imagem dos tokens do mapa de relações, mantendo o avatar circular e sem distorcer a proporção da imagem.
- **FR-004**: Quando um personagem não tiver retrato ou a imagem não puder ser carregada, as duas listas MUST apresentar um fallback de iniciais em vez de uma imagem quebrada ou de um espaço vazio.
- **FR-005**: Os retratos MUST permanecer vinculados ao nome e à linha do personagem correspondente em todos os estados de seleção, busca e filtro já existentes.
- **FR-006**: A exibição dos retratos MUST respeitar os conjuntos de personagens e as regras de visibilidade que já se aplicam a cada mapa e usuário.
- **FR-007**: A imagem junto ao nome MUST ser tratada como decorativa para tecnologias assistivas, evitando repetição do nome já disponível na linha.
- **FR-008**: A alteração MUST preservar o tamanho e a legibilidade das linhas em telas estreitas, sem causar rolagem horizontal.

### Key Entities *(include if feature involves data)*

- **Personagem**: Registro já existente com nome e retrato opcional; esta funcionalidade apenas apresenta o retrato associado nas listas e não altera seus dados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos personagens com retrato válido exibidos nas listas do mapa e do mapa de relações, o avatar corresponde ao retrato do personagem daquela linha.
- **SC-002**: Em 100% dos personagens sem retrato ou com erro de carregamento, ambas as listas exibem um fallback de iniciais, sem ícone de imagem quebrada ou avatar vazio.
- **SC-003**: Em todos os tamanhos de tela suportados, nomes e ações existentes permanecem legíveis e nenhuma das listas passa a exigir rolagem horizontal.
- **SC-004**: Busca, seleção, filtros e visibilidade continuam apresentando exatamente o mesmo conjunto e comportamento de personagens antes da mudança.

## Assumptions

- A imagem de personagem já cadastrada é a fonte dos retratos; não será necessário solicitar, carregar ou persistir imagens por um fluxo novo.
- O fallback de iniciais atualmente usado nas listas será preservado para personagens sem retrato e para erros de carregamento.
- O token do mapa de relações é a referência de apresentação: formato circular, imagem recortada para preencher o avatar e iniciais subjacentes como fallback.
- O escopo abrange os avatares nas listas de personagens do mapa e do mapa de relações; não altera os detalhes de personagem, os tokens do grafo ou outros lugares onde nomes aparecem.
