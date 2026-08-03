# Feature Specification: Conexões entre locais no mapa

**Feature Branch**: `017-location-connections`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Quero criar uma Funcionalidade para mostrar as conexões entre os locais, exemplo: de onde os jogadors foram saindo de Altdorf? Ter uma linha conectando todos os locais quee os jogadores foram saindo de Altdorf. Mesma coisa para cada localidade."

## Clarifications

### Session 2026-08-03

- Q: Visibilidade das linhas no mapa? → A: Só no foco — linhas aparecem apenas ao selecionar/abrir um local, e somente as saídas daquele local.
- Q: Como o GM cadastra as saídas? → A: No formulário do local (lista/multi-seleção de destinos de saída).
- Q: As linhas precisam indicar direção? → A: Linha simples sem seta (sentido implícito pelo pin focado).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver para onde o grupo saiu de um local (Priority: P1)

Um jogador olha o mapa e quer entender a jornada a partir de um local (ex.: Altdorf). Ao selecionar ou abrir esse pin, ele vê linhas partindo dali até os locais para os quais o grupo saiu. O mesmo padrão vale para qualquer outra localidade. Sem um local em foco, o mapa não mostra linhas de conexão.

**Why this priority**: É a pergunta central (“para onde foram a partir daqui?”) e o valor visual da feature.

**Independent Test**: Com um local A ligado a B e C como destinos de saída, ao selecionar A o jogador vê linhas A→B e A→C; sem seleção, nenhuma linha de conexão; um local sem saídas selecionado não mostra linhas.

**Acceptance Scenarios**:

1. **Given** o local Altdorf tem saídas cadastradas para dois outros locais, **When** o jogador seleciona ou abre o pin de Altdorf, **Then** vê linhas ligando Altdorf a cada um desses destinos.
2. **Given** outro local com suas próprias saídas, **When** o jogador seleciona esse local, **Then** vê apenas as linhas que partem desse local (nenhuma saída de outros locais).
3. **Given** um local sem nenhuma saída cadastrada, **When** o jogador o seleciona, **Then** nenhuma linha de saída parte desse pin (o restante do mapa e do pin continuam normais).
4. **Given** o mapa com várias conexões cadastradas, **When** o jogador não tem nenhum local selecionado/aberto, **Then** nenhuma linha de conexão é exibida.
5. **Given** um local com saídas em foco, **When** o jogador fecha o pin / deseleciona o local, **Then** as linhas de saída desse local desaparecem.

---

### User Story 2 - GM cadastra as saídas no formulário do local (Priority: P2)

O GM, ao criar ou editar um local, escolhe naquele formulário para quais outros locais o grupo saiu dali (ex.: em Altdorf, marca os destinos X e Y). Pode adicionar, remover e corrigir essa lista após as sessões. Não há modo separado de “ligar pins” no mapa nesta feature.

**Why this priority**: Sem cadastro confiável, as linhas não refletem a campanha; o jogador não pode confiar no mapa.

**Independent Test**: Autenticado como GM, abrir o formulário de um local A, marcar destino B, salvar; em visão de jogador (após recarregar), selecionar A e ver a linha; desmarcar B no formulário, salvar, e confirmar que a linha some ao selecionar A.

**Acceptance Scenarios**:

1. **Given** o GM no formulário de criar/editar um local e existem outros locais cadastrados, **When** marca um ou mais destinos de saída e salva, **Then** as conexões de saída daquele local ficam persistidas.
2. **Given** uma saída já listada no formulário do local, **When** o GM a remove e salva, **Then** ao selecionar a origem o jogador não vê mais essa linha na próxima carga.
3. **Given** o GM tenta marcar o próprio local como destino de saída, **When** salva, **Then** o sistema não cria uma conexão inválida (auto-ligação proibida; o próprio local não é opção válida de destino).
4. **Given** dois locais A e B, **When** o GM cadastra só A→B no formulário de A (e não B→A no de B), **Then** ao focar A a linha A→B aparece; ao focar B essa saída de A não aparece (B só mostra as próprias saídas, se houver).
5. **Given** o formulário de um local sem nenhum destino marcado, **When** o GM salva, **Then** o local permanece válido e, ao selecioná-lo, nenhuma linha de saída aparece.

---

### User Story 3 - Manter o mapa legível com muitas saídas (Priority: P3)

Quando um local tem muitas saídas, o jogador ainda distingue pins, o marcador do grupo e as linhas daquele local; as linhas não atrapalham zoom/pan nem o Modo GM.

**Why this priority**: Alguns hubs da campanha (ex. cidade-base) acumulam muitas saídas; o foco deve continuar legível.

**Independent Test**: Com um local de origem com ≥5 saídas, selecioná-lo e confirmar que todas as linhas desse local aparecem e os pins/controles continuam usáveis; sem seleção, mapa limpo de linhas.

**Acceptance Scenarios**:

