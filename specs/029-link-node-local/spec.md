# Feature Specification: Vincular Nó a Local Após a Criação

**Feature Branch**: `029-link-node-local`  
**Created**: 2026-08-03  
**Status**: Draft  
**Input**: User description: "Precisamos ter, de alguma maneira, a opção de vincular nó com local, depois do nó criado. Isso será utilizado no cenário do nó ser criado antes de eu ter dados sobre o local, então primeiro crio o nó, e depois que os jogadores forem para lá ou conhecerem da existencia do local, o local será criado no mapa também."

## Clarifications

### Session 2026-08-03

- Q: Ao vincular nó ↔ Local, as coordenadas devem sincronizar? → A: Sim — o pin do Local passa para a posição do nó
- Q: Onde o Mestre edita o vínculo nesta entrega? → A: Rede de rotas e no formulário de Local (criar/editar Local escolhendo um nó)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ligar um nó existente a um Local novo ou já criado (Priority: P1)

Como Mestre, crio primeiro um **nó** na rede (sem Local), porque o sítio ainda não é conhecido/visitado. Mais tarde, quando crio o **Local** no mapa de lore, quero **vincular** esse nó ao Local sem apagar nem recriar o nó.

**Why this priority**: Fluxo real de campanha — a rede de viagem antecipa o lore; o vínculo hoje só na criação do nó obriga a recriar ou deixar nós órfãos de Local.

**Independent Test**: Criar nó sem Local → criar Local → associar (Rede ou formulário do Local) → vínculo gravado, Local na posição do nó, segmentos intactos.

**Acceptance Scenarios**:

1. **Given** um nó sem Local e um Local ainda sem nó vinculado, **When** o Mestre associa o nó a esse Local, **Then** o vínculo fica persistido, o nó mostra-se ligado a esse Local, e o **pin do Local move-se para as coordenadas do nó**.
2. **Given** um nó já ligado a um Local, **When** o Mestre altera o vínculo para outro Local livre, **Then** o novo vínculo substitui o anterior e o **novo** Local é reposicionado na posição do nó (o Local anterior deixa de estar vinculado; a sua posição não é revertida automaticamente).
3. **Given** um nó ligado a um Local, **When** o Mestre remove o vínculo (fica sem Local), **Then** o nó permanece na rede, o Local deixa de ter esse nó associado, e a **posição do Local permanece** onde estava (não volta atrás).
4. **Given** um Local que já tem outro nó vinculado, **When** o Mestre tenta ligar um segundo nó a esse Local, **Then** a ação é rejeitada com mensagem clara (um Local ↔ no máximo um nó) e **nenhuma** posição é alterada.

---

### User Story 2 - Editar o vínculo na Rede e no formulário de Local (Priority: P2)

Como Mestre, quero poder definir o vínculo **tanto** ao gerir um nó na Rede de rotas **como** ao criar/editar um Local (escolhendo um nó livre), para o fluxo “nó primeiro, Local depois” ser natural nos dois sítios.

**Why this priority**: Completa o cenário de campanha — o Local nasce depois do nó e o Mestre associa no próprio formulário do Local.

**Independent Test**: (1) Rede de rotas → editar vínculo do nó. (2) Criar/editar Local → escolher nó → gravar → Local na posição do nó e vínculo visível na lista de nós.

**Acceptance Scenarios**:

1. **Given** a lista de nós na Rede de rotas, **When** o Mestre edita o vínculo de um nó, **Then** pode escolher entre “Sem Local” e os Locais elegíveis (não já tomados por outro nó, mais o Local atualmente ligado a este nó).
2. **Given** o formulário de criar ou editar Local, **When** o Mestre escolhe um nó elegível (sem Local, ou o já ligado a este Local) e grava, **Then** o vínculo fica gravado e o pin do Local fica nas coordenadas desse nó.
3. **Given** o fluxo “Novo nó”, **When** o Mestre cria um nó, **Then** continua a poder opcionalmente ligar um Local na criação (comportamento atual não é removido).
4. **Given** um nó sem nome e depois ligado a um Local, **When** o calculador de rotas lista esse nó, **Then** o rótulo pode usar o nome do Local (regra já definida noutra entrega), sem exigir renomear o nó.
5. **Given** o formulário de Local, **When** a lista de nós elegíveis é mostrada, **Then** não oferece nós já ligados a **outro** Local (exceto o nó atualmente ligado a este Local, se houver).

