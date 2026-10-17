# itens-publicos Specification

## Purpose
Permite que qualquer visitante de uma campanha (jogador ou mestre) consulte os Itens cadastrados pelo mestre em `frontend-v2/`, respeitando exatamente as mesmas regras de visibilidade já aplicadas a Locais, Personagens, Arcos, Sessões e Eventos — com o mestre, em Modo GM, vendo também os itens ocultos.

## Requirements

### Requirement: Listagem pública de Itens visíveis
O sistema SHALL oferecer uma tela que lista todos os Itens com `visivel_para_todos=true` da campanha, consumindo `GET /api/c/{slug}/itens`, com busca por nome. Itens com `visivel_para_todos=false` SHALL NOT aparecer na lista para quem não está em Modo GM.

#### Scenario: Jogador vê só os Itens visíveis
- **WHEN** um jogador (sem sessão de dono) abre a tela de Itens de uma campanha com Itens visíveis e ocultos
- **THEN** a lista mostra somente os Itens com `visivel_para_todos=true`

#### Scenario: Busca por nome filtra a lista
- **WHEN** a pessoa digita um termo de busca que corresponde ao nome de um Item visível
- **THEN** a lista mostra apenas os Itens cujo nome corresponde ao termo buscado

### Requirement: Modo GM vê também os Itens ocultos
Quando a pessoa está em Modo GM (dono da campanha), o sistema SHALL listar todos os Itens da campanha, incluindo os com `visivel_para_todos=false`, consumindo o mesmo client administrativo já usado pelo diálogo de Itens da Linha do Tempo — sem introduzir nenhum parâmetro de bypass de visibilidade no endpoint público. Um Item oculto SHALL ser visualmente identificável como tal nessa listagem.

#### Scenario: GM vê Itens ocultos com indicação visual
- **WHEN** o mestre em Modo GM abre a tela de Itens de uma campanha com Itens visíveis e ocultos
- **THEN** a lista mostra todos os Itens, e os ocultos aparecem com uma indicação visual de que não são visíveis ao público

### Requirement: Detalhe de Item com descrição em Markdown sanitizado
Ao selecionar um Item, o sistema SHALL mostrar seu nome e descrição renderizada como Markdown sanitizado, a partir dos dados já carregados na listagem (sem uma segunda chamada HTTP por id). Para quem não está em Modo GM, um Item que não está na lista pública carregada (por ser oculto ou não existir) SHALL resultar no mesmo estado de "não encontrado" em ambos os casos — sem diferenciar "oculto" de "inexistente".

#### Scenario: Descrição com formatação é exibida corretamente
- **WHEN** um Item tem descrição com formatação Markdown (ex. lista, ênfase)
- **THEN** a descrição aparece formatada e sanitizada, sem sintaxe de Markdown literal visível e sem HTML não sanitizado executado

#### Scenario: Deep-link para Item oculto não é diferenciável de Item inexistente
- **WHEN** um jogador (sem sessão de dono) acessa a tela de Itens com `?item=ID` apontando para um Item que existe mas está marcado como não visível
- **THEN** o sistema mostra o mesmo estado de "não encontrado" que mostraria para um `ID` que não existe, pois o Item oculto nunca está presente na lista pública carregada

#### Scenario: Deep-link seleciona o Item correspondente
- **WHEN** a tela de Itens é aberta com `?item=ID` apontando para um Item visível (ou, em Modo GM, para um Item oculto)
- **THEN** esse Item aparece selecionado no painel de detalhe, sem exigir que a pessoa clique nele na lista

### Requirement: Referências de sessão e evento respeitam a visibilidade de cada uma
O detalhe de um Item SHALL mostrar as sessões e eventos aos quais está associado como referências navegáveis, apenas as que são individualmente visíveis para quem está consultando (em Modo GM, todas). O chip de sessão associada SHALL navegar para a tela de Sessões com a sessão pré-selecionada (`?s={numero}`). O chip de evento associado SHALL navegar para a Linha do Tempo sem pré-seleção, pois não existe deep-link por evento.

#### Scenario: Item associado a uma sessão oculta
- **WHEN** um jogador consulta um Item visível associado a uma sessão visível e a uma sessão oculta
- **THEN** a lista de referências do Item mostra somente a sessão visível

#### Scenario: Chip de sessão pré-seleciona a sessão
- **WHEN** a pessoa clica no chip de uma sessão associada ao Item
- **THEN** a navegação leva à tela de Sessões com aquela sessão já selecionada

### Requirement: Navegação pela aba "Itens" da campanha
O sistema SHALL oferecer uma aba "Itens" na navegação da campanha (`frontend-v2/src/components/codex/Shell.tsx`), ao lado das abas já existentes, levando à listagem de Itens.

#### Scenario: Aba Itens está disponível para qualquer visitante
- **WHEN** qualquer pessoa (com ou sem sessão) abre uma campanha
- **THEN** a navegação da campanha mostra uma aba "Itens" que leva à tela de listagem

### Requirement: CRUD de Itens continua restrito ao fluxo existente na Linha do Tempo
Esta capability SHALL NOT introduzir criação, edição ou exclusão de Itens pela tela nova. O CRUD de Itens continua disponível apenas pelo diálogo já existente dentro da Linha do Tempo, restrito a Modo GM.

#### Scenario: Tela de Itens não oferece ações de edição
- **WHEN** um mestre em Modo GM abre a tela de Itens
- **THEN** a tela não oferece criar/editar/excluir Item diretamente; um link leva ao diálogo de Itens já existente na Linha do Tempo para essas ações
