# Spec Delta

## MODIFIED Requirements

### Requirement: Tempo decorrido entre sessões da mesma raia
Cada ligação desenhada entre duas sessões SHALL indicar o tempo decorrido entre as datas dos eventos dessas sessões. Um intervalo longo entre duas sessões do mesmo arco SHALL ser visualmente distinguível por uma ligação tracejada. A coluna de um arco que continua no tempo SHALL manter a ligação vertical entre as suas sessões mesmo quando a data de uma sessão de outro arco fica entre elas; essa outra sessão SHALL aparecer na coluna da bifurcação, ligada por curva, e SHALL NOT substituir a vertical do arco que continua. Quando a ligação entre duas sessões visíveis atravessa dois arcos sequenciais (a data mais antiga de um arco e a data mais recente de outro arco adjacente no tempo, sem nenhum arco com data entre eles), a ligação SHALL ser sempre tracejada, independentemente da duração do intervalo, e a cor do traço SHALL fazer uma transição gradual da cor do arco mais recente para a cor do arco mais antigo. Quando os dois arcos sequenciais ocupam a mesma coluna, essa ligação SHALL continuar sendo um traço reto vertical (não uma curva) — só o estilo (tracejado, gradiente) muda em relação à ligação sólida já usada dentro de um único arco.

#### Scenario: Duas sessões do mesmo arco separadas no tempo
- **WHEN** o utilizador consulta duas sessões da mesma coluna, vizinhas nessa coluna e separadas por um intervalo longo
- **THEN** o sistema exibe o tempo decorrido entre as datas dos eventos e usa uma ligação visual tracejada

#### Scenario: Outra sessão é mais próxima no tempo
- **WHEN** duas sessões do mesmo arco têm outra sessão visível, de outro arco, com data estritamente entre elas
- **THEN** o sistema mantém a ligação vertical entre as duas sessões do arco que continua e desenha a sessão intermédia na coluna da bifurcação

#### Scenario: Dois arcos sequenciais, sem overlap de datas
- **WHEN** a sessão mais antiga de um arco e a sessão mais recente de outro arco, adjacente no tempo e sem nenhuma data intercalada entre os dois, são vizinhas na ordenação visível
- **THEN** o sistema exibe o tempo decorrido entre os dois arcos com uma ligação sempre tracejada, com transição de cor entre a cor de um arco e a do outro, mesmo que o intervalo seja curto

### Requirement: Ligação ao ponto mais próximo no tempo
No modo "Por arcos", as sessões visíveis da mesma coluna SHALL ligar-se na vertical, da mais recente para a mais antiga nessa coluna. Quando uma coluna existe por bifurcação — seja por overlap de datas detectado automaticamente, seja por uma sessão de transição marcada pelo mestre —, a ligação entre essa coluna e a coluna de onde saiu SHALL ser desenhada automaticamente como uma curva contínua, sem canto reto, que sai alinhada à coluna de origem e chega alinhada à outra coluna na altura da sessão que delimita o encontro, sem exigir nenhuma ação do mestre para a bifurcação detectada por overlap. Quando mais de um arco já posicionado poderia ser a origem de uma bifurcação (overlap com mais de um arco ao mesmo tempo), o sistema SHALL escolher como origem o par de sessões (uma do arco novo, uma do arco já posicionado) com a menor distância de tempo entre si, de forma determinística. Uma sessão de transição marcada pelo mestre entre dois arcos específicos SHALL ter precedência sobre a curva automática desse mesmo par de arcos — o sistema SHALL NOT desenhar as duas ligações sobrepostas para o mesmo par. Um filtro de arcos SHALL recalcular colunas e ligações só entre as sessões que permanecem visíveis, incluindo as ligações tracejadas entre arcos sequenciais e as curvas de bifurcação automática, e SHALL NOT desenhar traço (de nenhum dos tipos de ligação) envolvendo um arco oculto. Duas sessões visíveis de arcos diferentes com a mesma data SHALL ocupar colunas diferentes.

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