---

### Edge Cases

- Local apagado: o nó não deve ficar com referência inválida (vínculo limpo ou tratado de forma segura, alinhado ao comportamento já existente ao apagar Local).
- Nó com segmentos: vincular/desvincular Local **não** apaga segmentos nem muda a geometria da rede.
- Posições: ao **criar ou alterar** o vínculo para um Local, o pin desse Local DEVE passar para as coordenadas do nó (clarificação B). Desvincular **não** move o Local de volta. O nó **não** muda de posição por causa do vínculo.
- Lista de Locais elegíveis vazia: ainda é possível deixar o nó sem Local; mensagem clara se tentar ligar a um Local inválido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O Mestre DEVE poder associar um nó **já existente** a um Local, sem recriar o nó.
- **FR-002**: O Mestre DEVE poder alterar ou remover (limpar) o Local associado a um nó existente.
- **FR-003**: Um Local NÃO DEVE ficar vinculado a mais de um nó; tentativas em conflito DEVEM falhar com feedback compreensível.
- **FR-004**: Vincular ou desvincular NÃO DEVE remover nós, segmentos ou Locais; só altera a associação (e, ao vincular/alterar, a posição do Local conforme FR-008).
- **FR-005**: A criação de nó com Local opcional (fluxo atual) DEVE continuar disponível.
- **FR-006**: A interface DEVE permitir editar o vínculo em **dois** sítios: (1) gestão da Rede de rotas, para nós já criados; (2) formulário de criar/editar **Local**, escolhendo um nó elegível (ou “Sem nó”).
- **FR-007**: Após gravar o vínculo (por qualquer dos sítios), o estado DEVE refletir-se na lista de nós e no Local correspondente.
- **FR-008**: Ao associar ou reassociar um nó a um Local, o sistema DEVE atualizar as coordenadas do Local para coincidirem com as do nó. Desvincular NÃO DEVE alterar coordenadas. O nó NÃO DEVE ser movido por esta operação.
- **FR-009**: No formulário de Local, a escolha de nó DEVE listar apenas nós sem Local, mais o nó já ligado a este Local (se existir); “Sem nó” limpa o vínculo deste Local.

### Key Entities

- **Nó (waypoint)**: Ponto da rede; pode ter `Local` opcional.
- **Local**: Pin de lore no mapa; no máximo um nó associado.
- **Vínculo nó↔Local**: Associação opcional, editável ao longo da campanha.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste do fluxo “nó primeiro, Local depois”, o Mestre completa o vínculo em ≤ 2 minutos após o Local existir, sem apagar o nó.
- **SC-002**: Em ≥ 9 de 10 tentativas, ligar um nó livre a um Local livre grava e mostra o vínculo corretamente após recarregar a Rede de rotas.
- **SC-003**: 100% das tentativas de ligar um segundo nó a um Local já ocupado são bloqueadas com mensagem clara (sem dados inconsistentes).
- **SC-005**: Após vincular com sucesso, a posição do Local no mapa coincide com a do nó (verificação visual ou por coordenadas) em ≥ 9 de 10 casos.

## Assumptions

- Utilizador desta feature: **Mestre** (gestão da Rede de rotas / digitalização), não o jogador no calculador.
- O cenário principal é: nó criado sem Local → Local criado mais tarde → vínculo na Rede **ou** no formulário do Local (clarificação B).
- Ao vincular/reassociar, o **Local é reposicionado para o nó** (clarificação B); desvincular não reverte a posição do Local.
- A regra “um Local ↔ no máximo um nó” já é a regra de negócio desejada e mantém-se.

## Out of Scope

- Fusão automática de nós duplicados.
- Mover o nó para a posição do Local (o inverso da clarificação B).
- Remover a possibilidade de criar nó já com Local.
- Alterar o calculador de rotas (já trabalha por nós).
- Jogadores a editar vínculos.
