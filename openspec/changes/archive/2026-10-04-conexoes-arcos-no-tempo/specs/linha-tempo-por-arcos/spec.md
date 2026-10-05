# Spec Delta

## MODIFIED Requirements

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
O sistema SHALL permitir que um mestre autorizado crie e edite arcos com título, cor persistida, resumo opcional e associações com locais e sessões existentes. Ao abrir a criação de um arco, seja manual ou a partir de uma proposta de IA, o sistema SHALL preencher a cor com uma escolha aleatória de uma paleta fixa, excluindo as cores já gravadas noutros arcos da mesma campanha. O mestre SHALL poder alterar essa cor antes de guardar e ao editar. Editar um arco existente SHALL NOT substituir a cor gravada por uma nova escolha aleatória. Se todas as cores da paleta já estiverem em uso, a criação SHALL continuar e a cor sugerida SHALL ser uma cor da paleta, mesmo que já esteja gravada noutro arco. Apenas o mestre autorizado SHALL poder gerir arcos e associações; jogadores SHALL ter somente leitura, de acordo com as regras de visibilidade já aplicadas à Linha do Tempo e às sessões.

#### Scenario: Mestre cria um arco com cor e associações
- **WHEN** um mestre autorizado abre a criação de um arco, confirma ou altera a cor sugerida e associa sessões e locais existentes
- **THEN** o arco fica disponível no modo "Por arcos" com essa cor e mantém essas associações após recarregar a página

#### Scenario: Nova cor evita as já usadas
- **WHEN** a campanha já tem arcos com cor gravada e ainda há cores da paleta por usar, e o mestre abre a criação de outro arco
- **THEN** a cor sugerida é uma das que ainda não estão gravadas nesses arcos

#### Scenario: Editar não volta a sortear a cor
- **WHEN** o mestre abre a edição de um arco que já tem cor gravada
- **THEN** o formulário mostra essa cor, sem a substituir por outra escolha aleatória

#### Scenario: Mestre associa uma sessão existente a um arco
- **WHEN** o mestre associa uma sessão ainda sem arco a um arco existente
- **THEN** a sessão passa a aparecer associada a esse arco

#### Scenario: Jogador sem ações de escrita
- **WHEN** um jogador abre a administração dos arcos de uma campanha
- **THEN** o sistema não oferece ações de criação ou edição de arcos

## ADDED Requirements

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
