# bloco-combate-preparo Specification

## Purpose

Permite ao mestre registrar um combate planejado dentro das Notas de Preparo como um bloco visualmente distinto, no estilo dos callouts do Obsidian, para localizá-lo rapidamente na hora da sessão.

## Requirements

### Requirement: Bloco de combate no texto das Notas de Preparo

O sistema SHALL reconhecer, na leitura das Notas de Preparo, um callout markdown cuja primeira linha é `> [!combate] Título` (o título é opcional, e o marcador não diferencia maiúsculas de minúsculas) e cujas linhas seguintes pertencem ao mesmo bloco de citação. O formato canônico SHALL ter, depois da linha do marcador, uma lista com os campos Inimigos, Ambiente, Tática ou gatilho e Desfecho, sem estatísticas de regra, de modo que cada campo apareça em sua própria linha com o markdown padrão. Um bloco de combate SHALL ser apenas texto dentro de `notas_preparo`, sem campo, tabela ou rota nova. O marcador SHALL ser reconhecido somente no início do primeiro parágrafo da citação; citações comuns, callouts de outros tipos e o texto `[!combate]` fora da primeira linha SHALL continuar sendo exibidos como citação comum. O reconhecimento SHALL estar ligado apenas na leitura das Notas de Preparo da sessão; nos demais campos de texto rico (itens, personagens, locais, eventos, Resumo), o texto SHALL ser exibido como hoje.

#### Scenario: Bloco bem formado

- **WHEN** as Notas de Preparo contêm `> [!combate] Emboscada na ponte` seguido de uma lista de campos em linhas de citação
- **THEN** a leitura da sessão exibe um bloco de combate com o título "Emboscada na ponte" e cada campo em sua própria linha

#### Scenario: Bloco sem título

- **WHEN** o callout é `> [!combate]` sem título
- **THEN** o bloco é exibido com o rótulo padrão "Combate"

#### Scenario: Outras citações inalteradas

- **WHEN** o texto contém uma citação comum, um callout de outro tipo como `> [!nota]`, ou `[!combate]` que não está na primeira linha da citação
- **THEN** ela é exibida como citação comum, sem a aparência de combate

#### Scenario: Fora das Notas de Preparo

- **WHEN** a descrição de um local, item, personagem ou evento, ou o Resumo, contém `> [!combate]`
- **THEN** o texto é exibido como citação comum, sem a aparência de combate

### Requirement: Bloco de combate visualmente distinto

O bloco de combate SHALL ter cor própria, diferente do restante da preparação e dos blocos privados da leitura da sessão, legível nos temas claro e escuro, e SHALL trazer cabeçalho com ícone e o texto "Combate" (ou o título informado), de modo que a distinção não dependa só de cor. O conteúdo SHALL quebrar palavras longas e não SHALL causar rolagem horizontal até 320 px.

#### Scenario: Reconhecível sem depender de cor

- **WHEN** o bloco de combate é exibido
- **THEN** o cabeçalho mostra um ícone e o texto de combate, além da cor

#### Scenario: Temas claro e escuro

- **WHEN** o mestre alterna entre os temas
- **THEN** o bloco de combate mantém contraste legível e a cor própria em ambos

#### Scenario: Tela estreita

- **WHEN** a leitura é aberta em 320 px com um bloco de combate de texto longo
- **THEN** não há rolagem horizontal

### Requirement: Combate nunca exposto a jogadores

Por viver em `notas_preparo`, o bloco de combate SHALL seguir as regras das Notas de Preparo: NUNCA SHALL ser incluído em respostas servidas a jogadores. O sistema NÃO SHALL copiar blocos de combate das Notas de Preparo para o Resumo por conta própria.

#### Scenario: Leitura pública da sessão

- **WHEN** um jogador lê uma sessão cujas notas têm blocos de combate
- **THEN** nenhum bloco de combate nem seu texto aparece na resposta ou na tela

### Requirement: Textos de combate em pt-BR e en

Os textos fixos do bloco (rótulo padrão "Combate" e eventuais nomes acessíveis) SHALL existir em pt-BR e en, com o mesmo conjunto de chaves.

#### Scenario: Troca de idioma

- **WHEN** o mestre alterna o idioma da interface
- **THEN** o rótulo padrão do bloco aparece no idioma escolhido
