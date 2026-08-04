# Feature Specification: Calculador de Rotas — Velocidade, Ritmo e Alternativas

**Feature Branch**: `024-route-planner-speed`  
**Created**: 2026-08-03  
**Status**: Draft  
**Input**: User description: melhorias no modal Calcular rota — auto-selecionar melhor opção entre alternativas; ritmo normal/intenso; velocidade média (padrão 4 mi/h); jornada diária máx. 6 h; resultados ordenados pela mais rápida com número, distância, tempo e tipo; rio +40% velocidade vs estrada; trilha −20% vs estrada.

## Clarifications

### Session 2026-08-03

- Q: Critério de auto-seleção (e 1ª da lista)? → A: Mais rápida (tempo) — lista e auto-seleção alinhadas (opção A)
- Q: Formato do tempo estimado na lista? → A: Dias + horas restantes de marcha no último dia (opção B)
- Q: Como achar as rotas alternativas no mapa? → A: Procurar pelo menor tempo (com modificadores); listar até N mais rápidas (opção A)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Calcular com ritmo e velocidade média (Priority: P1)

Como jogador ou Mestre, no modal Calcular rota quero informar **De**, **Para**, **Ritmo** (normal ou intenso) e **Velocidade média** (padrão 4 mi/h), e obter tempos de viagem baseados numa jornada diária máxima de **6 horas** (8 horas se ritmo intenso = +2 h/dia).

**Why this priority**: É o núcleo da nova regra de tempo; sem isso o restante do modal fica inconsistente.

**Independent Test**: Abrir Calcular rota → De/Para → ritmo Normal, velocidade 4 → calcular → ver tempo coerente com 6 h/dia; repetir com Intenso e ver tempo de calendário menor (mais horas/dia).

**Acceptance Scenarios**:

1. **Given** o modal Calcular rota aberto, **When** o utilizador o inspeciona, **Then** vê campos De, Para, Ritmo (Normal | Intenso) e Velocidade média (pré-preenchida com 4 mi/h).
2. **Given** De e Para válidos, ritmo Normal e velocidade 4 mi/h, **When** calcula, **Then** o tempo estimado de cada rota usa no máximo **6 horas de viagem por dia**.
3. **Given** os mesmos De/Para e velocidade, **When** calcula com ritmo Intenso, **Then** o tempo de calendário (dias de viagem) reflete **+2 horas** de jornada diária (8 h/dia), mantendo a mesma distância.
4. **Given** o utilizador altera a velocidade média para um valor positivo diferente de 4, **When** calcula, **Then** os tempos estimados mudam de forma proporcional à nova velocidade (na linha de base estrada).

---

### User Story 2 - Alternativas auto-selecionadas e escolhíveis (Priority: P1)

Como utilizador, quando existem várias rotas possíveis (ex.: trechos por estrada vs rio), quero que o sistema **selecione automaticamente a opção preferida** e me deixe **ver e escolher** as outras no resultado e no mapa.

**Why this priority**: Evita ambiguidade quando o grafo oferece caminhos distintos; reforça confiança no cálculo.

**Independent Test**: Origem/destino com ≥2 rotas distintas → calcular → uma rota fica selecionada; mudar seleção → mapa/resultado acompanham.

**Acceptance Scenarios**:

1. **Given** ≥2 rotas válidas entre De e Para (incluindo casos em que a mais rápida não é a de menor distância, ex. rio), **When** o cálculo termina, **Then** as rotas aparecem listadas **ordenadas da mais rápida para a mais lenta** e a **primeira (mais rápida) fica auto-selecionada**.
2. **Given** a lista de rotas, **When** o utilizador escolhe outra entrada, **Then** essa passa a ser a rota ativa (destaque no resultado e traçado correspondente no mapa, se o mapa mostrar a rota calculada).
3. **Given** apenas uma rota, **When** calcula, **Then** essa única rota é selecionada e exibida sem exigir escolha extra.

---

### User Story 3 - Resultado rico por rota (Priority: P2)

Como utilizador, quero ver em cada rota: **número**, **distância total**, **tempo estimado** e **tipo(s)** (rio, estrada, trilha, etc.), para comparar alternativas de forma clara.

**Why this priority**: Torna a ordenação e a escolha compreensíveis.

**Independent Test**: Após calcular com ≥1 rota, conferir os quatro campos em cada item da lista.

**Acceptance Scenarios**:

1. **Given** um cálculo com N rotas (N ≥ 1), **When** o utilizador olha a lista, **Then** cada item mostra número da rota (1…N na ordem da lista), distância total, tempo estimado e tipo(s) de via usados.
2. **Given** uma rota que mistura tipos (ex.: estrada + trilha), **When** o resultado é mostrado, **Then** os tipos presentes nessa rota são indicados (não omitidos).

---

### User Story 4 - Modificadores por tipo de via (Priority: P1)

Como utilizador, quero que rotas (ou trechos) por **rio** sejam **40% mais rápidas** que a referência de **estrada**, e por **trilha** **20% mais lentas** que a estrada, usando a velocidade média informada como base da estrada.

**Why this priority**: Define a física do tempo e explica por que a “mais rápida” pode não ser a de menor distância.

**Independent Test**: Duas alternativas com distâncias iguais ou conhecidas — uma só estrada, uma só rio — a de rio tem tempo menor (~40% mais rápida); trilha vs estrada na mesma distância — trilha ~20% mais lenta.

**Acceptance Scenarios**:

1. **Given** velocidade média V na estrada, **When** um trecho é rio, **Then** a velocidade efetiva nesse trecho é **V × 1,4** (40% mais rápida).
2. **Given** velocidade média V na estrada, **When** um trecho é trilha, **Then** a velocidade efetiva nesse trecho é **V × 0,8** (20% mais lenta).
3. **Given** uma rota com vários trechos de tipos diferentes, **When** o tempo é calculado, **Then** cada trecho usa o modificador do seu tipo e o tempo total é a soma coerente desses trechos (depois convertida em dias pela jornada diária do ritmo).

