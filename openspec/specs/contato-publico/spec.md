# contato-publico Specification

## Purpose
Dá a qualquer pessoa, com ou sem conta, um meio de contactar o operador da instância por um formulário, sem expor o e-mail do operador e sem a aplicação guardar as mensagens.

## Requirements

### Requirement: Página pública de contacto
O sistema SHALL oferecer uma página pública de contacto acessível a qualquer pessoa, autenticada ou não. O formulário SHALL pedir nome, e-mail para resposta, assunto (de uma lista fixa de categorias) e mensagem, e SHALL estar disponível em pt-BR e en.

#### Scenario: Visitante sem conta
- **WHEN** uma pessoa sem sessão abre a página de contacto
- **THEN** vê o formulário completo

#### Scenario: Pessoa autenticada
- **WHEN** uma pessoa com sessão abre a página de contacto
- **THEN** vê o mesmo formulário, sem redirecionamento

#### Scenario: Envio com sucesso
- **WHEN** a pessoa preenche os campos válidos e envia
- **THEN** a página mostra a confirmação de que a mensagem foi enviada e limpa o formulário

### Requirement: Entrega por e-mail ao administrador
O sistema SHALL enviar cada mensagem válida por e-mail ao endereço de contacto configurado para a instância, com o e-mail da pessoa como endereço de resposta. O conteúdo do utilizador SHALL ser tratado como texto, nunca como marcação, e nome e assunto SHALL NOT permitir injeção de cabeçalhos. O sistema SHALL NOT guardar a mensagem na aplicação e SHALL NOT enviar qualquer e-mail à própria pessoa.

#### Scenario: Mensagem entregue
- **WHEN** é enviada uma mensagem válida
- **THEN** o administrador recebe um e-mail com assunto identificável como contacto, o nome, o e-mail e o texto, e responder a esse e-mail responde à pessoa

#### Scenario: Conteúdo malicioso
- **WHEN** a mensagem ou o nome contém marcação HTML ou quebras de linha
- **THEN** o e-mail mostra o conteúdo como texto e o assunto não ganha cabeçalhos extra

#### Scenario: Sem armazenamento nem confirmação
- **WHEN** uma mensagem é enviada
- **THEN** nada fica guardado na base de dados da aplicação e nenhum e-mail é enviado ao endereço da pessoa

### Requirement: Resultado honesto e validação
O sistema SHALL informar a pessoa do resultado real do envio: a confirmação de sucesso SHALL só aparecer depois de o provedor de e-mail ter aceitado a mensagem, e uma falha do provedor SHALL resultar num erro claro que convida a tentar mais tarde, para que nenhuma mensagem se perca em silêncio. O sistema SHALL recusar com erro claro nomes, e-mails ou mensagens fora dos limites de tamanho e assuntos fora da lista.

#### Scenario: Provedor indisponível
- **WHEN** o provedor de e-mail recusa ou não responde a tempo
- **THEN** a pessoa vê uma mensagem de que não foi possível enviar e pode tentar de novo, e o formulário mantém o que escreveu

#### Scenario: Mensagem demasiado longa
- **WHEN** a mensagem excede o tamanho máximo
- **THEN** o pedido é recusado com um erro de validação e nenhum e-mail é enviado

#### Scenario: Mensagem demasiado curta
- **WHEN** a mensagem tem menos do mínimo de caracteres
- **THEN** o pedido é recusado com um erro de validação

#### Scenario: Assunto inválido
- **WHEN** o assunto não pertence à lista de categorias
- **THEN** o pedido é recusado com um erro de validação

#### Scenario: Demasiadas ligações
- **WHEN** a mensagem contém mais de duas ligações `http://` ou `https://`
- **THEN** o pedido é recusado com um erro de validação e nenhum e-mail é enviado

### Requirement: Defesas contra spam e abuso
O sistema SHALL limitar os pedidos de contacto por IP, por e-mail e no total diário da instância, com um limite próprio e separado para a categoria de privacidade e dados (para proteger a caixa do administrador e a quota de envio partilhada com o registo), SHALL ignorar silenciosamente os pedidos que preencham o campo isca (honeypot), e, quando o captcha estiver configurado, SHALL recusar os pedidos cuja verificação falhe ou não responda a tempo. Um limite excedido SHALL responder com o erro de limite de pedidos, sem enviar e-mail. O sistema SHALL NOT registar em logs o nome, o e-mail nem o texto da mensagem.

#### Scenario: Muitos pedidos do mesmo IP
- **WHEN** o mesmo IP excede o limite horário de pedidos de contacto
- **THEN** os pedidos seguintes são recusados com o erro de limite e nenhum e-mail é enviado

