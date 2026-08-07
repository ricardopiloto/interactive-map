# Feature Specification: Route Planner Cohesion

**Feature Branch**: `064-route-planner-cohesion`

**Created**: 2026-08-07

**Status**: Implemented

**Input**: User description: "Mude a cor das rotas não selecionadas para vermelho. O calculo de pernoite tem que levar em consideração o calculo normal de distancia, ou seja, se uma rota tem 6 dias de viagem por rio não pode ter 10 paradas de pernoite (uma vez que ela dura somente 6 dias de viagem), isso fica desconexo com o calculo normal de distancia e tempo de viagem. Vamos também migrar o menu de calculo de rota para o menu lateral, junto dos demais menus de Locais, NPCs e História para manter uma coesão visual e deixar mais espaço para o usuário conseguir ver o mapa com melhor clareza."

**Depends on**: `062-route-pernoites`, `063-route-pin-fatigue-colors` (overnight + map colours); existing side menu (Locais / NPCs / História)

## Clarifications

### Session 2026-08-07

- Q: Quando o tempo publicado é D dias + R horas (R > 0), quantos dias de marcha usa a simulação de pernoite? → A: Dias de marcha = D + (1 se R > 0); pernoites intermédios ≤ esse total − 1; chegada no último dia (mesmo parcial) não é pernoite
- Q: Como ancorar posicionamento dos pernoites a M dias? → A: Orçamento diário = milhas da rota ÷ M; Local vs relento pela **área em volta do nó** que tiver Local associado (não inventar dias além de M); regras 062 de chegada/fadiga mantêm-se
- Q: Tamanho da área em volta do nó para Local vs relento? → A: ±20% do orçamento diário (milhas) ao longo da rota face ao marco do dia (como 062, com orçamento = milhas÷M)
- Q: Quando o clique no mapa preenche De/Para em vez do detalhe do Local? → A: Só com o separador Rota activo
- Q: Overlay de viagem no mapa ao mudar para outro separador? → A: Esconder ao sair de Rota; reaparecer ao voltar a Rota (estado interno do plano mantido)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pernoites alinhados aos dias de viagem (Priority: P1)

Ao calcular uma rota, o número e o espaçamento dos pernoites reflectem a **mesma** duração de viagem que o utilizador vê (dias/horas derivados da distância e velocidade daquela rota). Uma viagem descrita como cerca de 6 dias **não** apresenta muitas mais noites do que essa duração (ex. ~10 pernoites), mesmo em percursos predominantemente fluviais ou mistos.

**Why this priority**: Corrige desconexão entre meta de viagem e mapa/pins de pernoite — erro de confiança no planeamento.

**Independent Test**: Comparar `tempo` em dias da linha da rota com a contagem de pernoites; em rotas fluviais longas, pernoites ≤ coerência com dias de marcha publicados.

**Acceptance Scenarios**:

1. **Given** uma rota cujo tempo publicado é **D dias** (e opcionalmente **R** horas restantes), **When** o utilizador vê pernoites, **Then** os dias de marcha da simulação são **M = D** se R = 0, ou **M = D + 1** se R > 0, e há no máximo **M − 1** pernoites intermédios (sem inventar marcha além de M).
2. **Given** uma rota longa predominantemente **por rio** (ou mista) cujo descritivo indica cerca de 6 dias (com ou sem resto de horas), **When** compara com o comportamento anterior desconexo, **Then** **não** vê ~10 pernoites “a mais” face a M derivado desse descritivo.
3. **Given** ritmo normal vs intenso, **When** recalcula a mesma origem/destino, **Then** pernoites e fadiga (se intensa) continuam a seguir as regras de pernoite existentes (chegada ≠ pernoite; Local vs relento), mas **sempre** com orçamento diário = distância ÷ M e detecção de Local por área em torno de nós com Local.
4. **Given** um marco de fim de dia e um nó da rota com Local a ≤ ±20% do orçamento diário (em milhas) desse marco, **When** o pernoite é classificado, **Then** é **Local**; **Given** nenhum tal nó na janela, **Then** é **relento**.
5. **Given** rota de **1 dia** de marcha (M = 1), **When** o resultado aparece, **Then** não há pernoites intermédios.

