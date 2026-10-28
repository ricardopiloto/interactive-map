# Spec Delta

## Purpose

Permite que uma pessoa crie a própria conta informando só o e-mail, provando a posse dele por um link de curta duração, sem expor contas existentes e com defesas contra spam e bots.

## ADDED Requirements

### Requirement: Página pública de criação de conta
O sistema SHALL oferecer uma página pública de criação de conta onde a pessoa informa o e-mail e aceita os termos de uso e a política de privacidade. O envio SHALL ser impossível sem o aceite. Quando o registo estiver fechado, a página SHALL informar que não está disponível e SHALL NOT mostrar o formulário.

#### Scenario: Envio com aceite
- **WHEN** a pessoa preenche um e-mail válido, marca o aceite e envia
- **THEN** a página mostra a confirmação "verifique o seu e-mail" e não revela se o endereço já tinha conta

#### Scenario: Envio sem aceite
- **WHEN** a pessoa tenta enviar sem marcar o aceite
- **THEN** o envio é impedido e é indicado que o aceite é obrigatório

#### Scenario: Registo fechado
- **WHEN** o registo está configurado como fechado e a pessoa abre a página
- **THEN** vê a indicação de que o registo não está disponível e o convite do admin continua a ser o único meio de entrada

#### Scenario: Pessoa já autenticada
- **WHEN** uma pessoa com sessão ativa abre a página de criação de conta
- **THEN** é levada ao Painel

### Requirement: Link de verificação de 5 horas
Ao receber um pedido de registo válido, o sistema SHALL enviar ao e-mail informado um link de verificação válido por 5 horas e de uso único. O link SHALL levar à mesma página onde a pessoa define a senha; ao concluir, a conta SHALL ficar ativa e a sessão iniciada. A conta SHALL só existir como utilizável depois de a senha ser definida.

#### Scenario: Ativar dentro do prazo
- **WHEN** a pessoa abre o link em até 5 horas e define uma senha válida
- **THEN** a conta fica ativa, a sessão é iniciada e a pessoa chega ao Painel

#### Scenario: Link de verificação expirado
- **WHEN** a pessoa abre o link de verificação depois de 5 horas e o registo está aberto
- **THEN** é informada de que o link expirou e pode pedir um novo pelo registo

#### Scenario: Convite do admin expirado
- **WHEN** a pessoa abre um convite do admin expirado
- **THEN** é informada de que o convite expirou e orientada a pedir outro ao administrador, sem atalho para o registo

#### Scenario: Link já usado
- **WHEN** a pessoa abre um link já consumido
- **THEN** é informada de que o link já foi usado

### Requirement: Resposta que não revela contas existentes
O pedido de registo SHALL devolver o mesmo corpo e o mesmo estado, quer o e-mail seja novo, esteja pendente, tenha conta ativa ou conta desativada. A resposta SHALL ser emitida antes de qualquer consulta ou escrita que dependa de a conta existir; esse processamento e o envio do e-mail SHALL ocorrer depois, fora do caminho da resposta.

#### Scenario: E-mail com conta ativa
- **WHEN** alguém pede registo com um e-mail que já tem conta ativa
- **THEN** a resposta é igual à de um e-mail novo e o dono do e-mail recebe uma mensagem a informar que já tem conta, com link para entrar

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

### Requirement: Limpeza de contas não confirmadas
O sistema SHALL apagar as contas criadas por auto-registo que não definiram a senha dentro das 5 horas, juntamente com os seus convites. A limpeza SHALL NOT apagar contas criadas por convite do admin, contas ativas, nem contas com campanhas ou sessões. A limpeza SHALL correr automaticamente e também poder ser executada manualmente pelo admin.

#### Scenario: Conta não confirmada
- **WHEN** passam mais de 5 horas sem que a conta auto-registada tenha definido a senha
- **THEN** a conta e os seus convites deixam de existir e o mesmo e-mail pode voltar a registar-se

#### Scenario: Convite do admin pendente
- **WHEN** um convite criado pelo admin está pendente há mais de 5 horas, dentro das suas 72 horas
- **THEN** a conta e o convite permanecem

#### Scenario: Conta já ativada
- **WHEN** a pessoa definiu a senha dentro do prazo
- **THEN** a conta não é afetada pela limpeza

#### Scenario: Registos de bloqueio
- **WHEN** a limpeza apaga uma conta não confirmada
- **THEN** os contadores de bloqueio e de limite associados ao e-mail também são apagados

