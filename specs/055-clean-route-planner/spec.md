# Feature Specification: Clean Calcular Rota Panel

**Feature Branch**: `055-clean-route-planner`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "O menu de calcular rota está cheio de informação, precisamos ajustar para deixar ele mais 'clean'. Faça uma análise do ponto de vista de um Designer de UI/UX e ajuste."

## Clarifications

### Session 2026-08-05

- Q: Ordem vertical Calcular vs opções? → A: De → Para → Calcular → Opções (recolhidas) → Resultados.
- Q: Resumo quando opções estão recolhidas? → A: Sim — linha curta só com valores **diferentes do default**; sem resumo se tudo estiver nos defaults.

## UX Diagnosis (Designer view)

O painel **Calcular rota** acumulou controlos de várias features (transporte, ritmo, ordenação, preferência de via, velocidade) todos **sempre visíveis** num cartão estreito (~280px) com scroll. O resultado:

| Problema | Impacto |
|----------|---------|
| Tudo no mesmo nível visual | O utilizador não vê um caminho claro De → Para → Calcular |
| 3 fieldsets de rádios + select + comboboxes | Densidade alta; “ruído” antes de qualquer resultado |
| Rótulos longos (ex. ritmo com horas no label) | Ocupam largura sem acrescentar decisão no momento |
| Resultados em várias linhas por item | Lista compete com o formulário; difícil comparar rotas |
| Velocidade só em próprio, mas resto permanente | Opções avançadas misturam-se com o fluxo principal |

**Direcção de design (locked nesta spec)**: *progressive disclosure* — caminho primário limpo; opções de viagem agrupadas e **recolhidas por omissão**; resultados mais compactos. **Não** remover capacidades (050/046/054); só reorganizar hierarquia e densidade.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Calcular com o mínimo de ruído (Priority: P1)

O jogador abre **Calcular rota**, vê sobretudo **De**, **Para** e **Calcular** (e o título/fechar), nesta ordem. Abaixo do botão Calcular fica o bloco de opções (recolhido) e depois a lista de resultados. Escolhe origem/destino, calcula, e lê alternativas sem o formulário parecer uma ficha de imposto.

**Why this priority**: Resolve o pedido “mais clean” no fluxo mais frequente.

**Independent Test**: Abrir o painel sem expandir opções; completar De/Para/Calcular; confirmar que opções avançadas não ocupam a maior parte do painel.

**Acceptance Scenarios**:

1. **Given** o painel acaba de abrir, **When** o utilizador observa o conteúdo, **Then** a ordem vertical é De → Para → Calcular → Opções (recolhidas) → (espaço para resultados); as opções avançadas **não** estão todas expostas.
2. **Given** De/Para válidos e opções recolhidas, **When** o utilizador clica Calcular, **Then** obtém a lista de rotas com o mesmo poder de cálculo de hoje (defaults actuais: transporte pago, ritmo normal, mais rápida, sem preferência de via).
3. **Given** resultados na lista, **When** compara duas alternativas, **Then** consegue ler distância, tempo e custos **sem** cada item ocupar um bloco visual excessivamente alto (informação principal numa hierarquia clara: título + linha de meta).

---

### User Story 2 - Ajustar opções sem perder poder (Priority: P1)

Quando precisa, o utilizador **abre** o grupo de opções de viagem e encontra transporte, ritmo, ordenação, preferência de via e (se próprio) velocidade — com o mesmo comportamento funcional já definido (auto-recálculo ao mudar modo/ordenação/preferência; reset ao reabrir o painel).

**Why this priority**: “Clean” não pode significar perder 050/046/054.

**Independent Test**: Expandir opções; alterar cada controlo; verificar comportamento existente (incl. velocidade só em próprio; reopen resets).

**Acceptance Scenarios**:

