# Feature Specification: Map Pick Route Cities

**Feature Branch**: `060-map-pick-route-cities`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "Vamos criar uma nova funcionalidade, o usuário poderá selecionar a cidade para onde ele quer ir, isso é para facilitar a seleção das cidades no mapa diretamente, sem o usuário ter que digitar no campo em Calcular Rota. Não precisa mostrar para o usuário a zona clicável, se a cidade tiver um node, ele consegue clicar, senão, nada acontece."

## Clarifications

### Session 2026-08-05

- Q: Qual campo recebe cada clique no mapa (De vs Para)? → A: 1.º clique elegível → De; 2.º → Para; cliques seguintes substituem Para
- Q: Com Calcular rota aberto, o clique no pin abre o modal do Local? → A: Pin com nó: só preenche De/Para (sem modal); pin sem nó: abre o modal como hoje
- Q: Como misturar combobox e clique no mapa? → A: Baseado no estado dos campos: De vazio → preenche De; De preenchido → preenche/substitui Para

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escolher origem/destino no mapa (Priority: P1)

Com o painel **Calcular rota** aberto, o utilizador clica num pin de cidade/local no mapa que tenha um nó da rede de rotas associado. O sistema preenche o campo correspondente em Calcular rota (De / Para), sem o utilizador precisar de digitar ou procurar no combobox. Não há destaque visual de “zona clicável” extra — o alvo é o pin já existente.

**Why this priority**: É o valor principal pedido — selecção espacial em vez de texto.

**Independent Test**: Abrir Calcular rota; clicar num pin com nó; ver De ou Para actualizado com o nome dessa cidade; calcular rota a partir daí.

**Acceptance Scenarios**:

1. **Given** Calcular rota aberto, De vazio, e um Local com nó, **When** o utilizador clica nesse pin, **Then** **De** fica preenchido com essa cidade.
2. **Given** Calcular rota aberto e De já preenchido, **When** o utilizador clica noutro pin com nó, **Then** **Para** fica preenchido (ou substituído se já tinha valor).
3. **Given** Calcular rota aberto, **When** o utilizador clica num pin **sem** nó de rota associado, **Then** De/Para **não** mudam e o **detalhe do Local** abre como hoje.
4. **Given** Calcular rota aberto e um pin **com** nó, **When** o utilizador clica nesse pin, **Then** De ou Para actualiza-se (FR-007) e o **modal do Local NÃO** abre.
5. **Given** Calcular rota **fechado**, **When** o utilizador clica pins, **Then** o comportamento actual do mapa (detalhe do local, etc.) **MUST NOT** ser alterado por esta feature — a selecção para rota só actua com o painel aberto.
6. **Given** Calcular rota aberto, **When** o utilizador observa o mapa, **Then** **não** há overlays/halos/zonas novas a indicar “clicável para rota”; só os pins já existentes.

---

### User Story 2 - Completar De e Para sem teclado (Priority: P1)

O utilizador consegue definir **ambos** De e Para clicando no mapa (dois cliques em cidades com nó), e depois premir Calcular — sem usar os comboboxes, embora estes permaneçam disponíveis.

**Why this priority**: “Cidades” no plural nos campos De/Para; o fluxo completo no mapa é o objectivo.

**Independent Test**: Com painel aberto, definir origem e destino só com cliques no mapa; Calcular produz rotas.

**Acceptance Scenarios**:

1. **Given** De e Para vazios, **When** o utilizador clica dois pins distintos com nó (nesta ordem), **Then** De e Para ficam preenchidos com essas cidades.
2. **Given** De e Para já preenchidos via mapa, **When** o utilizador clica Calcular, **Then** o cálculo funciona igual a ter escolhido as mesmas cidades no combobox.
3. **Given** De e Para preenchidos, **When** o utilizador clica um terceiro pin com nó, **Then** só **Para** é substituído (De mantém-se).
4. **Given** De preenchido via **combobox** e Para vazio, **When** o utilizador clica um pin com nó, **Then** **Para** é preenchido (De não é sobrescrito).
5. **Given** comboboxes ainda visíveis, **When** o utilizador prefere digitar/seleccionar na lista, **Then** o fluxo actual de texto **MUST** continuar a funcionar (mapa é atalho, não substituto exclusivo).
6. **Given** De preenchido, **When** o utilizador limpa De no combobox e depois clica um pin com nó, **Then** esse clique preenche **De** de novo.
---

### User Story 3 - Feedback discreto e coerência (Priority: P2)

Após um clique válido no mapa, o utilizador reconhece qual campo foi actualizado (De vs Para) sem UI extra de zonas. Clicar de novo pode corrigir a escolha conforme a regra de preenchimento.

**Why this priority**: Evita confusão sobre “para onde foi o clique”.

**Independent Test**: Clicar duas cidades; observar De/Para; clicar terceira conforme regra; campos coerentes.

**Acceptance Scenarios**:

