# Spec Delta

## Purpose

Permite que o mestre dono de uma campanha com IA habilitada peça ajuda para escrever campos de texto livre (preparo de sessão, fios narrativos, resumo, descrição de personagem, descrição de local), recebendo sugestões coerentes com o conteúdo real da campanha e sempre sujeitas à revisão do mestre antes de qualquer gravação.

## ADDED Requirements

### Requirement: Assistência de IA em campos de texto livre do mestre

Numa campanha com o módulo de IA ativo, o mestre dono SHALL poder acionar, por ação explícita, uma assistência de IA nos seguintes campos: notas de preparo da sessão, resumo da sessão, descrição de personagem (em todos os editores de personagem, inclusive o do mapa) e descrição de local. O assistente NUNCA SHALL preencher notas mecânicas: esse campo é do mestre. O sistema SHALL devolver um texto sugerido para o campo. O sistema NUNCA SHALL acionar a IA automaticamente, nem gravar a sugestão sem ação do mestre.

#### Scenario: Sugestão para um campo com a IA habilitada

- **WHEN** o mestre dono aciona a assistência num dos campos cobertos, numa campanha com o módulo de IA ativo
- **THEN** o sistema apresenta um texto sugerido para aquele campo sem alterar o conteúdo salvo

#### Scenario: Personagem criado pelo mapa

- **WHEN** o mestre dono cria ou edita um personagem pelo editor do mapa numa campanha com o módulo de IA ativo
- **THEN** a assistência de descrição está disponível nesse editor, assim como no editor da lista de relações

#### Scenario: Módulo de IA desligado

- **WHEN** o mestre abre um formulário com campo coberto numa campanha sem o módulo de IA ativo
- **THEN** nenhuma ação de assistência de IA está disponível em nenhum dos campos e o formulário permanece apenas manual

#### Scenario: Jogador não vê nem aciona a assistência

- **WHEN** um jogador, que não é mestre dono, tenta acionar a assistência
- **THEN** o sistema nega o pedido com resposta de acesso negado, sem chamar o provedor

#### Scenario: Módulo desligado no servidor

- **WHEN** um pedido de assistência chega para uma campanha sem o módulo de IA ativo
- **THEN** o sistema responde com recusa explícita (não como falha do provedor) e não chama o provedor

#### Scenario: Alvo obrigatório ausente ou inexistente

- **WHEN** o pedido é de um tipo que exige um registro-alvo e não informa o alvo, ou informa um alvo que não existe na campanha
- **THEN** o sistema recusa o pedido (alvo ausente como erro de validação; alvo inexistente como não encontrado) sem chamar o provedor e sem revelar dados de outras campanhas

### Requirement: Fios narrativos a partir da história da campanha

O mestre dono SHALL poder pedir fios narrativos (ganchos e linhas em aberto) para a próxima sessão, a partir do editor de sessão, inclusive de uma sessão nova ainda não salva. O sistema SHALL basear a sugestão no que já existe na campanha — sessões anteriores, arcos, eventos, personagens, locais e facções — e SHALL entregar o resultado como texto a ser inserido nas notas de preparo, sob revisão do mestre. Fios narrativos é uma ação cujo destino é o campo de notas de preparo, não um campo próprio.

#### Scenario: Fios narrativos coerentes com a campanha

- **WHEN** o mestre pede fios narrativos numa campanha que já tem sessões, arcos e personagens registrados
- **THEN** a sugestão considera esse histórico e pode referenciar personagens, locais e arcos existentes

#### Scenario: Sessão nova ainda não salva

- **WHEN** o mestre pede fios narrativos no editor de uma sessão que ainda não foi salva
- **THEN** o sistema atende o pedido com o contexto da campanha, sem exigir identificador da sessão

#### Scenario: Campanha quase vazia

- **WHEN** o mestre pede fios narrativos numa campanha com menos registros que o limiar mínimo definido para o tipo
- **THEN** o sistema informa que há pouco contexto e ainda pode devolver uma sugestão genérica claramente identificada como tal, ou orienta o mestre a registrar mais conteúdo antes

### Requirement: Contexto real da campanha em toda chamada

