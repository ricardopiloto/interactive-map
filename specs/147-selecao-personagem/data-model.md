# Data Model: Seleção de personagem no Mapa e em Relações

## Persistência

Esta funcionalidade não adiciona nem altera entidades persistidas, campos ou relações. Personagens e vínculos continuam usando os modelos existentes da campanha.

## Estado transitório da interface

### Personagem

Representa um personagem já carregado para a campanha em tela. A seleção usa seu identificador e consulta os dados carregados para preencher ficha/painel e nó do grafo.

### Seleção no Mapa

- **Estado**: nenhuma seleção, Local selecionado ou personagem selecionado.
- **Identidade do personagem**: tipo de seleção + identificador do personagem.
- **Resultado derivado**: a ficha do personagem correspondente é exibida no painel.
- **Transições**: selecionar personagem abre sua ficha; selecionar outro atualiza a ficha; voltar à lista limpa a seleção.
- **Validação**: o personagem deve pertencer à coleção carregada para a campanha atual. Quando removido da coleção disponível, a seleção deve ser limpa.

### Seleção em Relações

- **Estado**: identificador do personagem selecionado ou ausência de seleção.
- **Consumidores do estado**: destaque/seleção do nó, painel de detalhe e composição de vínculos relacionados.
- **Transições**: seleção pela lista ou pelo nó atualiza o identificador compartilhado; selecionar outro troca os três resultados; desmarcar ou tornar o personagem indisponível limpa o foco conforme o comportamento atual.
- **Invariante**: nó selecionado e conteúdo do painel correspondem ao mesmo personagem.

## Isolamento e ciclo de vida

O estado vive somente na tela e usa coleções obtidas para a campanha aberta. Não há estado global de seleção, armazenamento local nem chamada nova de rede.
