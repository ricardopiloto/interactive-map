# Spec Delta

## Purpose

Permite que uma pessoa recupere o acesso à própria conta por e-mail, sem depender do admin, sem revelar quais contas existem e sem nunca reativar uma conta desativada pelo admin.

## ADDED Requirements

### Requirement: Pedido de recuperação a partir do login
O sistema SHALL oferecer, nas duas variantes do login (página própria e janela sobre outra página), um link "Esqueci a senha" que leva a uma página pública onde a pessoa informa o e-mail. A página SHALL ser acessível com ou sem sessão e SHALL usar o mesmo rodapé das demais páginas fora de campanha.

#### Scenario: Link no login
- **WHEN** a pessoa abre o login, em página própria ou em janela
- **THEN** vê o link "Esqueci a senha" que leva à página de recuperação

#### Scenario: Envio do pedido
- **WHEN** a pessoa informa um e-mail válido e envia
- **THEN** vê a confirmação "se existir uma conta com este e-mail, enviamos um link", igual para qualquer e-mail

### Requirement: Resposta que não revela contas
O pedido de recuperação SHALL devolver o mesmo corpo e o mesmo estado, quer o e-mail seja de uma conta ativa, não exista, seja de uma conta pendente ou de uma conta desativada pelo admin. A resposta SHALL ser emitida antes de qualquer consulta ou escrita que dependa de a conta existir; esse processamento e o envio do e-mail SHALL ocorrer depois, fora do caminho da resposta.

#### Scenario: Conta ativa
- **WHEN** alguém pede recuperação com o e-mail de uma conta ativa
- **THEN** a resposta é a padrão e o dono do e-mail recebe um link de redefinição

#### Scenario: E-mail sem conta
- **WHEN** alguém pede recuperação com um e-mail sem conta
- **THEN** a resposta é igual e nenhum e-mail é enviado

#### Scenario: Conta pendente
- **WHEN** alguém pede recuperação com o e-mail de uma conta que ainda não definiu a senha
- **THEN** a resposta é igual e nenhum e-mail é enviado

#### Scenario: Conta desativada
- **WHEN** alguém pede recuperação com o e-mail de uma conta desativada pelo admin
- **THEN** a resposta é igual, nenhum link é emitido e a conta continua desativada

#### Scenario: Alias do mesmo endereço
- **WHEN** alguém pede recuperação com uma variante `+etiqueta` (ou com pontos diferentes num endereço Gmail) do e-mail de uma única conta ativa
- **THEN** o link é enviado ao endereço registado da conta e não ao alias digitado

#### Scenario: E-mail exato preferido
- **WHEN** o e-mail pedido é exatamente o de uma conta ativa e outra conta ativa tem o mesmo endereço canonicalizado
- **THEN** o link é enviado à conta do e-mail exato

#### Scenario: Contas ambíguas
- **WHEN** o e-mail pedido não coincide com nenhuma conta e duas ou mais contas ativas têm o mesmo endereço canonicalizado
- **THEN** a resposta é a padrão e nenhum e-mail é enviado

### Requirement: Link de redefinição de curta duração
O link de recuperação pedido pela própria pessoa SHALL ser válido por 1 hora e de uso único. Ao emitir um novo link, o sistema SHALL invalidar os links de redefinição anteriores da mesma conta. O reset gerado pelo admin SHALL continuar válido por 72 horas.

#### Scenario: Usar dentro do prazo
- **WHEN** a pessoa abre o link em até 1 hora e define uma senha válida
- **THEN** a senha é trocada

#### Scenario: Link expirado
- **WHEN** a pessoa abre o link depois de 1 hora
- **THEN** é informada de que o link expirou e pode pedir um novo pelo atalho oferecido

#### Scenario: Link já usado ou inválido
- **WHEN** a pessoa abre um link de redefinição que já foi usado, que foi invalidado por um pedido mais recente ou que não é válido
- **THEN** é informada do problema e vê o mesmo atalho para pedir um novo link

#### Scenario: Novo pedido invalida o anterior
- **WHEN** a pessoa pede um segundo link antes de usar o primeiro
- **THEN** o primeiro link deixa de funcionar e apenas o segundo é válido

#### Scenario: Link do admin
- **WHEN** o admin gera um link de reset
- **THEN** esse link continua válido por 72 horas