Toda chamada de assistência SHALL enviar ao provedor, além do texto atual do campo e do pedido do mestre, o contexto da campanha relevante para aquele tipo de campo. O sistema NUNCA SHALL chamar o provedor apenas com o texto digitado no campo. O prompt SHALL ser genérico, sem depender do sistema de RPG da campanha, e SHALL instruí-lo a responder no idioma do texto atual e do conteúdo da campanha (pt-BR na dúvida). O texto atual e a instrução do mestre SHALL ser enviados como dados do contexto, nunca como instrução do sistema. O contexto de cada chamada SHALL respeitar um limite de tamanho, cortando de forma determinística (mais recente primeiro) e incluindo o texto atual e a instrução no cômputo.

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
- **THEN** o sistema corta registros do mais antigo para o mais recente até caber, mantendo o texto atual e a instrução, e o conteúdo enviado não excede o limite

#### Scenario: Conteúdo da campanha com instruções embutidas

- **WHEN** um texto da campanha contém instruções dirigidas à IA
- **THEN** o prompt trata esse texto como material de referência e a sugestão não obedece a essas instruções

### Requirement: Conteúdo oculto enviado somente ao mestre dono, da própria campanha

Na assistência de escrita, o sistema SHALL incluir no contexto o conteúdo oculto (`visivel_para_todos=false`) da própria campanha apenas quando o pedido vem do mestre dono dessa campanha. O sistema NUNCA SHALL incluir conteúdo oculto em pedido de outra pessoa, nem conteúdo de outra campanha. O sistema SHALL informar na resposta se algum conteúdo oculto foi de fato enviado ao provedor, considerando apenas os registros que sobraram após o limite de contexto.

#### Scenario: Segredo da campanha informa a sugestão

- **WHEN** o mestre dono pede ganchos numa campanha com um personagem oculto
- **THEN** o contexto enviado ao provedor inclui esse personagem e a sugestão pode ser coerente com ele

#### Scenario: Isolamento entre campanhas

- **WHEN** o mestre dono é dono de duas campanhas e aciona a assistência numa delas
- **THEN** nenhum dado da outra campanha é enviado ao provedor

#### Scenario: Oculto cortado pelo limite de contexto

- **WHEN** o único registro oculto da campanha é cortado pelo limite de contexto
- **THEN** a resposta indica que nenhum conteúdo oculto foi enviado

### Requirement: Aviso quando a sugestão pode revelar conteúdo oculto

Quando a sugestão foi gerada com conteúdo oculto e o campo de destino é visível para jogadores, o sistema SHALL avisar o mestre, antes de aplicar a sugestão, que ela pode conter informação oculta e deve ser revisada. A visibilidade do campo SHALL seguir o estado atual do rascunho do formulário. Campos que só o mestre vê SHALL NOT exibir esse aviso.

#### Scenario: Campo visível a jogadores

- **WHEN** a sugestão para a descrição de um personagem ou de um local visível a jogadores foi gerada com conteúdo oculto
- **THEN** o sistema exibe o aviso de revisão antes de o mestre inserir ou substituir o texto

#### Scenario: Campo exclusivo do mestre

- **WHEN** a sugestão é para notas de preparo ou fios narrativos, que só o mestre vê
- **THEN** o sistema não exibe o aviso de conteúdo oculto

#### Scenario: Registro oculto

- **WHEN** a sugestão é para a descrição de um personagem ou local cujo rascunho está marcado como oculto
- **THEN** o sistema não exibe o aviso, e se o mestre marcar o registro como visível antes de aplicar, o aviso passa a aparecer

### Requirement: Indicação de campo público orienta o prompt

O pedido SHALL aceitar a indicação de que o campo de destino é lido por jogadores (padrão: sim). O sistema SHALL combinar essa indicação com a visibilidade real do campo, valendo a mais restritiva, e SHALL tratar como só do mestre os campos que jogadores nunca leem. A indicação orienta o modelo a não revelar segredos, mas NÃO SHALL ser tratada como garantia: o aviso e a revisão do mestre continuam obrigatórios.

#### Scenario: Cliente indica campo não público mas o registro salvo é visível

- **WHEN** o pedido para a descrição de um personagem salvo como visível indica que o campo não é público
- **THEN** o prompt trata o campo como público

#### Scenario: Indicação ausente

- **WHEN** o pedido não informa se o campo é público
- **THEN** o sistema assume que o campo é público

#### Scenario: Campo exclusivo do mestre

- **WHEN** o pedido é para notas de preparo ou fios narrativos e indica campo público
- **THEN** o prompt trata o campo como só do mestre

### Requirement: Revisão obrigatória antes de aplicar

