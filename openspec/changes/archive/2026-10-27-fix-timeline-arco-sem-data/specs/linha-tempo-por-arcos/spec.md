# Spec Delta

## MODIFIED Requirements

### Requirement: Modo "Por arcos" na Linha do Tempo
A Linha do Tempo SHALL oferecer um modo "Por arcos" além do modo cronológico existente, sem alterar o resultado ou os dados do modo cronológico. O modo "Por arcos" SHALL apresentar uma linha por sessão visível, ordenada pela data do evento associado a essa sessão, com as sessões mais recentes acima das mais antigas. A data do evento SHALL ser o ano e, quando existir, o mês do evento ligado à sessão; se a sessão tiver vários eventos, SHALL ser usada a data mais antiga. Duas sessões visíveis com exatamente a mesma data (mesmo ano e mês) SHALL ser desempatadas pelo número da sessão, com a de número maior acima da de número menor — consistente com a regra de mais recente no topo, já que o número da sessão cresce com a cronologia real de jogo. Uma sessão sem evento com ano, cujo arco tem pelo menos uma outra sessão com evento datado, SHALL aparecer posicionada dentro do bloco contínuo desse arco — na posição correspondente à data mais recente entre as sessões datadas do próprio arco, desempatada pelas mesmas regras das demais sessões do arco — sem que o sistema lhe atribua uma data própria. Uma sessão que não pertence a nenhum arco e não tem evento com ano SHALL permanecer visível, abaixo de todas as sessões posicionadas por data (própria ou do arco), ordenada pelo número da sessão em ordem crescente, sem data inventada. Um arco em que nenhuma sessão tem evento com ano SHALL ter todas as suas sessões posicionadas usando, como data de referência, a data da sessão datada mais próxima por número de sessão, buscando em ambas as direções a partir do menor e do maior número de sessão desse arco; quando as duas sessões datadas mais próximas (uma de número menor, outra de número maior) estiverem à mesma distância, SHALL prevalecer a de número menor. Quando só existir sessão datada de um dos lados (número menor ou número maior) dentro do conjunto visível, SHALL ser usada a data dessa única sessão, sem desempate. Quando não existir nenhuma sessão datada visível de nenhum dos lados, o arco SHALL manter o comportamento já descrito para quando não há nenhuma referência disponível: permanecer visível no fim da lista, ordenado pelo número da sessão, sem data inventada. Essa data de referência SHALL ser usada apenas para posicionar essas sessões na lista e para o desempate por igualdade de data já descrito; o sistema SHALL continuar a exibir essas sessões sem data (o mesmo indicador já usado para sessão sem evento) e SHALL NOT calcular um texto de tempo decorrido baseado nessa data de referência. Enquanto as datas das sessões visíveis não se intercalarem, o modo SHALL desenhar todas essas sessões numa única coluna vertical, qualquer que seja o arco de cada uma. O modo SHALL abrir uma coluna adicional só quando a data de uma sessão visível fica estritamente entre a data mais antiga e a mais recente de outro arco, ou quando duas sessões visíveis de arcos diferentes têm a mesma data e as faixas de número de sessão desses dois arcos se intercalam — dois arcos com a mesma data cujas faixas de número de sessão não se intercalam (todas as sessões de um têm número menor que as do outro) SHALL ser tratados como sequenciais, na mesma coluna — essa regra de coluna continua baseada só nas sessões que têm data de evento própria, nunca na data de referência herdada do arco por uma sessão sem data, nem na data de referência usada para posicionar um arco inteiro sem nenhuma sessão datada. O texto de tempo decorrido entre duas sessões datadas consecutivas do mesmo arco SHALL continuar correto mesmo quando sessões sem data desse arco estiverem posicionadas entre elas.

#### Scenario: Consultar sessões agrupadas por arco
- **WHEN** uma campanha tem arcos e sessões associadas e o utilizador escolhe "Por arcos"
- **THEN** o sistema mostra uma linha por sessão, as mais recentes pela data do evento acima das mais antigas, na mesma coluna quando as datas não se intercalam

#### Scenario: História linear numa só coluna
- **WHEN** as sessões visíveis pertencem a arcos diferentes e nenhuma data cai estritamente entre a sessão mais antiga e a mais recente de outro arco
- **THEN** o sistema mostra todas essas sessões na mesma coluna vertical, sem curva entre elas

