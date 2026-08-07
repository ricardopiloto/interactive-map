# Feature Specification: Route Default Red

**Feature Branch**: `065-route-default-red`

**Created**: 2026-08-07

**Status**: Implemented

**Input**: User description: "Volte a rota default para a cor vermelha, Mantenha a regra de escurecer o vermelho conforme aumenta o acumulo de fadiga."

**Depends on**: `063-route-pin-fatigue-colors` (segment colouring + fatigue intensity); `064-route-planner-cohesion` (alt routes currently red)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rota seleccionada volta ao vermelho (Priority: P1)

A polilinha da rota **seleccionada** deixa de usar verde como cor base e volta a ser **vermelha** por omissão (trechos sem fadiga residual / ritmo normal). O utilizador reconhece de imediato a viagem activa em vermelho no mapa.

**Why this priority**: Pedido explícito de reverter a cor default introduzida em 063.

**Independent Test**: Calcular rota em ritmo normal; a seleccionada aparece vermelha (não verde).

**Acceptance Scenarios**:

1. **Given** uma rota seleccionada em ritmo **normal** (sem fadiga residual), **When** o mapa mostra a viagem, **Then** a polilinha dessa rota é **vermelha** (não verde).
2. **Given** a mesma rota, **When** o utilizador compara com o estado pós-063 (verde), **Then** a cor base da seleccionada voltou ao vermelho de viagem.
3. **Given** só uma rota no resultado, **When** está seleccionada, **Then** usa o estilo vermelho de seleccionada (espessura/opacidade de destaque), não o de alternativa discreta.

---

### User Story 2 - Fadiga continua a escurecer o vermelho (Priority: P1)

Em ritmo intenso, os trechos com fadiga residual continuam a pintar-se de vermelho **mais intenso** à medida que o saldo de fadiga sobe (escala até o vermelho máximo), sem voltar a marcadores dedicados de fadiga. Trechos do mesmo dia que **não** deixam fadiga (ex. noite em Local que recupera) permanecem no vermelho “base” da rota (não no tom escurecido de fadiga).

**Why this priority**: Pedido explícito de manter a regra de intensidade; sem isto a reversão de cor apagaria o valor de 063.

**Independent Test**: Intenso com pelo menos um dia residual e saldos diferentes → vermelho mais escuro onde o saldo é maior; dias recuperados em Local sem escurecimento de fadiga.

**Acceptance Scenarios**:

1. **Given** ritmo **intenso** e um dia que deixa fadiga (relento ou chegada sem recuperação), **When** a rota está seleccionada, **Then** esse trecho é vermelho **mais escuro** que o vermelho base (proporcional ao saldo após esse dia, até o máximo da escala).
2. **Given** dois trechos residuais com saldos distintos (ex. 1 vs 3+), **When** o utilizador compara, **Then** distingue visualmente qual vermelho é o **mais intenso**.
3. **Given** um dia cujo pernoite em Local anula o +1 desse dia, **When** observa o mapa, **Then** esse trecho **não** usa o vermelho escurecido de fadiga (fica no vermelho base da seleccionada).
4. **Given** ritmo normal, **When** recalcula, **Then** não há escurecimento por fadiga (só vermelho base).

---

### User Story 3 - Alternativas legíveis face à seleccionada (Priority: P2)

Com a seleccionada outra vez vermelha, as rotas **não seleccionadas** continuam distinguíveis (ex. vermelho mais claro/tracejado ou menor opacidade), sem confundir com o vermelho base nem com o vermelho máximo de fadiga da seleccionada.

**Why this priority**: Evitar que todas as polilinhas fiquem indistinguíveis após a reversão.

**Independent Test**: ≥2 rotas; seleccionada vermelha destacada; alternativas mais discretas; só a seleccionada mostra escurecimento por fadiga / pins de pernoite.

**Acceptance Scenarios**:

1. **Given** várias rotas no resultado, **When** uma está seleccionada, **Then** as outras são visivelmente **mais discretas** que a seleccionada (ainda na família vermelha ou equivalente acordado nas Assunções).
2. **Given** o utilizador muda a selecção, **When** o mapa actualiza, **Then** destaque e (se intenso) escurecimento de fadiga acompanham só a nova seleccionada.

---

### Edge Cases

- Rota de um dia intenso com fadiga residual: toda a polilinha (ou o único trecho) pode ser vermelho escurecido conforme o saldo.
- Pico ≥ 6 (morte): continua a comunicar-se pelo vermelho **máximo** da escala + hover existente; sem badge extra de morte no mapa.
- Overlay só no separador Rota (064): as cores aplicam-se quando o overlay está visível.
- Zoom extremo: contraste entre base e fadiga permanece legível em teste visual desktop típico.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A cor base da polilinha da rota **seleccionada** MUST ser **vermelha** (substitui o verde introduzido como default de viagem em 063).
- **FR-002**: Em trechos **sem** fadiga residual (ritmo normal, ou dias que não deixam fadiga), a seleccionada MUST usar esse vermelho base (não o tom máximo da escala de fadiga).
- **FR-003**: Em ritmo intenso, trechos de dias que **deixam** fadiga MUST continuar a usar vermelho cuja **intensidade aumenta com o saldo de fadiga** após esse dia, até o vermelho máximo da escala (incl. saldo ≥ 6), conforme as regras de elegibilidade já definidas em 063.
- **FR-004**: O sistema MUST NOT remover nem substituir a regra de escurecimento por fadiga por outra cor de família (ex. voltar a verde+vermelho misto na seleccionada).
- **FR-005**: Rotas **não seleccionadas** MUST permanecer distinguíveis da seleccionada (estilo mais discreto); MUST NOT receber o escurecimento por fadiga nem o chrome exclusivo da seleccionada (pernoites/fadiga por segmento).
- **FR-006**: Hover / indicação de ganho de fadiga nos segmentos escurecidos MUST manter-se utilizável (comportamento já existente).
- **FR-007**: Mudar ritmo ou selecção MUST actualizar as cores de forma coerente com FR-001–FR-005.

### Key Entities

- **Vermelho base (rota seleccionada)**: Cor default da viagem activa sem escurecimento de fadiga.
- **Vermelho de fadiga**: Tom mais intenso do vermelho base, escalonado pelo saldo após o dia residual.
- **Rota alternativa (visual)**: Polilinha não seleccionada — vermelho discreto / tracejado, sem escala de fadiga.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em ritmo normal, **100%** das rotas seleccionadas testadas aparecem com cor base **vermelha** (0 verdes de viagem como default).
- **SC-002**: Com intenso e ≥2 trechos residuais de saldos diferentes, o utilizador identifica o vermelho **mais intenso** em teste visual lado a lado em menos de **15 segundos**.
- **SC-003**: Em ritmo normal, **0** segmentos usam o tom escurecido de fadiga.
- **SC-004**: Com ≥2 rotas, o utilizador distingue seleccionada vs alternativas em menos de **5 segundos**.
- **SC-005**: Regras de *quais* dias escurecem (residual vs Local) permanecem as de 063 — esta feature só altera a **família de cor base** (verde → vermelho), não a lógica de elegibilidade.

## Assumptions

- “Rota default” = cor base da rota **seleccionada** no mapa (não o separador do menu nem a lista).
- Alternativas: mantêm-se vermelhas mas **mais discretas** (tracejado / opacidade / tom mais claro) do que a seleccionada — alinhado a 064, agora que a seleccionada também é vermelha.
- A escala de intensidade de fadiga (níveis até máximo em saldo ≥ 6) e a regra de dias residuais (relento / chegada sem recuperação; Local recupera → sem escurecimento) **não mudam**.
- Pins de pernoite / badge em Local (063) e overlay só no tab Rota (064) ficam fora de alteração excepto se a mudança de cor base exigir contraste CSS mínimo.
- Fora de escopo: alterar cálculo de fadiga/pernoite; redesenhar o menu lateral; mudar cores de pins de Local.
