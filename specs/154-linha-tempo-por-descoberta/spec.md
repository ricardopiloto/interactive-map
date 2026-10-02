# Feature Specification: Linha do Tempo por descoberta

**Feature Branch**: `154-linha-tempo-por-descoberta`  
**Backlog**: [BKLG-039](../../docs/backlog/backlog.md#bklg-039-produto--linha-do-tempo-por-arcos-e-por-descoberta)  
**Created**: 2026-09-28  
**Status**: Draft

**Input**: User description: "Leia o BKLG-039 e vamos criar uma spec para este item." Decisão: incluir Itens na visualização por descoberta nesta fase.

## Constitution *(constraints; not implementation)*

- Entidades e associações de descoberta permanecem isoladas na campanha a que pertencem; toda superfície de dados nova integra a matriz de isolamento.
- Autorização, dados persistidos e migrações seguem testes antes da implementação e migrações versionadas.
- Não exigir alterações nas instâncias legadas antes do corte.
- Reutilizar padrões existentes e justificar dependências novas; SQLite continua sendo o armazenamento.
- Toda copy nova da interface existe em pt-BR e en; nomes, descrições e conteúdo narrativo escritos pelo mestre não são traduzidos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar a ordem em que elementos foram descobertos (Priority: P1)

Como mestre ou jogador, quero ver personagens, locais, facções e itens pela sessão em que surgiram pela primeira vez, para recordar quando cada elemento entrou na história da campanha.

**Why this priority**: A primeira aparição é a informação central que diferencia este modo da cronologia de eventos.

**Independent Test**: Com sessões e eventos associando personagens, locais, facções e itens em ordens diferentes, abrir «Por descoberta» e confirmar o primeiro ponto temporal de cada elemento, agrupamento e visibilidade de cada papel.

**Acceptance Scenarios**:

1. **Given** entidades presentes em várias sessões ou eventos, **When** o utilizador escolhe «Por descoberta», **Then** cada entidade aparece agrupada por tipo e ordenada pela data da sua primeira aparição.
2. **Given** uma entidade que aparece numa sessão e num evento, **When** a timeline calcula a primeira aparição, **Then** usa o registo cronologicamente mais antigo e apresenta as aparições posteriores disponíveis.
3. **Given** um jogador e uma entidade ou menção oculta, **When** o jogador consulta o modo, **Then** não recebe conteúdo protegido nem nomes ou associações que revelem a entidade oculta.
4. **Given** uma campanha sem associações de descoberta, **When** o utilizador abre o modo, **Then** recebe um estado vazio compreensível e pode voltar ao modo cronológico.

### User Story 2 - Reconhecer reaparições e filtrar tipos (Priority: P1)

Como utilizador, quero perceber quando uma entidade reaparece e filtrar a timeline por tipo, para acompanhar personagens, locais, facções ou itens sem percorrer uma lista misturada.

**Why this priority**: As reaparições e o agrupamento por tipo permitem reconhecer continuidade e lacunas na história.

**Independent Test**: Preparar aparições em sessões separadas por diferentes intervalos; confirmar primeira ocorrência, aparições seguintes, intervalo desde a anterior e filtros por tipo.

**Acceptance Scenarios**:

1. **Given** uma entidade com duas ou mais aparições, **When** o utilizador consulta o seu registo, **Then** vê a primeira aparição e todas as aparições posteriores identificadas como reaparições.
2. **Given** duas aparições consecutivas separadas por tempo, **When** o utilizador lê a sequência, **Then** consegue identificar o tempo decorrido entre elas, inclusive quando o intervalo é longo.
3. **Given** todos os tipos disponíveis, **When** o utilizador escolhe um tipo, **Then** a lista mostra somente entidades desse tipo; escolher «Todos» restaura os grupos.

### User Story 3 - Registar e associar Itens (Priority: P1)

Como mestre, quero cadastrar Itens da campanha e associá-los às sessões e acontecimentos em que aparecem, para que também possam ser acompanhados pela Linha do Tempo por descoberta.

**Why this priority**: Itens não têm registo estruturado existente e não poderiam aparecer na visualização sem uma forma de criá-los e documentar suas aparições.

**Independent Test**: Como mestre, criar um item, editar dados e visibilidade, associá-lo a uma sessão e a um evento, e confirmar que jogadores veem apenas as referências autorizadas.

**Acceptance Scenarios**:

1. **Given** um mestre autorizado, **When** cria um item com nome e associações opcionais, **Then** o item persiste e pode ser encontrado na gestão da campanha.
2. **Given** um item existente, **When** o mestre associa o item a uma sessão ou evento, **Then** essa sessão ou evento conta como aparição do item na timeline.
3. **Given** um item restrito ao mestre, **When** um jogador consulta a timeline ou uma sessão/evento a ele associado, **Then** nome e detalhes do item não são revelados.
4. **Given** um jogador, **When** abre o modo ou as superfícies de gestão de itens, **Then** vê apenas conteúdo permitido e não recebe controles de escrita.

### Edge Cases

- Entidade sem sessão ou evento associado não tem primeira aparição e não é listada como descoberta.
- Uma aparição ligada a uma sessão ou evento oculto (`visivel_para_todos=false`) não conta como aparição na perspectiva do jogador — nem como primeira aparição, nem como reaparição. Para o jogador, a entidade só é considerada descoberta a partir da primeira sessão/evento **visível** em que aparece; sessões ocultas anteriores não são reveladas nem contadas. Para o mestre, todas as aparições contam, ocultas ou não.
- Quando um personagem aparece numa sessão visível e também numa sessão anterior oculta com o mesmo personagem, o sistema MUST alertar o mestre sobre essa inconsistência (ao gerir a sessão ou ao consultar o modo por descoberta como mestre), sem bloquear a gravação nem alterar a visibilidade automaticamente — a decisão de manter, revelar ou ajustar a sessão oculta permanece do mestre.
- Quando sessão e evento indicam aparições em datas iguais, manter desempate estável definido pela Linha do Tempo; não criar aparições duplicadas para o mesmo vínculo e momento.
- Uma entidade vinculada a várias sessões na mesma data continua com uma única aparição por sessão pertinente; não perder a sequência posterior.
- O mesmo NPC pode contribuir para descoberta de uma facção derivada; variações de espaços e maiúsculas/minúsculas na facção são tratadas como o mesmo rótulo para agrupar, preservando a forma de apresentação mais legível.
- Facção vazia ou composta apenas por espaços não forma um grupo de descoberta.
- Excluir um Item não deve excluir sessões nem eventos; remover suas associações segundo confirmação clara.
- Item com associações todas ocultas não pode ser revelado ao jogador pela lista de descoberta.
- Dados e identificadores de outra campanha não podem ser consultados ou alterados.
- Falha ao salvar um Item informa o mestre sem perder os dados já persistidos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A Linha do Tempo MUST oferecer «Por descoberta» como modo adicional e manter disponíveis os modos cronológico e por arcos quando estes estiverem presentes.
- **FR-002**: O modo MUST agrupar entidades em Personagens, Locais, Facções e Itens e permitir filtrar um tipo ou todos.
- **FR-003**: Para Personagens, Locais e Itens, a primeira aparição MUST ser determinada pela sessão ou evento cronologicamente mais antigo que tenha uma associação explícita com a entidade. Na perspectiva do jogador, apenas sessões/eventos **visíveis** contam para essa determinação — uma aparição em sessão/evento oculto não é considerada primeira aparição nem reaparição para o jogador, ainda que conte normalmente na perspectiva do mestre.
- **FR-004**: Facções MUST ser derivadas das facções informadas nos personagens associados a sessões ou eventos; valores equivalentes após remoção de espaços periféricos e comparação sem distinção entre maiúsculas/minúsculas são agrupados.
- **FR-005**: Para cada entidade, o produto MUST apresentar a primeira aparição e todas as reaparições posteriores conhecidas, com a sessão ou evento correspondente e o tempo decorrido desde a aparição anterior.
- **FR-006**: Ordenação e duração MUST usar as datas/ordem cronológica existentes na campanha e nunca presumir uma entidade sem aparições.
- **FR-007**: O mestre autorizado MUST poder criar, consultar, editar e excluir Itens da campanha. Um Item MUST ter nome obrigatório, descrição opcional e visibilidade configurável para jogadores.
- **FR-008**: O mestre autorizado MUST poder associar um Item a zero ou mais sessões e zero ou mais eventos existentes; cada associação conta como uma aparição.
- **FR-009**: Jogadores MUST ter apenas leitura dos Itens e das aparições que lhes são visíveis; conteúdo oculto MUST ser omitido sem revelar nome, descrição ou existência por contagem/metadado.
- **FR-010**: Itens, associações, sessões, eventos, personagens e locais MUST permanecer isolados por campanha; novas superfícies de dados MUST entrar na matriz de isolamento.
- **FR-011**: Toda copy nova MUST estar disponível em pt-BR e en.
- **FR-012**: O estado sem aparições MUST ser compreensível e não apresentar entidades como descobertas sem associação temporal.
- **FR-013**: As ações do jogador MUST permanecer somente de leitura; administração e alterações de associações ficam restritas ao mestre autorizado.
- **FR-014**: Quando um personagem aparecer numa sessão visível e também numa sessão anterior oculta com o mesmo personagem, o sistema MUST alertar o mestre sobre essa inconsistência (na gestão da sessão ou no modo por descoberta em perspectiva de mestre), sem bloquear a gravação nem alterar a visibilidade automaticamente. A decisão de manter a sessão oculta, revelá-la ou ajustar as associações permanece exclusivamente do mestre.

### Key Entities *(include if data involved)*

- **Item**: Objeto narrativo registado pelo mestre, com nome, descrição opcional e visibilidade, que pode aparecer em sessões e eventos.
- **Aparição**: Relação entre personagem, local, facção derivada ou item e uma sessão/evento, que determina primeira aparição e reaparições.
- **Facção**: Agrupamento de personagens pelo rótulo de facção já usado na campanha; não requer cadastro separado nesta versão.
- **Sessão** e **Evento**: Registos cronológicos existentes em que as entidades podem aparecer.
- **Campanha**: Limite de propriedade, autorização e isolamento das entidades e aparições.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Para todos os tipos, 100% das entidades com aparições conhecidas são ordenadas pela primeira aparição cronológica correta.
- **SC-002**: Para entidades com pelo menos duas aparições, 100% das aparições posteriores são apresentadas e identificadas em sequência com o intervalo desde a anterior.
- **SC-003**: O utilizador consegue mostrar cada tipo isoladamente e restaurar a lista de todos os tipos sem perder a posição temporal das entidades.
- **SC-004**: O mestre consegue cadastrar um Item e fazê-lo aparecer na timeline após associá-lo a uma sessão ou evento, sem duplicar o registo do Item.
- **SC-005**: Nenhum cenário de jogador revela Items ou aparições ocultos; nenhum cenário de autorização ou isolamento permite gestão indevida ou acesso cruzado entre campanhas.
- **SC-007**: Em 100% dos casos em que um personagem tem uma sessão oculta anterior a uma sessão visível com o mesmo personagem, o mestre recebe o alerta de inconsistência; nenhuma sessão oculta é revelada ao jogador por conta desse alerta.
- **SC-006**: 100% das strings novas estão disponíveis em pt-BR e en e a vista permanece legível nos temas e larguras suportados.

## Assumptions

- Como Itens não existem no modelo atual, o escopo inclui o registo mínimo completo (nome, descrição opcional, visibilidade, administração pelo mestre e vínculos com Sessões e Eventos) necessário para que as suas aparições possam ser documentadas. Campos como raridade, quantidade, proprietário, categoria, inventário e relações entre itens ficam fora desta versão.
- Uma aparição requer associação explícita a uma sessão ou evento; não se infere descoberta apenas porque um nome aparece em texto livre.
- Todos os retornos após a primeira aparição são exibidos como reaparições, independentemente da duração da ausência. O intervalo é mostrado em granularidade legível de dias, semanas, meses ou anos; não se aplica um limiar que silencie aparições.
- A facção continua derivada do texto já registado nos personagens; esta feature não introduz catálogo editável de facções.
- Eventos e sessões usam a ordem temporal já definida pela Linha do Tempo e pela crónica; a precedência entre tipos de registo com data equivalente usa desempate estável definido no plan.
- A criação de Itens e sua inclusão em pacotes de importação/exportação deve seguir o contrato de portabilidade do produto; detalhes do formato ficam para o plan.
- Resolução de validação (2026-09-28, confirmada com o usuário): sessões/eventos ocultos nunca contam como aparição pro jogador (FR-003/edge case); o alerta de inconsistência (FR-014) é só um aviso ao mestre, nunca uma ação automática — a decisão final sobre a sessão oculta é sempre do mestre.
