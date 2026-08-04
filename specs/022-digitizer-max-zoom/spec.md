# Feature Specification: Zoom Aumentado na Digitalização de Rotas

**Feature Branch**: `022-digitizer-max-zoom`  
**Created**: 2026-08-03  
**Status**: Draft  
**Input**: User description: "Vamos ajustar um pouco a spec 021, ao criar segmento, eu preciso ter a opção de dar um zoom maior no mapa para conseguir ser mais realista nas rotas"

## Clarifications

### Session 2026-08-03

- Q: Qual o teto de aproximação na digitalização em relação ao máximo do mapa normal? → A: ~3× o máximo do mapa normal (opção B)
- Q: Quais controles de zoom na digitalização? → A: Só roda / pinça, sem novos botões de zoom (opção A)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Traçar segmentos com precisão visual (Priority: P1)

Como Mestre, ao criar ou editar segmentos da rede de viagem (especialmente desenhando o caminho da polilinha no mapa), preciso aproximar o mapa o suficiente para acompanhar estradas, rios e contornos da arte com realismo, sem ficar limitado ao nível de zoom da visualização normal da campanha.

**Why this priority**: Segmentos imprecisos distorcem distância, duração e fidelidade ao mapa; o zoom atual da vista de digitalização (mesma faixa da vista de jogador) impede traçar rotas realistas.

**Independent Test**: Abrir Rede de rotas → modo Criar segmento → aproximar além do máximo anterior → desenhar polilinha acompanhando um traço fino da arte → confirmar segmento.

**Acceptance Scenarios**:

1. **Given** o Mestre está na vista Rede de rotas, **When** usa zoom (roda do mouse ou controles), **Then** consegue aproximar o mapa até cerca de 3× o limite máximo da visualização normal do mapa da campanha.
2. **Given** o Mestre está no modo Criar segmento, **When** aproxima ao máximo permitido nesta vista, **Then** detalhes da arte do mapa (ex.: estradas estreitas) ficam nítidos o bastante para posicionar pontos da polilinha com intenção, e pan continua disponível.
3. **Given** o Mestre aproxima o mapa e desenha um segmento, **When** confirma o segmento, **Then** o segmento é gravado normalmente e o nível de zoom usado na digitalização não altera a escala quilômetros↔pixels da campanha.

---

### User Story 2 - Zoom utilizável em todos os modos da digitalização (Priority: P2)

Como Mestre, quero o mesmo alcance de zoom alto ao criar nós e ao configurar escala, não só ao criar segmento, para manter consistência ao posicionar a rede.

**Why this priority**: Nós mal posicionados também afetam realismo; mesmo limite em toda a vista evita surpresa.

**Independent Test**: Alternar entre Criar nó, Criar segmento e Escala; em cada um, verificar que o máximo de aproximação é o mesmo e utilizável.

**Acceptance Scenarios**:

1. **Given** a vista Rede de rotas, **When** o Mestre muda de modo de ferramenta, **Then** o limite máximo de zoom permanece o mesmo.
2. **Given** zoom no máximo, **When** o Mestre cria um nó ou define pontos de escala, **Then** as ações continuam possíveis sem “travar” pan ou cliques.

---

### User Story 3 - Voltar à visão geral sem esforço (Priority: P3)

Como Mestre, após trabalhar em detalhe, quero poder afastar o mapa até uma visão geral da região para planejar o próximo trecho.

**Why this priority**: Complementa o zoom alto; sem afastamento adequado o fluxo fica incompleto.

**Independent Test**: Aproximar ao máximo, depois afastar até o mínimo da vista; mapa e rede continuam legíveis o suficiente para orientação.

**Acceptance Scenarios**:

1. **Given** zoom máximo, **When** o Mestre afasta até o mínimo da vista de digitalização, **Then** consegue ver uma área ampla do mapa e a rede existente (nós/segmentos) para decidir o próximo traçado.

---

### Edge Cases

