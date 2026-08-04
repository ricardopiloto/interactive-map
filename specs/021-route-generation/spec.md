# Feature Specification: Geração de rotas de viagem

**Feature Branch**: `021-route-generation`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Leia o documento docs/prd-mapa-campanha-rpg(3).md e gere uma nova spec para a funcionalidade de geração de rotas" (fonte: seção 12 — Rotas & Tempo de Viagem).

## Clarifications

### Session 2026-08-03

- Q: Com uma rota selecionada, as alternativas aparecem no mapa? → A: Escolhida destacada + alternativas discretas/tracejadas no mapa.
- Q: Segmentos de via são bidirecionais ou dirigidos? → A: Bidirecionais por padrão — um segmento vale nos dois sentidos.
- Q: Como o GM acessa a tela de digitalização? → A: Modo/vista GM dedicada no mesmo app (entrada pelo Modo GM).
- Q: Ao calcular, auto-selecionar a rota mais rápida no mapa? → A: Sim — a mais rápida já fica selecionada/destacada; demais discretas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Planejar viagem entre locais conhecidos (Priority: P1)

Como jogador, na mesma tela do mapa que já uso, quero escolher origem e destino entre locais conhecidos que fazem parte da rede de vias, escolher um ritmo de viagem e ver **várias rotas possíveis** ordenadas da mais rápida à mais lenta (distância e tempo), e destacar uma delas no mapa — para estimar quanto tempo a jornada vai levar entre sessões.

**Why this priority**: É o valor principal da extensão para quem consulta o codex; sem o planejamento no mapa do jogador, o grafo digitalizado não serve ao público.

**Independent Test**: Com a rede já digitalizada e dois locais ligados a nós da rede (ex. Altdorf → Ubersreik), abrir “Calcular rota”, escolher De/Para e um ritmo; ver lista ordenada por tempo; clicar uma rota e vê-la desenhada no mapa com pins ainda visíveis.

**Acceptance Scenarios**:

1. **Given** existem pelo menos duas rotas distintas possíveis entre origem e destino na rede, **When** o jogador solicita o cálculo com um ritmo, **Then** vê uma lista de rotas ordenada da mais rápida para a mais lenta, cada uma com distância (milhas) e tempo total, e a **mais rápida já está selecionada** (destacada no mapa; demais discretas/tracejadas).
2. **Given** a lista de rotas está visível com a mais rápida selecionada, **When** o jogador seleciona outra rota da lista, **Then** essa rota passa a ser a destacada e as demais (incluindo a anterior) ficam discretas/tracejadas; pins de locais continuam visíveis.
3. **Given** há rotas alternativas além da selecionada, **When** uma rota está selecionada, **Then** a escolhida fica **destacada** no mapa e as demais aparecem de forma **discreta/tracejada** (ainda visíveis para comparar opções sem poluir).
4. **Given** o seletor De/Para, **When** o jogador abre as opções, **Then** só aparecem locais que estão vinculados a um nó da rede de navegação (locais sem vínculo não são opções).
5. **Given** origem e destino iguais ou sem caminho na rede, **When** o jogador calcula, **Then** recebe um resultado compreensível (nenhuma rota / mensagem clara), sem quebrar o mapa.

---

### User Story 2 - Digitalizar a rede de vias (Priority: P2)

Como GM autenticado, quero uma **vista dedicada no Modo GM** (separada da visualização de lore/pins de local) para criar nós e traçar segmentos de estrada, rio ou trilha sobre o mapa, persistindo no sistema — para montar a rede que os jogadores usam no cálculo.

**Why this priority**: Sem a rede digitalizada, o cálculo do jogador não tem dados; é pré-requisito operacional, mas o “produto” visível aos jogadores é a US1.

**Independent Test**: Entrar no Modo GM → abrir a vista de digitalização de rotas; criar dois nós; traçar um segmento com pontos intermediários e tipo; salvar; confirmar que o planejamento do jogador passa a usar esse segmento.

**Acceptance Scenarios**:

