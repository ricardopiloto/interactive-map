# Feature Specification: Prefer River or Road in Route Planner

**Feature Branch**: `054-prefer-river-road`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "No route planner, eu quero também trazer a opção para o jogador colocar a preferência: por rio ou estrada."

## Clarifications

### Session 2026-08-05

- Q: Semântica da preferência rio/estrada (suave vs filtro rígido)? → A: Preferência suave — enviesa resultados; rotas mistas permitidas.
- Q: Default ao abrir o painel / opções de preferência? → A: Três opções — Sem preferência (default) / Rio / Estrada; reabrir o painel repõe Sem preferência.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Preferir viagem por rio ou por estrada (Priority: P1)

No painel **Calcular rota**, o jogador (ou GM) escolhe uma **preferência de via**: **Sem preferência**, **por rio** ou **por estrada**, além das opções já existentes (transporte, ritmo, ordenação rápida/barata). Com Rio ou Estrada, o cálculo **enviesa** (preferência suave) as alternativas para reflectir a intenção de viajar mais por água ou mais por estrada, sem banir rotas mistas. Com Sem preferência, o comportamento de descoberta/ordenação actual mantém-se.

**Why this priority**: Pedido explícito — nova dimensão de escolha no planeamento de viagem.

**Independent Test**: Mesmo De/Para; calcular com preferência rio vs estrada; a lista / rota destacada muda de forma coerente com a preferência (não é só um rótulo cosmético).

**Acceptance Scenarios**:

1. **Given** Calcular rota aberto, **When** o utilizador observa os controlos, **Then** consegue escolher **Sem preferência**, **por rio** ou **por estrada** (além de transporte / ritmo / ordenação).
2. **Given** De/Para válidos e preferência **por rio**, **When** calcula (ou a lista actualiza), **Then** as rotas apresentadas reflectem preferência por trechos de rio face a uma preferência por estrada no mesmo De/Para.
3. **Given** o mesmo De/Para e preferência **por estrada**, **When** calcula, **Then** as rotas apresentadas reflectem preferência por trechos de estrada face à preferência por rio.
4. **Given** De/Para válidos e resultados visíveis, **When** o utilizador muda a preferência (incluindo para/desde Sem preferência), **Then** o sistema recalcula automaticamente (mesmo espírito da troca de ordenação / modo de transporte) e a lista reflecte a nova preferência.
5. **Given** De/Para válidos e **Sem preferência**, **When** calcula, **Then** a lista segue só ordenação / transporte / ritmo (sem enviesamento rio/estrada).

---

### User Story 2 - Conviver com ordenação e transporte (Priority: P1)

A preferência rio/estrada **não substitui** ordenação (mais rápida / mais barata) nem modo de transporte (pago / próprio): todas as dimensões aplicam-se juntas. O utilizador continua a ver tempo, custos e tipos nas alternativas.

**Why this priority**: Sem isto, a feature conflitua com 046/050 e parta fluxos já aprendidos.

**Independent Test**: Em próprio + mais barata + preferência rio (e outras combinações); resultados utilizáveis, sem erro, com critérios coerentes.

**Acceptance Scenarios**:

1. **Given** preferência rio ou estrada activa, **When** o utilizador altera **mais rápida** ↔ **mais barata**, **Then** a lista continua a respeitar a ordenação **e** a preferência de via.
2. **Given** preferência activa, **When** muda transporte pago ↔ próprio, **Then** custos/tempos seguem as regras de transporte **e** a preferência de via mantém-se aplicada.
3. **Given** qualquer combinação válida, **When** vê cada rota na lista, **Then** continua a ver distância, tempo, tipos de via e custos Dentro/Fora (ou zero em próprio).

---

### User Story 3 - Default previsível ao abrir o painel (Priority: P2)

Ao abrir o painel, a preferência de via inicia em **Sem preferência**, para quem não quer pensar nisso obter o mesmo tipo de resultados de sempre até escolher Rio ou Estrada.

**Why this priority**: Evita surpresas e regressões face ao comportamento actual.

**Independent Test**: Abrir Calcular rota sem tocar na preferência; calcular; resultados sem enviesamento rio/estrada.

**Acceptance Scenarios**:

1. **Given** o painel acabou de abrir, **When** o utilizador não altera a preferência de via, **Then** **Sem preferência** está activo.
2. **Given** o painel foi fechado com Rio ou Estrada seleccionado, **When** o reabre na mesma visita, **Then** a preferência volta a **Sem preferência** (mesmo espírito do reset do modo de transporte para pago).

---

### Edge Cases