---

### User Story 2 - Calcular rota no menu lateral (Priority: P1)

O fluxo “Calcular rota” deixa o painel flutuante/sobreposto que rouba área do mapa e passa a viver como **separador do menu lateral**, ao lado de Locais, NPCs e História (e Grupo no modo GM, se existir), com a mesma linguagem visual dos outros separadores. O mapa ganha espaço útil.

**Why this priority**: Pedido explícito de coesão e legibilidade do mapa.

**Independent Test**: Abrir o separador de rota no menu lateral; controlos De/Para/Calcular e lista de resultados estão lá; o antigo painel flutuante dedicado deixa de ocupar a vista principal.

**Acceptance Scenarios**:

1. **Given** o utilizador na vista do mapa, **When** abre o menu lateral, **Then** vê um separador dedicado a calcular rota (rótulo claro, ex. “Rota” / “Calcular rota”) junto de Locais, NPCs e História.
2. **Given** esse separador activo, **When** preenche origem/destino e calcula, **Then** obtém a mesma capacidade funcional de planear rotas (ritmo, modo, preferências, lista, selecção) **dentro** do menu lateral.
3. **Given** o separador de rota activo, **When** observa o mapa, **Then** há **mais área visível** do mapa do que com o painel flutuante anterior (sem segundo painel largo a cobrir o mapa).
4. **Given** o separador **Rota** activo, **When** o utilizador clica num pin elegível no mapa, **Then** preenche De ou Para (mapa-pick) e **não** abre o detalhe do Local; **Given** outro separador activo (ex. Locais), **When** clica no mesmo pin, **Then** o comportamento habitual de detalhe/selecção de Local aplica-se (sem mapa-pick de rota).
5. **Given** o utilizador muda para Locais (ou outro separador), **When** volta mais tarde a Rota, **Then** o estado do planeamento (campos/resultados) **mantém-se** enquanto a sessão da página estiver activa, e o overlay de viagem **reaparece** no mapa.
6. **Given** resultados de rota calculados e o separador Rota activo (overlay visível), **When** o utilizador muda para outro separador, **Then** o overlay de viagem (polilinhas, pins/badge de pernoite, cores de fadiga) **desaparece** do mapa até regressar a Rota.

---

### User Story 3 - Alternativas em vermelho (Priority: P2)

As polilinhas de rotas **não seleccionadas** no mapa passam a ser **vermelhas** (legíveis, tipicamente mais discretas/tracejadas do que a seleccionada). A rota **seleccionada** mantém o tratamento visual actual de destaque (verde base e, quando aplicável, segmentos de fadiga / pins de pernoite só nela).

**Why this priority**: Ajuste visual pedido; menor risco que o alinhamento de pernoites e a migração do menu.

**Independent Test**: Com ≥2 rotas no resultado, a não seleccionada é vermelha; a seleccionada não usa vermelho como cor base de “alternativa”.

**Acceptance Scenarios**:

1. **Given** várias rotas no resultado, **When** uma está seleccionada, **Then** as **outras** aparecem em **vermelho** no mapa.
2. **Given** o utilizador selecciona outra rota da lista, **When** o mapa actualiza, **Then** a nova seleccionada ganha o destaque de seleccionada e as restantes ficam vermelhas.
3. **Given** só uma rota no resultado, **When** está seleccionada, **Then** essa rota usa o estilo de seleccionada (não o de “alternativa vermelha”).

---

### Edge Cases