1. **Given** um clique válido, **When** o campo é actualizado, **Then** o valor mostrado em De ou Para corresponde ao Local/nó clicado (nome reconhecível).
2. **Given** a regra baseada no estado (De vazio → De; De preenchido → Para), **When** o utilizador clica outra cidade elegível, **Then** o campo correcto é actualizado sem estado inconsistente (origem = destino inválido tratado como hoje ao Calcular).
3. **Given** pin com nó e painel aberto, **When** o clique actualiza De ou Para, **Then** o modal do Local **não** aparece.

---

### Edge Cases

- Local sem nó (painel aberto): De/Para inalterados; modal do Local abre como hoje.
- Local com nó (painel aberto): preenche De/Para; modal do Local **não** abre.
- Limpar De (combobox) e clicar de novo: esse clique volta a preencher De.
- De já preenchido via combobox: próximo clique elegível preenche Para (não sobrescreve De).
- Mesmo pin duas vezes: ao Calcular, a validação actual (“origem e destino devem ser diferentes”) aplica-se.
- Painel fechado a meio: cliques voltam ao comportamento normal do mapa.
- Zoom/pan: clique no pin continua a seleccionar para rota (não confundir com arrastar o mapa).
- GM placement / digitizer activo: fora de âmbito — não misturar com modos de edição de pin/rede.
- Cidade com nó mas sem pin visível: fora de âmbito desta feature (alvo = pins de Local existentes).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Com **Calcular rota** aberto, um clique num pin de Local que tenha **nó da rede de rotas** associado MUST preencher De ou Para conforme FR-007.
- **FR-002**: Com Calcular rota aberto, clique num pin **sem** nó associado MUST **não** alterar De/Para; o detalhe do Local MUST abrir como quando o painel está fechado.
- **FR-003**: A feature MUST **não** introduzir visualização de zonas clicáveis, halos ou hit-areas dedicadas além dos pins já existentes.
- **FR-004**: Com Calcular rota **fechado**, cliques no mapa MUST preservar o comportamento actual (detalhe do local, etc.).
- **FR-005**: Os campos De/Para MUST continuar seleccionáveis por combobox/teclado; o mapa é um atalho complementar.
- **FR-006**: Valores preenchidos via mapa MUST ser os mesmos identificadores de nó que o combobox usaria (cálculo idêntico).
- **FR-007**: Regra de preenchimento (estado dos campos): com Calcular rota aberto e clique elegível — se **De** estiver vazio, preenche **De**; se **De** já tiver valor (via mapa ou combobox), preenche ou substitui **Para**. Limpar **De** no combobox faz o próximo clique elegível voltar a preencher **De**. (Equivalente prático: 1.º preenchimento → De, seguintes → Para.)
- **FR-008**: Com Calcular rota aberto e pin **com** nó: o clique MUST actualizar De/Para (FR-007) e MUST **não** abrir o modal do Local. Com pin **sem** nó: MUST abrir o modal como hoje e MUST **não** alterar De/Para.

### Key Entities

- **Local (pin no mapa)**: Cidade/lugar com pin; alvo visual do clique.
- **Nó da rede de rotas**: Ponto nomeado usável como De/Para; pode estar associado a um Local.
- **Campos De / Para**: Origem e destino no painel Calcular rota.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em ≤ 30 segundos, um utilizador familiarizado define De e Para só com cliques no mapa (duas cidades com nó) e obtém lista de rotas ao Calcular, sem digitar nos comboboxes.
- **SC-002**: Em 100% dos cliques em pins **sem** nó (painel aberto), De/Para não mudam e o detalhe do Local abre.
- **SC-003**: Em revisão visual, 0 novos indicadores de “zona clicável” para rota além dos pins existentes.
- **SC-004**: Com painel fechado, abrir detalhe de Local por pin continua a funcionar como antes (spot-check ≥ 3 pins).
- **SC-005**: Em 100% dos cliques em pins **com** nó (painel aberto), o modal do Local **não** abre.

## Assumptions

- A feature só está activa enquanto o painel **Calcular rota** está aberto.
- “Cidade” = Local com pin no mapa; elegibilidade = existência de nó de rota associado a esse Local.
- Não é necessário listar/seleccionar nós sem pin (waypoints só de rede).
- Feedback de erro ao Calcular (origem=destino, campos vazios) permanece o actual.
- Modos GM de posicionar pin / digitar segmentos não são alterados.
- Preenchimento De/Para via mapa baseado no **estado dos campos** (De vazio → De; senão → Para), incluindo origem via combobox (Clarifications 2026-08-05).
- Pin com nó + painel aberto: sem modal; pin sem nó + painel aberto: modal como hoje (Clarifications 2026-08-05).

## Out of Scope

- Destacar ou desenhar zonas/hit-areas de nós no mapa.
- Selecção de nós sem Local/pin.
- Alterar algoritmo de cálculo de rotas.
- Substituir ou remover os comboboxes De/Para.
- Fluxo no digitizer / edição da rede.
