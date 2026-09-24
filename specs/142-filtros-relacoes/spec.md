# Feature Specification: Filtros consistentes em Relações

**Feature Branch**: `142-filtros-relacoes`
**Backlog**: [BKLG-032](../../docs/backlog/backlog.md#bklg-032-bug--filtros-de-vínculo-em-relações-devem-manter-paridade-entre-sidepanel-e-grafo)
**Created**: 2026-09-24
**Status**: Draft

**Input**: User description: "Leia o item BKLG-032 no backlog e crie uma SPEC para ele."

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; a funcionalidade só filtra dados da campanha já carregados na tela, sem criar superfície HTTP.
- Produção legada: a tela existente continua funcionando sem exigir mudanças nas instâncias legadas.
- Interface: qualquer texto novo deve existir em pt-BR e en; nomes e conteúdo escritos pelo mestre permanecem sem tradução.
- Escopo: alinhar comportamento de filtragem com `main`, preservando o desenho atual da tela nesta branch.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Aplicar filtro de tipo ao grafo e ao detalhe (Priority: P1)

Como mestre ou jogador, quero que a seleção de tipos de vínculo controle de forma coerente as arestas do grafo e os vínculos listados no SidePanel quando seleciono um personagem, para que ambos mostrem a mesma visão filtrada.

**Why this priority**: A divergência entre o grafo e o detalhe é o problema central do BKLG-032: a mesma tela pode apresentar conjuntos de vínculos diferentes porque o detalhe tem um filtro independente.

**Independent Test**: Com um personagem ligado a outros por pelo menos dois tipos distintos, selecionar um tipo e confirmar que o grafo e os vínculos do detalhe exibem somente vínculos que correspondem à seleção; alterar a seleção e confirmar que os dois resultados mudam juntos.

**Acceptance Scenarios**:

1. **Given** a tela de Relações sem filtros de tipo ativos, **When** a pessoa ativa um tipo de vínculo, **Then** o grafo e, ao abrir o detalhe de um personagem, a lista de vínculos dele mostram somente vínculos que correspondem aos tipos ativos.
2. **Given** um tipo ativo, **When** a pessoa ativa outro tipo, **Then** o grafo e a lista de detalhe mostram a união dos vínculos correspondentes aos dois tipos.
3. **Given** um ou mais tipos ativos, **When** a pessoa desativa todos eles, **Then** o grafo e a lista de detalhe voltam a mostrar todos os vínculos disponíveis.
4. **Given** um personagem selecionado e tipos filtrados, **When** a pessoa muda a seleção de tipos, **Then** a lista de detalhe acompanha a mesma seleção sem exigir um filtro separado.

### User Story 2 - Combinar status e busca sem divergência entre painel e grafo (Priority: P2)

Como mestre ou jogador, quero que status e busca mantenham o comportamento conhecido de `main` ao usar o painel e o grafo, para localizar personagens sem resultados contraditórios.

**Why this priority**: Status e busca são filtros complementares já presentes na experiência de Relações e precisam continuar coerentes durante a correção dos filtros de vínculo.

**Independent Test**: Escolher um status e buscar um personagem; confirmar que a lista lateral contém somente personagens que passam pelos dois critérios e que o grafo aplica o mesmo recorte de status, mantendo o comportamento de busca do grafo existente.

**Acceptance Scenarios**:

1. **Given** personagens com status diferentes, **When** a pessoa escolhe um status, **Then** a lista de personagens do SidePanel e os nós/arestas do grafo consideram somente personagens compatíveis com esse status.
2. **Given** um status selecionado, **When** a pessoa digita uma busca, **Then** a lista lateral restringe os personagens pelo texto e o grafo mantém o comportamento de busca já usado em `main`, sem esconder nós apenas porque não correspondem ao texto.
3. **Given** um personagem selecionado que deixa de corresponder ao filtro de status, **When** o filtro é aplicado, **Then** o painel de detalhe e a seleção do grafo deixam de apontar para um personagem fora do conjunto visível.

### User Story 3 - Preservar as interações de seleção e isolamento (Priority: P3)

Como mestre ou jogador, quero continuar selecionando personagens e isolando seus vínculos enquanto uso filtros, para explorar a rede sem perder as interações atuais.

**Why this priority**: Filtros e seleção atuam sobre a mesma rede. A correção não pode reintroduzir vínculos excluídos nem quebrar o retorno ao estado geral.

**Independent Test**: Selecionar um personagem, ativar isolamento e alternar filtros de tipo; confirmar que painel e grafo continuam limitados aos vínculos permitidos pelos filtros ativos e ao comportamento de isolamento já existente.

**Acceptance Scenarios**:

1. **Given** um personagem selecionado e isolamento ativo, **When** a pessoa altera os tipos ativos, **Then** o grafo mostra somente vínculos incidentes ao personagem selecionado que também correspondem ao filtro.
2. **Given** filtros ativos, **When** a pessoa remove a seleção ou desativa o isolamento, **Then** o grafo retorna ao conjunto geral permitido pelos filtros ativos.

### Edge Cases

- Quando não há vínculos que correspondam aos tipos ativos para o personagem selecionado, o SidePanel mostra o estado vazio existente e o grafo não mostra arestas incompatíveis.
- Quando a pessoa desativa o último tipo selecionado, o estado significa "sem filtro de tipo" e restaura todos os vínculos; não deve produzir lista vazia.
- Quando um vínculo tem tipos em ambas as direções, ele corresponde se ao menos um tipo apresentado para o vínculo satisfizer o filtro, seguindo a regra de correspondência já usada pelo grafo.
- Quando não há personagens compatíveis com status ou busca, painel e grafo mostram seus estados vazios existentes sem erro.
- A troca do personagem selecionado não deve criar um estado de tipo separado para o novo detalhe; a seleção global permanece coerente entre painel e grafo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST apresentar no SidePanel o controle de filtro de tipos de vínculo usado na tela de Relações.
- **FR-002**: O sistema MUST aplicar a mesma seleção de tipos às arestas exibidas no grafo e aos vínculos listados no detalhe do personagem no SidePanel.
- **FR-003**: O sistema MUST tratar múltiplos tipos ativos como união: um vínculo aparece quando pelo menos um dos seus tipos relevantes corresponde a um tipo selecionado.
- **FR-004**: O sistema MUST tratar ausência de tipos ativos como ausência de restrição por tipo, mostrando todos os vínculos que passam pelos demais critérios.
- **FR-005**: O sistema MUST preservar a interação existente dos chips: clique alterna/adiciona tipos segundo a semântica definida nas specs 133 e 134; duplo-clique isola o tipo selecionado e, quando ele já é o único isolado, restaura todos os tipos.
- **FR-006**: O filtro de status MUST restringir os personagens da lista lateral e o conjunto de personagens e vínculos disponíveis no grafo segundo o status escolhido.
- **FR-007**: A busca MUST restringir a lista de personagens do SidePanel e MUST preservar o comportamento de destaque correspondente no grafo, sem remover nós exclusivamente por não corresponderem ao texto.
- **FR-008**: A opção de isolamento MUST continuar limitando o grafo aos vínculos do personagem selecionado e combinar essa restrição com o filtro de tipos ativo.
- **FR-009**: Se o personagem selecionado deixar de estar visível por causa do filtro de status, o sistema MUST limpar sua seleção e o isolamento associado.
- **FR-010**: Os estados vazios do SidePanel e do grafo MUST comunicar que não há resultados para os critérios ativos, sem exibir vínculos que não correspondem a eles.
- **FR-011**: O sistema MUST manter a apresentação visual atual; esta funcionalidade altera o comportamento e a consistência dos filtros, não o desenho dos controles ou da tela.

### Key Entities *(include if data involved)*

- **Personagem**: pessoa representada na rede, com nome e status usados na busca e no filtro de status.
- **Vínculo**: relação entre personagens, podendo apresentar um ou mais tipos relevantes para filtragem e exibição.
- **Seleção de filtros**: critérios temporários da tela para tipos de vínculo, status e busca; não constituem dados persistidos da campanha.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em todos os cenários verificados com filtros por tipo, 100% dos vínculos visíveis no detalhe do personagem correspondem aos mesmos tipos ativos que filtram as arestas do grafo.
- **SC-002**: Ao desativar todos os tipos, 100% dos vínculos que passam pelos critérios de status, visibilidade e isolamento voltam a ser exibidos tanto no SidePanel quanto no Grafo.
- **SC-003**: Para qualquer seleção de status, 100% dos personagens exibidos na lista lateral e no grafo pertencem ao conjunto permitido por esse status.
- **SC-004**: A busca continua filtrando a lista do SidePanel e destacando correspondências no grafo, sem remover personagens do grafo apenas por não corresponderem ao texto.
- **SC-005**: A tela mantém os controles, organização e estilos atuais, sem alterações visuais introduzidas por esta funcionalidade.

## Assumptions

- A referência funcional é a branch `main` no momento da especificação: chips de tipo no SidePanel alimentam a filtragem do grafo, e status/busca mantêm o comportamento descrito nesta spec.
- A exigência de paridade também inclui os vínculos do painel de detalhe, que deve usar a seleção global de tipos em vez de manter filtros concorrentes.
- Os filtros são transitórios e não são gravados no perfil ou na campanha.
- A semântica de clique único e duplo-clique é a já documentada nas specs 133 e 134; esta feature trata da aplicação consistente dos resultados no painel e no grafo.
- Não há mudanças de API, persistência, permissões ou modelo de dados.