### Requirement: Defesas contra spam e bots
O sistema SHALL limitar os pedidos de registo por IP e por e-mail, SHALL rejeitar domínios de e-mail descartável, e SHALL ignorar silenciosamente pedidos que preencham o campo isca (honeypot). Quando o captcha estiver configurado, o pedido SHALL ser rejeitado se a verificação falhar. Um limite excedido SHALL responder com erro de limite de pedidos, sem enviar e-mail.

#### Scenario: Muitos pedidos do mesmo IP
- **WHEN** o mesmo IP excede o limite de pedidos de registo por hora
- **THEN** os pedidos seguintes são recusados com o erro de limite de registo (código `LIMITE_REGISTO`, estado 429) e nenhum e-mail é enviado

#### Scenario: Muitos pedidos para o mesmo e-mail
- **WHEN** o mesmo endereço, canonicalizado, recebe pedidos acima do limite diário, seja ele novo, pendente, ativo ou desativado
- **THEN** não são enviados novos e-mails (verificação ou aviso) e a resposta continua igual à de um pedido normal

#### Scenario: Limite de IP sem proxy confiável
- **WHEN** o registo está `aberto`, o modo de depuração está desligado e o proxy reverso não está declarado como confiável
- **THEN** a aplicação não arranca e indica o motivo, em vez de aplicar o limite de IP ao proxy como se fosse um só cliente

#### Scenario: E-mail descartável
- **WHEN** a pessoa informa um domínio de e-mail descartável
- **THEN** o pedido é recusado com uma mensagem clara e nenhuma conta é criada

#### Scenario: Campo isca preenchido
- **WHEN** o pedido chega com o campo isca preenchido
- **THEN** a resposta parece normal mas nenhuma conta nem e-mail é criado

#### Scenario: Captcha falhado
- **WHEN** o captcha está configurado e a verificação falha
- **THEN** o pedido é recusado e nenhuma conta nem e-mail é criado

### Requirement: Modo de registo configurável
O sistema SHALL ter um modo de registo configurável com os valores `fechado` e `aberto`. Em `fechado`, o endpoint de registo SHALL recusar pedidos e a página SHALL indicar indisponibilidade. O padrão SHALL ser `fechado`, para que nenhuma instalação existente passe a aceitar registos sem decisão explícita.

#### Scenario: Instalação sem configuração
- **WHEN** a variável de modo não está definida
- **THEN** o registo está fechado

### Requirement: Entrega de e-mail
O sistema SHALL enviar os e-mails de verificação e de aviso por um provedor transacional configurável. Quando o provedor não estiver configurado, o sistema SHALL registar o conteúdo do e-mail em log, e SHALL fazê-lo apenas em modo de depuração ou nos testes. O sistema SHALL recusar-se a arrancar com o registo `aberto`, fora do modo de depuração, se o provedor não estiver configurado ou se o endereço público da aplicação não for HTTPS nem apontar para uma máquina local. Os registos de falha de envio SHALL NOT conter o e-mail do destinatário em claro nem o token. Os e-mails SHALL sair em pt-BR ou en conforme o idioma da página de onde o pedido partiu. Uma falha do provedor SHALL ser registada e SHALL NOT revelar-se na resposta ao pedido.

#### Scenario: Provedor indisponível
- **WHEN** o provedor devolve erro no envio
- **THEN** a falha é registada nos logs e a resposta ao pedido permanece a genérica

#### Scenario: Produção sem provedor
- **WHEN** o registo está `aberto`, o modo de depuração está desligado e não há provedor de e-mail configurado
- **THEN** a aplicação não arranca e indica o motivo

#### Scenario: Endereço público inválido
- **WHEN** o registo está `aberto`, o modo de depuração está desligado e o endereço público é `localhost` ou não usa HTTPS
- **THEN** a aplicação não arranca e indica o motivo

#### Scenario: Idioma do e-mail
- **WHEN** o pedido parte da página em inglês
- **THEN** o e-mail de verificação é redigido em inglês

### Requirement: Convite do admin por e-mail
O convite criado pelo admin SHALL continuar válido por 72 horas e continuar a devolver o link ao admin. Quando o envio de e-mail estiver configurado, o admin SHALL poder pedir que o link também seja enviado ao e-mail convidado.

#### Scenario: Convite sem envio
- **WHEN** o admin cria o convite sem pedir envio
- **THEN** o comportamento é igual ao atual e o link é devolvido ao admin

#### Scenario: Convite com envio
- **WHEN** o admin cria o convite pedindo envio e o provedor está configurado
- **THEN** o convidado recebe o link por e-mail e o admin também o vê

#### Scenario: Envio sem provedor
- **WHEN** o admin pede envio mas o provedor não está configurado (fora do modo de depuração)
- **THEN** o pedido de envio é recusado, a opção não aparece na interface e o convite só é devolvido ao admin