#### Scenario: Bifurcação com datas intercaladas
- **WHEN** a data de uma sessão visível fica estritamente entre a sessão mais antiga e a mais recente de outro arco
- **THEN** o sistema abre uma coluna adicional para essa bifurcação e mantém o outro arco na coluna que já ocupava

#### Scenario: Sessão sem evento datado, mas o arco tem outras sessões datadas
- **WHEN** uma sessão visível não tem evento com ano, mas outra sessão do mesmo arco tem
- **THEN** essa sessão aparece posicionada dentro do bloco do próprio arco, na posição correspondente à data mais recente entre as sessões datadas desse arco, sem o sistema lhe atribuir uma data própria

#### Scenario: Sessão sem evento datado
- **WHEN** uma sessão visível não pertence a nenhum arco e não tem evento com ano
- **THEN** essa sessão continua visível abaixo de todas as sessões posicionadas por data, ordenada pelo número da sessão, sem o sistema lhe atribuir uma data

#### Scenario: Arco inteiro sem sessão datada é posicionado pelo vizinho mais próximo
- **WHEN** nenhuma sessão de um arco tem evento com ano, mas existem sessões datadas (de outros arcos, ou sem arco) com número menor e com número maior que o intervalo de números desse arco
- **THEN** as sessões desse arco aparecem posicionadas usando como referência a data da sessão datada mais próxima por número de sessão, entre as duas apuradas, e não aparecem mais no fim da lista

#### Scenario: Empate de distância entre vizinhos prefere o de número menor
- **WHEN** a sessão datada mais próxima por número abaixo do arco e a sessão datada mais próxima por número acima do arco estão à mesma distância em número de sessão
- **THEN** o sistema usa a data da sessão de número menor como referência, de forma determinística

#### Scenario: Arco sem data com vizinho datado de um só lado
- **WHEN** um arco não tem nenhuma sessão com evento com ano e só existe sessão datada visível de um dos lados (número menor ou número maior) desse arco, não dos dois
- **THEN** o sistema usa a data dessa única sessão datada como referência, sem precisar comparar distâncias

#### Scenario: Arco sem data sem nenhum vizinho datado
- **WHEN** um arco não tem nenhuma sessão com evento com ano e não existe nenhuma sessão datada visível nem com número menor nem com número maior que o intervalo desse arco
- **THEN** o arco continua sem data de referência e suas sessões permanecem visíveis no fim da lista, ordenadas pelo número da sessão, sem data inventada

#### Scenario: Vizinho mais próximo não cria coluna nem tempo decorrido inventado
- **WHEN** um arco é posicionado pela data de referência do vizinho mais próximo por número de sessão
- **THEN** essas sessões continuam exibindo o indicador de "sem data", não têm texto de tempo decorrido calculado a partir dessa referência, e a referência não é usada para abrir ou fechar colunas

#### Scenario: Tempo decorrido não se perde com uma sessão sem data no meio
- **WHEN** duas sessões datadas do mesmo arco têm, entre elas na exibição, uma ou mais sessões sem data desse mesmo arco
- **THEN** o texto de tempo decorrido entre as duas sessões datadas continua sendo calculado a partir da data real uma da outra, ignorando as sessões sem data intercaladas

#### Scenario: Duas sessões do mesmo mês ficam na ordem certa entre si
- **WHEN** duas sessões visíveis (do mesmo arco ou de arcos diferentes) têm o mesmo ano e mês de evento
- **THEN** a sessão de número maior aparece acima da sessão de número menor

#### Scenario: Arcos do mesmo mês com sessões em sequência ficam numa coluna
- **WHEN** dois arcos têm eventos na mesma data (mesmo ano e mês) e todas as sessões de um têm número menor que as do outro
- **THEN** o sistema mostra os dois na mesma coluna, o de números maiores acima, sem abrir coluna de bifurcação nem curva entre eles

#### Scenario: Arcos do mesmo mês com sessões intercaladas continuam em colunas diferentes
- **WHEN** dois arcos têm eventos na mesma data e as faixas de número de sessão deles se intercalam (há sessão de um entre sessões do outro)
- **THEN** o sistema mantém o comportamento atual: colunas diferentes, com a bifurcação

