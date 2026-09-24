# Feature Specification: Roteamento por campanha

**Feature Branch**: `094-roteamento-campanha`

**Created**: 2026-09-19

**Status**: Implemented

**Input**: User description: "Roteamento por campanha. Backend: todas as rotas públicas e admin passam para /api/c/{slug}/... com o get_session da spec 093. Slug desconhecido devolve 404; campanha so_link continua acessível pelo slug. Configuração (sistema, módulos ativos, se há mapa) passa a vir da Campanha, não do .env. Frontend: rotas /c/:slug e /c/:slug/relacoes; cache de configuração indexado por slug (hoje é global); base de API derivada do slug. O Basic Auth atual continua como guarda TRANSITÓRIA das rotas admin; esta spec não vai a produção antes da 095. Fora de escopo: contas, login, página inicial, uploads. Depende de: 093. Critério-chave: os testes da 092 continuam passando adaptados ao prefixo /c/{slug}; dados de uma campanha nunca aparecem em outra."

**Depends on**: [093-controle-alembic-sqlite](../093-controle-alembic-sqlite/spec.md) (Implemented); [092-fundacao-testes](../092-fundacao-testes/spec.md); Campaign Codex RFC / brief ([docs/v2/product-brief-campaign-codex.md](../../docs/v2/product-brief-campaign-codex.md) fase 094); constituição v1.0.0 (I, II, III, IV, V)

## Constitution

- Isolamento (I): **esta fase introduz** as rotas HTTP por slug. Toda superfície de conteúdo (`/api/c/{slug}/…` pública e admin) **e** a superfície de ficheiros de upload servidos sob caminho com o mesmo slug MUST entrar na matriz de isolamento: pedido a A MUST NOT devolver dados nem ficheiros de B (anónimo e autenticado com Basic Auth). Sem `campanha_id` nas tabelas de conteúdo — o slug na URL escolhe o ficheiro via o resolvedor da 093. ACL fina / ocultar mídia por personagem permanece 096.
- Testes primeiro (II): a matriz de isolamento A/B nas rotas novas e a adaptação da caracterização 092 ao prefixo MUST ter testes a falhar **antes** da implementação correspondente.
- Produção legada (III): MUST NOT exigir alteração das instâncias WFRP/WoD nem `git pull` em `/opt/codex-*`. Esta feature **não** entra em produção até existir 095 (guarda transitória de Basic Auth); o desenvolvimento continua no repositório sem tocar nas pastas antigas.
- Simplicidade (IV): reutilizar o resolvedor e o `get_session` da 093; sem contas, sem novo motor de auth; uploads = **só** remount/path por slug sobre a pasta já existente por campanha — sem endpoint novo de política nem cota.
- i18n (V): copy nova de interface (ex.: campanha não encontrada, navegação sob `/c/:slug`) MUST ter chaves pt-BR e en. Conteúdo do mestre não é traduzido. Erros de API MUST usar códigos mapeáveis.
- Migrações (VI): N/A — sem mudança de schema de `control.db` nem de `campanha.db` nesta fase.

## Clarifications

### Session 2026-09-19

- Q: Rotas de API de conteúdo sem slug (prefixo antigo) → A: 404 sem redirecionar
- Q: Rotas do cliente sem slug (`/`, `/relacoes`) → A: ecrã «não encontrado» / peça link com slug (sem mapa)
- Q: Imagens/uploads nesta fase → A: expor ficheiros actuais sob caminho **com slug** (pasta 093); sem ACL/cota novas (isso fica 096)
- Q: Papel de `CAMPAIGN_SLUG` após 094 → A: HTTP só pela URL; env opcional só para CLI/seed/scripts (nunca fallback de pedido HTTP)
- Q: Slug inactivo vs desconhecido → A: mesma 404 opaca (mesmo código de erro)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jogador abre a mesa pelo slug na URL (Priority: P1)

Um jogador (sem conta) abre o endereço da campanha pelo identificador público (slug). Vê o mapa (ou a experiência actual sem mapa) e pode ir à Rede de Relações no caminho dessa mesma campanha. Os dados mostrados são só dessa mesa.

**Why this priority**: Sem URL por campanha não há multi-mesa utilizável; é o contrato do brief para jogadores.

**Independent Test**: Com duas campanhas no controle, abrir cada slug no cliente e verificar conteúdo e configuração distintos; slug inexistente → «não encontrado».

**Acceptance Scenarios**:

