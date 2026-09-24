# Feature Specification: Relações e Rota (reconstrução estrutural)

**Feature Branch**: `116-relacoes-rota-reconstrucao`

**Created**: 2026-09-22

**Status**: Draft

**Input**: User description: "Reconstrução estrutural de Relações e Rota. As duas reaproveitam o mesmo painel flutuante da spec 115 (busca/filtro/lista/detalhe em Relações; formulário + cartões de resultado em Rota) em vez de coluna fixa + painel de detalhe / planejador próprio. Critério-chave: mesma forma, posição e recolha móvel que o Mapa; nenhum popover ou coluna fixa das telas antigas sobra."

**Depends on**: Spec 110 (tokens / pílula / sombra); Spec 114 (cabeçalho); Spec 115 (painel flutuante nasce no Mapa e é **reaproveitado** aqui).

**Phase**: Paridade estrutural com o protótipo — superfícies Relações e Rota.

## Constitution *(constraints; not implementation)*

- Isolation (I): Sem rotas HTTP novas de dados; UI sobre APIs já existentes. Matriz isolamento **N/A**.
- Testes primeiro (II): UI de polimento — quickstart/capturas (claro/escuro + móvel) MAY; sem mudança de schema/auth.
- Produção legada (III): Só produto Codex; MUST NOT tocar `/opt`.
- Simplicidade (IV): Reutilizar o motor de cálculo de rota e o motor do grafo já entregues (specs 105/106); sem nova biblioteca de grafo ou de routing.
- i18n (V): Strings novas de casca (voltar, estados vazios, rótulos de cartão se necessários) MUST ter pt-BR e en; nomes/notas do mestre MUST NOT ser traduzidos.
- Migrações (VI): N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Relações no painel flutuante (Priority: P1) 🎯 MVP

Um visitante abre **Relações**. Em vez de uma **coluna fixa** à esquerda e um **painel de detalhe** separado, vê o **mesmo cartão flutuante** do Mapa (margem, cantos arredondados, sombra; no telemóvel, folha inferior recolhível). No cartão: **busca** em pílula, filtros de famílias/tipos de vínculo, **lista** de personagens; ao seleccionar na lista **ou** no grafo, o **mesmo** cartão passa ao **detalhe** do personagem (com «Voltar»). O **grafo** continua no fundo do palco: com foco, o personagem seleccionado fica no **centro**, vínculos directos no **anel interno**, restantes **esmaecidos** no anel externo; as **quatro famílias** de vínculo já existentes permanecem.

**Why this priority**: Fecha o gap estrutural coluna+detalhe vs. protótipo; critério-chave partilha o painel com o Mapa.

**Independent Test**: Abrir `/c/{slug}/relacoes` desktop e móvel; seleccionar personagem na lista e no grafo; confirmar detalhe no painel único e ausência de coluna/painel lateral antigo; capturar e comparar com o RelacoesPage do protótipo.

**Acceptance Scenarios**:

1. **Given** Relações aberta em desktop, **When** o utilizador vê a página, **Then** o contentor de busca/lista/detalhe é o painel flutuante partilhado (mesma forma e posição relativa que no Mapa), não uma coluna flush + painel de detalhe solto.
2. **Given** lista visível, **When** o utilizador selecciona um personagem na lista ou no grafo, **Then** o mesmo painel mostra o detalhe com «Voltar»; nenhum segundo painel lateral ou popover de detalhe permanece.
3. **Given** personagem seleccionado, **When** o grafo redesenha o foco, **Then** o foco está no centro, vizinhos directos no anel interno e o resto esmaecido no exterior (comportamento radial já esperado; sem redesenho do algoritmo se já correcto).
4. **Given** viewport estreita, **When** o painel está em repouso, **Then** comporta-se como folha inferior recolhível; ao focar a busca ou seleccionar, **Then** expande (paridade com o Mapa).

---

### User Story 2 - Rota no mesmo painel (Priority: P1)

