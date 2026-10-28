# Spec Delta

## MODIFIED Requirements

### Requirement: Resposta que não revela contas existentes
O pedido de registo SHALL devolver o mesmo corpo e o mesmo estado, quer o e-mail seja novo, esteja pendente, tenha conta ativa ou conta desativada. A resposta SHALL ser emitida antes de qualquer consulta ou escrita que dependa de a conta existir; esse processamento e o envio do e-mail SHALL ocorrer depois, fora do caminho da resposta.

#### Scenario: E-mail com conta ativa
- **WHEN** alguém pede registo com um e-mail que já tem conta ativa
- **THEN** a resposta é igual à de um e-mail novo e o dono do e-mail recebe uma mensagem a informar que já tem conta, com link para entrar e link para recuperar a senha

#### Scenario: E-mail pendente
- **WHEN** alguém pede registo com um e-mail cuja conta ainda não foi confirmada (conta inativa e sem senha)
- **THEN** a resposta é igual e o e-mail recebe um novo link de 5 horas, invalidando o anterior

#### Scenario: Conta desativada
- **WHEN** alguém pede registo com o e-mail de uma conta desativada pelo admin (inativa e com senha)
- **THEN** a resposta é igual, a conta continua desativada e nenhum link de ativação é emitido; o e-mail recebe apenas o aviso de que já existe uma conta

#### Scenario: Pedidos simultâneos
- **WHEN** dois pedidos para o mesmo endereço, ou para aliases do mesmo endereço, chegam ao mesmo tempo
- **THEN** existe no fim uma única conta e nenhuma das respostas revela o conflito

#### Scenario: Alias do mesmo endereço
- **WHEN** alguém pede registo com uma variante `+etiqueta` de um endereço existente, ou com pontos diferentes num endereço Gmail
- **THEN** o pedido é tratado como o mesmo endereço e não cria uma segunda conta