1. **Given** uma campanha activa com slug conhecido, **When** o jogador abre o caminho dessa campanha (mapa), **Then** vê só o conteúdo dessa mesa.
2. **Given** a mesma campanha, **When** o jogador abre o caminho de Relações dessa campanha, **Then** a rede mostrada é a dessa mesa (não de outra).
3. **Given** um slug que não existe no controle (ou campanha inactiva), **When** o jogador tenta abrir mapa ou relações, **Then** recebe uma resposta de «não encontrado» (sem cair noutro conteúdo).

---

### User Story 2 - Pedidos de leitura e de GM usam o slug e não misturam mesas (Priority: P1)

Toda a leitura pública e toda a administração de conteúdo da mesa pedem o recurso **dentro** do caminho da campanha. O sistema resolve o armazenamento pelo slug (093). Credenciais GM (Basic Auth da instância) continuam a guardar as rotas de escrita/administração **de forma transitória** até 095; mesmo autenticado, um pedido sob o slug A nunca devolve ou altera o conteúdo de B.

**Why this priority**: Critério-chave de isolamento (constituição I) e rede de segurança da 092.

**Independent Test**: Matriz automatizada: popular A e B; listagens/detalhes sob A omitem B; admin autenticado sob A não lê/escreve B; ficheiro só em A inacessível sob path de B; caracterizações 092 passam com o prefixo por slug.

**Acceptance Scenarios**:

1. **Given** um local só na campanha A, **When** se lista locais sob o slug B, **Then** esse local não aparece.
2. **Given** credenciais GM válidas da instância, **When** se pede uma listagem admin sob o slug A, **Then** só há dados de A; o mesmo sob B só devolve B.
3. **Given** a suíte de caracterização da 092, **When** os pedidos usam o prefixo por campanha (slug da campanha de teste), **Then** todos os pins públicos, admin (401/autenticado) e de visibilidade de personagens passam.
4. **Given** pedido admin sem credencial sob um slug válido, **When** se acede a uma GET admin de listagem/sessão, **Then** a resposta é 401 (comportamento actual preservado, só o caminho muda).

---

### User Story 3 - Campanha «só por link» abre pelo slug (Priority: P1)

Uma campanha com visibilidade «só por link» **não** precisa de aparecer numa página inicial (essa página é 098). Quem conhece o slug consegue abrir mapa, relações e a API dessa campanha como qualquer outra campanha activa.

**Why this priority**: O brief distingue listagem de acessibilidade; 094 não pode bloquear `so_link` por engano.

**Independent Test**: Criar campanha `so_link`; pedidos sob o seu slug sucedem; slug desconhecido continua «não encontrado».

**Acceptance Scenarios**:

1. **Given** uma campanha activa com visibilidade `so_link`, **When** o jogador abre o caminho dessa campanha, **Then** o conteúdo carrega (não é tratado como inexistente só por ser `so_link`).
2. **Given** a mesma campanha, **When** se pede a configuração sob o seu slug, **Then** sistema, módulos e presença de mapa reflectem o registo dessa Campanha.

---

### User Story 4 - Configuração da mesa vem da Campanha, por slug (Priority: P1)

O cliente deixa de depender de configuração global de ambiente (`sistema` / módulos / presença de mapa no `.env` da instância) para o ecrã da mesa. Cada slug devolve a configuração da **sua** Campanha. O cliente guarda essa configuração **por slug** (não um único valor global para toda a app) e deriva o destino da API a partir do slug na URL.

**Why this priority**: Sem isto, duas mesas no mesmo browser misturam sistema/módulos; o brief exige campos na Campanha.

**Independent Test**: Duas campanhas com sistemas ou módulos distintos; abrir A depois B no cliente (ou na API) mostra a config correcta de cada uma; cache/reload de A não aplica a config de B.

**Acceptance Scenarios**:

1. **Given** campanha A (ex.: um sistema) e B (outro sistema ou módulos diferentes), **When** se pede a configuração sob cada slug, **Then** cada resposta reflecte só essa Campanha — não o `.env` da instância como fonte de sistema/módulos/mapa.
2. **Given** o cliente com a URL da campanha A, **When** carrega dados, **Then** os pedidos vão para o caminho de API dessa campanha (base derivada do slug).
3. **Given** o cliente já visitou A e depois abre B, **When** consulta a configuração em cache, **Then** a entrada de B não é a de A (cache indexado por slug).

---

### Edge Cases

