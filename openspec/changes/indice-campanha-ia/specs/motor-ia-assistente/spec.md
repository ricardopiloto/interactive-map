# Spec Delta

## MODIFIED Requirements

### Requirement: Contexto real da campanha em toda chamada

Toda chamada de assistência SHALL enviar ao provedor, além do texto atual do campo e do pedido do mestre, o contexto da campanha relevante para aquele tipo de campo. O sistema NUNCA SHALL chamar o provedor apenas com o texto digitado no campo. O prompt SHALL ser genérico, sem depender do sistema de RPG da campanha, e SHALL instruí-lo a responder no idioma do texto atual e do conteúdo da campanha (pt-BR na dúvida). O texto atual e a instrução do mestre SHALL ser enviados como dados do contexto, nunca como instrução do sistema. O contexto da campanha SHALL ser composto, nesta ordem de prioridade, por: o texto atual e a instrução do mestre; os fios em aberto (no rascunho de sessão); as sessões e os arcos mais recentes, completos; um catálogo compacto com o nome (e papel ou facção, quando houver) de personagens, locais, itens, arcos e sessões; e os trechos mais relevantes ao pedido recuperados do índice da campanha. O contexto de cada chamada SHALL respeitar um limite de tamanho, cortando de forma determinística (menos prioritário e menos relevante primeiro) e incluindo o texto atual e a instrução no cômputo. Quando o índice da campanha estiver indisponível, o contexto SHALL ser montado pela leitura completa da campanha, com o mesmo limite.

#### Scenario: Descrição de personagem usa o universo existente

- **WHEN** o mestre pede um rascunho de descrição para um personagem
- **THEN** a chamada inclui o nome e dados do personagem e o contexto da campanha relevante, como facções, locais e personagens relacionados

#### Scenario: NPC proposto sem bloco mecânico

- **WHEN** a sugestão propõe ou descreve um NPC
- **THEN** o texto não traz atributos, estatísticas nem regras de nenhum sistema e usa o marcador de placeholder "[Mecânica a definir pelo mestre]" onde a mecânica caberia

#### Scenario: Notas mecânicas não são assistidas

- **WHEN** o mestre edita o campo de notas mecânicas de um personagem
- **THEN** nenhuma ação de assistência de IA é oferecida nesse campo e a rota recusa um pedido para ele

#### Scenario: Campanha grande respeita o limite de contexto

- **WHEN** a campanha tem mais conteúdo do que cabe no limite de contexto da chamada
- **THEN** o contexto enviado traz os itens de maior prioridade e os trechos mais relevantes ao pedido, sem exceder o limite, e mantém o texto atual e a instrução

#### Scenario: Sessão antiga relevante ao pedido

- **WHEN** a campanha tem centenas de sessões e o pedido cita um personagem que só aparece numa sessão antiga
- **THEN** os trechos dessa sessão antiga fazem parte do contexto, mesmo sem estar entre as sessões recentes

#### Scenario: Contexto não depende do tamanho do histórico

- **WHEN** a campanha cresce com novas sessões
- **THEN** o tamanho do contexto enviado continua dentro do limite e o conteúdo recente e o catálogo de nomes continuam presentes

#### Scenario: Índice indisponível

- **WHEN** o índice da campanha está indisponível ou a consulta a ele falha
- **THEN** o contexto é montado pela leitura completa da campanha com o limite de tamanho, e a sugestão é gerada normalmente

#### Scenario: Conteúdo da campanha com instruções embutidas

- **WHEN** um texto da campanha contém instruções dirigidas à IA
- **THEN** o prompt trata esse texto como material de referência e a sugestão não obedece a essas instruções
