## MODIFIED Requirements

### Requirement: Nenhuma caixa de nó se sobrepõe, em nenhum dos dois anéis
No espaçamento padrão e em qualquer espaçamento maior, nenhum par de nós do anel interno SHALL se sobrepor entre si; nenhum par de nós do anel externo SHALL se sobrepor entre si; e nenhum nó do anel externo SHALL se sobrepor a nenhum nó do anel interno — pra qualquer quantidade de PJ e NPC, incluindo elencos grandes (dezenas de Personagens). Quando a pessoa escolhe um espaçamento menor que o padrão, a sobreposição de caixas é permitida.

#### Scenario: Elenco grande não sobrepõe
- **WHEN** a campanha tem um elenco grande (dezenas de PJ e NPC) e o espaçamento está no padrão ou acima
- **THEN** nenhuma caixa de nó, em nenhum dos dois anéis, se sobrepõe a outra

#### Scenario: Espaçamento reduzido pela pessoa
- **WHEN** a pessoa move o slider para um valor abaixo do padrão
- **THEN** os anéis se aproximam e as caixas podem se sobrepor, sem erro

### Requirement: Seleção reorganiza o grafo por vínculo direto
Quando um Personagem visível é selecionado, o grafo SHALL colocá-lo no centro do layout e centralizá-lo na viewport. Personagens visíveis com vínculo direto com ele SHALL ocupar um anel interno; todos os demais Personagens visíveis SHALL ocupar um anel externo. A direção e o tipo PJ/NPC não alteram a condição de vizinho direto. Apenas vínculos disponíveis ao usuário e aceitos pelo filtro de tipo ativo SHALL contar para essa classificação. Cada Personagem SHALL aparecer uma única vez, mesmo que tenha vários vínculos com o selecionado. Os anéis SHALL ser determinísticos, acomodar grupos vazios e preservar a separação das caixas dos nós no espaçamento padrão ou maior.

#### Scenario: Seleção com vizinhos e demais Personagens
- **WHEN** a pessoa seleciona um Personagem que tem vínculos diretos com parte do elenco visível
- **THEN** o selecionado fica no centro da visão, seus vizinhos diretos formam o anel interno e os demais formam um anel externo sem sobreposição de caixas (no espaçamento padrão ou maior)

#### Scenario: Seleção sem vizinhos visíveis
- **WHEN** a pessoa seleciona um Personagem sem vínculos diretos disponíveis no filtro atual
- **THEN** ele permanece no centro e todos os outros Personagens visíveis formam apenas o anel externo

#### Scenario: Mudança de filtro ou de seleção
- **WHEN** a pessoa muda o filtro de tipo, seleciona outro Personagem ou remove a seleção
- **THEN** o layout é recalculado conforme os vínculos atualmente disponíveis; sem seleção, volta ao layout PJ/NPC e o enquadramento geral

#### Scenario: Arrasto e seleção
- **WHEN** a pessoa arrasta um nó sem selecioná-lo
- **THEN** a seleção e o foco da viewport não mudam por causa do arrasto

## ADDED Requirements

### Requirement: Controle de distância entre personagens
O grafo de Relações SHALL oferecer, como item à parte do painel de zoom, um controle deslizante "Perto — Longe" que ajusta a distância entre os personagens. O controle SHALL sempre iniciar centralizado, o que corresponde ao espaçamento padrão (atual do layout, fator 1×), e SHALL NOT ter rótulo para o padrão; apenas "Perto" na ponta esquerda e "Longe" na direita. Mover para a esquerda SHALL aproximar até 0,25× e para a direita SHALL afastar até 2×, em escala logarítmica por metade, aplicada ao raio dos anéis do layout PJ/NPC e do layout centrado na seleção. O tamanho das caixas dos nós SHALL permanecer o mesmo. Com o fator 1×, as posições SHALL ser idênticas às do layout sem o controle e o layout SHALL continuar determinístico para o mesmo fator. O controle SHALL ter rótulo acessível, texto de valor legível por leitores de tela e operação por teclado, e o duplo clique SHALL voltar ao padrão. O valor SHALL ser mantido só em memória durante a visita e SHALL voltar ao padrão ao abrir a página de novo.

#### Scenario: Padrão no meio do slider
- **WHEN** a pessoa abre o grafo
- **THEN** o slider está centralizado, o fator é 1× e as posições são as do layout atual

#### Scenario: Afastar e aproximar
- **WHEN** a pessoa move o slider para a direita (ou esquerda)
- **THEN** os anéis aumentam (ou diminuem) de raio na proporção da escala, ao vivo, sem alterar o zoom e o pan da pessoa durante o arrasto; ao soltar o slider, o grafo é reenquadrado

#### Scenario: Valor com seleção ativa
- **WHEN** há um personagem selecionado e a pessoa muda o slider
- **THEN** o layout centrado na seleção usa o novo fator e, ao soltar o slider, a viewport é centrada de novo no selecionado

#### Scenario: Voltar ao padrão
- **WHEN** a pessoa dá duplo clique no slider
- **THEN** o fator volta a 1× e o slider ao meio

#### Scenario: Deslocamentos de arraste
- **WHEN** a pessoa tinha arrastado nós e muda o slider
- **THEN** os deslocamentos de arraste da visita são descartados e os nós voltam às posições do layout

#### Scenario: Teclado
- **WHEN** o slider tem foco e a pessoa usa as setas, Home ou End
- **THEN** o valor muda em passos pequenos, e o texto de valor anuncia o fator no formato do idioma (por exemplo "0,25×" em pt-BR e "0.25×" em en)
