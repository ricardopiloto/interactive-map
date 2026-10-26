# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Dados ocultos nunca enviados ao provedor de IA`
- TO: `### Requirement: Dados ocultos só enviados em assistência de escrita do mestre dono`

## MODIFIED Requirements

### Requirement: Dados ocultos só enviados em assistência de escrita do mestre dono
Conteúdo marcado como oculto (`visivel_para_todos=false`) — sessões, eventos, personagens, locais ou qualquer outra entidade sujeita a essa regra de visibilidade — NUNCA SHALL ser incluído nos dados enviados ao provedor de IA, independentemente do módulo estar habilitado, EXCETO numa assistência de escrita acionada pelo mestre dono da própria campanha, em que o conteúdo oculto dessa mesma campanha MAY ser incluído. Toda chamada que não seja uma assistência de escrita explícita do mestre dono SHALL continuar excluindo conteúdo oculto. A inclusão de conteúdo oculto SHALL ser uma escolha explícita do chamador (parâmetro nomeado), nunca o comportamento padrão.

#### Scenario: Sessão oculta excluída da chamada de IA
- **WHEN** uma chamada de IA que não é uma assistência de escrita do mestre dono é montada a partir de dados da campanha que incluem uma sessão marcada como oculta
- **THEN** o conteúdo dessa sessão oculta não é incluído nos dados enviados ao provedor de IA

#### Scenario: Assistência de escrita do mestre dono inclui conteúdo oculto da própria campanha
- **WHEN** o mestre dono aciona uma assistência de escrita e a campanha contém um personagem oculto
- **THEN** o conteúdo desse personagem oculto pode ser incluído nos dados enviados ao provedor, e nenhum conteúdo de outra campanha é incluído

#### Scenario: Inclusão de oculto sem mestre dono é recusada
- **WHEN** a inclusão de conteúdo oculto é solicitada numa chamada que não vem do mestre dono da campanha
- **THEN** o sistema recusa a chamada sem contatar o provedor
