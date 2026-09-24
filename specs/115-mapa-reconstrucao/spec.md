# Feature Specification: Mapa (reconstrução estrutural)

**Feature Branch**: `115-mapa-reconstrucao`

**Created**: 2026-09-22

**Status**: Draft

**Input**: User description: "Reconstrução estrutural do Mapa. Painel único flutuante (busca + lista + detalhe) no lugar de SideMenu flush + PinModal; zoom em pílula/círculo no canto inferior direito reaproveitando a escala estável já existente; FAB + em Modo edição. Critério-chave: captura de /c/wfrp bate com o MapPage do protótipo sem diferença a olho nu."

**Depends on**: Spec 110 (tokens / pílula / sombra); Spec 114 (cabeçalho reconstruído — o mapa encaixa por baixo dele).

**Phase**: Paridade estrutural com o protótipo — superfície principal do Mapa.

## Constitution *(constraints; not implementation)*

- Isolation (I): Sem rotas HTTP novas de dados; UI sobre APIs já existentes. Matriz isolamento **N/A**.
- Testes primeiro (II): UI de polimento — quickstart/capturas (claro/escuro + móvel) MAY; sem mudança de schema/auth.
- Produção legada (III): Só produto Codex; MUST NOT tocar `/opt`.
- Simplicidade (IV): Reutilizar pan/zoom e o mecanismo de escala estável dos pinos já presente; sem nova biblioteca de mapa.
- i18n (V): Strings novas (filtros, voltar, FAB, estados vazios) MUST ter pt-BR e en; nomes/descrições do mestre MUST NOT ser traduzidos.
- Migrações (VI): N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Painel flutuante unificado (Priority: P1) 🎯 MVP

Um visitante abre o mapa da campanha. Em vez de uma coluna fixa encostada à borda, vê um **cartão flutuante** (margem das bordas, cantos arredondados, sombra) à esquerda no ecrã largo. No cartão: campo de **busca** em forma de pílula e chips **Tudo / Locais / Personagens**. A lista compacta mostra resultados. Ao tocar num item da lista **ou** num pino do mapa, o **mesmo** cartão passa ao **detalhe** (com «Voltar»); **não** aparece um popover separado sobre o mapa. No telemóvel, o cartão é uma **folha inferior** recolhível (só a busca/cabeçalho em repouso; expande ao focar a busca ou ao seleccionar).

**Why this priority**: Critério-chave — fecha o gap estrutural SideMenu+PinModal vs. protótipo.

**Independent Test**: Abrir `/c/wfrp` desktop e móvel; seleccionar pino e item da lista; confirmar detalhe no painel e ausência de popover à parte; capturar e comparar com o MapPage do protótipo.

**Acceptance Scenarios**:

1. **Given** mapa aberto em desktop, **When** o utilizador vê a página, **Then** o painel de conteúdo é um cartão flutuante com margem e sombra (não uma coluna flush de ~340px colada à borda).
2. **Given** lista visível, **When** o utilizador selecciona um local na lista ou no mapa, **Then** o mesmo painel mostra o detalhe com acção «Voltar»; nenhum painel/popover separado ancora-se ao pino.
3. **Given** detalhe aberto, **When** o utilizador escolhe «Voltar», **Then** regressa à lista/busca no mesmo painel.
4. **Given** viewport estreita, **When** nada está seleccionado e a busca não está focada, **Then** a folha inferior está recolhida; ao focar a busca ou seleccionar, **Then** expande.

---

### User Story 2 - Controles de mapa e FAB (Priority: P1)

O utilizador usa controlos de **zoom** (+, −, 1:1 / repor, ir ao grupo) num bloco **translúcido** no canto inferior **direito**, com botões em formato **pílula/círculo** (não rectângulos de raio pequeno). Os pinos **mantêm tamanho visual estável** ao fazer zoom (comportamento já correcto no produto — não se inventa um segundo mecanismo). Em **Modo edição**, um **FAB «+»** no canto oposto inicia a adição de local no mapa (mesmo fluxo de permissão/dados de hoje).

**Why this priority**: Segunda metade do critério visual; depende do mapa continuar utilizável.

**Independent Test**: Zoom in/out e ir ao grupo; comparar forma dos controlos com o protótipo; em Modo edição, FAB + e posicionar local.

**Acceptance Scenarios**:

1. **Given** mapa aberto, **When** o utilizador faz zoom, **Then** os pinos não «crescem» com o zoom (escala estável preservada) e os controlos permanecem no canto inferior direito em casca pílula/círculo.
2. **Given** Modo edição activo, **When** o utilizador activa o FAB +, **Then** pode posicionar um novo local no mapa como hoje (sem exigir a coluna antiga).
3. **Given** Modo edição inactivo, **When** o visitante vê o mapa, **Then** o FAB + **não** aparece.

---

### User Story 3 - Detalhe e edição no painel (Priority: P2)

No detalhe de um local (e, quando aplicável, de um personagem mostrado pelos filtros), o utilizador lê o conteúdo já conhecido (nome, arco/sessão, descrição, vínculos). Em **Modo edição**, ícones de **editar** e **excluir** aparecem no detalhe do local e abrem os fluxos de formulário/confirmação já existentes — sem reabrir o PinModal. Filtros e busca respeitam a **visibilidade** já aplicada pelas APIs (locais/personagens ocultos fora de edição).

**Why this priority**: Completa o fluxo do protótipo; permissões intactas.

**Independent Test**: Detalhe de local com e sem Modo edição; editar/excluir só com edição; anon não vê conteúdo oculto além do que a API já filtra.

**Acceptance Scenarios**:

1. **Given** detalhe de local e Modo edição ligado, **When** o utilizador vê o cabeçalho do detalhe, **Then** há acções de editar e excluir; **When** edição está desligada, **Then** essas acções estão ausentes.
2. **Given** chips Tudo/Locais/Personagens e texto de busca, **When** o utilizador filtra, **Then** a lista reflecte o filtro e a busca sobre os dados já carregados (sem nova regra de ACL).
3. **Given** selecção de personagem a partir da lista filtrada, **When** o painel mostra detalhe, **Then** «Voltar» regressa à lista (paridade de fluxo com o local).

---

### Edge Cases

- Mapa sem imagem / sem pinos: painel mostra estado vazio i18n; controlos de zoom/grupo degradam com a mesma lógica actual (desactivar o que não fizer sentido).
- Nome longo na lista: elipse; detalhe mostra o nome completo.
- Folha móvel expandida + teclado virtual: o painel não deve empurrar o mapa para fora de uso crítico (recolher ao perder foco é aceitável).
- Digitalizador de rotas (ferramenta GM separada): **fora de escopo** — permanece acessível pelo caminho actual se existir fora do SideMenu a substituir; esta spec MUST NOT redesenhá-lo.
- Abas antigas do SideMenu só-GM (ex.: gestão densa de arcos/grupo): MUST permanecer utilizáveis via acções de Modo edição / formulários já existentes, **sem** restaurar a coluna flush.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A combinação «coluna lateral fixa + popover de pino» MUST ser substituída por **um** painel flutuante que hospeda busca, lista e detalhe.
- **FR-002**: Seleccionar pino no mapa ou item na lista MUST abrir o detalhe **no mesmo painel**; MUST NOT abrir um popover/modal ancorado ao pino.
- **FR-003**: O painel desktop MUST ter margem face às bordas da área do mapa, cantos arredondados e sombra; no móvel MUST comportar-se como folha inferior recolhível/expansível.
- **FR-004**: A busca MUST usar campo em forma de pílula; chips Tudo / Locais / Personagens MUST filtrar a lista.
- **FR-005**: O detalhe MUST oferecer «Voltar» à lista; em Modo edição, editar/excluir local MUST reutilizar os fluxos de dados já autorizados.
- **FR-006**: Controlos de zoom (+, −, repor/1:1, ir ao grupo) MUST permanecer no canto inferior direito com casca visual pílula/círculo/translúcida alinhada ao protótipo.
- **FR-007**: O mecanismo de **escala estável dos pinos** já presente no mapa real MUST ser **reutilizado** (não substituído); esta feature só muda a casca visual dos pinos/controlos quando necessário para paridade.
- **FR-008**: FAB «+» MUST aparecer só em Modo edição e iniciar adição de local no mapa.
- **FR-009**: Lógica de API, i18n de conteúdo do mestre, revelação progressiva e `canEdit` MUST permanecer; só a estrutura visual e o contentor do painel mudam.
- **FR-010**: RouteDigitizer / digitalizador de rotas MUST NOT ser redesenhado nesta feature.
- **FR-011**: Strings novas de UI MUST existir em pt-BR e en.

### Key Entities

- **Painel do mapa**: Contentor flutuante com estados lista e detalhe; no móvel, expandido vs. recolhido.
- **Selecção de mapa**: Referência ao local ou personagem activo no painel (e destaque no mapa quando for local).
- **Controlos de câmara**: Zoom/pan/grupo — comportamento existente, nova casca.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Captura desktop de `/c/wfrp` alinhada ao MapPage do protótipo — painel flutuante com margem/sombra, sem coluna flush, sem popover de pino, controlos inferiores direitos em pílula/círculo — sem diferença a olho nu para um revisor humano (claro e escuro).
- **SC-002**: Em viewport estreita, a folha inferior recolhida ↔ expandida é utilizável; seleccionar pino ou item abre detalhe na folha; revisão manual em &lt; 2 minutos confirma o fluxo «voltar».
- **SC-003**: Após zoom in/out, os pinos mantêm tamanho aparente estável (sem regressão face ao comportamento actual).
- **SC-004**: Utilizador sem Modo edição nunca vê FAB + nem acções editar/excluir no detalhe; com Modo edição, ambas existem e concluem o mesmo efeito de dados de antes.
- **SC-005**: 100% das strings novas do painel/filtros/voltar/FAB aparecem correctamente em pt-BR e en.

## Assumptions

- Confirmado no código actual: a estabilidade visual dos pinos usa a variável de escala do transform (`--map-zoom` / factor inverso) — equivalente ao «KeepScale» do pedido; **reutilizar**, não reimplementar zoom/pan.
- Spec 114 já entrega o cabeçalho; o mapa ocupa a área abaixo.
- Formulários de criação/edição de local (Drawer) e confirmação de exclusão já existentes continuam a ser o veículo de escrita; o painel só dispara essas acções.
- Filtro «Personagens» cobre o elenco já exposto ao mapa/relações públicas; não exige novo endpoint.
- Gestão GM que vivia só em separadores densos do SideMenu (arcos admin, grupo, etc.) permanece acessível por controlos de Modo edição / fluxos já existentes na página, sem coluna flush.
- Digitalizador de rotas fica fora; pode continuar a abrir por entrada já existente se não depender do SideMenu destruído — se depender, essa entrada move-se para um controlo mínimo de Modo edição sem redesenhar o digitalizador.
- Paridade de forma dos pinos com o protótipo (ponto vs. teardrop) MAY ajustar CSS de casca desde que a escala estável e os dados do pino se mantenham.