O sistema SHALL apresentar a sugestão num painel de revisão separado do campo, em texto puro, e SHALL permitir ao mestre inserir ao final do texto existente, substituir o texto existente ou descartar. O texto existente do campo SHALL permanecer intacto até o mestre escolher uma ação. Nenhuma sugestão SHALL ser persistida sem o mestre salvar o formulário pelo fluxo habitual. Uma resposta que chegue depois de o mestre trocar de registro SHALL ser descartada.

#### Scenario: Inserir sem perder o texto

- **WHEN** o mestre escolhe inserir a sugestão num campo que já tem texto
- **THEN** a sugestão é acrescentada ao texto existente no rascunho e nada é gravado até o mestre salvar

#### Scenario: Descartar

- **WHEN** o mestre descarta a sugestão
- **THEN** o campo e o rascunho permanecem exatamente como estavam

#### Scenario: Resposta tardia de outro registro

- **WHEN** o mestre troca para outro registro enquanto um pedido está em andamento e a resposta chega depois
- **THEN** a resposta é descartada e não aparece no painel do novo registro

### Requirement: Falhas explícitas sem perda de rascunho

Quando o provedor falhar, expirar, a credencial estiver ausente ou a resposta vier vazia ou inutilizável, o sistema SHALL informar o mestre com uma mensagem clara e SHALL manter o rascunho do formulário inalterado. O sistema SHALL tratar o limite de pedidos por minuto como um estado explícito e informar o mestre para tentar novamente. O sistema SHALL impedir pedidos duplicados enquanto um pedido está em andamento no mesmo campo.

#### Scenario: Timeout do provedor

- **WHEN** o provedor não responde dentro do tempo limite
- **THEN** o mestre vê uma mensagem de falha e o conteúdo do campo continua como estava

#### Scenario: Limite de pedidos excedido

- **WHEN** o mestre excede o limite de pedidos de IA por minuto
- **THEN** o sistema informa que o limite foi atingido e que é possível tentar novamente em seguida, sem chamar o provedor

### Requirement: Sugestão limitada ao tamanho do campo

O texto sugerido SHALL respeitar o tamanho máximo do campo de destino. Quando a resposta do provedor exceder esse limite, o sistema SHALL truncá-la em limite de parágrafo e sinalizar que houve truncamento. Ao inserir ao final, o sistema SHALL considerar o espaço restante do campo (limite menos o texto já existente) e SHALL NOT permitir que o mestre aplique um texto que o salvamento rejeitaria sem aviso.

#### Scenario: Resposta maior que o campo

- **WHEN** o provedor devolve um texto maior que o limite do campo de destino
- **THEN** o sistema entrega a sugestão truncada, marcada como truncada, e o mestre é informado

#### Scenario: Inserir ao final em campo quase cheio

- **WHEN** o mestre escolhe inserir ao final uma sugestão que somada ao texto existente excede o limite do campo
- **THEN** o sistema bloqueia a inserção ou avisa o mestre antes de aplicar

### Requirement: Registro de uso sem conteúdo

O sistema SHALL registrar em log, para cada pedido de assistência, apenas dados de contagem e resultado (campanha, tipo, tamanho do contexto, indicador de conteúdo oculto, código de resultado). O sistema NUNCA SHALL registrar o conteúdo da campanha, do campo ou da sugestão.

#### Scenario: Log sem conteúdo

- **WHEN** um pedido de assistência é concluído
- **THEN** o log contém apenas contagens e o código de resultado, sem texto da campanha nem da sugestão

### Requirement: Ajuda de IA em pt-BR e en

Todo texto novo da interface de assistência (botões, estados de carregamento, avisos, erros, painel de revisão, rótulo e ajuda do toggle) SHALL existir em pt-BR e en, com o mesmo conjunto de chaves nos dois idiomas. A ajuda do toggle SHALL informar que o assistente pode enviar conteúdo oculto da campanha ao provedor de IA. A sugestão SHALL ser gerada no idioma do conteúdo da campanha.

#### Scenario: Troca de idioma da interface

- **WHEN** o mestre alterna o idioma da interface
- **THEN** os rótulos e mensagens da assistência de IA aparecem no idioma escolhido

#### Scenario: Toggle informa o envio de oculto

- **WHEN** o mestre vê o toggle de IA no Painel
- **THEN** o rótulo é "Assistente de IA" e a ajuda informa que conteúdo oculto da campanha pode ser enviado ao provedor
