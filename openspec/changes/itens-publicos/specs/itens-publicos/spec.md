# Spec Delta

## Purpose

Permite que qualquer visitante de uma campanha (jogador ou mestre) consulte os Itens cadastrados pelo mestre, respeitando exatamente as mesmas regras de visibilidade já aplicadas a Locais, Personagens, Arcos, Sessões e Eventos.

## ADDED Requirements

### Requirement: Listagem pública de Itens visíveis
O sistema SHALL oferecer uma tela que lista todos os Itens com `visivel_para_todos=true` da campanha, consumindo `GET /api/c/{slug}/itens`, com busca por nome. Itens com `visivel_para_todos=false` SHALL NOT aparecer na lista para quem não é dono da campanha.

#### Scenario: Jogador vê só os Itens visíveis
- **WHEN** um jogador (sem sessão de dono) abre a tela de Itens de uma campanha com Itens visíveis e ocultos
- **THEN** a lista mostra somente os Itens com `visivel_para_todos=true`

#### Scenario: Busca por nome filtra a lista
- **WHEN** a pessoa digita um termo de busca que corresponde ao nome de um Item visível
- **THEN** a lista mostra apenas os Itens cujo nome corresponde ao termo buscado

### Requirement: Detalhe de Item com descrição em Markdown sanitizado
Ao selecionar um Item visível, o sistema SHALL mostrar seu nome e descrição renderizada como Markdown sanitizado, consumindo `GET /api/c/{slug}/itens/{id}`. Uma tentativa de acessar um Item inexistente ou não visível SHALL resultar em "não encontrado", nunca numa resposta que revele que o Item existe mas está oculto.

#### Scenario: Descrição com formatação é exibida corretamente
- **WHEN** um Item visível tem descrição com formatação Markdown (ex. lista, ênfase)
- **THEN** a descrição aparece formatada e sanitizada, sem sintaxe de Markdown literal visível e sem HTML não sanitizado executado

#### Scenario: Item oculto não é diferenciável de Item inexistente
- **WHEN** um jogador tenta acessar o detalhe de um Item que existe mas está marcado como não visível
- **THEN** o sistema mostra o mesmo estado de "não encontrado" que mostraria para um id que não existe

### Requirement: Referências de sessão e evento respeitam a visibilidade de cada uma
O detalhe de um Item SHALL mostrar as sessões e eventos aos quais está associado como referências navegáveis, apenas as que são individualmente visíveis para quem está consultando. Uma sessão ou evento oculto associado ao Item SHALL NOT aparecer na lista de referências, mesmo que o próprio Item seja visível.

#### Scenario: Item associado a uma sessão oculta
- **WHEN** um Item visível está associado a uma sessão visível e a uma sessão oculta
- **THEN** a lista de referências do Item mostra somente a sessão visível

### Requirement: Navegação pela aba "Itens" da campanha
O sistema SHALL oferecer uma aba "Itens" na navegação da campanha, ao lado das abas já existentes (Mapa, Relações, Rota, Sessões, Linha do Tempo), levando à listagem pública de Itens.

#### Scenario: Aba Itens está disponível para qualquer visitante
- **WHEN** qualquer pessoa (com ou sem sessão) abre uma campanha
- **THEN** a navegação da campanha mostra uma aba "Itens" que leva à tela de listagem

### Requirement: CRUD de Itens continua restrito ao Modo GM existente
Esta capability SHALL NOT introduzir criação, edição ou exclusão de Itens pela tela pública. O CRUD de Itens continua disponível apenas pelo fluxo já existente (gerenciador de Itens dentro da Linha do Tempo, restrito a Modo GM).

#### Scenario: Tela pública não oferece ações de edição
- **WHEN** um mestre em Modo GM abre a tela pública de Itens
- **THEN** a tela não oferece criar/editar/excluir Item diretamente; um link leva ao gerenciador de Itens existente para essas ações
