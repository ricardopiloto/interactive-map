# Feature Specification: Calcular Rota entre Quaisquer Nós da Rede

**Feature Branch**: `028-route-any-waypoint`  
**Created**: 2026-08-03  
**Status**: Draft  
**Input**: User description: "O calculador não pode estar associado aos locais, ou seja, eu posso conseguir calcular a rota de qualquer nó cadastrado no mapa sem que ele esteja necessariamente linkado a um local"

## Clarifications

### Session 2026-08-03

- Q: Como rotular cada nó na lista do calculador? → A: Nome do nó; se vazio, nome do Local vinculado; senão “Nó {id}”
- Q: A entrada do cálculo aceita ainda IDs de Local? → A: Só IDs de nó (corte limpo; UI lista só nós)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escolher origem e destino entre todos os nós (Priority: P1)

Como jogador ou Mestre, quero calcular uma rota escolhendo **qualquer nó** da rede de rotas como origem e destino, **mesmo que esse nó não esteja ligado a um Local** do mapa de lore.

**Why this priority**: Hoje o calculador só oferece (ou só aceita) locais com nó vinculado; nós “puros” da rede (ex. cruzamentos) ficam inutilizáveis para planeamento de viagem.

**Independent Test**: Com pelo menos um nó sem Local e um nó com Local (ou dois sem Local) ligados por segmentos, abrir Calcular rota → selecionar esses nós → obter rota(s) ou mensagem clara se não houver caminho.

**Acceptance Scenarios**:

1. **Given** existem nós na rede (com e/ou sem Local), **When** o utilizador abre o calculador, **Then** a lista de origem/destino inclui **todos** os nós cadastrados, não só os associados a Locais.
2. **Given** origem e destino são dois nós distintos sem vínculo a Local, **When** calcula, **Then** o sistema devolve rotas válidas pela rede (ou indica que não há caminho), sem exigir associação a Local.
3. **Given** um nó ligado a um Local e outro sem Local, **When** calcula entre eles, **Then** o cálculo funciona da mesma forma que entre quaisquer outros dois nós.
4. **Given** o utilizador tenta calcular, **When** escolhe o mesmo nó como origem e destino, **Then** recebe um erro claro e não é pedido um cálculo.
5. **Given** o painel Calcular rota aberto, **When** o utilizador inspeciona origem/destino, **Then** as opções são **nós**, não uma lista de Locais.

---

### User Story 2 - Identificar nós na lista sem depender do nome do Local (Priority: P2)

Como utilizador do calculador, quero reconhecer cada nó na lista pelo **nome do nó** (ou identificador legível), para não depender do nome de um Local que pode não existir.

**Why this priority**: Nós sem Local precisam de rótulo útil; nós com Local podem continuar a ser reconhecíveis.

**Independent Test**: Abrir o calculador e verificar que cada opção mostra um rótulo compreensível (nome do nó ou fallback); nós sem Local não aparecem vazios ou omitidos.

**Acceptance Scenarios**:

1. **Given** um nó com nome próprio e sem Local, **When** aparece na lista, **Then** o rótulo usa esse nome.
2. **Given** um nó sem nome e sem Local, **When** aparece na lista, **Then** usa o fallback “Nó {id}”.
3. **Given** um nó sem nome mas com Local vinculado, **When** aparece na lista, **Then** o rótulo usa o **nome do Local**.
4. **Given** um nó com nome próprio e Local vinculado, **When** aparece na lista, **Then** o rótulo usa o **nome do nó** (não substitui pelo Local).

---

### Edge Cases

- Rede vazia ou um único nó: listas vazias / incompletas; cálculo impossível com mensagem clara.
- Dois nós sem caminho na rede: mensagem do tipo “nenhuma rota encontrada” (já existente na ideia do produto), sem culpar “falta de Local”.
- Nó apagado após abertura do painel: falha graciosa no cálculo.
- Vínculo Local↔nó continua a existir na digitalização/GM para outros fins; só o **calculador** deixa de exigir esse vínculo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O calculador de rotas DEVE permitir escolher origem e destino entre **todos os nós** da rede de rotas cadastrados, independentemente de estarem ou não associados a um Local.
- **FR-002**: O pedido de cálculo DEVE identificar origem e destino **apenas por nós** da rede (não por Locais). Não há modo paralelo de “escolher Local” no calculador.
- **FR-003**: Nós **sem** Local associado DEVEM ser selecionáveis e utilizáveis no cálculo, nas mesmas condições que nós com Local.
- **FR-004**: A interface do calculador NÃO DEVE listar Locais como opções de origem/destino — apenas nós.
- **FR-005**: Mensagens de erro e listas DEVEM falar em termos de **nós / rede** (ou equivalentes claros), não exigir “Local sem waypoint” como pré-condição do cálculo entre pontos da rede.
- **FR-006**: Ritmo, velocidade média, listagem de alternativas e desenho da rota no mapa DEVEM continuar a funcionar após a mudança de seleção (comportamento de viagem inalterado, só muda **quem** se pode escolher).
- **FR-007**: A associação opcional nó↔Local (na gestão da rede / digitalização) PODE permanecer; esta feature **não** remove essa ligação — apenas desacopla o calculador dela.
- **FR-008**: O rótulo de cada opção no calculador DEVE seguir esta prioridade: (1) nome do nó, se preenchido; (2) senão, nome do Local vinculado, se existir; (3) senão, “Nó {id}”.
- **FR-009**: O sistema NÃO DEVE aceitar Locais como identificadores de origem/destino no fluxo do calculador (corte limpo para nós).

### Key Entities

- **Nó (waypoint)**: Ponto da rede de rotas; pode ter nome; pode opcionalmente referenciar um Local.
- **Local**: Entidade de lore no mapa; **não** é obrigatória para participar no cálculo de viagem.
- **Segmento**: Ligação entre dois nós; base do caminho calculado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste com ≥1 nó sem Local ligado à rede, o utilizador consegue selecioná-lo como origem ou destino em ≤ 10 segundos após abrir o calculador.
- **SC-002**: Em ≥ 9 de 10 tentativas, calcular entre dois nós sem Local (quando existe caminho) devolve pelo menos uma rota sem erro de “sem waypoint / sem Local”.
- **SC-003**: 100% dos nós existentes na rede aparecem como opções de origem/destino (salvo filtros explícitos futuros — nesta entrega: **nenhum** filtro por Local).
- **SC-004**: Calculadoras entre pares que já funcionavam via Local continuam a produzir rotas equivalentes quando os mesmos nós da rede são escolhidos (≥ 1 par de verificação no quickstart).

## Assumptions

- “Calculador” = painel Calcular rota do mapa (jogador/Mestre), não a digitalização GM.
- A intenção é **desacoplar a UI e a entrada do cálculo dos Locais**, não eliminar Locais do produto.
- Entrada do cálculo = **só nós** (clarificação A); sem dual Local/nó.
- Rótulo na lista (clarificação A): **nome do nó** → se vazio, **nome do Local** vinculado → senão **“Nó {id}”**.
- Não é obrigatório nesta entrega um mapa clicável para escolher origem/destino — listas/selects bastam, desde que listem nós.
- Autenticação e quem vê o calculador permanecem como hoje.

## Out of Scope

- Remover o campo de vínculo Local nos nós / digitalização.
- Recalcular ou redesenhar a lógica de pathfinding (ritmo, tipos de via, etc.) além do necessário para aceitar IDs de nó.
- Cálculo entre Locais sem nó (continua impossível: sem nó na rede não há vértice).
- Multi-destino ou waypoints intermédios obrigatórios no pedido de cálculo.
