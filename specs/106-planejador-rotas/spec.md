# Feature Specification: Planejador de rotas

**Feature Branch**: `106-planejador-rotas`

**Created**: 2026-09-20

**Status**: Implemented

**Input**: User description: "Planejador de rotas. Opções avançadas recolhidas com resumo em chips (\"Pago · Normal · Mais rápida\"). Tempo e distância humanizados (\"5 dias e 5 h\"), unidade por campanha (mi/km) e métricas com rótulo (revisar o significado e o texto de \"Dentro/Fora\"). Resultado selecionado no acento (não em vermelho, que é \"visitado\"). Linha do tempo com pernoites. Digitalizador de rede de vias estilizado com os tokens. Sem mudar o cálculo. Depende de: UX-2. Critério-chave: nenhum número exibido sem unidade ou rótulo; nenhuma casa decimal bruta."

**Depends on**: [101-componentes-base-icones](../101-componentes-base-icones/spec.md) (UX-2); [100-fundacoes-sistema-visual](../100-fundacoes-sistema-visual/spec.md) (UX-1 — tokens/temas); RFC ([docs/v2/rfc-ux-redesign.md](../../docs/v2/rfc-ux-redesign.md) §7 e fase UX-7); constituição v1.0.0 (III, IV, V). Coordena com [103-mapa](../103-mapa/spec.md) (overlay no mapa) sem redesenhar pinos. Capacidades de cálculo existentes (custos, ritmo, pernoites, etc.) permanecem; esta fase é **apresentação**.

**Phase**: UX-7. Apresentação do **planejador de viagem** e do **digitalizador de rede de vias**. **MUST NOT** alterar a lógica de cálculo nem os contratos numéricos do planeador no servidor — só formatação, rótulos, hierarquia visual e estilo.

## Clarifications

### Session 2026-09-21

- Q: Onde fica a preferência de unidade de distância (mi/km) por campanha? → A: Campo novo na config da campanha (`mi` \| `km`, default `mi`); UI no painel admin/config da mesa; cálculo continua em milhas.
- Q: Quais opções entram nos chips de resumo recolhido? → B: Todos os grupos avançados (transporte, ritmo, ordenação, preferência de via; velocidade só se aplicável).
- Q: Como fica a copy revista de «Dentro / Fora»? → A: Rótulos curtos novos no meta (ex. «Via / Fora da via» + bp); sem tooltip obrigatório; dois totais inalterados.
- Q: Onde aparece a linha do tempo de pernoites? → A: Timeline completa só no detalhe / rota seleccionada.
- Q: Qual a granularidade do tempo humanizado? → A: Dias + horas inteiras apenas (arredondar; sem minutos).

## Constitution

- Isolamento (I): planejador e digitalizador só da campanha do slug; sem rotas novas de conteúdo (salvo se o plano justificar um campo de preferência de unidade já no config existente — sem cruzar campanhas).
- Testes primeiro (II): «nenhum número sem unidade/rótulo» e «sem casa decimal bruta» MUST ser verificáveis (amostra de UI / checklist; formatação coberta por testes onde o plano o definir).
- Produção legada (III): MUST NOT tocar `/opt/codex-*`.
- Simplicidade (IV): tokens UX-1 + Chip/Button/EmptyState da UX-2; sem motor de rotas novo.
- i18n (V): copy nova (chips de resumo, tempo humanizado, rótulos de métricas, linha do tempo, digitalizador) MUST ter pt-BR e en. Nomes de locais/nós do mestre MUST NOT ser traduzidos.
- Migrações (VI): preferência de unidade de distância por campanha MAY reutilizar config existente; se precisar de campo novo, fica no plano com migração versionada — **sem** mudar fórmulas de tempo/custo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Opções recolhidas com resumo em chips (Priority: P1)

O jogador (ou mestre) abre **Calcular rota** e vê o caminho primário (origem, destino, calcular). As **opções avançadas** (transporte, ritmo, ordenação, preferência de via, velocidade quando aplicável) ficam **recolhidas**. No estado recolhido, um **resumo em chips** mostra as escolhas actuais de forma escaneável (ex.: «Pago · Normal · Mais rápida»), alinhado ao espírito do RFC — não uma parede de rádios.

**Why this priority**: Diagnóstico do RFC (quatro grupos de rádio sempre visíveis); progressive disclosure.

**Independent Test**: Abrir o painel → opções recolhidas + chips de resumo legíveis; expandir → mesmos controlos de hoje; calcular com defaults funciona sem expandir.

**Acceptance Scenarios**:

1. **Given** o painel acaba de abrir, **When** o utilizador observa as opções, **Then** estão **recolhidas** e o resumo aparece como **chips** (ou equivalente Chip da UX-2) com os valores actuais (ex. transporte, ritmo, ordenação), não como formulário completo.
2. **Given** opções recolhidas e origem/destino válidos, **When** calcula, **Then** obtém resultados com o **mesmo poder de cálculo** de hoje (sem mudar regras).
3. **Given** o utilizador altera uma opção (ex. ritmo Intenso), **When** volta a recolher o bloco, **Then** o resumo em chips reflecte o novo valor.
4. **Given** o bloco expandido, **When** o utiliza, **Then** encontra transporte, ritmo, ordenação, preferência de via e velocidade condicional como hoje.

