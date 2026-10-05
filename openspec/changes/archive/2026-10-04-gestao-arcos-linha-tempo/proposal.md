# Proposal

## Why

Criar e editar arcos está escondido no menu de ferramentas do mapa. Quem está na Linha do Tempo, que é onde os arcos se vêem, tem de voltar ao mapa para os gerir. O mestre precisa dessa ação no próprio sítio da linha do tempo.

## What Changes

- "Gerenciar arcos" sai do menu de ferramentas do mapa.
- Na Linha do Tempo, com o modo de edição ligado, o mestre vê um controlo para abrir a lista de arcos, criar e editar. O jogador não vê esse controlo.
- A lista, o formulário e a escolha entre criação manual e por IA mudam de página; o que se pode fazer neles permanece (título, cor, resumo, ordem, visibilidade, sessões, transição e locais).
- O controlo fica no cabeçalho da Linha do Tempo, junto das outras ações do mestre, e vale nos três modos da página.

## Capabilities

### New Capabilities

(nenhuma.)

### Modified Capabilities

- `linha-tempo-por-arcos`: a gestão de arcos passa a ser alcançada na Linha do Tempo, visível para o mestre em modo de edição, e deixa de aparecer no menu do mapa.

## Impact

- **Frontend**: o item `arco.manage` e o painel `ArcoAdminList` deixam `MapPage.tsx`. A Linha do Tempo, que já carrega arcos, sessões e locais quando o modo de edição está ligado, passa a montar a mesma lista, o formulário e os diálogos de criação manual ou por IA.
- **Sem API nova e sem migração.**
- **Suposição**: "visível para o mestre" usa o mesmo portão do botão de novo evento nessa página — o modo de edição ligado. Com o modo de edição desligado, o mestre não vê a gestão, tal como não vê a criação de eventos. O jogador nunca a vê.
- **Coordenação**: a change aberta `conexoes-arcos-no-tempo` também altera o requisito "Gestão de arcos pelo mestre", mas só para a cor sugerida. Este delta parte da spec principal e acrescenta o lugar da ação. No arquivo, os dois textos têm de ficar os dois.