---

### Edge Cases

- Velocidade média ≤ 0 ou inválida: impedir cálculo com mensagem clara; não usar valor silencioso absurdo.
- De = Para: mensagem clara; sem rotas.
- Sem caminho no grafo: mensagem “nenhuma rota”; lista vazia.
- Muitas alternativas: mostrar um conjunto razoável das melhores (as mais rápidas); utilizador ainda pode escolher entre as listadas.
- Ritmo legado (ex.: cauteloso/arriscado) deixa de ser a UI padrão; apenas Normal e Intenso nesta entrega.
- Tipos desconhecidos futuros: tratar como estrada (modificador 1,0) até haver regra própria.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O modal Calcular rota DEVE expor: **De**, **Para**, **Ritmo** (Normal | Intenso) e **Velocidade média** (unidade mi/h), com default **4 mi/h**.
- **FR-002**: Ritmo **Normal** DEVE usar jornada diária máxima de **6 horas**; ritmo **Intenso** DEVE usar **8 horas** (+2 h).
- **FR-003**: O tempo estimado DEVE derivar da distância efetiva (com modificadores de tipo) e da velocidade média, depois convertido em duração de viagem usando as horas/dia do ritmo, e DEVE ser apresentado como **dias + horas restantes** de marcha no último dia (ex.: “2 dias e 3 h”; omitir partes zero de forma legível, ex.: “1 dia” ou “4 h”).
- **FR-004**: Modificadores relativamente à estrada: **rio = +40% velocidade** (fator 1,4); **trilha = −20% velocidade** (fator 0,8); **estrada = 1,0**.
- **FR-005**: Quando houver múltiplas rotas, a descoberta de alternativas DEVE otimizar pelo **menor tempo de viagem** (já com modificadores de tipo), a lista DEVE ser ordenada da mais rápida para a mais lenta, e a mais rápida DEVE ser **auto-selecionada**.
- **FR-006**: O utilizador DEVE poder selecionar outra rota da lista; a seleção atual DEVE refletir-se no destaque do resultado e no mapa (quando aplicável).
- **FR-007**: Cada item de resultado DEVE mostrar: **número da rota**, **distância total**, **tempo estimado** (formato dias + horas, FR-003) e **tipo(s)** (rio, estrada, trilha, etc.).
- **FR-008**: A velocidade média informada no modal DEVE ser usada no cálculo (não apenas um ritmo fixo embutido sem este campo).

### Key Entities

- **Pedido de cálculo**: De (local), Para (local), ritmo, velocidade média.
- **Rota candidata**: sequência de trechos; distância total; tempo estimado; tipos de via; posição na ordenação.
- **Trecho / tipo de via**: estrada, rio, trilha (e equivalentes); define o modificador de velocidade.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com Normal + 4 mi/h, um percurso só-estrada de 24 mi produz tempo apresentado como **1 dia** (6 h de marcha / 6 h/dia).
- **SC-002**: Um percurso só-estrada de 28 mi com Normal + 4 mi/h (7 h de marcha) apresenta-se como **1 dia e 1 h** (ou equivalente legível), não só “2 dias” nem só “7 h”.
- **SC-003**: O mesmo percurso de SC-001 com ritmo Intenso (8 h/dia) completa-se em **menos dias de calendário** (ou fração menor) que com Normal, distância igual.
- **SC-004**: Em teste A/B com mesma distância, rota só-rio tem tempo estimado ≈ **1/1,4** do tempo só-estrada (±5% de arredondamento).
- **SC-005**: Em teste A/B com mesma distância, rota só-trilha tem tempo estimado ≈ **1/0,8** do tempo só-estrada (±5%).
- **SC-006**: Com ≥2 rotas, em 100% dos cálculos a lista está ordenada por tempo crescente e a seleção inicial é o índice da mais rápida.
- **SC-007**: O utilizador consegue mudar a rota selecionada em ≤ 2 cliques a partir da lista e reconhecer distância, tempo e tipo(s) em cada linha.

## Assumptions

- **Auto-seleção e ordenação travadas**: pela **mais rápida (menor tempo estimado)**; a rota #1 da lista é sempre a auto-selecionada. “Mais curta” no pedido original = esta opção preferida por tempo, não por milhas.
- Velocidade média default **4 mi/h** é a base da **estrada**; rio/trilha aplicam fatores 1,4 / 0,8 sobre essa base.
- Jornada: Normal 6 h/dia; Intenso 8 h/dia. O “tempo estimado” comunica **dias + horas restantes** no último dia (clarificação B).
- Rotas mistas: tempo = soma por trecho com o modificador de cada tipo.
- Substitui a tríade antiga de ritmo (cauteloso / normal / arriscado como velocidades embutidas) pela combinação **ritmo (horas/dia) + velocidade média editável**.
- Extensão da feature de geração/cálculo de rotas (021); não redefine digitalização de rede.
- Limite razoável de alternativas na lista (ex. até 5 mais rápidas) se o grafo gerar muitas — detalhe no plano.
- **Descoberta de caminhos**: o sistema procura alternativas pelo **menor tempo** (com modificadores rio/trilha), não pela menor distância isolada; depois apresenta até N mais rápidas.

## Out of Scope

- Redesenhar a digitalização de nós/segmentos ou a escala do mapa.
- Clima, fadiga, encontros ou custos além de distância/tempo/tipo.
- Modo offline ou partilha de rotas.
- Alterar regras de conexão narrativa entre locais (saídas visitadas).
