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

### Requirement: Dados ocultos nunca enviados ao provedor de IA
Conteúdo marcado como oculto (`visivel_para_todos=false`) — sessões, eventos, personagens, locais ou qualquer outra entidade sujeita a essa regra de visibilidade — NUNCA SHALL ser incluído nos dados enviados ao provedor de IA, independentemente do módulo estar habilitado.

#### Scenario: Sessão oculta excluída da chamada de IA
- **WHEN** uma chamada de IA é montada a partir de dados da campanha que incluem uma sessão marcada como oculta
- **THEN** o conteúdo dessa sessão oculta não é incluído nos dados enviados ao provedor de IA

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