1. **Given** o grupo de opções está recolhido e todos os valores estão nos defaults de abertura, **When** o utilizador olha para o cabeçalho do bloco, **Then** vê o rótulo do bloco **sem** linha de resumo de desvios.
2. **Given** o grupo está recolhido e há pelo menos um valor diferente do default (ex. próprio, mais barata, por rio, ritmo intenso), **When** o utilizador olha para o cabeçalho, **Then** vê uma **linha curta de resumo** desses não-defaults (sem expandir).
3. **Given** o grupo de opções está recolhido, **When** o utilizador o expande, **Then** vê transporte, ritmo, ordenar por e preferência de via (e velocidade se transporte próprio).
4. **Given** opções expandidas e De/Para válidos, **When** muda modo, ordenação ou preferência de via, **Then** a lista recalcula automaticamente como hoje.
5. **Given** o painel foi usado com opções alteradas, **When** o fecha e reabre, **Then** defaults de abertura actuais mantêm-se (pago, Sem preferência, etc.) e o grupo de opções volta **recolhido** (sem resumo, porque voltou aos defaults).
6. **Given** transporte próprio, **When** opções estão expandidas, **Then** o campo de velocidade desejada aparece; em pago, não.

---

### User Story 3 - Legibilidade e etiquetas mais leves (Priority: P2)

Rótulos e textos auxiliares são mais curtos e escaneáveis; detalhe (ex. horas por dia do ritmo) não compete com a decisão principal, mas continua acessível o suficiente para não confundir (texto de apoio curto ou equivalente claro).

**Why this priority**: Reforça a sensação “clean” sem mudar regras de negócio.

**Independent Test**: Spot-check de rótulos; um utilizador identifica Normal vs Intenso e Pago vs Próprio em ≤ 30 s.

**Acceptance Scenarios**:

1. **Given** opções expandidas, **When** o utilizador lê ritmo, **Then** a escolha Normal / Intenso é óbvia sem um label longo a dominar a linha (detalhe de horas pode ser secundário).
2. **Given** a lista de resultados, **When** vê um item, **Then** título da rota e métricas (mi, tempo, custos) estão visualmente hierarquizados — não uma pilha de linhas de igual peso.

---

### Edge Cases

- Painel em viewport baixa / móvel: De → Para → Calcular MUST permanecer utilizáveis sem expandir opções; o CTA não fica enterrado sob o bloco de opções expandido.
- Ordem vertical locked: De → Para → Calcular → Opções → Resultados (Clarifications 2026-08-05).
- Erro de validação / sem rota: mensagem continua visível junto ao fluxo primário.
- Opções expandidas + lista longa: scroll do painel mantém-se; MUST NOT exigir redesenhar o mapa.
- Auto-recálculo com opções recolhidas: se o utilizador expandiu, mudou um valor e voltou a recolher, o valor escolhido **mantém-se** até fechar o painel (só o default de reopen repõe); o resumo de não-defaults actualiza-se no cabeçalho recolhido.
- Resumo recolhido: MUST listar só desvios dos defaults de abertura; MUST NOT listar tudo quando está tudo default; formato exacto da microcopy fica para o plano (curto, escaneável).
- Acessibilidade: o grupo de opções MUST ser expansível/colapsável de forma clara (estado aberto/fechado perceptível); controlos continuam etiquetados; o resumo MUST NOT substituir o acesso aos controlos.
- Digitizer / Rede de rotas: fora de âmbito.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O painel Calcular rota MUST apresentar um **caminho primário** claro na ordem vertical **De → Para → Calcular**, depois o bloco de opções, depois os resultados — sem exigir que o utilizador percorra todas as opções avançadas para completar um cálculo com defaults.
- **FR-002**: Opções de viagem avançadas (transporte, ritmo, ordenação, preferência de via, e velocidade quando aplicável) MUST estar agrupadas num único bloco **abaixo de Calcular**, **recolhido por omissão** ao abrir o painel.
- **FR-003**: O utilizador MUST poder expandir e recolher esse bloco; o estado expandido/recolhido MUST ser óbvio.
- **FR-003a**: Com o bloco **recolhido**, se existir pelo menos um valor diferente dos defaults de abertura do painel, MUST mostrar uma **linha curta de resumo** desses não-defaults no cabeçalho do bloco; se tudo estiver nos defaults, MUST NOT mostrar essa linha de resumo.
- **FR-004**: Nenhuma capacidade funcional existente de Calcular rota MUST ser removida (transporte pago/próprio, ritmo, ordenação, preferência de via, velocidade em próprio, auto-recálculo, resets ao reabrir, lista até 6, overlay no mapa).
- **FR-005**: Itens da lista de resultados MUST usar hierarquia visual mais compacta (título + meta consolidada) mantendo distância, tempo e custos Dentro/Fora legíveis.
- **FR-006**: Rótulos de controlos MUST privilegiar clareza curta; detalhe secundário (ex. horas/dia) MUST NOT competir visualmente com a decisão principal.
- **FR-007**: Ao reabrir o painel, além dos resets de negócio já existentes, o bloco de opções MUST iniciar **recolhido**.
- **FR-008**: Em viewport estreita / com scroll, Calcular e De/Para MUST permanecer fáceis de alcançar sem depender de expandir opções.
- **FR-009**: Erros e estados vazios MUST permanecer visíveis no fluxo primário.
- **FR-010**: Esta feature MUST NOT alterar a lógica de cálculo no servidor nem as regras de 046/050/054 — apenas apresentação e organização do painel.

