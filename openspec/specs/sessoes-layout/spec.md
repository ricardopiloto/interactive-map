# sessoes-layout Specification

## Purpose
Garante que, em telas grandes, a lista de sessões e a descrição da sessão selecionada tenham rolagem independente, pra que a descrição permaneça sempre alcançável sem depender do tamanho da lista.

## Requirements

### Requirement: Scroll independente entre lista e descrição em telas grandes
Em telas grandes (onde a lista de sessões e a descrição aparecem lado a lado), a lista de sessões SHALL ter rolagem vertical própria, independente da rolagem da descrição da sessão selecionada, e vice-versa. Rolar uma das duas colunas SHALL NOT alterar a posição de rolagem da outra.

#### Scenario: Lista longa não afeta a leitura da descrição
- **WHEN** a campanha tem sessões suficientes pra a lista ultrapassar a altura da tela, numa tela grande
- **THEN** rolar a lista pra encontrar uma sessão não move nem esconde a descrição da sessão atualmente selecionada

#### Scenario: Descrição longa não afeta a navegação da lista
- **WHEN** a sessão selecionada tem uma descrição longa o bastante pra ultrapassar a altura da tela, numa tela grande
- **THEN** rolar a descrição pra terminar de ler não move a posição de rolagem da lista de sessões

### Requirement: Layout mobile permanece inalterado
Em telas pequenas, o comportamento de rolagem já existente (página inteira, lista em formato horizontal no topo) SHALL permanecer exatamente como era antes desta mudança.

#### Scenario: Mobile continua com um único scroll
- **WHEN** a tela de Sessões é aberta num dispositivo de tela pequena
- **THEN** a lista de sessões aparece em formato horizontal no topo e a rolagem da página continua sendo uma só, sem nenhuma mudança de comportamento