- Slug desconhecido, malformado ou campanha com `activa=false`: superfície de conteúdo responde como **não encontrado** (404) **opaco** — mesmo código de erro para inactivo e desconhecido; sem fallback para outra mesa nem para `CAMPAIGN_SLUG`.
- Visibilidade `so_link` vs `listada`: nesta fase **não** há diferença de acesso por URL; a diferença de listagem na home é 098.
- Pedido a caminho de conteúdo **sem** slug (antigo prefixo global de API de mesa): MUST responder **404** (não encontrado), **sem** redirecionar para um caminho com slug — o contrato passa a ser só por slug.
- Health / superfícies não-campanha (se existirem): podem permanecer fora do prefixo por slug; MUST NOT expor linhas de conteúdo de mesa.
- Basic Auth: credencial errada → 401; credencial correcta sob slug A **não** autoriza ler B. Papéis por conta são 095.
- Uploads/imagens: MUST ser servidos sob um caminho que **inclui o slug**, a partir da pasta de uploads dessa campanha (093). MUST NOT introduzir ACL por personagem, mapa versionado enforced nem cota (096). Pedido de ficheiro sob slug A MUST NOT ler a pasta de B. O caminho global antigo de uploads (sem slug), se existir, MUST NOT servir ficheiros de campanha (404), alinhado à API.
- Página inicial / login / contas: fora de escopo; o cliente desta fase assume entrada directa por `/c/:slug` (links partilhados ou bookmark). Caminhos do cliente **sem** slug (`/` e o antigo `/relacoes`) MUST mostrar ecrã de «não encontrado» / pedido de link com slug — **sem** carregar mapa nem relações.
- Instâncias `/opt/codex-*` intocadas; este código não é o deploy de produção até após 095+.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Toda rota pública de **conteúdo de campanha** e toda rota **admin** de conteúdo MUST ser exposta sob um caminho que inclui o slug da campanha (contrato: prefixo de API por campanha). O resolvedor da 093 MUST obter o slug **desse** caminho (não do ambiente como fonte primária do pedido HTTP). `CAMPAIGN_SLUG` MUST NOT ser usado como fallback silencioso de pedidos HTTP; MAY permanecer só para CLI, seed ou scripts locais.
- **FR-001a**: Caminhos antigos de conteúdo **sem** slug (o prefixo global anterior) MUST responder **404** e MUST NOT redirecionar para um equivalente com slug nem servir dados de qualquer mesa.
- **FR-002**: Slug inexistente, inactivo ou que não resolve para uma Campanha utilizável MUST resultar em **não encontrado** (404) na superfície de conteúdo — sem servir outra mesa. Inactivo e desconhecido MUST partilhar a **mesma** resposta opaca (mesmo código de erro mapeável); MUST NOT revelar se o slug existe mas está desligado.
- **FR-003**: Campanha com visibilidade `so_link` e `activa` MUST ser acessível pelos mesmos caminhos por slug que uma campanha `listada`.
- **FR-004**: A configuração exposta ao cliente da mesa (sistema, módulos activos, indicação de mapa) MUST ser lida do registo **Campanha** resolvido pelo slug do pedido — MUST NOT usar o `.env` da instância como fonte desses campos para essa resposta.
- **FR-005**: O cliente da app MUST oferecer navegação de mapa e de Relações sob caminhos por slug da campanha; MUST derivar a base dos pedidos de API a partir do slug na URL; MUST guardar a configuração de mesa **indexada por slug** (não um único cache global).
- **FR-005a**: Caminhos do cliente **sem** slug (incluindo `/` e o antigo caminho de Relações na raiz) MUST mostrar um ecrã de «não encontrado» / indicação para abrir um link com slug — MUST NOT carregar mapa nem Rede de Relações nesses caminhos. (A home com listagem de campanhas permanece 098.)
- **FR-006**: A guarda actual de Basic Auth MUST continuar a proteger as rotas admin sob o prefixo por slug (comportamento 401 / autenticado da 092). Esta guarda é **transitória** até 095; esta feature MUST NOT ser o veículo de corte em produção antes de 095.
- **FR-007**: MUST existir matriz de testes de isolamento: pedidos (anónimo e com Basic Auth) sob o slug A MUST NOT devolver nem alterar dados da campanha B, e o inverso; o mesmo para **ficheiros** pedidos sob o caminho de uploads com slug.
- **FR-008**: A suíte de caracterização da 092 MUST ser adaptada ao prefixo por slug e MUST continuar a passar (pins públicos, admin, visibilidade de personagens).
- **FR-009**: MUST NOT introduzir contas, convite, cookie de sessão de mestre, página inicial de escolha de campanhas, nem ACL/cota de mídia (096). MUST, contudo, expor os uploads **já existentes** sob caminho com slug (pasta da campanha), para o cliente não misturar imagens entre mesas.
- **FR-009a**: O cliente MUST derivar URLs de mapa/imagens a partir do slug (mesmo princípio da base de API), não de um `/uploads` global único.
- **FR-010**: Copy nova de UI introduzida por esta feature MUST existir em pt-BR e en. Códigos de erro de API MUST permanecer mapeáveis a chaves.
- **FR-011**: MUST NOT exigir alteração das instâncias legadas nem schema Alembic novo nesta fase.