1. **Given** o GM autenticado abre a vista de digitalização de rotas pelo Modo GM, **When** a vista carrega, **Then** vê o mapa de fundo **sem** a camada de pins de lore de locais — apenas nós e segmentos da rede de navegação.
2. **Given** a tela de digitalização, **When** o GM clica no mapa para criar um nó, **Then** pode opcionalmente nomeá-lo e vinculá-lo a um Local existente.
3. **Given** nós existentes, **When** o GM define um extremo → pontos intermediários ao longo da via desenhada no mapa → outro extremo, escolhe o tipo (estrada, rio ou trilha) e salva, **Then** o segmento fica persistido, **bidirecional** (válido nos dois sentidos) e visível na tela de digitalização.
4. **Given** um segmento salvo, **When** o GM o revisita, **Then** pode editar ou remover o segmento / nós conforme regras de integridade (sem deixar a rede em estado inconsistente sem aviso).
5. **Given** jogador não autenticado, **When** tenta acessar a digitalização (vista GM de rotas), **Then** não consegue editar a rede (mesma proteção de escrita do Modo GM).

---

### User Story 3 - Tempo coerente com escala e tipo de via (Priority: P3)

Como jogador (e GM), quero que distância e tempo reflitam a escala calibrada do mapa e o tipo/modificador da via e o ritmo escolhido — para confiar nos números ao planejar a sessão.

**Why this priority**: Sem calibração e regras de tempo, as rotas são só desenhos; a credibilidade da feature depende disso.

**Independent Test**: Com escala calibrada e um segmento de estrada conhecido, calcular uma rota no ritmo padrão e verificar distância/tempo plausíveis; mudar ritmo e ver o tempo mudar na direção esperada (mais cauteloso → mais lento).

**Acceptance Scenarios**:

1. **Given** a escala do mapa está calibrada (milhas por unidade de mapa), **When** um segmento é salvo ou recalculado, **Then** sua distância em milhas deriva do comprimento do traçado na escala.
2. **Given** segmentos com tipos diferentes (estrada / rio / trilha) e modificadores associados, **When** o cálculo monta o tempo de uma rota, **Then** aplica o ritmo escolhido e os modificadores dos tipos ao longo do caminho.
3. **Given** o jogador altera o ritmo e recalcula a mesma origem/destino, **When** os resultados aparecem, **Then** a ordem e/ou os tempos refletem o novo ritmo (sem exigir comparar vários ritmos lado a lado na mesma tela).

---

### Edge Cases

- Segmento dirigido / sentido único de rio: fora do MVP (segmentos são bidirecionais).
- Rede com ciclos: o sistema limita o número de rotas retornadas a um máximo razoável (várias alternativas, não um número explosivo).
- Destino/origem sem nó vinculado: não listados no seletor do jogador.
- Nó “cruzamento” sem Local: participa do caminho, mas não aparece sozinho como destino “lore” no seletor De/Para.
- Segmento com poucos ou nenhum ponto intermediário: ainda é uma aresta válida (linha reta entre nós).
- Exclusão de Local vinculado a um nó: o vínculo some ou o nó permanece como ponto de rede (sem lore); o planejamento não quebra.
- Zoom/pan no mapa do jogador com rota desenhada: o traçado acompanha o mapa como os demais overlays.
- Convivência com linhas de **saída narrativa** entre locais (feature já existente): overlays distintos — rotas de viagem ≠ saídas de história; não se misturam no mesmo significado.
- Mobile: seletor De/Para e lista de rotas usáveis; desenho da rota permanece legível.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST manter uma rede de navegação composta por **nós** (waypoints) e **segmentos** (arestas) entre nós, independente da lore dos Locais.
- **FR-002**: Um nó MUST poder existir sem Local vinculado; um Local MUST poder ser vinculado a no máximo um nó (ou a um nó dedicado) para participar do seletor de rotas do jogador.
- **FR-003**: Um segmento MUST ter dois nós (extremidades), tipo (estrada | rio | trilha), traçado (incluindo pontos intermediários opcionais) e distância em milhas derivada da escala + comprimento do traçado; MUST poder ter modificador de velocidade associado ao tipo (ou ao segmento). O segmento MUST ser **bidirecional** no cálculo de rotas (percorrível nos dois sentidos) no MVP.
- **FR-004**: O GM autenticado MUST poder abrir, pelo **Modo GM**, uma **vista dedicada de digitalização** (não misturada com edição de pins de lore) para criar, editar e remover nós e segmentos, com o mapa sem pins de lore de Local.
- **FR-005**: Jogadores MUST NÃO poder criar ou alterar a rede de navegação.
- **FR-006**: Na tela principal do mapa (jogador), o sistema MUST oferecer um fluxo “Calcular rota” com origem, destino e ritmo, usando apenas Locais vinculados a nós.
- **FR-007**: O cálculo MUST retornar **múltiplas** rotas possíveis entre origem e destino (quando existirem), ordenadas da mais rápida para a mais lenta, cada uma com distância total e tempo total — limitado a um máximo configurável de alternativas (ex. poucas unidades).
- **FR-008**: Ao concluir um cálculo com ≥1 rota, o sistema MUST **auto-selecionar a mais rápida**, desenhá-la **destacada** sobre o mapa e desenhar as demais retornadas de forma **discreta/tracejada**; o jogador MUST poder mudar a seleção pela lista. Pins de Local permanecem visíveis.
- **FR-009**: O sistema MUST usar uma escala calibrada (pixels/unidades de mapa → milhas) para distâncias; a calibração é responsabilidade do GM/operador (não do jogador).
- **FR-010**: O tempo de cada rota MUST considerar ritmo de viagem escolhido e modificadores dos tipos de via no caminho.
- **FR-011**: A feature MUST NÃO exigir clima, estação, múltiplos veículos, nem comparação simultânea de vários ritmos na mesma vista (fora do MVP).
- **FR-012**: Escrita da rede (nós/segmentos) MUST usar a mesma barreira de autenticação GM já usada para demais escritas admin.

