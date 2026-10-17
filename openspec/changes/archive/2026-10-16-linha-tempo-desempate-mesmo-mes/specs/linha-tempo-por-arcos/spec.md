# Spec Delta

## MODIFIED Requirements

### Requirement: Modo "Por arcos" na Linha do Tempo
A Linha do Tempo SHALL oferecer um modo "Por arcos" além do modo cronológico existente, sem alterar o resultado ou os dados do modo cronológico. O modo "Por arcos" SHALL apresentar uma linha por sessão visível, ordenada pela data do evento associado a essa sessão, com as sessões mais recentes acima das mais antigas. A data do evento SHALL ser o ano e, quando existir, o mês do evento ligado à sessão; se a sessão tiver vários eventos, SHALL ser usada a data mais antiga. Duas sessões visíveis com exatamente a mesma data (mesmo ano e mês) SHALL ser desempatadas pelo número da sessão, com a de número maior acima da de número menor — consistente com a regra de mais recente no topo, já que o número da sessão cresce com a cronologia real de jogo. Uma sessão sem evento com ano, cujo arco tem pelo menos uma outra sessão com evento datado, SHALL aparecer posicionada dentro do bloco contínuo desse arco — na posição correspondente à data mais recente entre as sessões datadas do próprio arco, desempatada pelas mesmas regras das demais sessões do arco — sem que o sistema lhe atribua uma data própria. Uma sessão sem evento com ano cujo arco não tem nenhuma sessão com evento datado (ou que não pertence a nenhum arco) SHALL permanecer visível, abaixo de todas as sessões posicionadas por data (própria ou do arco), ordenada pelo número da sessão em ordem crescente, sem data inventada. Enquanto as datas das sessões visíveis não se intercalarem, o modo SHALL desenhar todas essas sessões numa única coluna vertical, qualquer que seja o arco de cada uma. O modo SHALL abrir uma coluna adicional só quando a data de uma sessão visível fica estritamente entre a data mais antiga e a mais recente de outro arco, ou quando duas sessões visíveis de arcos diferentes têm a mesma data — essa regra de coluna continua baseada só nas sessões que têm data de evento própria, nunca na data de referência herdada do arco por uma sessão sem data. O texto de tempo decorrido entre duas sessões datadas consecutivas do mesmo arco SHALL continuar correto mesmo quando sessões sem data desse arco estiverem posicionadas entre elas.

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
- **WHEN** uma sessão visível não tem evento com ano e nenhuma outra sessão do mesmo arco tem (ou a sessão não pertence a nenhum arco)
- **THEN** essa sessão continua visível abaixo de todas as sessões posicionadas por data, ordenada pelo número da sessão, sem o sistema lhe atribuir uma data

#### Scenario: Tempo decorrido não se perde com uma sessão sem data no meio
- **WHEN** duas sessões datadas do mesmo arco têm, entre elas na exibição, uma ou mais sessões sem data desse mesmo arco
- **THEN** o texto de tempo decorrido entre as duas sessões datadas continua sendo calculado a partir da data real uma da outra, ignorando as sessões sem data intercaladas

#### Scenario: Duas sessões do mesmo mês ficam na ordem certa entre si
- **WHEN** duas sessões visíveis (do mesmo arco ou de arcos diferentes) têm o mesmo ano e mês de evento
- **THEN** a sessão de número maior aparece acima da sessão de número menor

#### Scenario: Alternar entre modo cronológico e por arcos
- **WHEN** o utilizador seleciona "Por arcos" numa campanha com arcos cadastrados
- **THEN** o sistema mostra o modo por arcos e permite voltar ao modo cronológico existente sem perder dados ou alterar seu resultado
