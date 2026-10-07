# linha-tempo-por-arcos

## Purpose

Permite ao mestre e aos jogadores acompanhar a continuidade de cada arco narrativo da campanha numa visualização dedicada da Linha do Tempo, agrupando as sessões por arco em raias verticais ordenadas pela data real, sem alterar o modo cronológico existente.

## Requirements

### Requirement: Modo "Por arcos" na Linha do Tempo
A Linha do Tempo SHALL oferecer um modo "Por arcos" além do modo cronológico existente, sem alterar o resultado ou os dados do modo cronológico. O modo "Por arcos" SHALL apresentar uma linha por sessão visível, ordenada pela data do evento associado a essa sessão, com as sessões mais recentes acima das mais antigas. A data do evento SHALL ser o ano e, quando existir, o mês do evento ligado à sessão; se a sessão tiver vários eventos, SHALL ser usada a data mais antiga. Uma sessão sem evento com ano SHALL permanecer visível, abaixo de todas as sessões que têm data, ordenada pelo número da sessão, sem data inventada. Enquanto as datas das sessões visíveis não se intercalarem, o modo SHALL desenhar todas essas sessões numa única coluna vertical, qualquer que seja o arco de cada uma. O modo SHALL abrir uma coluna adicional só quando a data de uma sessão visível fica estritamente entre a data mais antiga e a mais recente de outro arco, ou quando duas sessões visíveis de arcos diferentes têm a mesma data.

#### Scenario: Consultar sessões agrupadas por arco
- **WHEN** uma campanha tem arcos e sessões associadas e o utilizador escolhe "Por arcos"
- **THEN** o sistema mostra uma linha por sessão, as mais recentes pela data do evento acima das mais antigas, na mesma coluna quando as datas não se intercalam

#### Scenario: História linear numa só coluna
- **WHEN** as sessões visíveis pertencem a arcos diferentes e nenhuma data cai estritamente entre a sessão mais antiga e a mais recente de outro arco
- **THEN** o sistema mostra todas essas sessões na mesma coluna vertical, sem curva entre elas

#### Scenario: Bifurcação com datas intercaladas
- **WHEN** a data de uma sessão visível fica estritamente entre a sessão mais antiga e a mais recente de outro arco
- **THEN** o sistema abre uma coluna adicional para essa bifurcação e mantém o outro arco na coluna que já ocupava

#### Scenario: Sessão sem evento datado
- **WHEN** uma sessão visível no modo "Por arcos" não tem evento com ano
- **THEN** essa sessão continua visível abaixo das sessões que têm data de evento, sem o sistema lhe atribuir uma data

#### Scenario: Alternar entre modo cronológico e por arcos
- **WHEN** o utilizador seleciona "Por arcos" numa campanha com arcos cadastrados
- **THEN** o sistema mostra o modo por arcos e permite voltar ao modo cronológico existente sem perder dados ou alterar seu resultado

### Requirement: Modo "Por arcos" escolhido na Linha do Tempo
A Linha do Tempo SHALL oferecer "Por arcos" no seletor de modos para mestre e jogador em qualquer campanha, sem configuração prévia. Ao abrir a Linha do Tempo, o modo selecionado SHALL ser o cronológico, por data do evento. A escolha de outro modo SHALL valer enquanto a pessoa permanece nessa tela e SHALL NOT ser gravada como configuração da campanha nem restaurada numa visita seguinte. A configuração da campanha SHALL NOT oferecer um controle para habilitar ou desabilitar esta visualização.

#### Scenario: Abrir a Linha do Tempo
- **WHEN** um mestre ou um jogador abre a Linha do Tempo de uma campanha que não teve este modo configurado
- **THEN** o modo selecionado é o cronológico, por data do evento, e o seletor também oferece "Por arcos"

#### Scenario: Escolher "Por arcos" na tela
- **WHEN** a pessoa seleciona "Por arcos" no seletor da Linha do Tempo
- **THEN** a tela mostra o modo por arcos e continua oferecendo a volta ao modo cronológico, sem gravar essa escolha na campanha

