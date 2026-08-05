# Feature Specification: Route Transport Mode (Paid vs Own)

**Feature Branch**: `050-route-transport-mode`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "Vamos melhorar o menu de calcular rota, adicionar mais opções ao usuário. Ao invés de ele poder editar a velocidade, nós vamos dar a opção de ele escolher entre transporte pago ou próprio, se for pago, assumimos a tabela que temos de velocidade e custo, se for próprio, nós zeramos o custo e ele tem a opção de colocar uma velocidade desejada, com um padrão configurado em 4."

## Clarifications

### Session 2026-08-05

- Q: Ao mudar Pago ↔ Próprio com De/Para válidos, recalcular automaticamente? → A: Sim — recalcular automaticamente ao mudar o modo (mesmo padrão da troca de ordenação).
- Q: Em próprio, ao alterar a velocidade desejada (De/Para válidos), recalcular sozinho? → A: Não — só no Calcular (ou na troca de modo/ordenação); não a cada edição do campo.
- Q: Ao fechar e reabrir o painel na mesma visita, modo inicial? → A: Sempre abrir em **pago** (reset do modo; velocidade própria volta ao default 4 ao entrar em próprio).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escolher transporte pago ou próprio (Priority: P1)

No painel **Calcular rota**, o utilizador escolhe **Transporte pago** ou **Transporte próprio** em vez de um campo livre de velocidade genérico. Em **pago**, o cálculo usa a **tabela** existente de velocidades e custos (coach/balsa/trilha). Em **próprio**, os **custos de passagem são zero** e o utilizador indica a **velocidade desejada** (padrão **4**).

**Why this priority**: Substitui o modelo actual de velocidade opcional pela intenção de negócio (pago vs próprio).

**Independent Test**: Calcular a mesma origem/destino em pago vs próprio; tempos e custos diferem conforme as regras; próprio mostra 0 bp e usa velocidade (default 4 ou a escolhida).

**Acceptance Scenarios**:

1. **Given** Calcular rota aberto, **When** o utilizador vê as opções de transporte, **Then** pode escolher **Pago** ou **Próprio** (não o antigo campo de velocidade como controlo principal).
2. **Given** transporte **pago** seleccionado e De/Para válidos, **When** calcula, **Then** tempos usam velocidades da tabela e custos Dentro/Fora seguem as tarifas da tabela (comportamento de tabela actual).
3. **Given** transporte **próprio** seleccionado, **When** calcula com a velocidade por omissão, **Then** a velocidade efectiva base é **4** e os custos Dentro e Fora são **0 bp**.
4. **Given** transporte **próprio**, **When** o utilizador altera a velocidade desejada para um valor positivo válido e (re)calcula, **Then** o tempo reflecte essa velocidade (com as regras de tipo de via já usadas no produto) e os custos continuam **0 bp**.
5. **Given** transporte **pago** ou **próprio** com De/Para válidos, **When** o utilizador muda o modo de transporte, **Then** o sistema recalcula automaticamente e a lista reflecte o modo novo (custos/tempos correctos sem novo clique em Calcular).
6. **Given** modo **próprio** e velocidade alterada no campo, **When** o utilizador ainda não clicou Calcular nem mudou modo/ordenação, **Then** a lista existente (se houver) não é recalculada só por causa da edição da velocidade.

---

### User Story 2 - UI do menu alinhada ao modo (Priority: P1)

O menu mostra só os controlos relevantes: em **pago**, não pede velocidade livre; em **próprio**, mostra o campo de velocidade desejada pré-preenchido com **4**. Ritmo e ordenação (mais rápida / mais barata) continuam disponíveis.

**Why this priority**: Evita confusão e torna a escolha de modo óbvia.

**Independent Test**: Alternar Pago ↔ Próprio; o campo de velocidade aparece só em próprio, com default 4; em pago desaparece ou fica inacessível.

**Acceptance Scenarios**:

1. **Given** modo **pago**, **When** o utilizador observa o formulário, **Then** não há controlo de velocidade editável como no fluxo antigo (só modo + ritmo + ordenação + De/Para).
2. **Given** o painel foi fechado em modo próprio, **When** o utilizador o reabre na mesma visita, **Then** o modo inicial é **pago** (não o último modo usado).
3. **Given** modo **próprio**, **When** o formulário é mostrado, **Then** existe controlo de velocidade desejada com valor inicial **4**.
4. **Given** modo próprio com velocidade 4, **When** o utilizador muda para pago e volta a próprio, **Then** a velocidade volta ao padrão **4**.

---

### User Story 3 - Validação e resultados claros (Priority: P2)

Em próprio, velocidade inválida (vazia, ≤ 0, não numérica) impede o cálculo com mensagem clara. Em pago e próprio, a lista de rotas continua a mostrar tempo e, quando aplicável, custos; em próprio, custos aparecem como zero (ou equivalente “sem custo de passagem”).

**Why this priority**: Evita cálculos silenciosos errados e deixa o resultado legível.

**Independent Test**: Próprio com velocidade inválida → erro, sem lista; próprio válido → 0 bp; pago → bp da tabela.

**Acceptance Scenarios**:

1. **Given** próprio e velocidade inválida, **When** tenta calcular, **Then** vê erro de validação e o cálculo não corre.
2. **Given** próprio e cálculo bem-sucedido, **When** vê a lista, **Then** cada rota mostra Dentro **0** e Fora **0** bp (ou rótulo equivalente de custo zero).
3. **Given** pago, **When** vê a lista, **Then** Dentro/Fora reflectem a tabela (não zeros forçados).