Um visitante abre **Rota**. O mapa da campanha ocupa o fundo. O **formulário** de origem/destino/opções e os **resultados** vivem **dentro** do painel flutuante partilhado (não num planejador com casca própria). Após calcular, cada opção de rota aparece como **cartão clicável** (tempo humanizado em dias+h, distância mi/km, e a **timeline de pernoites** já entregue). Seleccionar um cartão **destaca** essa rota no mapa com o **acento** da campanha.

**Why this priority**: Segunda metade do critério-chave; unifica a casca com Mapa/Relações sem alterar o cálculo.

**Independent Test**: Abrir `/c/{slug}/rota`; calcular rotas; clicar cartões e ver destaque no mapa; comparar casca do painel com Mapa/Relações e com o RotaPage do protótipo.

**Acceptance Scenarios**:

1. **Given** Rota aberta, **When** o utilizador vê a página, **Then** formulário e resultados estão no painel flutuante partilhado (mesma forma/posição/recolha móvel que Mapa e Relações), não num painel de planejador com estrutura visual antiga.
2. **Given** origem e destino válidos, **When** o utilizador calcula, **Then** as opções aparecem como cartões com tempo (dias+h), distância (mi/km conforme unidade da campanha) e timeline de pernoites quando aplicável — sem regressão face ao planejador actual.
3. **Given** várias opções, **When** o utilizador selecciona um cartão, **Then** essa rota fica destacada no mapa com a cor de acento da campanha; as demais opções deixam de ser a selecção activa.
4. **Given** origem igual a destino (ou rede sem caminho), **When** o utilizador tenta calcular ou recebe zero resultados, **Then** vê mensagem i18n clara no painel (sem ecrã em branco).

---

### User Story 3 - Edição e filtros sem cascas antigas (Priority: P2)

Em **Modo edição**, o mestre continua a criar/editar personagens e vínculos pelos **formulários já existentes** (disparados a partir do painel ou FAB/menu de adição alinhado ao protótipo), sem restaurar a coluna fixa. Filtros de família/tipo no painel (e legenda no grafo, se mantida) sincronizam a visibilidade das arestas. Em Relações, detalhe de personagem oferece conteúdo e ligações já conhecidos; «Voltar» regressa à lista no mesmo painel.

**Why this priority**: Completa a paridade de fluxo; permissões e dados intactos.

**Independent Test**: Ligar Modo edição; abrir criar personagem/vínculo; filtrar famílias; confirmar que não reaparece coluna flush nem painel de detalhe antigo.

**Acceptance Scenarios**:

1. **Given** Modo edição activo em Relações, **When** o mestre adiciona personagem ou vínculo, **Then** usa os fluxos de formulário/confirmação já autorizados; a lista/grafo actualizam sem coluna lateral antiga.
2. **Given** filtros de família/tipo, **When** o utilizador desactiva uma família, **Then** as arestas dessa família deixam de destacar-se no grafo (comportamento já esperado) e o painel reflecte o filtro na lista quando aplicável.
3. **Given** detalhe aberto, **When** o utilizador escolhe «Voltar», **Then** regressa à lista/busca no mesmo painel.

---

### Edge Cases