#### Scenario: Alternar entre modo cronológico e por arcos
- **WHEN** o utilizador seleciona "Por arcos" numa campanha com arcos cadastrados
- **THEN** o sistema mostra o modo por arcos e permite voltar ao modo cronológico existente sem perder dados ou alterar seu resultado

### Requirement: Tempo decorrido entre sessões da mesma raia
Cada ligação desenhada entre duas sessões SHALL indicar o tempo decorrido entre as datas dos eventos dessas sessões. Um intervalo longo entre duas sessões do mesmo arco SHALL ser visualmente distinguível por uma ligação tracejada. A coluna de um arco que continua no tempo SHALL manter a ligação vertical entre as suas sessões mesmo quando a data de uma sessão de outro arco fica entre elas; essa outra sessão SHALL aparecer na coluna da bifurcação, ligada por curva, e SHALL NOT substituir a vertical do arco que continua. Quando a ligação entre duas sessões visíveis atravessa dois arcos sequenciais (a data mais antiga de um arco e a data mais recente de outro arco adjacente no tempo, sem nenhum arco com data entre eles), a ligação SHALL ser sempre tracejada, independentemente da duração do intervalo, e a cor do traço SHALL fazer uma transição gradual da cor do arco mais recente para a cor do arco mais antigo. Quando os dois arcos sequenciais ocupam a mesma coluna, essa ligação SHALL continuar sendo um traço reto vertical (não uma curva) — só o estilo (tracejado, gradiente) muda em relação à ligação sólida já usada dentro de um único arco. Dois arcos consecutivos na ordenação visível cujas faixas de número de sessão não se intercalam SHALL também ser ligados por essa ligação sequencial tracejada, mesmo quando têm a mesma data ou quando um deles (ou ambos) não tem nenhuma sessão com data própria; a ligação SHALL unir a sessão de menor número do arco mais recente à sessão de maior número do arco mais antigo, e SHALL NOT exibir texto de tempo decorrido quando uma das duas pontas não tem data própria.

#### Scenario: Duas sessões do mesmo arco separadas no tempo
- **WHEN** o utilizador consulta duas sessões da mesma coluna, vizinhas nessa coluna e separadas por um intervalo longo
- **THEN** o sistema exibe o tempo decorrido entre as datas dos eventos e usa uma ligação visual tracejada

#### Scenario: Outra sessão é mais próxima no tempo
- **WHEN** duas sessões do mesmo arco têm outra sessão visível, de outro arco, com data estritamente entre elas
- **THEN** o sistema mantém a ligação vertical entre as duas sessões do arco que continua e desenha a sessão intermédia na coluna da bifurcação

#### Scenario: Dois arcos sequenciais, sem overlap de datas
- **WHEN** a sessão mais antiga de um arco e a sessão mais recente de outro arco, adjacente no tempo e sem nenhuma data intercalada entre os dois, são vizinhas na ordenação visível
- **THEN** o sistema exibe o tempo decorrido entre os dois arcos com uma ligação sempre tracejada, com transição de cor entre a cor de um arco e a do outro, mesmo que o intervalo seja curto

#### Scenario: Arcos do mesmo mês ligados em sequência
- **WHEN** dois arcos consecutivos têm eventos na mesma data e as sessões de um têm todas número menor que as do outro
- **THEN** o sistema liga a sessão de menor número do arco mais recente à de maior número do arco mais antigo com a ligação sequencial tracejada, sem curva de bifurcação

#### Scenario: Arco sem nenhuma sessão datada entre dois arcos
- **WHEN** um arco sem sessões com data própria fica, na ordenação visível, entre dois arcos sequenciais
- **THEN** o sistema o liga ao arco seguinte e ao arco anterior com ligações sequenciais tracejadas, sem exibir texto de tempo decorrido nas pontas sem data e sem atribuir data ao arco