1. **Given** um local com muitas saídas, **When** o jogador o seleciona, **Then** todas as saídas daquele local aparecem e nenhum outro conjunto de rotas compete visualmente.
2. **Given** linhas do local focado desenhadas sobre o mapa, **When** o jogador usa zoom/pan, **Then** as linhas acompanham os pins (permanecem conectando os mesmos locais).
3. **Given** o Modo GM com placement ativo (novo pin / reposicionar), **When** está posicionando, **Then** linhas (se houver por seleção) não impedem clicar no mapa para posicionar.

---

### Edge Cases

- Destino excluído: conexões que apontavam para ele desaparecem; origem permanece válida.
- Origem excluída: todas as saídas daquele local desaparecem.
- Local reposicionado: as linhas (quando a origem está em foco) atualizam para a nova posição do pin.
- Mesma saída cadastrada duas vezes: o sistema trata como uma só (sem duplicar linha).
- Muitas saídas do mesmo local: todas são listáveis/visíveis no foco; nenhuma omitida em silêncio.
- Tela estreita: linhas do local focado continuam compreensíveis; não bloqueiam fechar o pin nem o menu.
- Destino fora da vista atual (zoom/pan): a linha ainda aponta na direção do pin destino (comportamento visual coerente com o mapa).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST representar conexões **dirigidas** de saída: de um local de origem para um local de destino (“o grupo saiu de A para B”).
- **FR-002**: Cada local MUST poder ter zero, uma ou várias saídas para outros locais distintos.
- **FR-003**: O mapa MUST desenhar uma linha **simples** (sem seta e sem rótulo na linha) entre o pin de origem e o pin de destino **somente** quando o local de origem estiver selecionado ou com o detalhe aberto, e **somente** para as saídas desse local. O sentido origem→destino fica implícito pelo pin em foco.
- **FR-004**: Ao selecionar ou abrir o detalhe de um local, o sistema MUST exibir todas as linhas de **saída** daquele local (o padrão vale para qualquer localidade, não só um exemplo como Altdorf).
- **FR-005**: Sem seleção/abertura de local, o sistema MUST NÃO exibir linhas de conexão no mapa.
- **FR-006**: Ao deselecionar ou fechar o detalhe do local, o sistema MUST ocultar as linhas que estavam visíveis por causa desse foco.
- **FR-007**: Apenas o GM autenticado MUST poder criar, alterar e remover conexões; jogadores só visualizam (quando um local está em foco).
- **FR-008**: O GM MUST gerenciar destinos de saída **no formulário do local** (seleção entre locais já existentes); não há modo de ligação por clique nos pins nesta feature; não criar destino “fantasma” sem pin.
- **FR-009**: O sistema MUST rejeitar auto-conexão (origem = destino) e MUST evitar duplicatas da mesma origem→destino; o próprio local MUST NOT aparecer como destino selecionável no formulário.
- **FR-010**: Exclusão de um local MUST remover conexões em que ele seja origem ou destino, sem quebrar o mapa.
- **FR-011**: Conexões NÃO criam automaticamente o sentido inverso; B→A só existe se o GM cadastrar.

### Key Entities

- **Local**: Ponto já existente no mapa (origem ou destino de uma saída).
- **Conexão de saída (rota)**: Vínculo dirigido origem → destino, significando que o grupo saiu da origem em direção ao destino; pertence à campanha e é editável pelo GM.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em um cenário de teste com Altdorf ligado a N destinos (N ≥ 2), um jogador identifica corretamente todos os N destinos de saída em menos de 30 segundos ao focar Altdorf.
- **SC-002**: O mesmo comportamento de SC-001 se reproduz para qualquer outro local com saídas (amostra de ≥3 locais de origem no teste).
- **SC-003**: O GM cadastra ou remove uma saída e o jogador vê o resultado após recarregar a página e focar a origem, em fluxo completo em menos de 2 minutos.
- **SC-004**: Com um hub de ≥5 saídas em foco (e ≥10 conexões cadastradas no total na campanha), zoom/pan e abertura/fechamento de pin continuam utilizáveis; sem foco, o mapa não mostra linhas.
- **SC-005**: 100% das conexões de saída do local focado aparecem; nenhuma saída válida daquele local fica oculta; conexões de outros locais não aparecem nesse foco.

## Assumptions

- Conexões são **cadastradas pelo GM no formulário do local** (não inferidas automaticamente por data de sessão, ordem de arco ou distância no mapa; sem modo de ligar pins no mapa nesta feature).
- O significado é jornada do grupo / campanha (“para onde saíram daqui”), não estradas geográficas reais do Old World.
- Linhas são **simples** (sem seta, sem rótulo na linha) entre pins; não precisam seguir caminhos do mapa-base. Sentido implícito: partem do local em foco.
- Visibilidade (clarificada): **somente no foco** do local de origem; não há overlay permanente de todas as rotas.
- Sentido único no foco: mostram-se **saídas** do local selecionado; ver “quem chega aqui” exige focar as origens correspondentes (não há modo “entradas” nesta feature).
- Jogadores veem mudanças após recarregar/reabrir a página (sem sync ao vivo).
- Fora de escopo nesta feature: animação de viagem, legendas de distância/tempo na linha, setas ou rótulos sobre a linha, múltiplos tipos de rota (barco/estrada), edição em massa por importação, visão geral permanente de todas as rotas, e cadastro de conexões por clique no mapa.