- Zoom extremo não deve impedir clicar em nós existentes nem completar uma polilinha (pontos ainda alinhados ao mapa).
- Em telas pequenas / mobile, zoom alto e pan devem continuar usáveis; se o desempenho cair, a aproximação ainda deve ser funcional (não obrigatório fluidez perfeita).
- Fora da vista Rede de rotas (mapa do jogador / planejar rota), o limite de zoom desta feature **não** precisa mudar (escopo só da digitalização), salvo decisão futura.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na vista dedicada de digitalização da rede de rotas (Modo GM → Rede de rotas), o Mestre DEVE poder aproximar o mapa até cerca de **3× o limite máximo** da visualização normal do mapa da campanha (ex.: se o mapa normal permite aproximação até N, a digitalização permite até ~3N).
- **FR-002**: O alcance de zoom aumentado DEVE estar disponível pelo menos enquanto o Mestre cria ou edita segmentos (desenho de polilinha); por padrão o mesmo alcance aplica-se a todos os modos dessa vista.
- **FR-003**: Zoom e pan na digitalização NÃO DEVEM alterar a configuração de escala (km por pixel) nem as coordenadas percentuais já gravadas de nós/segmentos; apenas melhoram a precisão visual ao posicionar.
- **FR-004**: O Mestre DEVE alcançar o novo máximo de zoom via **roda do mouse e/ou gesto de pinça** (controles já familiares da vista). Esta feature NÃO exige novos botões visíveis de +/− ou reset; o zoom de detalhe deve ser alcançável em poucos segundos.
- **FR-005**: A visualização normal do mapa da campanha (jogador e overlay de rotas calculadas) NÃO é obrigada a herdar o mesmo limite máximo desta feature.

### Key Entities

- **Vista de digitalização de rotas**: Espaço GM onde nós, segmentos e escala da rede de viagem são definidos sobre a arte do mapa.
- **Segmento de rota**: Ligação entre nós com geometria no mapa; benefício principal do zoom alto ao traçar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste com o Mestre, ao criar um segmento que segue um traço fino da arte, o zoom máximo da digitalização (~3× o teto do mapa normal) permite posicionar pontos da polilinha de forma que o traçado visual coincida com a intenção do Mestre (avaliação subjetiva “aceito / preciso” em ≥ 8 de 10 segmentos de teste).
- **SC-002**: O Mestre alcança o zoom de detalhe desejado em menos de 5 segundos a partir do zoom inicial da vista, usando apenas roda do mouse ou pinça.
- **SC-003**: Após gravar um segmento criado sob zoom alto, a distância/duração derivadas (via escala da campanha) continuam coerentes com a geometria gravada — o zoom visual não “infla” quilômetros.
- **SC-004**: 100% dos modos da vista Rede de rotas compartilham o mesmo teto de zoom (sem regressão de “modo X zooma menos”).

## Assumptions

- Extensão / refinamento da capacidade da feature **021-route-generation** (vista Rede de rotas), não um novo domínio de dados.
- O problema atual é o **teto de aproximação** insuficiente na digitalização (hoje alinhado ao mapa normal), não a falta total de zoom.
- Valor-alvo travado: teto de aproximação na digitalização ≈ **3×** o máximo do mapa normal da campanha; o valor numérico exato no plano técnico deve refletir essa proporção.
- Controles: zoom por **roda / pinça** apenas; sem barra nova de +/− nesta entrega.
- Jogadores e o fluxo “Calcular rota” não precisam deste zoom extra nesta entrega.
- Sem mudança de modelo (waypoints, segmentos, escala) — só comportamento de visualização na digitalização.

## Out of Scope

- Alterar algoritmo de planejamento de rotas ou pesos de terreno.
- Redesenhar a arte do mapa ou adicionar camadas GIS.
- Zoom independente por “lupa” flutuante.
- Novos controles visíveis de zoom (+/− / reset) na digitalização.
- Mudar zoom máximo do mapa do jogador nesta feature.
