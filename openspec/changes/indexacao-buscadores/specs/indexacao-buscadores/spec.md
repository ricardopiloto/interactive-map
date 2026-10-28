# Spec Delta

## Purpose

Define o que o site permite que os buscadores indexem: só as páginas institucionais e o conteúdo público das campanhas que o mestre autorizou, nunca as páginas de conta, as páginas com token, a API nem as campanhas "só com link".

## ADDED Requirements

### Requirement: Indexação de campanha por escolha do mestre
O sistema SHALL permitir que o dono de uma campanha autorize ou revogue a indexação do conteúdo público dessa campanha em buscadores. A autorização SHALL vir **desligada por padrão** em toda campanha nova e em todas as já existentes. A autorização só SHALL ter efeito quando a campanha está ativa e com visibilidade "listada"; campanhas "só com link" ou inativas SHALL NOT ser indexáveis, mesmo que a autorização esteja ligada, e a autorização guardada SHALL voltar a valer se a campanha voltar a ser listada.

#### Scenario: Padrão desligado
- **WHEN** uma campanha é criada, ou já existia antes desta funcionalidade
- **THEN** a indexação está desligada

#### Scenario: Dono liga a indexação
- **WHEN** o dono de uma campanha listada liga "Permitir indexação em buscadores"
- **THEN** a campanha passa a ser indexável e o sitemap passa a listá-la

#### Scenario: Quem não é dono
- **WHEN** um membro que não é dono, ou uma pessoa sem sessão, tenta alterar a indexação
- **THEN** o pedido é recusado e o valor não muda

#### Scenario: Campanha só com link
- **WHEN** a campanha tem visibilidade "só com link" e a autorização está ligada
- **THEN** a campanha não é indexável e o Painel explica por que o interruptor não tem efeito

#### Scenario: Volta a ser listada
- **WHEN** uma campanha com a autorização ligada passa de "só com link" para "listada"
- **THEN** a campanha volta a ser indexável sem nova ação do mestre

### Requirement: Sitemap
O sistema SHALL publicar um sitemap XML em `/sitemap.xml` (na raiz do site, fora de `/api`) com endereços absolutos. O sitemap SHALL listar as páginas institucionais (início, explorar, termos, privacidade e contato) e, para cada campanha indexável, apenas as suas páginas públicas com conteúdo (mapa quando existe imagem de mapa, relações, sessões, linha do tempo e itens), cada uma e SHALL NOT publicar datas de modificação (`lastmod`), para não expor quando o mestre edita conteúdo privado. O sitemap SHALL NOT listar páginas privadas, páginas com token, a página de registo, páginas só do mestre nem campanhas não indexáveis.

#### Scenario: Campanha indexável
- **WHEN** uma campanha ativa, listada e autorizada existe
- **THEN** o sitemap lista as suas páginas públicas com conteúdo, no endereço canônico `/c/{id}/{slug}/…`, sem datas de modificação

#### Scenario: Campanha não autorizada
- **WHEN** uma campanha ativa e listada não tem a indexação ligada
- **THEN** nenhuma página dela aparece no sitemap

#### Scenario: Campanha só com link ou inativa
- **WHEN** uma campanha tem a autorização ligada mas é "só com link" ou está inativa
- **THEN** nenhuma página dela aparece no sitemap

#### Scenario: Sem imagem de mapa
- **WHEN** uma campanha indexável não tem imagem de mapa
- **THEN** a página de mapa não aparece no sitemap

#### Scenario: Páginas excluídas
- **WHEN** o sitemap é gerado
- **THEN** não contém `/login`, `/registo`, `/painel`, `/admin`, `/conta`, `/convite/…` nem `/reset/…`

#### Scenario: Sem datas de modificação
- **WHEN** o sitemap é gerado
- **THEN** nenhuma entrada contém `lastmod`

#### Scenario: Contato indisponível
- **WHEN** o contato não está disponível na instância
- **THEN** `/contato` não aparece no sitemap

### Requirement: Páginas privadas e API fora dos buscadores
O sistema SHALL sinalizar como não indexáveis (`noindex`) as páginas de conta e administração (início de sessão, registo, recuperação de senha, painel, conta, administração) e as páginas com token (convite e redefinição de senha), e SHALL impedir que o endereço dessas páginas seja enviado como origem (`Referrer-Policy: no-referrer`) nas páginas com token. Também SHALL sinalizar como não indexáveis as respostas da API. O sistema SHALL NOT bloquear esses endereços no `robots.txt`, para que o buscador consiga ver o `noindex` e consiga buscar a API ao renderizar as páginas.

#### Scenario: Página privada
- **WHEN** um buscador pede o painel, a administração, o login ou a recuperação de senha
- **THEN** a resposta traz `X-Robots-Tag: noindex, nofollow` e a página traz `meta robots noindex`

#### Scenario: Página com token
- **WHEN** um buscador ou navegador abre `/convite/<token>` ou `/reset/<token>`
- **THEN** a página é `noindex` e a resposta pede `Referrer-Policy: no-referrer`

