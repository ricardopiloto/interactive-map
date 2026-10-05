# linha-tempo-por-arcos

## Purpose

Permite ao mestre e aos jogadores acompanhar a continuidade de cada arco narrativo da campanha numa visualização dedicada da Linha do Tempo, agrupando as sessões por arco em raias verticais ordenadas pela data real, sem alterar o modo cronológico existente.

## Requirements

### Requirement: Modo "Por arcos" na Linha do Tempo
A Linha do Tempo SHALL oferecer um modo "Por arcos" além do modo cronológico existente, sem alterar o resultado ou os dados do modo cronológico. O modo "Por arcos" SHALL apresentar uma raia vertical por arco, com o tempo real como eixo e as sessões mais recentes posicionadas acima das mais antigas.

#### Scenario: Consultar sessões agrupadas por arco
- **WHEN** uma campanha tem arcos e sessões associadas e o utilizador escolhe "Por arcos"
- **THEN** o sistema mostra uma raia vertical por arco, com as sessões na posição correspondente à sua data real e as mais recentes acima das mais antigas

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
Entre sessões consecutivas de uma mesma raia de arco, a interface SHALL indicar o tempo decorrido; intervalos longos SHALL ser visualmente distinguíveis por uma ligação tracejada.

#### Scenario: Duas sessões do mesmo arco separadas no tempo
- **WHEN** o utilizador consulta uma raia com duas sessões consecutivas do mesmo arco separadas por um intervalo longo
- **THEN** o sistema exibe o tempo decorrido entre elas e usa uma ligação visual tracejada para indicar o intervalo

### Requirement: Sessão pertence a no máximo um arco, exceto na transição
Cada sessão SHALL pertencer a no máximo um arco, exceto quando marcada como sessão de transição: uma sessão que encerra um arco e inicia o arco imediatamente seguinte SHALL poder aparecer nas duas raias. A exceção não SHALL duplicar nem criar outro registo de sessão.

#### Scenario: Sessão encerra um arco e inicia o seguinte
- **WHEN** uma sessão é marcada pelo mestre como sessão de transição entre dois arcos adjacentes
- **THEN** essa mesma sessão aparece como limite compartilhado nas duas raias sem duplicar o registo subjacente da crónica

### Requirement: Sessões sem arco permanecem visíveis
Sessões sem arco associado SHALL permanecer visíveis numa raia neutra identificada como "Sem arco" no modo "Por arcos".

#### Scenario: Sessão sem arco associado
- **WHEN** existem sessões sem arco associado numa campanha que também tem arcos
- **THEN** essas sessões continuam visíveis numa raia neutra identificada como "Sem arco"

### Requirement: Gestão de arcos pelo mestre
O sistema SHALL permitir que um mestre autorizado crie e edite arcos com título, cor persistida, resumo opcional e associações com locais e sessões existentes. Apenas o mestre autorizado SHALL poder gerir arcos e associações; jogadores SHALL ter somente leitura, de acordo com as regras de visibilidade já aplicadas à Linha do Tempo e às sessões.

#### Scenario: Mestre cria um arco com cor e associações
- **WHEN** um mestre autorizado informa título, cor e associa sessões e locais existentes na criação de um arco
- **THEN** o arco fica disponível no modo "Por arcos" e mantém essas associações após recarregar a página

#### Scenario: Mestre associa uma sessão existente a um arco
- **WHEN** o mestre associa uma sessão ainda sem arco a um arco existente
- **THEN** a sessão passa a aparecer na raia correspondente a esse arco

#### Scenario: Jogador sem ações de escrita
- **WHEN** um jogador abre a administração dos arcos de uma campanha
- **THEN** o sistema não oferece ações de criação ou edição de arcos

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