- Viagem com resto de horas (ex. “2 dias e 3 h”): M = 3 dias de marcha; no máximo 2 pernoites intermédios; a fracção final do dia 3 até à chegada não gera pernoite de chegada.
- Rota sem alternativas: só estilo de seleccionada; sem polilinhas vermelhas órfãs.
- Menu lateral em ecrã estreito / mobile: o separador de rota usa o mesmo padrão responsivo dos outros separadores (scroll interno, sem reintroduzir painel flutuante largo).
- Overlay escondido fora de Rota: pins de Local e resto do mapa comportam-se normalmente; ao voltar a Rota o traçado regressa sem perda do plano em sessão.
- Modo GM com separador Grupo: o separador de rota coexiste na mesma barra de separadores sem deslocar Grupo para fora do menu.
- Preferência rio vs estrada / modo de transporte: a coerência pernoite↔dias aplica-se a **cada** rota do resultado com o tempo **e** a distância dessa rota (orçamento = milhas÷M).
- Tolerância Local: ±20% do orçamento diário em milhas ao longo da rota (FR-001d).
- Se o cálculo de pernoite/fadiga (intenso) depender de dias de marcha, dias e fadiga MUST permanecer internamente consistentes após o alinhamento.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST alinhar a simulação de pernoites (quantidade e posicionamento ao longo da viagem) com a **duração de viagem publicada** daquela rota (dias/horas derivados do cálculo normal de distância e tempo), de modo que não existam “dias de pernoite” em excesso face a essa duração.
- **FR-001b**: Dado tempo publicado **D** dias completos e **R** horas restantes (R ≥ 0), os **dias de marcha** M MUST ser **D** quando R = 0 e **D + 1** quando R > 0. O número de pernoites intermédios MUST ser ≤ **M − 1**. A chegada no último dia de marcha MUST NOT contar como pernoite.
- **FR-001c**: O orçamento diário de progresso para posicionar fins de dia MUST ser **distância total da rota (milhas) ÷ M** (quando M ≥ 1).
- **FR-001d**: Em cada fim de dia intermédio, o sistema MUST classificar pernoite como **Local** se existir um **nó da rota com Local associado** dentro de **±20% do orçamento diário** (milhas ao longo da rota) face ao marco ideal desse dia (o mais próximo / melhor desvio dentro da tolerância); caso contrário MUST ser **relento**. A “área em volta do nó” é essa janela de tolerância em milhas em torno do marco, aplicada a nós com Local.
- **FR-002**: Para rotas com dias de marcha **M** assim definidos, o número de pernoites MUST ser coerente com M (MUST NOT apresentar ~M×1,5+ noites por desajuste de orçamento diário face ao tempo real da rota).
- **FR-003**: O alinhamento MUST aplicar-se a todos os modos/vias relevantes (incluindo percursos fluviais e mistos), não só a estrada.
- **FR-004**: Regras de negócio de pernoite já acordadas (chegada sem ser pernoite; fadiga em ritmo intenso) MUST permanecer; a ancoragem passa a FR-001b/c e a discriminação Local/relento a FR-001d (área em torno do nó com Local).
- **FR-005**: O planeamento de rota MUST estar disponível como **separador do menu lateral**, no mesmo conjunto visual que Locais, NPCs e História (e Grupo no GM quando existir).
- **FR-006**: O painel flutuante/sobreposto dedicado a “Calcular rota” que competia com a área do mapa MUST ser removido ou deixar de ser o contentor principal — a UI canónica passa a ser o separador lateral.
- **FR-007**: No separador lateral de rota, o utilizador MUST poder realizar o fluxo completo de cálculo (origem, destino, parâmetros, calcular, lista, seleccionar rota) com paridade funcional ao painel anterior.
- **FR-007b**: O mapa-pick De/Para (clique em pin elegível preenche origem/destino) MUST estar activo **apenas** quando o separador Rota está seleccionado; noutros separadores MUST NOT interceptar o clique para esse fim.
- **FR-007c**: O overlay de viagem no mapa (rotas alternativas/seleccionada, pernoites, fadiga visual) MUST estar visível **apenas** enquanto o separador Rota está activo; ao mudar para outro separador MUST ocultar-se; ao regressar a Rota MUST reaparecer com o mesmo plano em memória (sem exigir recalcular), até o utilizador recalcular ou limpar resultados.
- **FR-008**: Com o separador de rota a ser o contentor, a área útil do mapa MUST aumentar face ao layout com painel flutuante (menos sobreposição horizontal/vertical sobre o mapa).
- **FR-009**: Polilinhas de rotas **não seleccionadas** MUST usar cor **vermelha** no mapa.
- **FR-010**: A rota **seleccionada** MUST manter o destaque de seleccionada (incl. verde base e indicadores de pernoite/fadiga da feature anterior, quando existirem); o vermelho de FR-009 aplica-se às **alternativas**, não como cor base da seleccionada.
- **FR-011**: Mudar a selecção na lista MUST actualizar imediatamente cores (vermelho vs seleccionada) e indicadores exclusivos da seleccionada.