- Sem caminho possível: mensagem existente; preferência não inventa rotas.
- Rede só com um tipo de via entre De/Para: preferir o outro tipo MUST ainda devolver o melhor caminho possível existente (lista vazia **só** se não houver caminho nenhum) — preferência suave nunca esconde o único caminho.
- Rotas mistas (rio + estrada + trilha): permitidas; a preferência enviesa ranqueamento / selecção do top-6 para favorecer mais distância (ou peso) no tipo escolhido, sem excluir misturas.
- Preferência e trilha: trilhas MUST NOT ser removidas do modelo de rede; sob preferência suave, trechos de trilha continuam a poder fazer parte de rotas mistas.
- Poucas alternativas (&lt; 6): mostrar as disponíveis, ordenadas pela combinação activa (preferência suave + ordenação + transporte + ritmo).
- Digitizer / Rede de rotas (autoria): fora de âmbito.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O painel Calcular rota MUST oferecer uma escolha explícita de preferência de via entre **Sem preferência**, **por rio** e **por estrada**.
- **FR-002**: Quando a preferência é **por rio** ou **por estrada**, MUST influenciar quais alternativas aparecem e/ou como são ranqueadas no conjunto de resultados (até 6, como hoje), de forma perceptível entre rio vs estrada no mesmo De/Para. Quando é **Sem preferência**, MUST NOT aplicar enviesamento por tipo de via.
- **FR-003**: Preferência **por rio** / **por estrada** MUST ser **suave**: enviesa quais alternativas entram no top-6 e/ou a sua ordem para favorecer rotas com mais uso do tipo escolhido; MUST NOT filtrar de forma rígida nem excluir rotas mistas só por incluírem outros tipos.
- **FR-004**: Ordenação mais rápida / mais barata MUST continuar a aplicar-se em conjunto com a preferência de via.
- **FR-005**: Modo de transporte pago / próprio, ritmo e validação de velocidade própria MUST continuar a comportar-se como hoje, com a preferência de via como parâmetro adicional do cálculo.
- **FR-006**: Com De/Para válidos, mudar a preferência de via (entre Sem preferência / rio / estrada) MUST recalcular automaticamente (sem exigir novo clique em Calcular), no mesmo espírito da troca de ordenação.
- **FR-007**: Cada abertura do painel MUST iniciar em **Sem preferência**; MUST NOT exigir que o utilizador escolha Rio/Estrada antes de calcular.
- **FR-008**: Resultados MUST continuar a listar alternativas com tempo, tipos e custos visíveis (tabela em pago; zero em próprio).
- **FR-009**: Rede de rotas / digitizer e pins do mapa da campanha MUST NOT mudar excepto o necessário para consumir a nova preferência no cálculo / overlay da rota seleccionada.
- **FR-010**: Se não existir caminho, o produto MUST usar a mensagem de vazio/erro já existente (sem falha silenciosa).

### Key Entities

- **Preferência de via**: Sem preferência | Rio | Estrada — default **Sem preferência**; Rio/Estrada com semântica **suave**.
- **Alternativa de rota**: Caminho com tipos de segmento, tempo, distância, custos e geometria.
- **Conjunto top-N**: Até 6 alternativas sob a combinação activa (preferência + ordenação + transporte + ritmo).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em ≤ 1 minuto, um utilizador encontra e selecciona Sem preferência / Rio / Estrada no Calcular rota.
- **SC-002**: No mesmo De/Para com alternativas mistas na rede, um cálculo **por rio** e um **por estrada** produzem listas ou rota de topo **distintas de forma coerente** com a preferência (spot-check em ≤ 2 minutos).
- **SC-003**: 100% das combinações smoke (preferência × ordenação × pago/próprio) completam sem erro de interface quando De/Para são válidos (pelo menos uma troca de cada eixo).
- **SC-004**: Mudar só a preferência de via com De/Para válidos actualiza a lista sem clique extra em Calcular.
- **SC-005**: Abrir o painel e calcular sem tocar na preferência usa **Sem preferência** e não piora o fluxo aprendido de Calcular rota.

## Assumptions

- “Preferência” é um controlo **adicional** no Calcular rota, não substitui ordenação rápida/barata nem transporte pago/próprio.
- Default ao abrir (e ao reabrir) o painel: **Sem preferência** — equivalência ao comportamento actual sem enviesamento; Rio/Estrada só quando escolhidos.
- Recálculo automático ao mudar preferência (com De/Para válidos): sim, alinhado a ordenação e modo de transporte.
- Trilha continua a existir na rede; não se pede um botão “por trilha” nesta feature.
- Limite de até 6 alternativas e overlay no mapa da rota seleccionada mantêm-se.
- Jogador e GM usam o mesmo painel Calcular rota (sem permissão extra).
- A métrica exacta do “enviesamento” (ex. partilha de milhas do tipo preferido) fica para o plano técnico, desde que SC-002 se verifique.

## Out of Scope

- Preferência por trilha como opção de UI dedicada.
- Redesign completo do painel além do controlo e do efeito no cálculo.
- Alterar tarifas ou velocidades da tabela (exceto o efeito da preferência na escolha de caminhos).
- Digitizer / edição da Rede de rotas.
- Alinhamento de pins no mapa da campanha.
