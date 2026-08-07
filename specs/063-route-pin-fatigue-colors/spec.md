# Feature Specification: Route Overnight Pins & Fatigue Segment Colors

**Feature Branch**: `063-route-pin-fatigue-colors`

**Created**: 2026-08-07

**Status**: Implemented

**Input**: User description: "Diminua os indicativos de pernoite, coloque-os como pins de cor Azul com mouse hover indicado pernoite, se for um Local, deixa o pin da mesma cor dos pins de locais, para os indicadores de fadiga, ao invés de adicionar um marcador na rota mude a cor do segmento que teremos a fadiga. Segmentos de rota devem ter a cor verde a partir de agora, segmentos com fadiga deve ficar vermelhos com uma indicação com mouse hover sob o segmento para indicar que há ganho de fadiga."

**Depends on**: `062-route-pernoites` (overnight + fatigue data already on planned routes)

## Clarifications

### Session 2026-08-07

- Q: Em ritmo intenso, quais trechos ficam vermelhos por “ganho de fadiga”? → A: Só dias que **deixam** fadiga (pernoite **relento** ou **dia de chegada** sem noite recuperadora); o vermelho fica **mais intenso a cada ponto de fadiga**
- Q: Pernoite em Local (já há pin do Local) — como mostrar? → A: **Sem segundo pin** — marcar pernoite no pin de Local existente (badge/halo/tooltip “Pernoite”) na cor desse Local
- Q: Com saldo ≥ 6 (morte), o mapa faz algo além do vermelho mais escuro? → A: **Só o vermelho mais intenso** — sem badge extra no mapa; (actualizado) alerta de morte **não** fica na lista — só mapa/hover
- Q: Remover o texto de pernoites do descritivo da rota no Calcular rota? → A: Sim — **remover** o resumo textual de pernoites nas linhas da lista do painel (a informação de pernoite fica no mapa)
- Q: Manter ou remover o texto de fadiga (saldo/aviso/morte) na lista do Calcular rota? → A: **Remover** também — fadiga só via cores/hover no mapa

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pernoites como pins discretos (Priority: P1)

Ao seleccionar uma rota multi-dia, os pernoites deixam de parecer marcadores SVG grandes/genéricos. Pernoite **ao relento** usa um **pin azul pequeno** com hover “Pernoite”. Pernoite **em Local** **não** cria um segundo pin: o pin de Local já existente ganha indicação de pernoite (badge/halo) e hover “Pernoite”, mantendo a **cor do Local**.

**Why this priority**: Corrige a leitura visual e evita pins duplicados no mesmo sítio.

**Independent Test**: Relento → pin azul pequeno; Local → só o pin do Local com badge de pernoite; hover comunica pernoite.

**Acceptance Scenarios**:

1. **Given** rota seleccionada com pernoite ao relento, **When** o utilizador olha o mapa, **Then** vê um pin **azul** pequeno (não o marcador SVG anterior) na posição do pernoite.
2. **Given** esse pin azul, **When** passa o rato (ou foco equivalente), **Then** vê indicação clara de **pernoite** (ex. tooltip/label “Pernoite”).
3. **Given** rota seleccionada com pernoite em Local, **When** observa o mapa, **Then** **não** há um segundo pin no mesmo sítio; o pin de Local existente mostra indicação de pernoite na **cor desse Local**.
4. **Given** pernoite em Local, **When** faz hover no pin de Local, **Then** vê indicação de **pernoite** (além do nome/comportamento habitual do Local, se aplicável).
5. **Given** pernoites visíveis, **When** compara com o estado anterior da feature 062, **Then** os indicadores são **mais pequenos** / mais discretos.

---

### User Story 2 - Rotas verdes; fadiga na cor do segmento (Priority: P1)

As polilinhas de rota no mapa passam a ser **verdes** por omissão. Em vez de um marcador extra de fadiga, só os trechos de dias que **deixam** fadiga (noite ao relento, ou chegada sem descanso recuperador) pintam-se de **vermelho**, com vermelho **mais intenso** à medida que o saldo de fadiga sobe. Hover sobre um segmento vermelho indica ganho/saldo de fadiga nesse trecho.

**Why this priority**: Substitui o modelo “marcador de fadiga” por leitura espacial; dias com noite em Local (recuperam o +1 do dia) ficam verdes.

**Independent Test**: Intenso com noite em Local no meio → esse dia verde; dia ao relento / chegada → vermelho; dias posteriores com mais saldo → vermelho mais forte.

**Acceptance Scenarios**:

1. **Given** uma rota seleccionada **sem** fadiga residual nos trechos (ex. ritmo normal), **When** o mapa mostra a rota, **Then** os segmentos visíveis dessa rota são **verdes**.
2. **Given** ritmo **intenso** e um dia que termina **ao relento** (ou chegada sem recuperação), **When** a rota está seleccionada, **Then** os segmentos desse dia são **vermelhos**; dias cujo pernoite em Local anula o +1 desse dia permanecem **verdes**.
3. **Given** vários dias vermelhos com saldo acumulado crescente, **When** o utilizador compara os trechos, **Then** o vermelho é **visualmente mais intenso** onde o saldo de fadiga é maior.
4. **Given** um segmento vermelho (fadiga), **When** o utilizador faz hover sobre esse segmento, **Then** vê indicação de **ganho de fadiga** (texto legível, podendo incluir o saldo nesse ponto).
5. **Given** a mesma rota em ritmo normal, **When** recalcula, **Then** não há segmentos vermelhos por fadiga nem hover de fadiga.

---

### User Story 3 - Alternativas e selecção (Priority: P2)

Rotas alternativas (não seleccionadas) continuam legíveis: base **verde** (possivelmente mais discreta/tracejada), sem confundir com pins de Local. Só a rota **seleccionada** mostra pins de pernoite e coloração vermelha de fadiga por segmento (evitar poluir o mapa com todas as alternativas).

**Why this priority**: Mantém comparação de rotas sem sobrecarregar o mapa.

**Independent Test**: Duas+ rotas na lista; só a seleccionada tem pins de pernoite e vermelho de fadiga; alternativas verdes discretas.

**Acceptance Scenarios**:

1. **Given** várias rotas no resultado, **When** nenhuma/outra está seleccionada excepto a activa, **Then** só a seleccionada mostra pins de pernoite e segmentos vermelhos de fadiga.
2. **Given** o utilizador muda a selecção, **When** a nova rota é destacada, **Then** pins e cores de fadiga actualizam-se para essa rota.

---

### User Story 4 - Lista limpa (sem pernoite nem fadiga no texto) (Priority: P1)

Nas linhas de resultado do Calcular rota, **não** aparece o texto de pernoites nem o de fadiga (saldo/aviso/morte) adicionados em 062. Distância/tempo/custos continuam; pernoites e fadiga leem-se no **mapa** (pins/badge e segmentos vermelhos + hover).

**Why this priority**: Pedido explícito — limpar o descritivo da lista.

**Independent Test**: Calcular rota multi-dia intensa → lista só com meta de viagem (mi/tempo/custos); mapa mostra pins e vermelho de fadiga.

**Acceptance Scenarios**:

1. **Given** rotas multi-dia no resultado, **When** o utilizador lê cada linha da lista, **Then** **não** há resumo textual de pernoites nem linhas de fadiga/aviso/morte.
2. **Given** a mesma rota seleccionada (intenso), **When** olha o mapa, **Then** pernoites e fadiga continuam indicados visualmente (pins/badge; segmentos vermelhos + hover).
3. **Given** ritmo intenso com pico ≥ 6, **When** lê a lista, **Then** o alerta de morte **não** aparece como texto na linha — a gravidade lê-se pelo vermelho máximo no mapa (e hover).

---

- Rota de um dia sem pernoites: sem pins de pernoite; se intenso, o(s) segmento(s) do único dia de marcha com +1 fadiga podem ficar vermelhos.
- Pernoite em Local sem cor conhecida: usar a cor padrão dos pins de Local da aplicação.
- Hover em mobile: onde não há hover de rato, o mesmo significado deve ser acessível (ex. toque curto mostra o mesmo texto de pernoite/fadiga) — se a plataforma já tiver padrão de tooltip ao toque, reutilizá-lo.
- Segmento muito curto: hit area de hover deve ser usável (não exigir pixel perfeito).
- Lista do painel: **sem** resumo textual de pernoites e **sem** texto de fadiga/aviso/morte; só meta de viagem (distância/tempo/custos e título).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Indicadores de pernoite no mapa MUST ser **discretos** (pins pequenos para relento; sem círculos SVG grandes de 062).
- **FR-002**: Pernoite tipo **relento** MUST usar pin de cor **azul** e, no hover (ou equivalente), indicar **pernoite**.
- **FR-003**: Pernoite tipo **local** MUST NOT criar um segundo pin; MUST marcar o **pin de Local existente** (badge/halo ou equivalente) na cor desse Local, com hover (ou equivalente) a indicar **pernoite**.
- **FR-003b**: O clique/tap no pin de Local com indicação de pernoite MUST manter o comportamento habitual de detalhe do Local (a indicação de pernoite é visual/hover, não substitui o detalhe).
- **FR-004**: A cor base das polilinhas de rota no mapa MUST ser **verde** (substitui o vermelho como cor padrão de traçado de viagem).
- **FR-005**: O sistema MUST NOT usar um marcador dedicado de fadiga sobre a rota; a fadiga no mapa MUST reflectir-se na **cor do segmento**.
- **FR-006**: Em ritmo intenso, segmentos MUST pintar-se de **vermelho** apenas nos dias de marcha que **deixam** fadiga: pernoite **relento**, ou **dia de chegada** sem pernoite recuperador. Dias cujo pernoite **local** recupera o +1 desse dia MUST permanecer **verdes**.
- **FR-006b**: A intensidade do vermelho MUST **aumentar com o saldo de fadiga** após esse dia (mais pontos → vermelho mais forte), até o vermelho máximo na escala (incl. saldo ≥ 6). MUST NOT acrescentar badge/padrão/pulse extra de “morte” no mapa.
- **FR-007**: Hover (ou equivalente) sobre um segmento vermelho de fadiga MUST indicar **ganho de fadiga** (e preferencialmente o saldo nesse ponto), incluindo quando o saldo atinge o limiar de morte.
- **FR-008**: Pins de pernoite e coloração vermelha por fadiga MUST aplicar-se à rota **seleccionada**; alternativas MUST permanecer verdes e sem pins de pernoite (podem ser mais discretas).
- **FR-009**: O painel Calcular rota MUST **deixar de mostrar** o resumo textual de pernoites e **qualquer** texto de fadiga (saldo, aviso suave, alerta de morte) nas linhas da lista. Pernoites e fadiga MUST comunicar-se pelo **mapa** (e hovers).
- **FR-010**: Mudar ritmo/selecção MUST actualizar pins e cores de segmento de forma coerente com os dados da rota activa.