### Requirement: Redefinição segura da senha
Ao redefinir a senha por um link válido, o sistema SHALL revogar todas as sessões anteriores da conta e limpar o bloqueio de login por tentativas falhadas desse e-mail. O sistema SHALL NOT reativar uma conta desativada pelo admin: um link emitido antes da desativação SHALL deixar de funcionar a partir dela.

#### Scenario: Sessões revogadas
- **WHEN** a pessoa redefine a senha com sucesso
- **THEN** as sessões que existiam deixam de valer e a pessoa pode entrar com a nova senha

#### Scenario: Bloqueio de login limpo
- **WHEN** a conta estava bloqueada por tentativas falhadas e a pessoa redefine a senha
- **THEN** pode entrar de imediato com a nova senha

#### Scenario: Conta desativada depois de pedir o link
- **WHEN** o admin desativa a conta depois de um link ter sido emitido e a pessoa tenta usá-lo
- **THEN** a redefinição é recusada e a conta continua desativada

### Requirement: Defesas contra abuso
O sistema SHALL limitar os pedidos de recuperação por IP e por e-mail, SHALL ignorar silenciosamente os pedidos que preencham o campo isca (honeypot) e, quando o captcha estiver configurado, SHALL recusar os pedidos cuja verificação falhe ou não responda a tempo. Um limite excedido por IP SHALL responder com o erro de limite de pedidos, sem enviar e-mail; o limite por e-mail SHALL ser aplicado a todos os tipos de conta sem alterar a resposta. O sistema SHALL NOT guardar o e-mail em claro nos contadores.

#### Scenario: Muitos pedidos do mesmo IP
- **WHEN** o mesmo IP excede o limite horário de pedidos de recuperação
- **THEN** os pedidos seguintes são recusados com o erro de limite de pedidos e nenhum e-mail é enviado

#### Scenario: Muitos pedidos para o mesmo e-mail
- **WHEN** o mesmo endereço, canonicalizado, excede o limite diário de pedidos de recuperação
- **THEN** não são enviados novos e-mails e a resposta continua igual à de um pedido normal

#### Scenario: Falha do provedor
- **WHEN** o provedor de e-mail falha ao enviar o link a uma conta ativa
- **THEN** a tentativa não consome o limite diário do e-mail e a falha fica registada sem dados pessoais

#### Scenario: Campo isca preenchido
- **WHEN** o pedido chega com o campo isca preenchido
- **THEN** a resposta parece normal mas nenhum e-mail é enviado

#### Scenario: Captcha falhado ou indisponível
- **WHEN** o captcha está configurado e a verificação falha ou não responde a tempo
- **THEN** o pedido é recusado, com erro distinto para falha e para indisponibilidade, e nenhum e-mail é enviado

### Requirement: E-mail de recuperação
O sistema SHALL enviar o link por e-mail em pt-BR ou en conforme o idioma da página de onde o pedido partiu, com o link de redefinição e o aviso de que, se a pessoa não fez o pedido, deve ignorar a mensagem. O e-mail SHALL NOT conter texto escolhido por quem fez o pedido.

#### Scenario: Idioma
- **WHEN** o pedido parte da página em inglês
- **THEN** o e-mail de recuperação é redigido em inglês

#### Scenario: Pedido que a pessoa não fez
- **WHEN** o dono do e-mail recebe um link que não pediu
- **THEN** a mensagem diz para ignorá-la e a senha da conta não muda

### Requirement: Disponibilidade da recuperação
A recuperação SHALL estar disponível apenas quando existir um meio de envio de e-mail (provedor real, ou o modo de depuração). Quando não estiver, a página SHALL informar que a recuperação não está disponível e orientar a pessoa a usar o contato, sem mostrar o formulário, e o endpoint SHALL recusar os pedidos.

#### Scenario: Sem provedor de e-mail
- **WHEN** não há provedor de e-mail nem modo de depuração
- **THEN** a página mostra que a recuperação não está disponível, com link para o contato, e não mostra o formulário

#### Scenario: Modo de depuração
- **WHEN** a instância está em modo de depuração sem provedor real
- **THEN** a recuperação fica disponível e o e-mail é registado no ficheiro de e-mails de desenvolvimento, sem ser enviado

### Requirement: Texto legal coerente com a recuperação
A política de privacidade SHALL descrever que, na recuperação de senha, o e-mail é usado para enviar o link e que um contador temporário com hash do e-mail limita o abuso, sem guardar mais nada.

#### Scenario: Descrição do tratamento
- **WHEN** a pessoa lê a política de privacidade
- **THEN** encontra a descrição do tratamento de dados da recuperação de senha