---

### User Story 2 - Tempo, distância e métricas legíveis (Priority: P1)

Tempo e distância aparecem **humanizados** (ex. «5 dias e 5 h», distância com unidade da campanha **mi** ou **km**). Toda métrica tem **rótulo** claro. O texto e o significado de **«Dentro / Fora»** são **revistos** para o jogador perceber o que são (dois regimes de custo de passagem em bp), sem números órfãos nem decimais brutos (ex. «0.19 h»).

**Why this priority**: Critério-chave da fase e §7 do RFC (números sempre com unidade; sem casas decimais soltas).

**Independent Test**: Lista de resultados sem «0.19 h» nem «12.345»; cada número tem unidade ou rótulo; unidade mi/km coerente com a preferência da campanha; Dentro/Fora com copy revista e bp.

**Acceptance Scenarios**:

1. **Given** uma rota multi-dia, **When** se lê o tempo, **Then** está humanizado (dias e horas compreensíveis), **sem** fracções decimais brutas de hora.
2. **Given** a campanha com unidade **mi** (ou **km**), **When** se lê a distância nos resultados, **Then** a unidade mostrada é a da campanha; o valor é formatado sem decimal bruto desnecessário (arredondamento legível).
3. **Given** custos de passagem, **When** se lêem as métricas que hoje se chamam Dentro/Fora, **Then** têm **rótulo** revisto (pt-BR e en) que comunica o significado (dois regimes de tarifa em bp) e mostram a unidade **bp** (ou equivalente i18n), nunca só o número.
4. **Given** qualquer número visível no planejador (distância, tempo, custo, velocidade, fadiga se mostrada), **When** se inspecciona, **Then** tem unidade ou rótulo; **nenhuma** casa decimal bruta tipo «0.19 h».

---

### User Story 3 - Selecção no acento; linha do tempo de pernoites (Priority: P1)

O resultado **seleccionado** usa a cor de **acento** do tema — **não** vermelho da família «visitado». Para rotas multi-dia, o painel mostra uma **linha do tempo** dos **pernoites** (Local ou ao relento), legível e alinhada aos dados já calculados.

**Why this priority**: RFC (selecção em vermelho = visitado); pernoites já existem nos dados — falta apresentação temporal clara.

**Independent Test**: Item seleccionado ≠ vermelho visitado; acento do tema; rota multi-dia mostra timeline de pernoites sem recalcular.

**Acceptance Scenarios**:

1. **Given** várias rotas na lista, **When** uma está seleccionada, **Then** o destaque usa o **acento** (token), não o vermelho associado a «visitado» no mapa.
2. **Given** rota multi-dia com pernoites calculados, **When** o utilizador vê o detalhe/resultado, **Then** vê uma **linha do tempo** (ou sequência temporal) dos pernoites (nome de Local ou «ao relento»), sem inventar paragens novas.
3. **Given** rota de um só dia sem pernoite intermédio, **When** se observa, **Then** a timeline não inventa noites; pode omitir-se ou mostrar só a viagem do dia de forma clara.

---

### User Story 4 - Digitalizador com tokens (Priority: P2)

O **digitalizador de rede de vias** (modo mestre) usa os **tokens** do sistema visual (UX-1) e componentes base onde couber (UX-2) — deixa de parecer um ecrã “órfão” com cores soltas.

**Why this priority**: Completa a superfície de rotas; secundário ao painel do jogador.

**Independent Test**: Abrir Rede de vias / digitalizador nos dois temas; controlos e traçados legíveis; sem hexadecimais de UI fora dos tokens (excepto dados do mestre se existirem).

**Acceptance Scenarios**:

1. **Given** mestre com permissão de edição, **When** abre o digitalizador, **Then** a UI usa tokens/tema (claro e escuro) de forma coerente com o resto da app.
2. **Given** o digitalizador, **When** se compara com o painel Calcular rota, **Then** partilham a mesma linguagem visual (não um tema paralelo).

---

### Edge Cases