### Out of Scope

- Contas, login, convite, papéis dono/co-mestre, remoção definitiva do Basic Auth (095).
- Página inicial com campanhas listadas / painel do mestre (098).
- ACL de mídia por visibilidade de personagem, cota enforced, mapa versionado com política nova (096) — **não** o simples servir ficheiros sob path com slug (isso **está** no escopo).
- Exportar/importar e corte de produção (097 / 099).
- Alterar regex/reservados de slug ou campos imutáveis da Campanha (já 093).

### Key Entities

- **Campanha** (093): slug na URL; `visibilidade`; `sistema` / `modulos_ativos` / mapa; `activa`.
- **Pedido por slug**: unidade de resolução — um slug → um sítio de conteúdo; sem misturar sessões entre slugs.
- **Configuração de mesa (cliente)**: valor cacheado por slug (sistema, módulos, mapa).
- **Guarda GM transitória**: Basic Auth de instância sobre admin sob o slug (até 095).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos pins da caracterização 092 (públicos, admin 401/autenticado, visibilidade) passam contra caminhos com slug da campanha de teste.
- **SC-002**: 100% dos casos da matriz de isolamento A/B (leitura pública, admin autenticado, e ficheiro de upload sob path com slug) mostram 0 fugas de dados/ficheiros de A→B e B→A.
- **SC-003**: 100% dos pedidos de conteúdo com slug desconhecido ou inactivo resultam em «não encontrado» opaco para o utilizador (mesma resposta nos dois casos; sem conteúdo de outra mesa).
- **SC-004**: Uma campanha `so_link` activa abre com sucesso pelo slug em mapa e relações (e na configuração dessa mesa).
- **SC-005**: Com duas campanhas de configuração distinta, o utilizador que abre A e depois B vê a configuração correcta de cada uma (sem reutilizar a de A para B).
- **SC-006**: Um jogador com o link correcto chega ao mapa ou às relações dessa campanha sem conta e sem passar por página inicial (esta ainda não existe).

## Assumptions

- O resolvedor e o layout em disco da 093 permanecem; 094 só muda a **fonte do slug** no HTTP (URL) e o prefixo das rotas de conteúdo (e o path dos uploads). `CAMPAIGN_SLUG` deixa de alimentar pedidos HTTP; permanece opcional para CLI/seed/scripts, sem fallback se a URL trouxer outro slug (ou qualquer slug).
- «Não encontrado» para slug mau **e** inactivo é a mesma resposta opaca (404 / um único código mapeável); não se distingue `so_link` de `listada` no acesso por URL. Caminhos de API de conteúdo **sem** slug também são 404 (sem redirect). Diagnóstico de campanha inactiva fica na CLI/`control.db`, não na API pública.
- Superfícies que não são conteúdo de mesa (ex.: health) podem ficar fora do prefixo por slug.
- Basic Auth continua **um** par de credenciais por instância (não por campanha) até 095; o isolamento entre mesas vem do slug + ficheiro, não do utilizador Basic Auth.
- Entrada do frontend nesta fase: deep link `/c/:slug` (e `/c/:slug/relacoes`); `/` e `/relacoes` sem slug são ecrã de «não encontrado» / peça link (não mapa). Redesenho da home com listagem é 098.
- Uploads: nesta fase só se **ancora o path ao slug** (pasta por campanha da 093). Isolamento de permissão fina e cota são 096; a matriz desta spec inclui API de conteúdo **e** GET de ficheiro sob path com slug.
- Deploy em produção do Campaign Codex multi-slug com só Basic Auth **não** é objectivo desta fase; 095 é pré-requisito de corte seguro.
- Sem dependência de produto nova além do stack actual.

## Notes

- Actualizar harness/docs de teste para o prefixo por slug; documentar exemplos de URL no README do backend/frontend conforme o plano.
- Sem bump SemVer de produto só por prefixo, salvo o plano da fase o exigir; produção legada intocada (III).
- Próxima fase natural: 095 (contas / sessão / fim do Basic Auth como guarda GM).