#### Scenario: Voltar à tela
- **WHEN** a pessoa tinha selecionado "Por arcos" e abre a Linha do Tempo de novo
- **THEN** o modo selecionado volta a ser o cronológico

#### Scenario: Configuração da campanha não controla o modo
- **WHEN** um mestre abre a configuração da campanha
- **THEN** não há controle para habilitar ou desabilitar a visualização "Por arcos"

### Requirement: Tempo decorrido entre sessões da mesma raia
Cada ligação desenhada entre duas sessões SHALL indicar o tempo decorrido entre as datas dos eventos dessas sessões. Um intervalo longo SHALL ser visualmente distinguível por uma ligação tracejada. A coluna de um arco que continua no tempo SHALL manter a ligação vertical entre as suas sessões mesmo quando a data de uma sessão de outro arco fica entre elas; essa outra sessão SHALL aparecer na coluna da bifurcação, ligada por curva, e SHALL NOT substituir a vertical do arco que continua.

#### Scenario: Duas sessões do mesmo arco separadas no tempo
- **WHEN** o utilizador consulta duas sessões da mesma coluna, vizinhas nessa coluna e separadas por um intervalo longo
- **THEN** o sistema exibe o tempo decorrido entre as datas dos eventos e usa uma ligação visual tracejada

#### Scenario: Outra sessão é mais próxima no tempo
- **WHEN** duas sessões do mesmo arco têm outra sessão visível, de outro arco, com data estritamente entre elas
- **THEN** o sistema mantém a ligação vertical entre as duas sessões do arco que continua e desenha a sessão intermédia na coluna da bifurcação

### Requirement: Sessão pertence a no máximo um arco, exceto na transição
Cada sessão SHALL pertencer a no máximo um arco, exceto quando marcada como sessão de transição: uma sessão que encerra um arco e inicia o arco imediatamente seguinte SHALL poder ser o limite dos dois arcos. A exceção SHALL NOT duplicar nem criar outro registo de sessão. Quando os dois arcos ocupam a mesma coluna, a transição SHALL ser um único ponto. Quando ocupam colunas diferentes, as ligações SHALL encontrar-se nessa sessão.

#### Scenario: Sessão encerra um arco e inicia o seguinte
- **WHEN** uma sessão é marcada pelo mestre como sessão de transição entre dois arcos adjacentes
- **THEN** essa mesma sessão é o limite compartilhado dos dois arcos sem duplicar o registo subjacente da crónica

### Requirement: Sessões sem arco permanecem visíveis
Sessões sem arco associado SHALL permanecer visíveis no modo "Por arcos", identificadas como "Sem arco". SHALL ocupar a coluna partilhada da timeline e SHALL ganhar coluna própria só quando a data se intercala com outro arco ou coincide com a data de uma sessão de outro arco.

#### Scenario: Sessão sem arco associado
- **WHEN** existem sessões sem arco associado numa campanha que também tem arcos e as datas não se intercalam
- **THEN** essas sessões continuam visíveis, identificadas como "Sem arco", na mesma coluna das restantes

### Requirement: Gestão de arcos pelo mestre
O sistema SHALL permitir que um mestre autorizado crie e edite arcos com título, cor persistida, resumo opcional e associações com locais e sessões existentes. Ao abrir a criação de um arco, seja manual ou a partir de uma proposta de IA, o sistema SHALL preencher a cor com uma escolha aleatória de uma paleta fixa, excluindo as cores já gravadas noutros arcos da mesma campanha. O mestre SHALL poder alterar essa cor antes de guardar e ao editar. Editar um arco existente SHALL NOT substituir a cor gravada por uma nova escolha aleatória. Se todas as cores da paleta já estiverem em uso, a criação SHALL continuar e a cor sugerida SHALL ser uma cor da paleta, mesmo que já esteja gravada noutro arco. Essa gestão SHALL estar na Linha do Tempo, no cabeçalho da página, visível quando o modo de edição está ligado, em qualquer dos modos da página. O menu de ferramentas do mapa SHALL NOT oferecer esta ação. Apenas o mestre autorizado SHALL poder gerir arcos e associações; jogadores SHALL ter somente leitura, de acordo com as regras de visibilidade já aplicadas à Linha do Tempo e às sessões, e SHALL NOT ver o controlo de gestão.