#### Scenario: API
- **WHEN** um buscador pede uma rota de `/api`
- **THEN** a resposta traz `X-Robots-Tag: noindex`, sem que isso impeça a renderização das páginas

#### Scenario: robots.txt
- **WHEN** o `robots.txt` é lido
- **THEN** não contém `Disallow` para a API nem para as páginas privadas e contém a linha `Sitemap:` com o endereço do sitemap

### Requirement: Metadados por página
O sistema SHALL definir, em cada página, um título e uma descrição próprios no idioma da interface (pt-BR ou en), no padrão "Página — Campaign Codex", e o atributo `lang` do documento SHALL acompanhar o idioma escolhido. Cada página indexável SHALL declarar o seu endereço canônico (absoluto, no endereço público do site); para campanhas, o canônico SHALL usar o id e o slug (`/c/{id}/{slug}/…`) e a rota antiga `cronologia` SHALL ter como canônico `linha-do-tempo`. O HTML estático inicial SHALL continuar indexável e SHALL NOT conter `noindex`.

#### Scenario: Títulos diferentes por página
- **WHEN** a pessoa abre a home, o explorar e a página de termos
- **THEN** cada uma tem o seu título e a sua descrição, no idioma da interface

#### Scenario: Troca de idioma
- **WHEN** a pessoa muda o idioma da interface
- **THEN** o título, a descrição e o `lang` do documento passam para o novo idioma

#### Scenario: Canônico da campanha
- **WHEN** a página de uma campanha é aberta por `/c/{slug}/…` ou por `/c/{id}/{slug}/…`
- **THEN** o canônico declarado é `/c/{id}/{slug}/…`

#### Scenario: Rota antiga da linha do tempo
- **WHEN** a página é aberta em `/c/{id}/{slug}/cronologia`
- **THEN** o canônico declarado é `/c/{id}/{slug}/linha-do-tempo`

### Requirement: Páginas de campanha indexáveis só quando autorizadas
As páginas de uma campanha SHALL declarar `noindex` quando a campanha não é indexável (indexação desligada, "só com link" ou inativa), quando a campanha não existe ou não carrega, e nas páginas só do mestre (ferramentas e fios) e na de rota, mesmo em campanhas indexáveis. Uma campanha indexável SHALL declarar `index` nas suas páginas públicas com conteúdo.

#### Scenario: Campanha não autorizada
- **WHEN** uma página de uma campanha com a indexação desligada é aberta
- **THEN** a página declara `noindex`

#### Scenario: Campanha autorizada
- **WHEN** a página de relações de uma campanha indexável é aberta
- **THEN** a página declara `index` e o canônico da campanha

#### Scenario: Páginas só do mestre
- **WHEN** as páginas de ferramentas ou de fios são abertas, mesmo numa campanha indexável
- **THEN** declaram `noindex`

#### Scenario: Campanha que não existe
- **WHEN** a campanha não existe ou falha ao carregar
- **THEN** a página declara `noindex`

#### Scenario: Campanha ainda carregando
- **WHEN** uma página de campanha é aberta e a configuração da campanha ainda não chegou
- **THEN** a página já declara `noindex` desde o primeiro momento e só passa a `index` se a configuração confirmar que a campanha é indexável e a página é uma das indexáveis

### Requirement: Página não encontrada
O sistema SHALL responder com o estado HTTP 404 às rotas desconhecidas do site, devolvendo a mesma página de "não encontrado" da aplicação, e a página de "não encontrado" SHALL declarar `noindex`. Para endereços de campanha (`/c/…`) que não existem, só conhecidos depois de consultar a API, o sistema SHALL declarar `noindex` na página.

#### Scenario: Rota desconhecida
- **WHEN** um buscador pede um caminho que não é rota da aplicação
- **THEN** a resposta tem estado 404 e traz a página de "não encontrado", com `noindex`

#### Scenario: Rota válida
- **WHEN** um buscador pede uma rota válida da aplicação
- **THEN** a resposta tem estado 200

#### Scenario: Campanha inexistente
- **WHEN** a pessoa abre `/c/9999/nao-existe/mapa`
- **THEN** a página mostra o erro de campanha e declara `noindex`

### Requirement: Transparência para o mestre e para as pessoas
O Painel SHALL mostrar, junto ao interruptor de indexação, um aviso de que o conteúdo que o mestre tornou visível aos jogadores pode aparecer em buscadores, e que desligar a indexação não retira de imediato o que já foi indexado. A política de privacidade SHALL informar que campanhas marcadas como indexáveis podem aparecer em buscadores.

#### Scenario: Aviso no Painel
- **WHEN** o dono vê as configurações da campanha
- **THEN** o interruptor vem com o aviso sobre a exposição do conteúdo público e sobre o tempo de retirada

#### Scenario: Política de privacidade
- **WHEN** a pessoa lê a política de privacidade
- **THEN** encontra a informação sobre campanhas indexáveis e buscadores
