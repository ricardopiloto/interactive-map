# motor-ia-assistente Specification

## Purpose

Permite que o mestre dono de uma campanha com IA habilitada peça ajuda para escrever campos de texto livre (preparo de sessão, fios narrativos, resumo, descrição de personagem, descrição de local), recebendo sugestões coerentes com o conteúdo real da campanha e sempre sujeitas à revisão do mestre antes de qualquer gravação.

## Requirements

### Requirement: Assistência de IA em campos de texto livre do mestre

Numa campanha com o módulo de IA ativo, o mestre dono SHALL poder acionar, por ação explícita, uma assistência de IA nos seguintes campos: rascunho da sessão (que preenche as Notas de Preparo), resumo da sessão (campo dedicado), descrição de personagem (em todos os editores de personagem, inclusive o do mapa) e descrição de local. O assistente NUNCA SHALL preencher notas mecânicas: esse campo é do mestre. O sistema SHALL devolver um texto sugerido para o campo. O sistema NUNCA SHALL acionar a IA automaticamente, nem gravar a sugestão sem ação do mestre.

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

- **WHEN** a sugestão é para fios narrativos, que só o mestre vê
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

- **WHEN** o pedido é para fios narrativos e indica campo público
- **THEN** o prompt trata o campo como só do mestre

### Requirement: Rascunho e fios apenas em sessão não visível

O sistema SHALL oferecer a assistência de rascunho da sessão e a de fios narrativos somente enquanto a sessão não estiver visível para jogadores. Com a sessão visível, essas duas ações NÃO SHALL estar disponíveis.

#### Scenario: Sessão ainda oculta

- **WHEN** o mestre dono edita uma sessão marcada como não visível para jogadores, com o módulo de IA ativo
- **THEN** as ações de rascunho e de fios narrativos estão disponíveis

#### Scenario: Sessão visível

- **WHEN** o mestre dono edita ou marca como visível uma sessão
- **THEN** as ações de rascunho e de fios narrativos não estão disponíveis

### Requirement: Rascunho da sessão usa as Notas de Preparo como destino e como fonte

O rascunho da sessão SHALL ser gerado com esta prioridade de fontes: a instrução do mestre, depois o texto já escrito nas Notas de Preparo, depois os resumos das sessões anteriores. O rascunho NUNCA SHALL ser escrito no Resumo. Quando as Notas de Preparo estiverem vazias, o sistema SHALL colocar o resultado diretamente no rascunho do formulário, sem gravar; quando já tiverem texto, o sistema SHALL apresentar o painel de revisão. Todo painel de revisão SHALL oferecer a ação de copiar a sugestão inteira.

#### Scenario: Notas de Preparo vazias

- **WHEN** o mestre pede o rascunho e as Notas de Preparo estão vazias
- **THEN** o resultado preenche as Notas de Preparo no rascunho do formulário e nada é gravado até o mestre salvar

#### Scenario: Notas de Preparo preenchidas

- **WHEN** o mestre pede o rascunho e as Notas de Preparo já têm texto
- **THEN** o resultado aparece no painel de revisão, com as ações de inserir, substituir, descartar e copiar

#### Scenario: Copiar a sugestão

- **WHEN** o mestre aciona Copiar no painel de revisão
- **THEN** a sugestão inteira vai para a área de transferência, sem alterar o formulário

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

### Requirement: Rascunho da sessão propõe combates como blocos de combate

O prompt do rascunho da sessão SHALL instruir a IA a propor combates planejados no formato do bloco de combate das Notas de Preparo (`> [!combate] Título` seguido de lista com Inimigos, Ambiente, Tática ou gatilho e Desfecho), nascendo do contexto (fios, arcos, personagens, locais), só onde uma cena pedir conflito e em número reduzido. O prompt SHALL proibir estatísticas e termos mecânicos nos combates, usando o marcador de mecânica a definir onde a mecânica seria necessária, e SHALL declarar que a instrução do mestre prevalece, inclusive para pedir mais combates ou nenhum. A sintaxe do bloco de combate SHALL ser explicitamente permitida pelas regras de saída do prompt. Como o resto do rascunho, a proposta SHALL passar pela revisão antes de entrar nas Notas de Preparo. A obediência do modelo a essas instruções não é garantida pelo sistema; formato fora do padrão é exibido como texto comum.

#### Scenario: Prompt do rascunho instrui combates

- **WHEN** o prompt do rascunho da sessão é montado
- **THEN** ele contém o formato do bloco de combate, a regra de propor só onde houver conflito, a proibição de estatísticas com o marcador de mecânica a definir e a precedência da instrução do mestre

#### Scenario: Instrução do mestre prevalece

- **WHEN** o mestre pede o rascunho com a instrução de não ter combates
- **THEN** o prompt enviado contém essa instrução e a declaração de que ela prevalece sobre a proposta de combates

#### Scenario: Sintaxe do bloco permitida

- **WHEN** o prompt é montado
- **THEN** as regras de saída que proíbem links wiki, frontmatter e prompts de imagem excetuam expressamente a sintaxe `> [!combate]`

### Requirement: Resumo e contexto não tratam combate planejado como ocorrido

O prompt do Resumo SHALL instruir a IA a não copiar blocos de combate das Notas de Preparo como fatos ocorridos. O contexto enviado à IA SHALL omitir os blocos de combate presentes nas notas de preparo de sessões diferentes da sessão alvo (tanto no texto da sessão que usa as notas na ausência de resumo quanto nas notas de sessões anteriores), de modo que um combate planejado numa sessão não jogada não seja lido como acontecimento.

#### Scenario: Prompt do Resumo

- **WHEN** o prompt do Resumo é montado
- **THEN** ele contém a instrução de não copiar blocos de combate como fatos ocorridos

#### Scenario: Notas anteriores com combate planejado

- **WHEN** uma sessão anterior tem notas de preparo com um bloco de combate e o mestre pede o rascunho de outra sessão
- **THEN** o contexto enviado inclui o restante das notas dessa sessão anterior, mas não o bloco de combate

#### Scenario: Notas da sessão alvo preservadas

- **WHEN** o mestre pede o Resumo ou o rascunho de uma sessão cujas próprias notas têm blocos de combate
- **THEN** as notas da sessão alvo são enviadas inteiras, e a instrução do prompt orienta a IA sobre como tratá-las

### Requirement: Resumo não lista fios abertos

O Resumo gerado pela IA SHALL contar o que aconteceu na sessão e o estado do grupo, e o prompt do Resumo NÃO SHALL instruir a IA a listar fios abertos nem pendências. Os fios narrativos permanecem no bloco de Fios Narrativos da sessão e na lista de fios, e não fazem parte do contexto do Resumo.

#### Scenario: Prompt do Resumo sem fios abertos

- **WHEN** o prompt do Resumo é montado
- **THEN** ele não contém a instrução de terminar com fios abertos e mantém a instrução de usar só fatos do contexto

#### Scenario: Resumo não inventa fios

- **WHEN** o mestre pede o Resumo de uma sessão
- **THEN** o contexto enviado não inclui fios narrativos e o prompt não pede a lista de fios abertos