Quando uma sessão tem um Capítulo de preparação vinculado (capability `capitulo-prep`), a sua associação a um arco deixa de poder ser editada diretamente por esta gestão: o arco dessa sessão é derivado automaticamente do Capítulo vinculado. Para associar essa sessão a outro arco, o mestre SHALL alterar o arco do Capítulo, ou remover o vínculo entre a sessão e o Capítulo primeiro. Sessões sem Capítulo vinculado continuam a aceitar a associação direta a um arco exatamente como hoje.

#### Scenario: Mestre cria um arco com cor e associações
- **WHEN** um mestre autorizado abre a criação de um arco, confirma ou altera a cor sugerida e associa sessões e locais existentes
- **THEN** o arco fica disponível no modo "Por arcos" com essa cor e mantém essas associações após recarregar a página

#### Scenario: Nova cor evita as já usadas
- **WHEN** a campanha já tem arcos com cor gravada e ainda há cores da paleta por usar, e o mestre abre a criação de outro arco
- **THEN** a cor sugerida é uma das que ainda não estão gravadas nesses arcos

#### Scenario: Editar não volta a sortear a cor
- **WHEN** o mestre abre a edição de um arco que já tem cor gravada
- **THEN** o formulário mostra essa cor, sem a substituir por outra escolha aleatória

#### Scenario: Mestre abre a gestão na Linha do Tempo
- **WHEN** um mestre autorizado está na Linha do Tempo com o modo de edição ligado
- **THEN** vê o controlo para gerir arcos e, ao abri-lo, pode listar, criar e editar arcos sem ir ao mapa

#### Scenario: Modo de edição desligado
- **WHEN** um mestre autorizado está na Linha do Tempo com o modo de edição desligado
- **THEN** o controlo de gestão de arcos não aparece

#### Scenario: Mestre associa uma sessão existente a um arco
- **WHEN** o mestre associa a um arco uma sessão ainda sem arco e sem Capítulo vinculado
- **THEN** a sessão passa a aparecer associada a esse arco

#### Scenario: Jogador sem ações de escrita
- **WHEN** um jogador abre a Linha do Tempo ou a administração dos arcos de uma campanha
- **THEN** o sistema não oferece ações de criação ou edição de arcos

#### Scenario: O mapa já não oferece a gestão
- **WHEN** um mestre autorizado abre o menu de ferramentas do mapa
- **THEN** esse menu não contém a ação de gerir arcos

#### Scenario: Sessão com capítulo vinculado não aceita associação manual de arco
- **WHEN** o mestre tenta associar diretamente, por esta gestão, uma sessão que tem um Capítulo vinculado a um arco diferente do arco desse Capítulo
- **THEN** o sistema rejeita a alteração e orienta o mestre a editar o arco pelo Capítulo ou a remover o vínculo primeiro

### Requirement: Filtro por arco sem teto artificial
O utilizador SHALL poder filtrar as raias por arco e restaurar a vista de todos os arcos, sem limite fixo de arcos selecionados simultaneamente.

#### Scenario: Filtrar por um ou mais arcos
- **WHEN** o utilizador filtra o modo "Por arcos" por um ou mais arcos entre vários disponíveis
- **THEN** apenas as raias selecionadas são enfatizadas ou exibidas, e o utilizador pode voltar a "Todos" sem limite artificial de quantidade selecionada

### Requirement: Estado vazio sem arcos cadastrados
O modo "Por arcos" SHALL informar de forma compreensível quando a campanha ainda não tem arcos cadastrados e SHALL manter disponível a navegação para a cronologia existente.