### Requirement: Ligação ao ponto mais próximo no tempo
No modo "Por arcos", as sessões visíveis da mesma coluna SHALL ligar-se na vertical, da mais recente para a mais antiga nessa coluna. Quando uma coluna existe por bifurcação — seja por overlap de datas detectado automaticamente, seja por uma sessão de transição marcada pelo mestre —, a ligação entre essa coluna e a coluna de onde saiu SHALL ser desenhada automaticamente como uma curva contínua, sem canto reto, que sai alinhada à coluna de origem e chega alinhada à outra coluna na altura da sessão que delimita o encontro, sem exigir nenhuma ação do mestre para a bifurcação detectada por overlap. Quando mais de um arco já posicionado poderia ser a origem de uma bifurcação (overlap com mais de um arco ao mesmo tempo), o sistema SHALL escolher como origem o par de sessões (uma do arco novo, uma do arco já posicionado) com a menor distância de tempo entre si, de forma determinística. Uma sessão de transição marcada pelo mestre entre dois arcos específicos SHALL ter precedência sobre a curva automática desse mesmo par de arcos — o sistema SHALL NOT desenhar as duas ligações sobrepostas para o mesmo par. Um filtro de arcos SHALL recalcular colunas e ligações só entre as sessões que permanecem visíveis, incluindo as ligações tracejadas entre arcos sequenciais e as curvas de bifurcação automática, e SHALL NOT desenhar traço (de nenhum dos tipos de ligação) envolvendo um arco oculto. Duas sessões visíveis de arcos diferentes com a mesma data SHALL ocupar colunas diferentes quando as faixas de número de sessão desses arcos se intercalam; quando as faixas não se intercalam, os dois arcos SHALL ser tratados como sequenciais, na mesma coluna, sem curva de bifurcação.

#### Scenario: Raias vizinhas no tempo encontram-se
- **WHEN** uma sessão está numa coluna aberta por bifurcação e a sessão que delimita o encontro está noutra coluna
- **THEN** a linha sai em curva, sem canto reto, e encontra essa sessão na altura da data dela

#### Scenario: Bifurcação por overlap conecta automaticamente, sem sessão de transição
- **WHEN** uma coluna é aberta porque a data de uma sessão visível fica estritamente entre a mais antiga e a mais recente de outro arco, e nenhuma sessão foi marcada como transição entre esses dois arcos
- **THEN** o sistema ainda assim desenha a curva de ligação entre a coluna nova e a sessão do arco de origem mais próxima no tempo da sessão que causou a bifurcação, sem exigir nenhuma configuração adicional do mestre

#### Scenario: Overlap com mais de um arco candidato escolhe o par mais próximo
- **WHEN** a sessão que abre uma coluna nova tem overlap de datas com mais de um arco já posicionado
- **THEN** o sistema escolhe como origem da curva o par de sessões (uma de cada arco) com a menor distância de tempo entre si, sempre o mesmo resultado para os mesmos dados

#### Scenario: Transição explícita tem precedência sobre a curva automática
- **WHEN** um par de arcos tem tanto overlap de datas (que abriria uma curva automática) quanto uma sessão marcada como transição entre eles
- **THEN** o sistema desenha só a ligação da sessão de transição para esse par, sem desenhar uma segunda curva automática sobreposta

#### Scenario: A mesma raia permanece vertical
- **WHEN** duas sessões vizinhas na mesma coluna se seguem no tempo
- **THEN** a ligação entre as duas é um traço vertical nessa coluna

#### Scenario: Transição junta as duas raias
- **WHEN** uma sessão está marcada como transição entre dois arcos que ocupam colunas diferentes
- **THEN** as linhas encontram-se nessa sessão, sem um segundo registo de sessão

#### Scenario: Filtro recalcula o vizinho
- **WHEN** o utilizador oculta o arco cuja sessão intercalava as datas de outro
- **THEN** a coluna da bifurcação desaparece, as sessões restantes voltam a uma coluna quando deixam de se intercalar, e nenhum traço entra no arco oculto

#### Scenario: Filtro esconde uma ligação tracejada entre arcos sequenciais
- **WHEN** o utilizador oculta um dos dois arcos envolvidos numa ligação tracejada com gradiente entre arcos sequenciais
- **THEN** essa ligação deixa de ser desenhada, e as sessões do arco que permanece visível recalculam seus vizinhos (de coluna e de ligação) só entre o que continua visível

#### Scenario: Filtro esconde uma curva de bifurcação automática
- **WHEN** o utilizador oculta o arco de origem ou o arco da bifurcação de uma curva automática (sem sessão de transição)
- **THEN** essa curva deixa de ser desenhada, sem erro, e a coluna recalcula normalmente entre o que continua visível

#### Scenario: Mesma data sem intercalar sessões não gera bifurcação
- **WHEN** dois arcos têm a mesma data de evento e as faixas de número de sessão deles não se intercalam
- **THEN** o sistema não abre coluna adicional nem desenha curva automática entre eles