### Key Entities

- **Nó de navegação (Waypoint)**: Ponto na rede; coordenadas relativas 0–1; nome opcional; vínculo opcional a um Local.
- **Segmento de rota (RouteSegment)**: Ligação **bidirecional** entre dois nós; tipo (estrada/rio/trilha); pontos intermediários; distância em milhas; modificador de velocidade.
- **Rota calculada**: Sequência de nós entre origem e destino, com distância e tempo agregados e tipos de via envolvidos.
- **Escala do mapa**: Fator de conversão para milhas (calibrado a partir de referência do lore).
- **Ritmo de viagem**: Modo único por cálculo (ex. cauteloso / normal / arriscado) que altera a velocidade base usada no tempo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com rede mínima (origem, destino e ≥2 caminhos distintos), o jogador obtém lista ordenada por tempo com a mais rápida já destacada no mapa (alternativas discretas) em ≤1 minuto sem ajuda.
- **SC-002**: Em revisão com o GM, digitalizar um novo segmento (dois nós + traçado + tipo) e vê-lo refletido num cálculo de jogador leva ≤5 minutos.
- **SC-003**: Para um par origem/destino com ≥2 rotas, 2 observadores classificam corretamente qual item da lista é o mais rápido **e** distinguem no mapa a rota destacada das alternativas discretas em ≤15 segundos.
- **SC-004**: Alterar o ritmo e recalcular muda o tempo reportado na direção esperada (mais cauteloso ≥ tempo do ritmo mais rápido) em pelo menos um par de teste documentado.
- **SC-005**: Tentativa de acesso à digitalização sem autenticação GM falha (sem edição da rede).

## Assumptions

- Seleção após cálculo (clarificada): **auto-seleciona a rota mais rápida**; jogador pode trocar pela lista (FR-008).
- Overlay de rotas (clarificado): rota selecionada **destacada**; alternativas do mesmo cálculo **discretas/tracejadas** no mapa (não só na lista).
- Fonte de requisitos: PRD `docs/prd-mapa-campanha-rpg(3).md` §12; resto do PRD (codex base) já entregue — esta spec é só a extensão de rotas.
- Segmentos (clarificado): **bidirecionais** no MVP — um traçado serve nos dois sentidos; sentido único (ex. rio a favor) fica fora do MVP.
- Rede desacoplada das **saídas narrativas** entre locais já existentes no produto; não as substitui.
- Ritmos MVP: pelo menos **cauteloso**, **normal** e **arriscado** (um por cálculo); velocidades base fixas definidas na implementação/plano.
- Máximo de rotas alternativas retornadas: da ordem de **3–5** (k caminhos), para resposta útil sem explosão combinatória.
- Calibração de escala: uma configuração global (ou seed) baseada em duas referências do lore WFRP; não é fluxo contínuo do jogador.
- Tela de digitalização (clarificada): **vista dedicada no mesmo app**, acessível via **Modo GM** (não aba misturada com pins de lore; não exige admin isolado na borda além da auth GM já existente).
- Protótipo HTML de digitalização citado no PRD serve de referência de UX; a entrega é integrada ao app, não ferramenta isolada.
- Fora do MVP (registrado): clima/estação, frota de veículos, fog of war nos nós, comparar ritmos lado a lado, múltiplos mapas.