#### Scenario: Campanha sem arcos
- **WHEN** o utilizador consulta o modo "Por arcos" numa campanha sem arcos cadastrados
- **THEN** o sistema informa que não há arcos, oferece o modo cronológico e não apresenta uma tela quebrada ou vazia sem explicação

### Requirement: Isolamento por campanha
Dados de arcos, sessões e locais SHALL permanecer isolados por campanha; novas superfícies de dados introduzidas por este modo SHALL integrar a matriz de testes de isolamento existente do produto.

#### Scenario: Acesso entre campanhas bloqueado
- **WHEN** um utilizador autenticado numa campanha tenta consultar ou alterar arcos de outra campanha
- **THEN** o sistema nega o acesso e não expõe dados ou identificadores da outra campanha

### Requirement: Internacionalização da nova copy
Toda copy nova introduzida pelo modo "Por arcos" SHALL estar disponível em pt-BR e en.

#### Scenario: Strings novas traduzidas
- **WHEN** o utilizador troca o idioma da interface entre pt-BR e en
- **THEN** toda a copy nova do modo "Por arcos" (rótulos, mensagens de estado vazio, filtros) aparece traduzida no idioma selecionado

### Requirement: Escolha entre criação manual ou por IA de um arco
O sistema SHALL permitir a escolha explícita entre criar um arco manualmente e solicitar a criação por IA; a criação manual SHALL permanecer disponível independentemente da disponibilidade de IA. Se o mestre escolher IA sem recursos de IA habilitados para a campanha, o produto SHALL explicar o estado e oferecer o caminho de habilitação ou a criação manual. A execução do motor de IA não faz parte deste requisito.

#### Scenario: Mestre escolhe criação manual
- **WHEN** o mestre inicia a criação de um arco e escolhe o caminho manual
- **THEN** o sistema apresenta o formulário manual de criação de arco, independentemente do estado do módulo de IA na campanha

#### Scenario: Mestre escolhe IA sem o módulo habilitado
- **WHEN** o mestre escolhe a criação de arco por IA numa campanha sem o módulo de IA habilitado
- **THEN** o sistema explica que a IA não está habilitada e oferece o caminho de habilitação ou a criação manual, sem executar nenhum motor de IA

### Requirement: Ligação ao ponto mais próximo no tempo
No modo "Por arcos", as sessões visíveis da mesma coluna SHALL ligar-se na vertical, da mais recente para a mais antiga nessa coluna. Quando uma coluna existe por bifurcação, a ligação entre essa coluna e a coluna de onde saiu SHALL ser uma curva contínua, sem canto reto, que sai alinhada à coluna de origem e chega alinhada à outra coluna na altura da sessão que delimita o encontro. Uma sessão de transição SHALL fazer as colunas encontrarem-se na sua linha quando os arcos ocupam colunas diferentes, sem duplicar o registo da sessão. Um filtro de arcos SHALL recalcular colunas e ligações só entre as sessões que permanecem visíveis e SHALL NOT desenhar traço de um arco oculto. Duas sessões visíveis de arcos diferentes com a mesma data SHALL ocupar colunas diferentes.

#### Scenario: Raias vizinhas no tempo encontram-se
- **WHEN** uma sessão está numa coluna aberta por bifurcação e a sessão que delimita o encontro está noutra coluna
- **THEN** a linha sai em curva, sem canto reto, e encontra essa sessão na altura da data dela

#### Scenario: A mesma raia permanece vertical
- **WHEN** duas sessões vizinhas na mesma coluna se seguem no tempo
- **THEN** a ligação entre as duas é um traço vertical nessa coluna

#### Scenario: Transição junta as duas raias
- **WHEN** uma sessão está marcada como transição entre dois arcos que ocupam colunas diferentes
- **THEN** as linhas encontram-se nessa sessão, sem um segundo registo de sessão

#### Scenario: Filtro recalcula o vizinho
- **WHEN** o utilizador oculta o arco cuja sessão intercalava as datas de outro
- **THEN** a coluna da bifurcação desaparece, as sessões restantes voltam a uma coluna quando deixam de se intercalar, e nenhum traço entra no arco oculto