- Campanha sem personagens / sem waypoints: painéis mostram estado vazio i18n; grafo e mapa degradam sem crash.
- Personagem oculto fora de Modo edição: continua filtrado pelas regras já existentes; o painel MUST NOT revelá-lo.
- Rota sem arestas na rede: cartões vazios + mensagem; mapa sem destaque de caminho.
- Deep-link / query que pré-selecciona personagem (se já existir): abre detalhe **no painel flutuante**, não no painel de detalhe antigo.
- Teclado virtual na folha móvel: recolher ao perder foco é aceitável (paridade com Mapa).
- Qualquer UI residual de planejador embutida noutro sítio com a casca antiga MUST NOT ser o padrão visual desta feature na página Rota; a superfície canónica de planeamento é a página Rota com o painel partilhado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Em Relações, a combinação «coluna lateral fixa + painel de detalhe separado» MUST ser substituída pelo **mesmo** painel flutuante estrutural do Mapa (spec 115), hospedando busca, filtros, lista e detalhe de personagem.
- **FR-002**: Em Rota, o planejador MUST viver **dentro** desse painel flutuante partilhado (formulário no topo; resultados como cartões); MUST NOT permanecer como casca visual independente da coluna/painel antigo.
- **FR-003**: Relações e Rota MUST partilhar visualmente a mesma forma, posição e comportamento de recolha móvel do painel do Mapa.
- **FR-004**: Seleccionar personagem na lista ou no grafo MUST abrir o detalhe **no mesmo painel**; MUST NOT restar popover ou segundo painel de detalhe das telas antigas.
- **FR-005**: O palco do grafo MUST manter layout radial com foco (centro / anel interno / exterior esmaecido) e as quatro famílias de vínculo já entregues, **sem** redesenhar o algoritmo do grafo se já estiver correcto — só a casca à volta muda.
- **FR-006**: Cartões de resultado de rota MUST preservar tempo humanizado (dias+h), distância mi/km e timeline de pernoites já entregues pelo planejador actual.
- **FR-007**: Cartão de rota seleccionado MUST destacar o caminho correspondente no mapa com o acento da campanha.
- **FR-008**: O algoritmo de cálculo de rotas MUST NOT mudar nesta feature.
- **FR-009**: Lógica de API, visibilidade, Modo edição e formulários de personagem/vínculo existentes MUST permanecer; só a estrutura visual e o contentor do painel mudam.
- **FR-010**: Strings novas de UI MUST existir em pt-BR e en.

### Key Entities

- **Painel flutuante partilhado**: Contentor estrutural do Mapa reutilizado em Relações (lista↔detalhe) e Rota (formulário + cartões); no móvel, expandido vs. recolhido.
- **Selecção de relações**: Personagem activo no painel e foco no grafo.
- **Opção de rota**: Resultado calculado apresentado como cartão; selecção activa ligada ao destaque no mapa.
- **Grafo de relações**: Palco radial com famílias de vínculo — comportamento existente, casca de página alinhada ao protótipo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Capturas desktop de Relações e Rota alinhadas aos RelacoesPage / RotaPage do protótipo e ao painel do Mapa pós-115 — mesma forma/posição do painel flutuante, sem coluna flush nem painel/popover de detalhe antigo — sem diferença a olho nu para um revisor humano (claro e escuro).
- **SC-002**: Em viewport estreita, as três superfícies (Mapa, Relações, Rota) partilham o mesmo padrão de folha inferior recolhida ↔ expandida; revisão manual em &lt; 3 minutos confirma paridade de comportamento.
- **SC-003**: Em 100% dos fluxos de abrir detalhe de personagem em Relações, o detalhe abre no painel flutuante; 0 regressões para coluna fixa + painel de detalhe separados.
- **SC-004**: Após calcular rotas, seleccionar cada cartão actualiza o destaque no mapa com o acento da campanha; tempo, distância e timeline de pernoites permanecem legíveis como antes.
- **SC-005**: 100% das strings novas de casca aparecem correctamente em pt-BR e en.

## Assumptions

- Spec 115 entrega o contentor flutuante reutilizável; esta feature **não** inventa um segundo sistema de painel.
- Spec 114 já entrega o cabeçalho; Relações e Rota encaixam por baixo.
- O grafo actual (spec 105) já cobre layout com foco e as quatro famílias; confirmação na implementação: se o radial/esmaecimento já bater com o RFC/protótipo, **manter**; só ajustar casca CSS mínima se a paridade visual do palco exigir — **sem** trocar o motor de layout.
- O planejador actual (spec 106) já formata tempo, distância e pernoites; esta feature **rehost** esse conteúdo em cartões no painel, sem novo motor.
- A página Rota passa a ser a superfície canónica do planeamento com mapa + painel; qualquer aba/embutido antigo de rota noutro ecrã não define o padrão visual desta feature.
- Formulários Drawer de personagem/vínculo e confirmações de exclusão continuam a ser o veículo de escrita.
