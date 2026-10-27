# Spec Delta

## Purpose

Permite que quem edita um campo de texto rico aplique formatação por botões, sem precisar saber de cabeça a sintaxe markdown, inclusive para inserir o bloco de combate nas Notas de Preparo.

## ADDED Requirements

### Requirement: Barra de formatação nos campos de texto rico

Os campos de edição cujo conteúdo é exibido como texto rico SHALL ter uma barra de formatação acima do campo, com as ações negrito, itálico, título, lista com marcadores, lista numerada, citação e link. Os campos são: Notas de Preparo e Resumo da sessão; descrições de local, de personagem (no mapa e em Relações), de evento e de item; e notas mecânicas do personagem. Os campos cujo conteúdo não é exibido como texto rico (fios narrativos, notas de vínculo e resumo de arco) NÃO SHALL ter a barra. O valor salvo SHALL continuar sendo o markdown em texto simples, sem formato novo.

#### Scenario: Barra visível no campo de texto rico

- **WHEN** o usuário abre o editor de uma sessão
- **THEN** os campos Notas de Preparo e Resumo mostram a barra de formatação acima do campo

#### Scenario: Campo sem texto rico

- **WHEN** o usuário edita um fio narrativo, a nota de um vínculo ou o resumo de um arco
- **THEN** o campo não mostra a barra de formatação

### Requirement: Ações de formatação sobre a seleção

Cada ação da barra SHALL aplicar a sintaxe markdown ao texto selecionado e manter o foco no campo. Negrito, itálico e link SHALL envolver a seleção (`**…**`, `*…*`, `[…](…)`); sem seleção, SHALL inserir um texto de exemplo já selecionado para ser substituído. Título, lista com marcadores, lista numerada e citação SHALL ser aplicados no início de cada linha selecionada (ou da linha do cursor). Aplicar de novo uma ação já presente na seleção ou nas linhas SHALL remover a formatação. Depois da ação, o texto selecionado SHALL ser aquele que o usuário provavelmente editará em seguida (o exemplo inserido ou o endereço do link).

#### Scenario: Negrito na seleção

- **WHEN** o usuário seleciona "ponte" e aciona Negrito
- **THEN** o texto passa a ter `**ponte**`, o foco permanece no campo e a seleção continua cobrindo "ponte"

#### Scenario: Negrito sem seleção

- **WHEN** o cursor está sem seleção e o usuário aciona Negrito
- **THEN** o campo recebe um texto de exemplo em negrito, já selecionado para ser substituído

#### Scenario: Alternar a formatação

- **WHEN** a seleção já está em negrito e o usuário aciona Negrito de novo
- **THEN** os marcadores de negrito são removidos

#### Scenario: Lista em várias linhas

- **WHEN** o usuário seleciona três linhas e aciona Lista com marcadores
- **THEN** cada uma das três linhas passa a começar com `- `, e acionar a ação outra vez remove os marcadores das três

#### Scenario: Link

- **WHEN** o usuário seleciona um texto e aciona Link
- **THEN** o texto vira `[texto](https://)` com o endereço selecionado para ser digitado

### Requirement: Cada ação aplica a alteração uma única vez

Cada ação da barra SHALL produzir exatamente uma alteração no valor do campo, notificada uma única vez ao formulário, e SHALL poder ser desfeita pelo desfazer do navegador (Ctrl+Z) ou, quando o navegador não oferecer essa integração, mantendo o resultado correto do texto.

#### Scenario: Uma alteração por ação

- **WHEN** o usuário aciona qualquer botão da barra
- **THEN** o valor do campo muda uma única vez, sem texto duplicado, e o formulário é notificado uma única vez

### Requirement: Botão de bloco de combate nas Notas de Preparo

A barra das Notas de Preparo da sessão SHALL ter o botão Bloco de combate, que SHALL inserir o modelo do bloco definido em `bloco-combate-preparo` (linha `> [!combate] Título do combate` e a lista Inimigos, Ambiente, Tática ou gatilho e Desfecho), em linhas próprias, separado do texto vizinho por uma linha em branco, com o título de exemplo selecionado. Nos demais campos, o botão NÃO SHALL aparecer, pois o bloco só é reconhecido na leitura das Notas de Preparo. Com texto selecionado, o botão SHALL usar a primeira linha da seleção como título.