### Key Entities

- **Pin de pernoite (relento)**: Pin azul pequeno no mapa.
- **Indicação de pernoite em Local**: Badge/halo no pin de Local existente (sem pin duplicado).
- **Segmento de rota (visual)**: Trecho da polilinha associado a um dia de marcha para coloração verde vs vermelho-fadiga.
- **Dia com fadiga residual (mapa)**: Em ritmo intenso, dia que termina ao relento ou chegada sem recuperação — elegível a vermelho; intensidade ligada ao saldo após esse dia.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste visual, 100% dos pernoites **ao relento** da rota seleccionada aparecem como pins azuis pequenos (não círculos SVG grandes de 062); 100% dos pernoites **em Local** usam o pin de Local existente com indicação de pernoite (sem segundo pin).
- **SC-002**: Em ≥ 95% dos casos manuais, hover no pin azul de relento comunica “pernoite” em menos de **3 segundos**.
- **SC-003**: Com ritmo intenso e pelo menos um dia com fadiga residual, o utilizador identifica trechos vermelhos vs verdes em menos de **15 segundos**.
- **SC-004**: Hover num segmento vermelho comunica ganho de fadiga em menos de **3 segundos**.
- **SC-005**: Em ritmo normal, **0** segmentos vermelhos por fadiga na rota seleccionada.
- **SC-006**: Alternativas não seleccionadas não mostram pins de pernoite nem vermelho de fadiga (só traçado verde discreto).
- **SC-007**: Com dois trechos vermelhos de saldos diferentes (ex. 1 vs 3+), o utilizador distingue qual é o vermelho **mais intenso** em teste visual lado a lado.
- **SC-008**: Em 100% das linhas do painel após esta feature, estão **ausentes** o resumo textual de pernoites e o texto de fadiga/aviso/morte.

## Assumptions

- Dados de `pernoites` e fadiga por dia já vêm do cálculo 062; esta feature é sobretudo **apresentação no mapa** (+ limpeza do texto de pernoite na lista).
- Remover o texto de pernoite **e** de fadiga na lista **não** remove os dados da API; só a UI do descritivo.
- Morte (saldo ≥ 6) comunica-se no mapa pelo vermelho máximo + hover no segmento (já não por texto na lista).
- “Cor dos pins de locais” = a cor usada pelos pins de Local no mapa (incluindo `cor_pin` do Local quando o pernoite tem `local_id`).
- Segmentação visual “por dia de marcha”: usa a progressão da simulação de pernoites (trecho entre início do dia e pernoite / chegada) para mapear geometria → dia → cor.
- Verde = sem fadiga residual naquele dia; vermelho escalonado pelo **saldo após esse dia** (máximo na escala para ≥ 6); sem cue extra de morte no mapa; selecção diferencia-se por espessura/opacidade, não pelo vermelho antigo como cor base.
- Tooltip/label de hover pode reutilizar padrões de acessibilidade já usados no mapa (title, aria, etc.).
- Fora de escopo: mudar regras de cálculo de fadiga/pernoite; redesenhar o digitizer admin; alterar cores de pins de Local no resto do mapa (só o pin de *pernoite em Local* alinha à cor de Local).
