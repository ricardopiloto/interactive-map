# Feature Specification: Custo de viagem nas rotas

**Feature Branch**: `031-route-travel-cost`

**Created**: 2026-08-03

**Updated**: 2026-08-03

**Status**: Draft

**Input**: User description: "Agora vamos melhorar a funcionalidade de rotas, vamos adicionar o custo de viagem. Utilize a tabela: Coach (estrada): Velocidade 6, Dentro = 2bp/milha, Fora = 1bp/milha; Balsa (rio): Velocidade 8, Dentro = 5bp/milha, Fora = 2bp/milha." + edição: "O campo de velocidade na calculadora passa a ser opcional, nós vamos mostrar ambas as opções de custo junto com o resultado, mostrando sempre o mais rápido primeiro. Se ele preencher o campo de velocidade, assuma a nova velocidade e mantenha os custos como default."

## Clarifications

### Session 2026-08-03

- Q: Como aplicar Dentro vs Fora? → A: Mostrar **ambos** os custos (Dentro e Fora) em cada resultado; sem toggle único por cálculo
- Q: Velocidades 6/8 vs campo de velocidade? → A: Campo de velocidade **opcional**; vazio → defaults da tabela (coach 6 / balsa 8); preenchido → usar essa velocidade no tempo; **custos** ficam sempre nas tarifas default da tabela
- Q: Ordenação? → A: Sempre a rota **mais rápida** primeiro (inalterado em espírito; reforçado)
- Q: Com velocidade preenchida, como tratar estrada/rio/trilha? → A: Override **V** = base estrada; rio **V×1,4**; trilha **V×0,8** (modelo atual)

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ver ambos os custos (Dentro e Fora) na lista (Priority: P1)

Como jogador ou Mestre, ao calcular uma rota quero ver, para **cada** alternativa, o **custo em bp Dentro** e o **custo em bp Fora**, além de distância e tempo — para comparar passagem no Império (Dentro) vs fora sem ter de recalcular.

**Why this priority**: Entrega o valor da tabela de tarifas sem ambiguidade de regime.

**Independent Test**: Calcular rota com estrada e/ou rio; cada item mostra dois totais de bp (Dentro e Fora) coerentes com milhas × tarifas.

**Acceptance Scenarios**:

1. **Given** uma rota só-estrada de 10 mi, **When** o resultado aparece, **Then** mostra custo Dentro **20 bp** e Fora **10 bp** (2 e 1 bp/mi).
2. **Given** uma rota só-rio de 10 mi, **When** o resultado aparece, **Then** mostra custo Dentro **50 bp** e Fora **20 bp** (5 e 2 bp/mi).
3. **Given** uma rota com 5 mi estrada + 5 mi rio, **When** o resultado aparece, **Then** Dentro = 10+25 = **35 bp** e Fora = 5+10 = **15 bp**.
4. **Given** várias rotas alternativas, **When** a lista é mostrada, **Then** cada rota tem os **dois** custos visíveis; a lista está ordenada da **mais rápida** para a mais lenta; a mais rápida está selecionada/destacada primeiro.

---

### User Story 2 — Velocidade opcional no calculador (Priority: P1)

Como utilizador, o campo de **velocidade média** é **opcional**: se o deixar vazio, o tempo usa as velocidades default da tabela (coach/estrada **6**, balsa/rio **8**); se o preencher com um valor positivo, o tempo usa **essa** velocidade (e os custos **não mudam** — continuam as tarifas default Dentro/Fora).

**Why this priority**: Substitui a velocidade obrigatória atual e alinha tempo aos defaults Coach/Balsa quando não há override.

**Independent Test**: Calcular sem velocidade → tempos coerentes com 6 (estrada) e 8 (rio); preencher velocidade (ex. 4) e recalcular → tempos mudam, custos Dentro/Fora iguais aos do cálculo anterior para a mesma geometria.

**Acceptance Scenarios**:

1. **Given** De/Para válidos e campo de velocidade **vazio**, **When** calcula, **Then** trechos de estrada usam velocidade efetiva **6** e trechos de rio **8** no cálculo de tempo; ambos os custos bp aparecem com tarifas da tabela.
2. **Given** a mesma origem/destino, **When** o utilizador preenche velocidade com um valor positivo **V** e recalcula, **Then** o tempo usa estrada **V**, rio **V×1,4**, trilha **V×0,8**; os custos **Dentro** e **Fora** permanecem os mesmos (tarifas default).
3. **Given** velocidade preenchida com valor ≤ 0 ou inválido, **When** tenta calcular, **Then** vê **erro de validação** e o cálculo **não** corre (não aplica defaults em silêncio).
4. **Given** ritmo Normal ou Intenso, **When** calcula com ou sem velocidade, **Then** a conversão para dias/horas continua a usar 6 h/dia (Normal) ou 8 h/dia (Intenso).

---

### User Story 3 — Trilha e custo zero de passagem (Priority: P2)

Como utilizador, trechos de **trilha** não têm tarifa Coach/Balsa: não acrescentam bp aos custos Dentro/Fora; o tempo da trilha continua a ser calculado de forma coerente com a velocidade em vigor (default ou override).

**Why this priority**: Completa a tabela (só coach/balsa) sem inventar tarifas.

**Independent Test**: Rota só-trilha → custos Dentro e Fora = 0 bp (ou “sem passagem”); tempo > 0 se houver milhas.

**Acceptance Scenarios**:

1. **Given** uma rota só com trilha, **When** calcula, **Then** custo Dentro e Fora = **0 bp** (sem passagem coach/balsa).
2. **Given** rota mista com trilha + estrada e velocidade vazia, **When** calcula, **Then** só as milhas de estrada (e rio, se houver) entram nos bp; a trilha usa **6×0,8** no tempo.
3. **Given** rota com trilha e velocidade override **V**, **When** calcula, **Then** a trilha usa **V×0,8** no tempo; custos de passagem da trilha continuam 0 bp.

---

### Edge Cases

- Velocidade vazia vs preenchida: custos idênticos para a mesma rota; só o tempo muda.
- Rota só-trilha: 0 bp Dentro e Fora; tempo usa regra de trilha (ver Assumptions).
- Sem rota possível: mensagem existente; sem custos fantasma.
- Muitas alternativas: ordenação só por tempo (mais rápida primeiro); custos não reordenam a lista.
- Moeda: **bp** apenas; sem conversão automática para ss/GC.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada rota calculada MUST mostrar **dois** totais de custo em bp: **Dentro** e **Fora**.
- **FR-002**: Trechos **estrada** (Coach) MUST contribuir com **2 bp/milha** ao total Dentro e **1 bp/milha** ao total Fora.
- **FR-003**: Trechos **rio** (Balsa) MUST contribuir com **5 bp/milha** ao total Dentro e **2 bp/milha** ao total Fora.
- **FR-004**: Cada total MUST ser a soma (milhas do trecho × tarifa do tipo e regime) sobre todos os trechos tarifáveis da rota.
- **FR-005**: NÃO MUST existir um único seletor Dentro/Fora que esconda o outro custo — ambos MUST aparecer no resultado.
- **FR-006**: Trechos **trilha** MUST NÃO acrescentar bp (contribuição 0 aos dois totais).
- **FR-007**: A lista MUST mostrar distância, tempo, tipo(s) e os dois custos; MUST permanecer ordenada da **mais rápida** para a mais lenta, com a mais rápida em primeiro e selecionada por omissão.
- **FR-008**: O campo de **velocidade** no calculador MUST ser **opcional** (pode ficar vazio).
- **FR-009**: Com velocidade **vazia**, o tempo MUST usar defaults da tabela: estrada/coach **6**, rio/balsa **8**; trilha **6×0,8**.
- **FR-010**: Com velocidade **preenchida** com valor positivo **V**, o tempo MUST usar: estrada **V**, rio **V×1,4**, trilha **V×0,8**; os custos Dentro/Fora MUST permanecer nas tarifas default da tabela (FR-002/FR-003).
- **FR-011**: Ritmo (Normal 6 h/dia / Intenso 8 h/dia) MUST continuar a converter horas de marcha em dias + horas como hoje.
- **FR-012**: Recalcular após mudar velocidade (ou esvaziar o campo) MUST atualizar tempos sem exigir recarregar a página; custos só mudam se a geometria/rota mudar.
- **FR-013**: Velocidade preenchida inválida (não numérica ou ≤ 0) MUST produzir erro de validação e MUST NÃO executar o cálculo.

### Key Entities

- **Tarifa de viagem**: Coach (estrada) e Balsa (rio) × regime Dentro/Fora → bp/milha (valores fixos da tabela).
- **Custos da rota**: Par `(custo_dentro_bp, custo_fora_bp)` por rota calculada.
- **Velocidade de cálculo**: Opcional no pedido; se ausente → 6 / 8 / (6×0,8); se presente **V** → V / (V×1,4) / (V×0,8) por tipo.
- **Rota calculada**: Sequência de trechos com distância, tempo, tipos e ambos os custos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Rota só-estrada de 10 mi mostra **20 bp** Dentro e **10 bp** Fora no mesmo cartão/item.
- **SC-002**: Rota só-rio de 10 mi mostra **50 bp** Dentro e **20 bp** Fora.
- **SC-003**: Rota 5 mi estrada + 5 mi rio mostra **35 bp** Dentro e **15 bp** Fora.
- **SC-004**: Com velocidade vazia, rota só-estrada e só-rio com a **mesma** milhagem: tempo do rio ≈ tempo_estrada × (6/8) (±5%).
- **SC-005**: Preencher velocidade **V** e recalcular a mesma origem/destino altera o tempo (estrada V, rio V×1,4) e **não** altera os dois totais de bp.
- **SC-006**: Em lista com ≥2 rotas, a primeira é a de menor tempo; ≥90% dos revisores identificam ambos os custos por item em ≤10 s.
- **SC-007**: Com velocidade vazia, trecho só-trilha de distância D tem tempo ≈ D/(6×0,8) horas de marcha (±5%).

## Assumptions

- **Coach** = tipo **estrada**; **Balsa** = tipo **rio**.
- Unidade monetária: **bp**; sem conversão ss/GC nesta entrega.
- Ordenação e auto-seleção: por **menor tempo** (mais rápida primeiro); custos são informativos.
- Com velocidade **vazia**: estrada **6**, rio **8** (absolutos da tabela); trilha **6×0,8**.
- Com velocidade override **V** (>0): estrada **V**, rio **V×1,4**, trilha **V×0,8** (clarificação 2026-08-03).
- Velocidade inválida: erro de validação; não calcula.
- Jogador e GM veem os mesmos custos e regras de velocidade.
- Não há toggle Dentro/Fora no formulário — só no resultado.
