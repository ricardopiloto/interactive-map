# Feature Specification: Linha do Tempo por arcos

**Feature Branch**: `153-linha-tempo-por-arcos`  
**Backlog**: [BKLG-039](../../docs/backlog/backlog.md#bklg-039-produto--linha-do-tempo-por-arcos-e-por-descoberta)  
**Created**: 2026-09-28  
**Status**: Draft

**Input**: User description: "Leia o BKLG-039 e vamos criar uma spec para este item." Decisões: usar a direção vertical do protótipo; cada sessão pertence a um arco, com a exceção de uma sessão que pode fechar um arco e iniciar o seguinte.

## Constitution *(constraints; not implementation)*

- Arcos e sessões permanecem isolados na campanha a que pertencem; qualquer nova superfície de dados deve respeitar a matriz de isolamento entre campanhas.
- Alterações de permissões, dados persistidos e migrações seguem testes antes da implementação e migrações versionadas.
- Não exigir alterações nas instâncias legadas antes do corte.
- Reutilizar os padrões existentes do produto e justificar dependências novas.
- Toda copy nova da interface existe em pt-BR e en; títulos e conteúdo narrativo escritos pelo mestre não são traduzidos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acompanhar sessões por arco (Priority: P1)

Como mestre ou jogador, quero consultar as sessões agrupadas visualmente por arco e posicionadas conforme suas datas, para acompanhar a continuidade de cada fio narrativo mesmo quando outros assuntos ocorrem entre suas sessões.

**Why this priority**: A continuidade visual dos arcos é o valor central deste modo da Linha do Tempo.

**Independent Test**: Com sessões datadas em dois ou mais arcos e sessões sem arco, abrir o modo por arcos e verificar raias, posição temporal, ligações e conteúdo permitido ao papel.

**Acceptance Scenarios**:

1. **Given** uma campanha com arcos e sessões associadas, **When** o utilizador escolhe «Por arcos», **Then** vê uma raia vertical por arco, com sessões na posição correspondente à sua data real e as mais recentes acima das mais antigas.
2. **Given** duas sessões consecutivas do mesmo arco separadas no tempo, **When** o utilizador consulta a raia, **Then** consegue perceber a sequência, o tempo decorrido e os intervalos longos por meio da ligação visual descontínua.
3. **Given** sessões sem arco, **When** o utilizador consulta o modo, **Then** essas sessões continuam visíveis numa raia neutra identificada como «Sem arco».
4. **Given** uma sessão que encerra um arco e inicia o arco seguinte, **When** o utilizador consulta ambos, **Then** a mesma sessão aparece como limite compartilhado entre as duas raias sem duplicar a sessão subjacente.

### User Story 2 - Criar e organizar arcos (Priority: P1)

Como mestre, quero criar arcos manualmente com título, cor, locais e sessões, para organizar a narrativa e disponibilizá-la no modo por arcos.

**Why this priority**: A visualização só é útil se o mestre puder definir os arcos e dizer quais sessões lhes dão continuidade.

**Independent Test**: Como mestre, criar um arco, escolher cor e associar locais e sessões; editar e remover associações; confirmar que a visualização reflete as alterações. Jogador tem somente leitura.

**Acceptance Scenarios**:

1. **Given** um mestre a criar um arco, **When** informa título, cor e associa sessões e locais existentes, **Then** o arco fica disponível no modo por arcos e mantém essas associações após recarregar.
2. **Given** uma sessão ainda sem arco, **When** o mestre a associa a um arco, **Then** a sessão passa a aparecer na respetiva raia.
3. **Given** uma sessão que inicia um novo arco e encerra o anterior, **When** o mestre marca a exceção de transição, **Then** essa única sessão pode aparecer no arco anterior e como primeira sessão do novo arco.
4. **Given** um jogador a abrir a administração dos arcos, **When** consulta a campanha, **Then** não recebe ações de criação ou edição.

### User Story 3 - Filtrar arcos e escolher modo (Priority: P2)

Como utilizador, quero alternar entre a cronologia existente e o modo por arcos e filtrar as raias, para concentrar a leitura nos fios narrativos relevantes.

**Why this priority**: Alternar preserva o uso atual da Linha do Tempo e os filtros tornam campanhas com muitos arcos navegáveis.

**Independent Test**: Alternar entre os modos cronológico e por arcos, ativar e remover filtros e verificar que a seleção não altera dados nem esconde sessões sem arco.

**Acceptance Scenarios**:

1. **Given** uma campanha com arcos cadastrados, **When** o utilizador seleciona «Por arcos», **Then** vê o modo descrito e pode voltar ao modo cronológico existente.
2. **Given** vários arcos disponíveis, **When** o utilizador filtra por um ou mais, **Then** apenas as raias selecionadas são enfatizadas/exibidas conforme o filtro, podendo voltar a «Todos» sem limite artificial de quantidade selecionada.
3. **Given** uma campanha sem arcos, **When** o utilizador consulta a Linha do Tempo, **Then** o modo continua compreensível, informa que não há arcos e oferece o modo cronológico; não apresenta uma tela quebrada ou vazia sem explicação.

### Edge Cases

- Datas iguais mantêm desempate estável, conforme o comportamento cronológico já definido pela Linha do Tempo.
- Uma sessão pode pertencer a um único arco; a exceção de transição permite compartilhar somente a sessão de abertura do arco seguinte com o arco imediatamente anterior.
- Uma sessão pode estar associada a vários eventos, mas isso não cria sessões duplicadas na mesma raia.
- Arco sem sessão continua válido e pode aparecer com estado vazio na administração; não cria aparições artificiais na timeline.
- Cor inválida ou ausente não pode tornar texto ou marcadores ilegíveis; a interface usa uma cor padrão legível.
- Remover um arco não deve remover sessões nem locais; associações são desfeitas segundo confirmação clara.
- Eventos da timeline existentes e o modo cronológico continuam acessíveis.
- Dados e identificadores de outra campanha não podem ser consultados ou alterados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A Linha do Tempo MUST oferecer os modos cronológico existente e «Por arcos», sem alterar o resultado ou os dados do modo cronológico.
- **FR-002**: O modo «Por arcos» MUST apresentar uma raia vertical por arco, com o tempo real como eixo e sessões mais recentes acima das mais antigas, seguindo a direção vertical escolhida para o protótipo.
- **FR-003**: O sistema MUST permitir que um mestre autorizado crie e edite arcos com título, cor persistida, resumo opcional e associações com locais e sessões existentes.
- **FR-004**: Cada sessão MUST pertencer a no máximo um arco, exceto quando marcada como sessão de transição: uma sessão que encerra um arco e inicia o arco imediatamente seguinte pode aparecer nas duas raias. A exceção não duplica nem cria outra sessão.
- **FR-005**: Entre sessões consecutivas de uma raia, a interface MUST indicar o tempo decorrido; intervalos longos MUST ser visualmente distinguíveis por uma ligação tracejada.
- **FR-006**: Sessões sem arco MUST permanecer visíveis em uma raia neutra identificada.
- **FR-007**: O utilizador MUST poder filtrar as raias por arco e restaurar a vista de todos os arcos, sem limite fixo de arcos selecionados.
- **FR-008**: O modo MUST informar de forma compreensível quando a campanha ainda não tem arcos e manter disponível a cronologia existente.
- **FR-009**: Apenas o mestre autorizado MUST poder gerir arcos e associações; jogadores MUST ter somente leitura, de acordo com as regras de visibilidade já aplicadas à Linha do Tempo e às sessões.
- **FR-010**: Dados de arcos, sessões e locais MUST permanecer isolados por campanha; novas superfícies de dados MUST integrar a matriz de testes de isolamento.
- **FR-011**: Toda copy nova MUST estar disponível em pt-BR e en.
- **FR-012**: O sistema MUST permitir a escolha explícita entre criar arco manualmente e solicitar criação por IA; a criação manual permanece disponível independentemente da IA.
- **FR-013**: Se o mestre escolher IA sem recursos de IA habilitados para a campanha, o produto MUST explicar o estado e oferecer o caminho de habilitação ou a criação manual. A execução do motor de IA não faz parte desta feature.

### Key Entities *(include if data involved)*

- **Arco**: Agrupamento narrativo com título, cor, resumo opcional e associações com sessões e locais de uma campanha.
- **Sessão**: Registo da crónica com data/ordem existente; pode pertencer a um arco, com a exceção explícita de uma sessão de transição compartilhada entre arcos adjacentes.
- **Local**: Lugar existente que pode estar associado a um arco.
- **Campanha**: Limite de propriedade e isolamento de arcos, sessões e locais.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em todos os cenários com datas distintas, sessões são exibidas na raia correta e na posição temporal correspondente, com as mais recentes acima das mais antigas.
- **SC-002**: Em 100% dos cenários de transição configurados, a sessão compartilhada aparece uma vez em cada uma das duas raias adjacentes e não é duplicada nos dados da crónica.
- **SC-003**: Um mestre consegue criar um arco e associar sessões e locais num único fluxo de gestão, e as associações persistem ao reabrir a Linha do Tempo.
- **SC-004**: Filtrar e restaurar os arcos não altera a associação persistida das sessões; todas as sessões sem arco permanecem localizáveis.
- **SC-005**: Nenhum cenário de autorização ou isolamento permite a um jogador gerir arcos ou a uma campanha aceder a dados de outra.
- **SC-006**: 100% das strings novas estão disponíveis em pt-BR e en; os modos e filtros permanecem utilizáveis em ecrãs estreitos e temas suportados.

## Assumptions

- A escolha «vertical» refere-se às raias verticais em estilo grafo da proposta: cada arco ocupa uma coluna; sessões mais recentes ficam acima das antigas, mantendo espaçamento proporcional ao tempo real. A direção horizontal/Gantt não será usada nesta versão.
- A exceção definida pelo utilizador significa que uma sessão pode ser compartilhada somente entre um arco e o arco imediatamente seguinte quando é a sessão de abertura deste último. O mestre assinala explicitamente essa condição; o limite e a UX final podem ser refinados no plan sem ampliar a regra.
- O filtro é livre: não há teto artificial para número de arcos selecionados; a campanha pode abrir inicialmente com todos e permitir foco por chips.
- Reaproveitar a entidade e a administração de Arco existentes; a execução/detecção de arcos por IA permanece fora de escopo. Esta feature define apenas escolha, estado de habilitação e caminho alternativo manual.
- Remoção de arcos, regras de visibilidade e ordem cronológica base seguem os padrões existentes; o modo por arcos não altera os eventos já registrados na Linha do Tempo.
- Importação e exportação da campanha ficam fora de escopo salvo requisito já obrigatório para os dados de Arco no produto.
