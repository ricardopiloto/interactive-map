# Feature Specification: Route Type Coverage in Alternatives

**Feature Branch**: `056-route-type-coverage`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "Outro ponto que precisamos analisar, quando eu coloco De: Altdorf, Para: Ubersreik, um dos caminhos que ele trás deveria ser Estrada somente, porém ele não me mostra esse caminho, apesar de ele existir no mapa."

## Problem

Entre **Altdorf** e **Ubersreik** existe no mapa (e na rede de vias) um caminho contínuo só por **estrada**. Com o Calcular rota nos defaults habituais (**Mais rápida**), a lista de até 6 alternativas mostra rotas só-rio e misturas rio/estrada, mas **não** mostra a alternativa **Estrada** pura — embora essa rota exista e já apareça se o utilizador ordenar por **Mais barata**.

O jogador espera que, se um modo de via “só estrada” for possível no mapa, ele figure entre as opções oferecidas, não só quando o critério de ordenação o favorece por acaso.

## Clarifications

### Session 2026-08-05

- Q: Preferência de via vs cobertura de tipos puros? → A: Sempre cobrir cada tipo puro existente (estrada/rio/trilha), independentemente da preferência de via; a preferência só enviesa/reordena, não remove cobertura.
- Q: Qual caminho puro incluir quando há vários do mesmo tipo? → A: O melhor caminho puro desse tipo pelo critério de ordenação activo (mais rápida → mais rápida pura; mais barata → menor custo Dentro pura).
- Q: Garantia quando o puro não está nos candidatos mistos “melhores”? → A: Se a rede tem caminho contínuo só daquele tipo, MUST incluir sempre o melhor puro desse tipo (sujeito a ≤6 e a manter o #1 do critério); não basta expandir o pool misto na esperança de o encontrar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver Estrada pura Altdorf → Ubersreik (Priority: P1)

O jogador abre **Calcular rota**, escolhe De: **Altdorf**, Para: **Ubersreik**, deixa ordenação em **Mais rápida** (default) e calcula. Entre as alternativas (até 6) aparece pelo menos uma rota cujo título/tipos reflectem **apenas Estrada** (não só misturas com rio), alinhada ao caminho de estrada que existe no mapa.

**Why this priority**: Caso reportado; prova o buraco de cobertura no fluxo mais comum.

**Independent Test**: Calcular Altdorf → Ubersreik com defaults (mais rápida, sem preferência de via forçada a barata); inspeccionar a lista — deve existir ≥1 item só-estrada.

**Acceptance Scenarios**:

1. **Given** De = Altdorf e Para = Ubersreik e ordenação **Mais rápida**, **When** o utilizador calcula, **Then** a lista inclui pelo menos uma alternativa com tipo(s) **somente estrada**.
2. **Given** o mesmo par e a lista com a Estrada pura, **When** o utilizador selecciona essa alternativa, **Then** o overlay no mapa segue o percurso de estrada (não o percurso só-rio).
3. **Given** ordenação **Mais barata** no mesmo par (comportamento já conhecido), **When** calcula, **Then** a Estrada pura continua disponível (não se regressa o que já funciona).

---

### User Story 2 - Cobertura de tipos puros quando existem na rede (Priority: P1)

Para qualquer De/Para em que a rede permita um caminho contínuo usando **apenas um tipo de via** (estrada, rio ou trilha), a lista de alternativas do Calcular rota MUST incluir a **melhor** alternativa desse tipo puro pelo critério activo — **mesmo que** esse caminho não apareça entre os candidatos mistos mais rápidos/baratos habituais — desde que caiba na regra de “até 6” e na preservação do #1 (ver Requirements).

**Why this priority**: Generaliza o bug Altdorf–Ubersreik; evita o mesmo silêncio noutros pares.

**Independent Test**: Para um par com caminho só-rio e só-estrada conhecidos, com **Mais rápida**, a lista contém ambas as puras (quando ambas existem); smoke noutro par com só um tipo puro disponível.

**Acceptance Scenarios**:

1. **Given** um De/Para com caminho contínuo só-rio **e** só-estrada na rede, **When** calcula com **Mais rápida**, **Then** a lista inclui ≥1 alternativa só-rio e ≥1 só-estrada (quando ambas existem de facto).
2. **Given** um De/Para em que só existe caminho puro de um tipo (ex. só rio), **When** calcula, **Then** esse tipo puro aparece; o produto MUST NOT inventar um tipo puro que a rede não permite.
3. **Given** preferência de via **Por estrada** (soft), **When** calcula um par que tem caminho só-estrada, **Then** a alternativa só-estrada continua a aparecer na lista (não fica excluída pelos primeiros candidatos mistos/rápidos).
4. **Given** preferência de via **Por rio** e a rede também permite só-estrada, **When** calcula, **Then** a lista ainda inclui ≥1 alternativa só-estrada (preferência não suprime a cobertura do tipo oposto).

---

### User Story 3 - Continuar a ordenar e limitar a 6 (Priority: P2)

O utilizador continua a ver no máximo **6** alternativas, ordenadas pelo critério escolhido (mais rápida / mais barata). A inclusão de tipos puros **não** remove o sentido da ordenação: as puras entram no conjunto final e a lista permanece ordenada; uma Estrada pura mais lenta pode aparecer abaixo de um Rio mais rápido.

**Why this priority**: Preserva 046/054 sem transformar a lista numa galeria ilimitada.

**Independent Test**: Lista ≤ 6; primeira entrada continua a ser a melhor pelo critério; Estrada pura Altdorf–Ubersreik pode não ser a #1 em mais rápida, mas está presente.

**Acceptance Scenarios**:

1. **Given** um cálculo com cobertura de tipos puros aplicada, **When** o utilizador conta os itens, **Then** há no máximo 6.
2. **Given** **Mais rápida**, **When** olha o primeiro item, **Then** continua a ser o mais rápido entre os devolvidos (badge/ indicação “mais rápida” coerente).
3. **Given** **Mais barata**, **When** olha o primeiro item, **Then** continua a ser o de menor custo Dentro entre os devolvidos.

---

### Edge Cases

- Sem caminho entre De/Para: mensagem vazia existente; nada a cobrir.
- Tipo puro inexistente na rede para aquele par: MUST NOT fabricar rota.
- Mais de três tipos puros possíveis e misturas: ainda ≤ 6; priorizar (1) melhores pelo critério de ordenação e (2) garantir um slot por tipo puro **existente** que ainda falte no conjunto.
- Preferência de via rio/estrada: soft bias e tie-break existentes mantêm-se; cobertura de tipo puro é adicional e **independente** da preferência — tipos puros opostos à preferência continuam a merecer slot se existirem na rede (Clarifications 2026-08-05).
- Transporte próprio / ritmo: não alteram a regra de cobertura de tipos; só tempos/custos.
- Paralelos no mesmo nó-caminho (variantes de aresta): uma variante só-estrada conta como cobertura de estrada.
- Puro ausente do “top” misto por tempo/custo (ex. Estrada Altdorf→Ubersreik sob Mais rápida): MUST mesmo assim ser encontrado e incluído se o caminho só-tipo existir na rede (Clarifications 2026-08-05); falhar só porque o pool misto limitado o omitiu NÃO é aceitável.
- Digitizer / edição da rede: fora de âmbito (excepto consumir a rede como está).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Para o par canónico **Altdorf → Ubersreik**, com ordenação **Mais rápida** e defaults de transporte/preferência de via habituais, Calcular rota MUST devolver pelo menos uma alternativa cujo conjunto de tipos seja **apenas estrada**.
- **FR-002**: Sempre que a rede permitir um caminho contínuo entre origem e destino usando **somente** um dado tipo de via (estrada, rio ou trilha), a lista de resultados (até 6) MUST incluir a **melhor** alternativa pura desse tipo segundo o critério de ordenação activo (Clarifications 2026-08-05) — **mesmo quando** esse caminho não figura entre os candidatos mistos habitualmente devolvidos por ordenação pura — se necessário deslocando um candidato misto ou redundante que não seja necessário para a cobertura de tipos nem para o “melhor” do critério de ordenação.
- **FR-003**: O produto MUST NOT inventar caminhos ou tipos que a rede de vias não suporte entre aquele De/Para.
- **FR-004**: O limite de **até 6** alternativas MUST permanecer; a lista MUST continuar ordenada por **Mais rápida** ou **Mais barata** conforme a escolha do utilizador (046).
- **FR-005**: O “melhor” pelo critério activo (mais rápida / mais barata) MUST permanecer no conjunto e tipicamente em primeiro lugar; a cobertura de tipos puros MUST NOT o expulsar.
- **FR-006**: Comportamento de preferência de via (054), transporte pago/próprio (050) e ritmo MUST permanecer utilizáveis; cobertura de tipos é complementar e MUST NOT ser desligada pela preferência activa — se só-estrada e só-rio existem, ambos MUST poder aparecer mesmo com preferência Por rio ou Por estrada (Clarifications 2026-08-05).
- **FR-007**: Seleccionar a alternativa só-estrada MUST actualizar o overlay do mapa para essa geometria.
- **FR-008**: Títulos/tipos na lista MUST continuar a reflectir os tipos reais da alternativa (025), de modo que “Estrada” pura seja reconhecível.
- **FR-009**: A existência de um caminho contínuo só-tipo na rede MUST ser condição suficiente para a obrigação de cobertura desse tipo (sujeito a FR-004/FR-005); omitir um puro existente só porque não surgiu no pool misto limitado MUST NOT ocorrer (Clarifications 2026-08-05).

### Key Entities

- **Tipo puro**: Alternativa de rota cujos segmentos usam um único tipo de via. Quando vários puros do mesmo tipo existem, o representante da cobertura é o **melhor** desse tipo pelo critério de ordenação activo.
- **Cobertura de tipos**: Propriedade do conjunto de resultados: para cada tipo com caminho contínuo possível na rede, ≥1 alternativa desse tipo puro está presente (sujeito ao limite de 6 e a FR-005).
- **Par canónico**: Altdorf → Ubersreik — regressão obrigatória desta feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em ≤ 1 minuto, com De Altdorf / Para Ubersreik / Mais rápida, um revisor encontra na lista uma entrada só-**Estrada** (taxa de sucesso do smoke = 100% neste par).
- **SC-002**: Num par com só-rio e só-estrada ambos possíveis, com Mais rápida, 100% das execuções de smoke mostram ambos os tipos puros na lista (quando a rede os permite).
- **SC-003**: Em 100% dos cálculos, o número de alternativas devolvidas é ≤ 6 e a primeira respeita o critério de ordenação activo.
- **SC-004**: Spot-check: Mais barata Altdorf→Ubersreik continua a incluir Estrada pura; preferência de via e transporte não quebram (smoke mínimo por eixo).

## Assumptions

- A Estrada pura Altdorf→Ubersreik já existe na rede (observável hoje com Mais barata); o defeito é de **seleção/cobertura** do conjunto mostrado, não de dados em falta no mapa. Sob Mais rápida ela fica fora do pool misto curto — a garantia de cobertura MUST encontrá-la na mesma (Clarifications 2026-08-05).
- “Deveria mostrar” aplica-se ao fluxo default **Mais rápida**, não só quando o utilizador muda a ordenação.
- Máximo 6 alternativas mantém-se (046); não se abre uma segunda página de resultados.
- Prioridade ao incluir tipos puros: garantir cobertura sem remover o melhor do critério; em conflito de slots, preferir expulsar misturas/redundâncias antes de expulsar o #1 ou um tipo puro único.
- Jogador e GM usam o mesmo Calcular rota.
- Não se exige listar *todas* as estradas paralelas possíveis — basta ≥1 por tipo puro existente, e essa uma é a melhor desse tipo pelo critério activo.
- A obrigação de cobertura é **por existência na rede**, não por aparição acidental nos primeiros candidatos mistos.

## Out of Scope

- Redesign do painel Calcular rota (055) além do necessário para validar a lista.
- Alterar velocidades/custos por tipo (tabela de mi/h e bp).
- Forçar “hard filter” só-estrada como único resultado (isso seria outro modo; aqui é cobertura no conjunto).
- Digitizer, pins da campanha, ou renomear nós.