- Opções nos defaults: chips de resumo MUST continuar a comunicar o estado actual (não ocultar o resumo só porque está no default — o exemplo do prompt inclui defaults «Pago · Normal · Mais rápida»).
- Unidade km: conversão é **só de apresentação**; cálculo e armazenamento continuam no modelo actual (milhas internas) — MUST NOT mudar tempos/custos por causa da unidade de ecrã.
- Tempo &lt; 1 dia: humanizar em horas (e minutos se necessário) sem decimais brutos.
- Distância muito curta: arredondar de forma legível; nunca «0.000» sem unidade.
- Fadiga / alertas já existentes: se continuarem visíveis, MUST cumprir a regra de número+rótulo; MUST NOT alterar regras de fadiga.
- Overlay no mapa: selecção/destaque da rota no mapa MUST NOT reintroduzir vermelho «visitado» como único sinal de «seleccionado» no painel; coordenar com UX-4 sem redesenhar pinos.
- Viewport estreita: De → Para → Calcular e chips MUST permanecer utilizáveis; timeline scrollável se longa.
- `/opt/codex-*` intocado; sem mudança da lógica de cálculo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Opções avançadas do planejador MUST estar **recolhidas por omissão**, com **resumo em chips** dos valores actuais (ex. transporte · ritmo · ordenação), expansíveis para os controlos completos existentes.
- **FR-002**: Tempo de viagem apresentado MUST ser **humanizado** em **dias e horas inteiras** (arredondar); MUST NOT mostrar minutos nem fracções decimais brutas de hora (ex. «0.19 h»).
- **FR-003**: Distância apresentada MUST usar a **unidade da campanha** (**mi** ou **km**) e formatação legível sem decimal bruto desnecessário.
- **FR-004**: Preferência de unidade de distância MUST ser **por campanha** (configuração da mesa); o valor calculado internamente MUST NOT mudar por causa da unidade de ecrã.
- **FR-005**: Toda métrica numérica no planejador MUST ter **unidade ou rótulo** visível (critério-chave).
- **FR-006**: Os custos hoje rotulados «Dentro / Fora» MUST ter **rótulos curtos novos** (ex. «Via / Fora da via», pt-BR e en) com unidade **bp**; MUST NOT depender de tooltip obrigatório. O **significado numérico** (dois totais) MUST permanecer o mesmo.
- **FR-007**: O resultado **seleccionado** MUST usar o **acento** do tema; MUST NOT usar vermelho da família «visitado» como destaque de selecção no painel.
- **FR-008**: A rota **seleccionada** multi-dia MUST apresentar **linha do tempo de pernoites** (Local / ao relento) com base nos pernoites já calculados — sem novo algoritmo de paragens. MUST NOT exigir timeline completa em cada linha da lista.
- **FR-009**: O digitalizador de rede de vias MUST ser estilizado com **tokens** UX-1 (e padrões UX-2 onde aplicável), nos dois temas.
- **FR-010**: MUST NOT alterar a lógica de cálculo no servidor nem as regras de negócio de distância/tempo/custo/pernoite/fadiga — apenas apresentação, formatação e estilo.
- **FR-011**: MUST NOT exigir `/opt/codex-*`.

### Out of Scope

- Novo algoritmo de planeamento, tarifas ou pernoites.
- Redesenho completo do mapa/pinos (UX-4) ou listas (UX-5).
- Acento por campanha (UX-9) — usa o acento do tema actual.
- Contas/login (095) além de respeitar quem já pode editar o digitalizador.

### Key Entities

- **Resumo em chips**: representação compacta das opções de viagem actuais no cabeçalho recolhido.
- **Métrica rotulada**: par (rótulo + valor formatado + unidade).
- **Unidade de campanha**: mi ou km para *exibição* de distância.
- **Linha do tempo de pernoites**: sequência ordenada das noites da viagem seleccionada/listada.
- **Digitalizador**: UI de edição da rede de vias do mestre.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em amostragem do painel de resultados (várias rotas, multi-dia e curtas), **0** números sem unidade ou rótulo; **0** fracções decimais brutas de tempo/distância do tipo «0.19 h» ou equivalentes.
- **SC-002**: Com opções recolhidas, um revisor identifica transporte/ritmo/ordenação actuais pelos **chips** em ≤ 5 s sem expandir o bloco.
- **SC-003**: Em tema claro e escuro, o item seleccionado **não** se confunde com a cor «visitado» do mapa; o destaque é o **acento**.
- **SC-004**: Rota multi-dia com ≥ 1 pernoite mostra linha do tempo com **todas** as noites já calculadas (Local ou relento), sem inventar nem omitir.
- **SC-005**: Campanha em mi e campanha em km mostram a unidade correcta na distância; tempos/custos bp **iguais** aos do mesmo cálculo (só muda a apresentação da distância).
- **SC-006**: Digitalizador nos dois temas passa revisão visual de legibilidade (tokens; sem UI “órfã”).

## Assumptions

- Defaults de abertura do painel mantêm-se (pago, ritmo normal, mais rápida, etc.); o resumo em chips **mostra** esses valores mesmo quando são default, cobrindo **todos** os grupos avançados activos (velocidade só quando aplicável).
- «Humanizado» para tempo: dias inteiros + horas inteiras (arredondar); **sem** minutos nem fracções decimais.
- Unidade por campanha: campo novo na config da campanha (`mi` \| `km`, default `mi`); conversão só de apresentação.
- Revisão de «Dentro/Fora»: rótulos curtos novos (ex. «Via / Fora da via» + bp, i18n); mantém **dois** totais de bp; sem tooltip obrigatório.
- Pernoites e fadiga já vêm do cálculo existente (062+); UX-7 só organiza a timeline **na rota seleccionada** e o destaque.
- Cálculo interno permanece em milhas; km é factor de apresentação (~1,609) documentado no plano.
- UX-1/UX-2 entregues (ou em curso) antes da implementação desta fase.
