# Spec Delta

## Purpose

Permite ao mestre e aos jogadores consultar quando cada personagem, local, facção e item surgiu por primeira vez na campanha e quando reapareceu depois, agrupados por tipo, respeitando as regras de visibilidade já aplicadas às sessões e eventos.

## ADDED Requirements

### Requirement: Modo "Por descoberta" na Linha do Tempo
A Linha do Tempo SHALL oferecer "Por descoberta" como modo adicional, mantendo disponíveis os modos cronológico e por arcos quando presentes. O modo SHALL agrupar entidades em Personagens, Locais, Facções e Itens, e SHALL permitir filtrar por um tipo ou exibir todos.

#### Scenario: Consultar entidades agrupadas por primeira aparição
- **WHEN** existem entidades presentes em várias sessões ou eventos e o utilizador escolhe "Por descoberta"
- **THEN** cada entidade aparece agrupada por tipo e ordenada pela data da sua primeira aparição

#### Scenario: Filtrar por um tipo de entidade
- **WHEN** o utilizador escolhe um tipo entre Personagens, Locais, Facções ou Itens
- **THEN** a lista mostra somente entidades desse tipo; escolher "Todos" restaura os grupos completos

### Requirement: Modo "Por descoberta" é opt-in por campanha
O modo "Por descoberta" SHALL estar disponível apenas para campanhas em que um mestre autorizado o tiver habilitado explicitamente numa tela de configuração da campanha. Por padrão, sem habilitação explícita, o modo SHALL permanecer indisponível e SHALL não aparecer no seletor de modos da Linha do Tempo.

#### Scenario: Campanha sem o modo habilitado
- **WHEN** uma campanha não tem o modo "Por descoberta" habilitado
- **THEN** o seletor de modos da Linha do Tempo não oferece "Por descoberta" para essa campanha, para mestre ou jogadores

#### Scenario: Mestre habilita o modo
- **WHEN** um mestre autorizado habilita o modo "Por descoberta" na tela de configuração da campanha
- **THEN** o modo passa a estar disponível no seletor de modos da Linha do Tempo para essa campanha, tanto para mestre quanto para jogadores

#### Scenario: Jogador não pode habilitar o modo
- **WHEN** um jogador acessa a tela de configuração da campanha
- **THEN** o sistema não oferece a esse jogador a opção de habilitar ou desabilitar o modo "Por descoberta"

### Requirement: Determinação de primeira aparição e reaparições
Para Personagens, Locais e Itens, a primeira aparição SHALL ser determinada pela sessão ou evento cronologicamente mais antigo com associação explícita à entidade. Na perspectiva do jogador, apenas sessões/eventos visíveis (`visivel_para_todos=true`) SHALL contar para essa determinação; uma aparição em sessão/evento oculto não SHALL ser considerada primeira aparição nem reaparição para o jogador, ainda que conte normalmente na perspectiva do mestre. O produto SHALL apresentar, para cada entidade, a primeira aparição e todas as reaparições posteriores conhecidas, com a sessão/evento correspondente e o tempo decorrido desde a aparição anterior, sem limiar que silencie aparições.

#### Scenario: Entidade com aparição em sessão e em evento
- **WHEN** uma entidade aparece numa sessão e também num evento
- **THEN** a timeline usa o registo cronologicamente mais antigo entre os dois como primeira aparição e apresenta as aparições posteriores disponíveis

#### Scenario: Reaparição após intervalo longo
- **WHEN** uma entidade com duas ou mais aparições tem duas aparições consecutivas separadas por um intervalo longo
- **THEN** o sistema identifica a aparição posterior como reaparição e mostra o tempo decorrido desde a aparição anterior, sem aplicar limiar que oculte a reaparição

#### Scenario: Aparição em sessão/evento oculto não conta para o jogador
- **WHEN** um jogador consulta o modo "Por descoberta" e a única aparição anterior de uma entidade está numa sessão/evento oculto
- **THEN** o jogador não vê essa entidade como descoberta a partir dessa aparição oculta; a entidade só é considerada descoberta a partir da primeira sessão/evento visível em que aparece

#### Scenario: Entidade sem sessão ou evento associado
- **WHEN** uma entidade não tem nenhuma sessão ou evento associado
- **THEN** ela não é listada no modo "Por descoberta" nem tratada como descoberta

### Requirement: Facções derivadas e normalizadas
Facções SHALL ser derivadas das facções informadas nos personagens associados a sessões ou eventos; valores equivalentes após remoção de espaços periféricos e comparação sem distinção entre maiúsculas/minúsculas SHALL ser agrupados sob o mesmo grupo de descoberta, preservando a forma de apresentação mais legível. Uma facção vazia ou composta apenas por espaços não SHALL formar um grupo de descoberta.

#### Scenario: Variações de grafia agrupadas
- **WHEN** personagens têm o campo de facção preenchido com variações de espaço e maiúsculas/minúsculas do mesmo nome (ex. "Guarda da Cidade" e "guarda da cidade ")
- **THEN** o sistema agrupa essas variações como a mesma facção de descoberta