#### Scenario: Inserir o modelo

- **WHEN** o usuário aciona Bloco de combate no meio das Notas de Preparo
- **THEN** o modelo completo é inserido em linhas próprias, com linha em branco antes e depois, e o título de exemplo fica selecionado

#### Scenario: Título a partir da seleção

- **WHEN** o usuário seleciona "Emboscada na ponte" e aciona Bloco de combate
- **THEN** o bloco é inserido com esse texto como título

#### Scenario: Reconhecido na leitura

- **WHEN** o usuário insere o modelo pelo botão e salva
- **THEN** a leitura das Notas de Preparo exibe o modelo como bloco de combate, no idioma de interface em que foi inserido

#### Scenario: Botão fora das Notas de Preparo

- **WHEN** o usuário edita o Resumo ou a descrição de um local
- **THEN** a barra não mostra o botão de Bloco de combate

### Requirement: Teclado e acessibilidade da barra

A barra SHALL ter papel de barra de ferramentas com nome acessível; cada botão SHALL ser um botão que não envia o formulário, com nome acessível e dica visível (o nome, e o atalho quando houver), operável por teclado e com foco visível. Negrito e itálico SHALL ter os atalhos Ctrl+B / Cmd+B e Ctrl+I / Cmd+I quando o foco está no campo. Com o campo desabilitado, os botões SHALL estar desabilitados. Em telas estreitas (320 px), a barra SHALL quebrar em linhas ou rolar sem causar rolagem horizontal da página, mantendo alvos de toque confortáveis.

#### Scenario: Operação por teclado

- **WHEN** o usuário navega até um botão da barra com Tab e aciona com Enter ou Espaço
- **THEN** a ação é aplicada à seleção do campo e o formulário não é enviado

#### Scenario: Atalho de negrito

- **WHEN** o foco está no campo e o usuário pressiona Ctrl+B (Cmd+B no macOS)
- **THEN** a seleção é alternada para negrito

#### Scenario: Campo desabilitado

- **WHEN** o campo está desabilitado
- **THEN** os botões da barra estão desabilitados

#### Scenario: Tela estreita

- **WHEN** o editor é aberto em 320 px
- **THEN** a barra cabe sem rolagem horizontal da página

### Requirement: Rótulo e foco do campo preservados

O campo com barra SHALL continuar associado ao seu rótulo: o `textarea` mantém o nome acessível do rótulo atual, e acionar o rótulo SHALL focar o campo (nunca um botão da barra). Acionar um botão da barra, com mouse ou toque, NÃO SHALL tirar o foco nem a seleção do campo.

#### Scenario: Nome acessível do campo

- **WHEN** um leitor de tela ou um teste procura o campo "Notas de Preparo" pelo rótulo
- **THEN** o resultado é o `textarea`, e não um botão da barra

#### Scenario: Clique no rótulo

- **WHEN** o usuário aciona o rótulo do campo
- **THEN** o foco vai para o `textarea`

#### Scenario: Seleção mantida ao acionar um botão

- **WHEN** o usuário seleciona um trecho e aciona um botão da barra com o mouse ou o toque
- **THEN** o campo continua com o foco e a ação é aplicada à seleção

### Requirement: Textos da barra em pt-BR e en

Os nomes, dicas e textos de exemplo da barra SHALL existir em pt-BR e en, com o mesmo conjunto de chaves. O modelo do bloco de combate SHALL ser inserido no idioma da interface (título de exemplo e rótulos dos campos Inimigos, Ambiente, Tática ou gatilho e Desfecho), e a leitura SHALL reconhecer o bloco independentemente do idioma dos rótulos.

#### Scenario: Troca de idioma

- **WHEN** o usuário alterna o idioma da interface
- **THEN** os botões, dicas e o texto de exemplo da barra aparecem no idioma escolhido
