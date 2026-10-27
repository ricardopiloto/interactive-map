# ia-provider Specification

## Purpose

Fornece a infraestrutura de base para que o backend chame um provedor externo de IA em nome de uma campanha, garantindo que o módulo esteja habilitado, que nenhum dado oculto ou de outra campanha seja exposto ao provedor, e que uma falha do provedor não corrompa dados nem vaze informação sensível.

## Requirements

### Requirement: IA disponível apenas quando o módulo está habilitado na campanha
O sistema SHALL permitir uma chamada ao provedor de IA somente quando o módulo de IA estiver ativo para a campanha que a solicita. Por padrão, sem configuração explícita, o módulo SHALL ser considerado desabilitado.

#### Scenario: Campanha sem o módulo de IA habilitado
- **WHEN** uma operação que dependeria de IA é solicitada numa campanha sem o módulo de IA ativo
- **THEN** o sistema não realiza nenhuma chamada ao provedor externo e informa que a IA não está habilitada para essa campanha

#### Scenario: Campanha com o módulo de IA habilitado
- **WHEN** uma operação que depende de IA é solicitada numa campanha com o módulo de IA ativo
- **THEN** o sistema permite a chamada ao provedor, sujeita às demais regras desta capability

### Requirement: Isolamento por campanha nas chamadas de IA
Cada chamada ao provedor de IA SHALL incluir apenas dados pertencentes à campanha que a solicitou. O sistema NUNCA SHALL combinar ou enviar, numa mesma chamada, dados de mais de uma campanha.

#### Scenario: Chamada restrita a uma única campanha
- **WHEN** uma chamada de IA é feita em nome de uma campanha específica
- **THEN** os dados enviados ao provedor pertencem exclusivamente a essa campanha, sem nenhum dado de outra campanha

### Requirement: Dados ocultos só enviados em assistência de escrita do mestre dono
Conteúdo marcado como oculto (`visivel_para_todos=false`) — sessões, eventos, personagens, locais ou qualquer outra entidade sujeita a essa regra de visibilidade — NUNCA SHALL ser incluído nos dados enviados ao provedor de IA, independentemente do módulo estar habilitado, EXCETO numa assistência de escrita acionada pelo mestre dono da própria campanha, em que o conteúdo oculto dessa mesma campanha MAY ser incluído. Toda chamada que não seja uma assistência de escrita explícita do mestre dono SHALL continuar excluindo conteúdo oculto. A inclusão de conteúdo oculto SHALL ser uma escolha explícita do chamador (parâmetro nomeado), nunca o comportamento padrão.

#### Scenario: Sessão oculta excluída da chamada de IA
- **WHEN** uma chamada de IA que não é uma assistência de escrita do mestre dono é montada a partir de dados da campanha que incluem uma sessão marcada como oculta
- **THEN** o conteúdo dessa sessão oculta não é incluído nos dados enviados ao provedor de IA

#### Scenario: Assistência de escrita do mestre dono inclui conteúdo oculto da própria campanha
- **WHEN** o mestre dono aciona uma assistência de escrita e a campanha contém um personagem oculto
- **THEN** o conteúdo desse personagem oculto pode ser incluído nos dados enviados ao provedor, e nenhum conteúdo de outra campanha é incluído

#### Scenario: Registro oculto é marcado quando enviado
- **WHEN** a inclusão de conteúdo oculto está ligada e um registro oculto entra no contexto enviado ao provedor
- **THEN** esse registro carrega a marca de oculto, e fora desse modo nenhum registro recebe a marca nem aparece oculto

#### Scenario: Inclusão de oculto sem mestre dono é recusada
- **WHEN** a inclusão de conteúdo oculto é solicitada numa chamada que não vem do mestre dono da campanha
- **THEN** o sistema recusa a chamada sem contatar o provedor

### Requirement: Apenas mestre autorizado aciona chamadas de IA
Apenas um mestre autorizado da campanha SHALL poder acionar uma operação que resulte numa chamada ao provedor de IA através desta infraestrutura. Um jogador SHALL não poder acionar nenhuma chamada de IA.

#### Scenario: Jogador não pode acionar IA
- **WHEN** um jogador (não mestre) tenta acionar uma operação que dependeria de uma chamada de IA
- **THEN** o sistema nega a operação sem realizar nenhuma chamada ao provedor

### Requirement: Credenciais do provedor configuradas fora do código e nunca expostas
A credencial de acesso ao provedor de IA SHALL ser configurada por configuração de implantação (variável de ambiente ou mecanismo equivalente), nunca fixada no código-fonte. A credencial NUNCA SHALL ser incluída em nenhuma resposta da API, log acessível ao cliente ou mensagem de erro voltada ao utilizador.

#### Scenario: Credencial ausente ou inválida
- **WHEN** a credencial do provedor de IA não está configurada ou é rejeitada pelo provedor
- **THEN** o sistema trata a IA como indisponível para todas as campanhas, sem expor a credencial nem detalhes internos de configuração na resposta ao utilizador

### Requirement: Indisponibilidade do provedor tratada de forma explícita
Quando o provedor de IA estiver indisponível, responder com erro, ou exceder o tempo limite, o sistema SHALL retornar ao chamador um estado de falha explícito e tratável, em vez de uma falha não tratada. Nenhum dado já persistido SHALL ser perdido ou corrompido por uma falha do provedor.

#### Scenario: Timeout do provedor de IA
- **WHEN** uma chamada ao provedor de IA excede o tempo limite configurado
- **THEN** o sistema retorna um estado de falha explícito ao chamador e os dados já persistidos na campanha permanecem intactos

#### Scenario: Erro de resposta do provedor de IA
- **WHEN** o provedor de IA responde com um erro
- **THEN** o sistema retorna um estado de falha explícito ao chamador, sem expor detalhes internos do provedor que não sejam seguros para o utilizador final