#### Scenario: Facção vazia ignorada
- **WHEN** um personagem tem o campo de facção vazio ou composto apenas por espaços
- **THEN** esse personagem não contribui para a criação de um grupo de descoberta de facção

### Requirement: Cadastro e associação de Itens pelo mestre
O mestre autorizado SHALL poder criar, consultar, editar e excluir Itens da campanha. Um Item SHALL ter nome obrigatório, descrição opcional e visibilidade configurável para jogadores. O mestre autorizado SHALL poder associar um Item a zero ou mais sessões existentes e zero ou mais eventos existentes; cada associação conta como uma aparição do item na timeline.

#### Scenario: Mestre cria um item
- **WHEN** um mestre autorizado cria um item com nome e associações opcionais a sessões/eventos
- **THEN** o item persiste e pode ser encontrado na gestão da campanha

#### Scenario: Associar item a uma sessão existente
- **WHEN** o mestre associa um item existente a uma sessão ou evento
- **THEN** essa sessão ou evento passa a contar como aparição do item na timeline "Por descoberta"

#### Scenario: Excluir item não remove sessões nem eventos
- **WHEN** o mestre exclui um item que tem associações com sessões e eventos
- **THEN** o sistema remove apenas o item e suas associações, sem afetar as sessões ou eventos associados, mediante confirmação clara

#### Scenario: Falha ao salvar um item preserva dados existentes
- **WHEN** ocorre uma falha ao salvar a criação ou edição de um item
- **THEN** o sistema informa o mestre sobre a falha sem perder os dados de itens já persistidos anteriormente

### Requirement: Leitura restrita de Itens e visibilidade para jogador
Jogadores SHALL ter apenas leitura dos Itens e das aparições que lhes são visíveis. Conteúdo oculto SHALL ser omitido sem revelar nome, descrição ou existência por contagem ou metadado. As ações do jogador SHALL permanecer somente de leitura; administração e alterações de associações ficam restritas ao mestre autorizado.

#### Scenario: Item restrito ao mestre não é revelado ao jogador
- **WHEN** um jogador consulta a timeline ou uma sessão/evento associado a um item restrito ao mestre
- **THEN** nome e detalhes do item não são revelados ao jogador

#### Scenario: Item com todas as associações ocultas
- **WHEN** um item tem todas as suas associações de sessão/evento marcadas como ocultas
- **THEN** o item não é revelado ao jogador pela lista de descoberta

#### Scenario: Jogador sem controles de escrita
- **WHEN** um jogador abre o modo "Por descoberta" ou as superfícies de gestão de itens
- **THEN** o sistema não oferece controles de criação, edição ou exclusão a esse jogador

### Requirement: Alerta ao mestre sobre aparição em sessão oculta anterior
Quando um personagem aparecer numa sessão visível e também numa sessão anterior oculta com o mesmo personagem, o sistema SHALL alertar o mestre sobre essa inconsistência, seja na gestão da sessão, seja no modo "Por descoberta" em perspectiva de mestre, sem bloquear a gravação nem alterar a visibilidade automaticamente. A decisão de manter a sessão oculta, revelá-la ou ajustar as associações permanece exclusivamente do mestre.

#### Scenario: Alerta de inconsistência exibido ao mestre
- **WHEN** um personagem aparece numa sessão visível e também numa sessão anterior oculta com o mesmo personagem
- **THEN** o sistema alerta o mestre sobre essa inconsistência sem bloquear a gravação da sessão nem alterar automaticamente a visibilidade de nenhuma sessão

### Requirement: Estado vazio sem associações de descoberta
O modo "Por descoberta" SHALL apresentar um estado vazio compreensível quando a campanha não tiver associações de descoberta, com caminho para voltar ao modo cronológico. O estado sem aparições SHALL ser compreensível e não SHALL apresentar entidades como descobertas sem associação temporal.

#### Scenario: Campanha sem associações de descoberta
- **WHEN** o utilizador abre o modo "Por descoberta" numa campanha sem nenhuma associação de descoberta
- **THEN** o sistema apresenta um estado vazio compreensível e permite voltar ao modo cronológico

### Requirement: Isolamento por campanha
Itens, associações, sessões, eventos, personagens e locais SHALL permanecer isolados por campanha; as novas superfícies de dados introduzidas por este modo SHALL integrar a matriz de testes de isolamento já existente do produto.

#### Scenario: Acesso entre campanhas bloqueado
- **WHEN** um utilizador autenticado numa campanha tenta consultar ou alterar itens ou associações de descoberta de outra campanha
- **THEN** o sistema nega o acesso e não expõe dados ou identificadores da outra campanha

### Requirement: Internacionalização da nova copy
Toda copy nova introduzida pelo modo "Por descoberta" e pela gestão de Itens SHALL estar disponível em pt-BR e en.

#### Scenario: Strings novas traduzidas
- **WHEN** o utilizador troca o idioma da interface entre pt-BR e en
- **THEN** toda a copy nova do modo "Por descoberta" e do cadastro de Itens aparece traduzida no idioma selecionado