---

### Edge Cases

- Troca de modo com De/Para já válidos: MUST **recalcular automaticamente** (mesmo padrão da troca de ordenação); se De/Para inválidos, não calcula e não deixa resultados stale inconsistentes com o modo novo quando aplicável.
- Edição só da velocidade própria: MUST NOT recalcular sozinha; ver FR-011.
- Ordenação **mais barata** em próprio: todas as rotas a 0 bp — a ordem pode cair em tempo (ou empates); o produto MUST permanecer utilizável (sem erro).
- Trilha em pago: continua sem tarifa de passagem (0 bp nesse trecho), como hoje.
- Sem rota possível: mensagem existente; sem custos fantasma.
- Velocidade própria muito alta/baixa: aceite se &gt; 0; limites extremos opcionais na implementação desde que &gt; 0.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O painel Calcular rota MUST oferecer escolha explícita entre transporte **pago** e **próprio**.
- **FR-002**: Em modo **pago**, o sistema MUST usar a tabela de velocidades e custos existente (sem override de velocidade pelo utilizador).
- **FR-003**: Em modo **próprio**, o sistema MUST tratar custos de passagem Dentro e Fora como **0** para a rota completa.
- **FR-004**: Em modo **próprio**, o utilizador MUST poder definir uma velocidade desejada com **padrão 4** (unidades já usadas no produto para velocidade média).
- **FR-005**: Em modo **próprio**, a velocidade desejada MUST ser usada no cálculo de tempo segundo as regras de tipo de via já existentes no produto (base + modificadores por tipo).
- **FR-006**: O antigo controlo principal de “velocidade opcional” livre (sem modo de transporte) MUST ser substituído por este modelo pago/próprio.
- **FR-007**: Ritmo (normal/intenso) e ordenação (mais rápida / mais barata) MUST continuar disponíveis em ambos os modos.
- **FR-008**: Velocidade própria inválida (≤ 0 ou não positiva) MUST bloquear o cálculo com feedback claro.
- **FR-009**: Resultados MUST continuar a listar alternativas com tempo; custos MUST ser visíveis (tabela em pago; zero em próprio).
- **FR-010**: Com De/Para válidos, a troca de modo Pago ↔ Próprio MUST recalcular automaticamente a rota (sem exigir novo clique em Calcular), no mesmo espírito da troca de ordenação.
- **FR-011**: Em modo **próprio**, alterar só o campo de velocidade desejada MUST NOT disparar recálculo automático; o novo valor aplica-se no próximo Calcular (ou num recálculo já obrigatório por troca de modo/ordenação).
- **FR-012**: Cada abertura do painel Calcular rota MUST iniciar em modo **pago** (não lembrar a escolha anterior da mesma visita); ao passar a **próprio**, a velocidade desejada inicia em **4**.

### Key Entities

- **Modo de transporte**: Pago | Próprio — escolha do utilizador no Calcular rota.
- **Tabela de viagem (pago)**: Velocidades e tarifas Dentro/Fora por tipo de via (já existentes).
- **Velocidade própria**: Valor numérico &gt; 0; default **4** quando modo = próprio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em ≤ 1 minuto, um utilizador novo identifica e selecciona Pago vs Próprio no Calcular rota.
- **SC-002**: No mesmo De/Para, um cálculo **pago** mostra custos &gt; 0 quando há estrada/rio tarifados; o mesmo em **próprio** mostra **0** bp Dentro e Fora.
- **SC-003**: Em próprio sem alterar o campo, o cálculo usa velocidade base **4** (tempos distintos de um cálculo pago na mesma geometria, salvo coincidência).
- **SC-004**: 100% das tentativas com velocidade própria inválida são rejeitadas com mensagem, sem lista de rotas.
- **SC-005**: Ritmo e ordenação continuam a funcionar em ambos os modos (smoke: pelo menos uma troca de cada).

## Assumptions

- Default ao abrir o painel: modo **pago** (preserva o comportamento “tabela” como principal) — **sempre**, inclusive após fechar e reabrir na mesma visita (FR-012); não persistir modo/velocidade própria entre aberturas.
- Recálculo automático ao mudar modo (com De/Para válidos) está fechado em FR-010 / Clarifications.
- Edição da velocidade própria sem Calcular/modo/ordenação: sem recálculo automático (FR-011).
- Unidade da velocidade própria = a mesma já usada no Calcular rota (mi/h / velocidade média do produto).
- Em próprio, ao entrar no modo, o campo inicia em **4**; se o utilizador editar e permanecer em próprio, mantém o valor editado até mudar de modo; ao voltar de pago → próprio, o campo **repor** para **4**.
- Em próprio, ainda se mostram as linhas Dentro/Fora com **0** (transparência), não se escondem os custos.
- “Em vez de editar a velocidade” aplica-se ao fluxo **pago**; a velocidade só é editável em **próprio**.
- Descoberta/ordenação de rotas continua a respeitar a preferência rápida/barata já existente; em próprio, “barata” empata em custo e desempata por tempo.
- Sem mudança do modelo de dados de segmentos; só parâmetros do cálculo / UI.

## Out of Scope

- Novas tarifas ou novas velocidades de tabela (além de usar as actuais em pago).
- Escolha de veículo concreto (cavalo, carroça, etc.) além de pago vs próprio + velocidade.
- Alterar o digitizer / Rede de rotas.
- Conversão de moeda além de bp.
