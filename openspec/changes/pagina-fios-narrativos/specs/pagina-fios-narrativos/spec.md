# Spec Delta

## Purpose

Dá aos fios narrativos da campanha uma página própria, com espaço e leitura confortável, em vez de uma lista espremida dentro da página de Sessões.

## ADDED Requirements

### Requirement: Página dedicada de fios narrativos

O sistema SHALL oferecer, em cada campanha, uma página «Fios» no endereço `/c/{id}/{slug}/fios`, que exibe a lista completa de fios narrativos da campanha com largura total. Cada fio SHALL ser um item expansível: recolhido, mostra o título e o estado (em aberto ou resolvido); expandido, mostra a descrição e as ações de editar, reordenar, resolver ou reabrir e remover. Os fios em aberto SHALL aparecer antes dos resolvidos, na ordem da lista. A página SHALL ter o formulário para adicionar um fio manual e uma mensagem de lista vazia. Uma falha ao carregar ou gravar SHALL mostrar um aviso na página, sem perder o que o mestre digitou. As regras e a API dos fios NÃO SHALL mudar.

#### Scenario: Lista em itens expansíveis

- **WHEN** o mestre dono, com o Modo GM ligado, abre a página «Fios» de uma campanha com fios em aberto e resolvidos
- **THEN** vê os fios em aberto antes dos resolvidos, cada um recolhido com título e estado, e ao expandir um fio vê a descrição e as ações

#### Scenario: Mesmas ações de hoje

- **WHEN** o mestre adiciona, edita, reordena, resolve, reabre ou remove um fio na página
- **THEN** o resultado é o mesmo que tinha na lista da página de Sessões, e a lista da página reflete a mudança

#### Scenario: Lista vazia

- **WHEN** a campanha não tem fios
- **THEN** a página mostra a mensagem de lista vazia e o formulário para adicionar um fio

#### Scenario: Falha ao carregar

- **WHEN** a consulta dos fios falha
- **THEN** a página mostra um aviso de erro e o restante da página continua utilizável

### Requirement: Acesso e navegação da página de fios

O item «Fios» SHALL aparecer na navegação da campanha (barra superior e barra inferior no celular) somente para o mestre dono com o Modo GM ligado. Quem abrir o endereço da página sem ser o mestre dono SHALL ver a indicação de que a página é só do mestre, sem nenhum dado de fios. O mestre dono com o Modo GM desligado SHALL ver a orientação de ligar o Modo GM e a página NÃO SHALL carregar a lista. Jogadores e visitantes NUNCA SHALL ver o item nem receber dados de fios.

#### Scenario: Item de navegação para o mestre dono

- **WHEN** o mestre dono liga o Modo GM numa campanha
- **THEN** o item «Fios» aparece na navegação e leva à página de fios

#### Scenario: Jogador ou visitante

- **WHEN** um jogador, um editor que não é o dono ou um visitante vê a campanha
- **THEN** o item «Fios» não aparece, e ao abrir o endereço da página vê a indicação de que é só do mestre, sem dados de fios

#### Scenario: Modo GM desligado

- **WHEN** o mestre dono, com o Modo GM desligado, abre o endereço da página de fios
- **THEN** vê a orientação de ligar o Modo GM e nenhum fio é carregado

#### Scenario: Endereço canônico e compatível

- **WHEN** a página é aberta por `/c/{id}/{slug}/fios` ou pela forma compatível só com o slug
- **THEN** a mesma página abre, e a navegação corrige para a forma canônica como nas demais páginas da campanha

### Requirement: Textos da página de fios em pt-BR e en

Todo texto novo da página de fios (item de navegação, título, introdução e avisos) SHALL existir em pt-BR e en, com o mesmo conjunto de chaves.

#### Scenario: Troca de idioma

- **WHEN** o mestre alterna o idioma da interface
- **THEN** o item de navegação e a página de fios aparecem no idioma escolhido