### Key Entities

- **Caminho primário**: De, Para, Calcular (+ feedback de erro).
- **Bloco de opções de viagem**: Grupo colapsável com transporte, ritmo, ordenação, preferência de via, velocidade condicional; cabeçalho com resumo opcional de não-defaults.
- **Resumo de não-defaults**: Texto curto no estado recolhido listando só desvios dos defaults de abertura.
- **Item de resultado**: Alternativa de rota com título e meta (distância, tempo, custos).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com o painel aberto e opções recolhidas, ≥ 70% da altura útil inicial do painel (acima da dobra / antes de scroll significativo) é caminho primário + espaço para resultados — não uma parede de fieldsets.
- **SC-002**: Em ≤ 1 minuto, um utilizador novo completa De → Para → Calcular sem expandir opções e obtém uma lista.
- **SC-003**: Em ≤ 2 minutos, o mesmo utilizador encontra e altera transporte, ordenação e preferência de via após expandir opções.
- **SC-004**: Spot-check: 100% das capacidades 046/050/054 ainda acessíveis e comportando-se como antes (smoke: uma troca de cada eixo + reopen).
- **SC-005**: Em revisão visual, cada item de resultado usa no máximo duas bandas tipográficas principais (título; linha de meta) em vez de quatro+ linhas de peso igual.
- **SC-006**: Com opções recolhidas e ≥1 não-default activo, o utilizador identifica o desvio em ≤ 10 s sem expandir; com todos os defaults, não há linha de resumo a acrescentar ruído.

## Assumptions

- A análise de UI/UX recomenda **progressive disclosure** (opções recolhidas) em vez de apenas comprimir tudo no mesmo ecrã — melhor para “clean” sem sacrificar funções.
- Ordem vertical do painel: **De → Para → Calcular → Opções → Resultados** (clarificado).
- Cabeçalho recolhido: **resumo só de não-defaults** (clarificado); microcopy exacta no plano.
- Defaults de negócio ao abrir o painel permanecem os actuais (pago, ritmo normal, mais rápida, Sem preferência, etc.).
- Não se introduz um segundo ecrã/wizard; é o mesmo painel com hierarquia melhor.
- Jogador e GM partilham o mesmo painel.
- Microcopy pode encurtar (ex. ritmo) desde que o significado se mantenha.

## Out of Scope

- Remover preferência de via, ordenação ou transporte.
- Mudar algoritmo de rotas ou API.
- Redesign do mapa, digitizer ou menu lateral.
- Novo sistema de design tokens para toda a app (só o necessário no painel).
- Internacionalização completa.