### Key Entities

- **Duração de viagem publicada**: Dias (e resto de horas) mostrados ao utilizador para uma rota, derivados do cálculo normal de distância/tempo.
- **Pernoite (simulado)**: Paragem nocturna ao longo da rota; quantidade e posição devem ser coerentes com a duração publicada.
- **Separador lateral de rota**: Secção do menu lateral que aloja o planeamento de viagem.
- **Rota alternativa (visual)**: Polilinha no mapa para um resultado não seleccionado — estilo vermelho.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em amostragem manual de ≥5 rotas multi-dia (incl. ≥2 com troços fluviais relevantes), **100%** têm contagem de pernoites ≤ **M − 1** com M derivado de D/R conforme FR-001b (sem excesso óbvio do tipo “~6 dias publicados / ~10 pernoites”).
- **SC-002**: Utilizadores encontram e abrem o cálculo de rota no menu lateral em menos de **10 segundos** sem instruções escritas (teste com alguém familiarizado com Locais/NPCs/História).
- **SC-003**: Em layout desktop típico, a largura (ou área) do mapa disponível com o separador de rota activo é **maior** do que com o painel flutuante anterior (verificação visual lado a lado / captura).
- **SC-004**: Com ≥2 rotas no resultado, **100%** das não seleccionadas aparecem vermelhas no mapa; a seleccionada não usa o estilo de alternativa vermelha.
- **SC-005**: Paridade: um cálculo De→Para com os mesmos parâmetros produz a mesma ordenação e métricas principais (distância, tempo, custos) que antes da migração do menu; só mudam contentor UI, cor das alternativas e coerência dos pernoites.

## Assumptions

- “Cálculo normal de distância e tempo” = o mesmo motor que já produz distância, dias/horas e custos na lista; M deriva de D/R (FR-001b); orçamento diário = milhas ÷ M (FR-001c).
- Coerência: no máximo **M−1** pernoites intermédios; Local se nó com Local dentro de ±20% do orçamento diário (milhas) do marco; senão relento (FR-001d).
- Rótulo do separador: algo curto e claro (“Rota” ou “Calcular rota”); detalhe exacto na implementação desde que inequívoco.
- Estado do formulário/resultados **persiste** ao mudar temporariamente para outro separador na mesma visita à página.
- Mapa-pick De/Para **só** com separador Rota activo (FR-007b).
- Overlay de viagem **só** visível com separador Rota activo; esconde ao sair e restaura ao voltar (FR-007c).
- Seleccionada permanece com o visual de 063 (verde + fadiga residual); este pedido só pinta **não seleccionadas** de vermelho.
- Fora de escopo: redesenhar Locais/NPCs/História; mudar regras de fadiga WFRP além do necessário para manter consistência com os dias corrigidos; digitizer de rede de vias.