#### Scenario: Muitos pedidos do mesmo e-mail
- **WHEN** o mesmo endereço excede o limite diário de pedidos de contacto
- **THEN** o pedido é recusado com o erro de limite de pedidos e nenhum e-mail é enviado

#### Scenario: Limite diário da instância
- **WHEN** a instância atinge o limite diário total de mensagens de contacto
- **THEN** os pedidos seguintes de outras categorias são recusados com um erro que pede para tentar mais tarde e nenhum e-mail é enviado

#### Scenario: Pedidos de privacidade com o limite diário esgotado
- **WHEN** a instância atingiu o limite diário total e chega uma mensagem da categoria de privacidade e dados
- **THEN** a mensagem continua a ser aceite, sujeita aos limites por IP e por e-mail e ao captcha, até ao limite diário próprio dessa categoria

#### Scenario: Limite diário da categoria de privacidade
- **WHEN** a instância atinge o limite diário próprio da categoria de privacidade e dados
- **THEN** as mensagens seguintes dessa categoria são recusadas com um erro que pede para tentar mais tarde e nenhum e-mail é enviado

#### Scenario: Falha do provedor não consome o limite da instância
- **WHEN** o provedor de e-mail falha ao enviar uma mensagem
- **THEN** o limite diário da instância não é consumido por essa tentativa e a pessoa pode tentar de novo sem perder a sua quota por e-mail

#### Scenario: Campo isca preenchido
- **WHEN** o pedido chega com o campo isca preenchido
- **THEN** a resposta parece de sucesso mas nenhum e-mail é enviado

#### Scenario: Captcha falhado ou indisponível
- **WHEN** o captcha está configurado e a verificação falha ou não responde a tempo
- **THEN** o pedido é recusado, com erro distinto para falha e para indisponibilidade, e nenhum e-mail é enviado

### Requirement: Disponibilidade do contacto
O contacto SHALL estar disponível apenas quando existir endereço de contacto configurado e um meio de envio de e-mail (provedor real, ou o modo de depuração). Quando não estiver, a página SHALL informar que o contacto não está disponível e SHALL NOT mostrar o formulário, e o endpoint SHALL recusar os pedidos.

#### Scenario: Sem endereço de contacto
- **WHEN** a instância não tem endereço de contacto configurado
- **THEN** a página mostra que o contacto não está disponível e não mostra o formulário

#### Scenario: Endereço de contacto inválido
- **WHEN** o endereço de contacto configurado não tem formato válido
- **THEN** a página mostra que o contacto não está disponível e a aplicação regista um aviso no arranque

#### Scenario: Sem provedor de e-mail
- **WHEN** há endereço de contacto mas não há provedor de e-mail nem modo de depuração
- **THEN** a página mostra que o contacto não está disponível

#### Scenario: Modo de depuração
- **WHEN** a instância está em modo de depuração sem provedor real
- **THEN** o contacto fica disponível e o e-mail é registado no ficheiro de e-mails de desenvolvimento, sem ser enviado

### Requirement: Arranque seguro dos formulários públicos
Com o endereço de contacto configurado, ou com um provedor real de e-mail configurado, e o modo de depuração desligado, o sistema SHALL recusar-se a arrancar se o proxy reverso não estiver declarado como confiável, para que o limite por IP dos formulários públicos (contacto, registo e recuperação de senha) não trate todos os visitantes como um só cliente, mesmo com o registo fechado.

#### Scenario: Contacto configurado sem proxy confiável
- **WHEN** o endereço de contacto está configurado, o modo de depuração está desligado e o proxy não está declarado como confiável
- **THEN** a aplicação não arranca e indica o motivo

#### Scenario: Provedor de e-mail configurado sem proxy confiável
- **WHEN** um provedor real de e-mail está configurado, o modo de depuração está desligado e o proxy não está declarado como confiável
- **THEN** a aplicação não arranca e indica o motivo

#### Scenario: Contacto sem configuração
- **WHEN** o endereço de contacto não está configurado
- **THEN** a aplicação arranca sem exigir essa declaração por causa do contacto

### Requirement: Texto legal coerente com o contacto
A política de privacidade SHALL descrever que o formulário envia nome, e-mail e mensagem por e-mail ao operador e que nada é guardado na aplicação. As páginas de termos e de privacidade SHALL apontar para a página de contacto como canal para dúvidas, correção e retirada de dados, e SHALL NOT conter a frase "cookies de terceiros próprios".

#### Scenario: Link nas páginas legais
- **WHEN** a pessoa abre os termos ou a política de privacidade
- **THEN** encontra um link para a página de contacto na seção de contacto

#### Scenario: Descrição do tratamento
- **WHEN** a pessoa lê a política de privacidade
- **THEN** encontra a descrição do tratamento dos dados do formulário de contacto
