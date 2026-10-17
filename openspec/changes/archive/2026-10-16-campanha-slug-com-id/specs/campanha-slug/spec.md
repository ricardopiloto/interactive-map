# Spec Delta

## Purpose

Garante que toda campanha tem um endereço (`/c/{id}/{slug}`) que nunca depende do texto do slug bater exatamente com nada, usando o identificador interno já existente da campanha como segmento canônico — sem quebrar nenhum link ou acesso já concedido, e sem exigir nenhum sufixo artificial colado no slug escolhido pelo dono.

## ADDED Requirements

### Requirement: O id da campanha é o identificador canônico da URL e da API
O sistema SHALL usar o identificador interno (`id`) de cada campanha como o segmento canônico de resolução na URL (`/c/{id}/{slug}`) e em toda chamada de API `/api/c/{identificador}/...`. A resolução por `id` SHALL ter precedência sobre a resolução por slug quando o identificador recebido for puramente numérico, de forma que a navegação nunca precise que o segmento de slug bata exatamente com o slug atual da campanha.

#### Scenario: Navegação usa o id para resolver, não o texto do slug
- **WHEN** uma pessoa abre `/c/{id}/{qualquer-texto}` de uma campanha existente, mesmo que `{qualquer-texto}` não seja o slug atual dessa campanha
- **THEN** a campanha correta carrega normalmente, pelo `id`

#### Scenario: Rota canônica não é confundida com a rota de formato antigo
- **WHEN** uma pessoa abre uma URL cujo primeiro segmento depois de `/c/` é puramente numérico, seguido de um segundo segmento que também existe como nome de sub-rota de campanha (ex. `/c/3/rota`)
- **THEN** o sistema trata o primeiro segmento como `id` e resolve a forma canônica (`/c/{id}/{slug}/...`), nunca confundindo com a rota de formato antigo de um segmento só

### Requirement: Slug continua único e validável, mas não é mais a fonte de unicidade
O sistema SHALL continuar validando o formato do slug (caracteres permitidos, tamanho, nomes reservados) e SHALL continuar impedindo que duas campanhas tenham o mesmo slug, para que links no formato antigo (sem `id`) continuem resolvendo sem ambiguidade — mas a criação de uma campanha nunca SHALL exigir compor o slug com nenhum sufixo artificial para garantir unicidade.

#### Scenario: Criação concorrente com o mesmo slug
- **WHEN** duas requisições de criação de campanha com o mesmo slug chegam ao mesmo tempo
- **THEN** exatamente uma é criada com sucesso; a outra recebe um erro de slug já em uso, não um erro genérico

#### Scenario: Slug digitado é o endereço mostrado ao dono
- **WHEN** o dono cria uma campanha e digita um slug válido e disponível
- **THEN** a interface mostra esse slug como o endereço da campanha, sem nenhuma ressalva sobre um número adicional

### Requirement: Link no formato antigo (sem id) continua resolvendo e é corrigido para a forma canônica
O sistema SHALL continuar resolvendo uma requisição feita só com o slug (sem `id` na URL), e a navegação SHALL corrigir a URL exibida para a forma canônica (`/c/{id}/{slug}`) assim que a campanha for resolvida, sem recarregar a página nem exigir login novo.

#### Scenario: Link antigo de uma campanha já existente
- **WHEN** uma pessoa com acesso já concedido abre um link salvo no formato antigo (`/c/{slug}/...`, sem `id`)
- **THEN** a campanha correta carrega normalmente e a URL exibida passa a mostrar a forma canônica `/c/{id}/{slug}/...`, sem recarregar a página

### Requirement: Importação de pacote não exige tratamento especial de unicidade
Ao importar um pacote de campanha, o sistema SHALL validar e exigir que o slug do pacote (ou o slug alternativo informado na importação) seja único, usando exatamente a mesma validação e o mesmo tratamento de colisão já usados na criação manual de campanha — sem nenhuma composição de sufixo adicional.

#### Scenario: Importar um pacote com slug já em uso
- **WHEN** um pacote é importado com um slug que já pertence a outra campanha, sem um slug alternativo válido informado
- **THEN** a importação falha com o mesmo erro de slug duplicado já usado na criação manual, sem criar uma campanha parcial
