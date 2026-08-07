# Feature Specification: Route Overnight Stops (Pernoites)

**Feature Branch**: `062-route-pernoites`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "Leia o documento docs/prd-mapa-campanha-rpg(4).md veja a seção 12 e vamos criar a nova funcionalidade de pernoites (12.4)"

**Source**: PRD §12.4 — Pernoites (locais de descanso) no cálculo de rota (`docs/prd-mapa-campanha-rpg(4).md`)

## Clarifications

### Session 2026-08-07

- Q: Ao “esticar” o dia até um Local passado o marco ideal de milhas, essa distância extra conta como marchada nesse dia (próximo dia começa nesse Local)? → A: Sim — pernoite no Local; o caminho restante após esse Local inicia o dia seguinte
- Q: Como determinar o orçamento diário de marcha (milhas por dia)? → A: Derivar do ritmo + modo/velocidade actuais (milhas/dia = horas/dia × velocidade)
- Q: Nesta entrega, pernoites também aparecem como marcadores no mapa quando uma rota está seleccionada? → A: Sim — texto na lista + marcadores para **relento** e para pernoites em **Local**
- Q: Na lista de resultados, quais linhas mostram o resumo de pernoites? → A: Todas as rotas multi-dia na lista mostram o resumo de pernoites
- Q: Dentro da janela de tolerância, quais Locais no caminho são elegíveis? → A: Ambos os lados (±20% do marco ideal ao longo do caminho); escolhe o Local com o menor ajuste
- Q: Fadiga e ritmo intenso — regras base? → A: O ritmo define a distância máxima por dia; com ritmo **intenso**, o grupo ganha **1 ponto de fadiga** ao final de cada dia de marcha; esse ponto só se recupera com uma **noite inteira de descanso que não seja ao relento** (pernoite em Local)
- Q: Além de mostrar fadiga, o que ela faz no planeador? → A: **Aviso suave** — mostra ganhos/recuperação/saldo e destaca rotas que terminam com fadiga por recuperar; não altera milhas/dia, não bloqueia ritmo nem o grafo
- Q: Dia intenso que termina com pernoite em Local — essa mesma noite recupera o ponto ganho nesse dia? → A: Sim — ganha ao fim do dia; a noite em Local recupera 1 (a mesma noite pode zerar o ponto desse dia)
- Q: Ritmo intenso, chegada ao destino no mesmo dia (sem pernoite na rota) — ganha fadiga? → A: Sim — +1 por esse dia de marcha; sem recuperação na rota (destacar se saldo > 0)
- Q: Com fadiga acumulada (ex. saldo 2), quanto recupera uma noite em Local? → A: Recupera **1** ponto por noite em Local (saldo 2 → 1)
- Q: Com saldo ≥ 1 quase sempre em intenso (dia de chegada), quando aplicar o destaque de aviso? → A: Mostrar sempre o saldo; destacar só quando **saldo > 1** (fadiga extra além do ponto típico de chegada)
- Q: Alerta de morte por fadiga (WFRP)? → A: Sim — é preciso alertar o cenário em que o grupo **adquire 6 pontos de fadiga**; em Warhammer isso significa **morte**
- Q: Quando dispara o alerta “6 fadiga = morte”? → A: Se o saldo atingir **≥ 6 em qualquer momento** da simulação dia a dia (pico), mesmo que noites em Local posteriores o baixem
- Q: Além do alerta de morte, o planeador bloqueia ou despromove a rota? → A: **Só avisa** — alerta forte de morte; rota continua seleccionável e distâncias inalteradas
- Q: Aviso extra ao aproximar-se de 6 (ex. pico 5)? → A: **Não** — só alerta de morte com pico ≥ 6; o aviso suave de saldo final > 1 mantém-se como está

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver onde o grupo dorme na rota (Priority: P1)

Um jogador (ou o GM) calcula uma rota entre dois locais conhecidos. Para cada rota listada cujo tempo ultrapassa um dia de viagem, o resultado mostra **quantos dias** e **onde o grupo pernoita** — num Local conhecido no caminho, ou **ao relento** se não houver Local adequado — sem precisar calcular mentalmente milhas e paradas.

**Why this priority**: É o valor central da §12.4: viagens multi-dia deixam de ser só “N dias” e passam a dizer **onde** se dorme.

**Independent Test**: Calcular uma rota com distância/tempo ≥ 2 dias de viagem; na lista de rotas, cada item com mais de um dia de marcha mostra pernoite(s) legíveis (nome de Local ou “ao relento”).

**Acceptance Scenarios**:

1. **Given** uma rota cuja distância exige **mais de um dia** de marcha no ritmo/modo escolhido, **When** o utilizador vê o resultado no painel Calcular rota, **Then** vê o número de dias e pelo menos um pernoite descrito (Local ou ao relento).
2. **Given** uma rota em que, ao atingir o limite do dia, existe um Local ligado a um nó do caminho **dentro da tolerância** (± do marco ideal), **When** o resultado é mostrado, **Then** esse pernoite é do tipo **local** e identifica o Local pelo nome reconhecível.
3. **Given** uma rota em que o limite do dia cai longe de qualquer Local ligado no caminho (fora da tolerância), **When** o resultado é mostrado, **Then** o pernoite é **ao relento** (sem nome de Local).
4. **Given** a chegada ao destino no último trecho do dia, **When** o resultado é mostrado, **Then** a chegada **não** conta como pernoite adicional.

---

### User Story 2 - Rota de um só dia sem pernoite (Priority: P1)

Se a viagem cabe num único dia de marcha, a lista **não** inventa pernoites; o utilizador vê só o tempo habitual (horas/dias já existentes), sem texto de “noite em…”.

**Why this priority**: Evita ruído e falsos positivos em rotas curtas.

**Independent Test**: Rota curta (≤ 1 dia de marcha) → zero entradas de pernoite; texto de dias/tempo continua coerente.

**Acceptance Scenarios**:

1. **Given** uma rota que cabe num dia de marcha, **When** o utilizador vê o resultado, **Then** não há lista/frase de pernoites (ou lista vazia) e o tempo total continua a ser mostrado como hoje.
2. **Given** duas rotas alternativas, uma de 1 dia e outra de 2+, **When** ambas aparecem na lista, **Then** só a(s) multi-dia mostram pernoite(s).

---

### User Story 3 - Texto claro no painel (Priority: P2)

Ao listar cada rota, o painel resume pernoites de forma legível, no espírito do PRD — por exemplo “2 dias — pernoite em Fielbach” ou “2 dias — 1 noite ao relento” (e equivalentes com várias noites).

**Why this priority**: Torna o cálculo útil sem obrigar o jogador a interpretar coordenadas ou IDs.

**Independent Test**: Comparar frases na UI com os pernoites daquela rota; nomes de Local batem certo; relento não inventa nome de cidade.

**Acceptance Scenarios**:

1. **Given** um pernoite em Local, **When** o utilizador lê o resumo da rota, **Then** vê o **nome do Local** (não só um identificador interno).
2. **Given** um ou mais pernoites ao relento, **When** lê o resumo, **Then** vê indicação clara de noite(s) ao relento (contagem coerente com o número de noites).
3. **Given** vários pernoites mistos (Local + relento), **When** lê o resumo ou detalhe da rota, **Then** consegue distinguir cada noite (dia 1, dia 2, …) e o tipo.
4. **Given** várias rotas multi-dia no resultado, **When** o utilizador compara a lista sem seleccionar, **Then** cada uma mostra o seu próprio resumo de pernoites.

---

### User Story 4 - Marcadores de pernoite no mapa (Priority: P2)

Quando uma rota está seleccionada/destacada no mapa, **todos** os pernoites dessa rota — **em Local** e **ao relento** — aparecem como marcadores no traçado, para o jogador ver *onde* dorme no espaço, além do texto na lista. Marcadores de pernoite em Local distinguem-se do pin habitual (indicam “noite aqui”, não só “local visitado”). Relento não parece um Local com lore.

**Why this priority**: Complementa o resumo textual; decidido como parte desta entrega (não diferido).

**Independent Test**: Seleccionar rota com pernoite em Local e ao relento → ambos marcados no mapa; trocar de rota → marcadores actualizam; desmarcar → somem.

**Acceptance Scenarios**:

1. **Given** rota seleccionada com pernoite ao relento, **When** o mapa mostra a rota destacada, **Then** a posição do pernoite é indicada de forma distinta do pin de Local habitual (sem parecer um Local inventado com lore).
2. **Given** rota seleccionada com pernoite em Local, **When** o mapa mostra a rota destacada, **Then** esse Local (ou a sua posição no traçado) tem indicação visível de pernoite, distinta do pin “só visitado”.
3. **Given** o utilizador muda para outra rota da lista, **When** a nova rota é destacada, **Then** os marcadores de pernoite reflectem só a rota activa.

---

### User Story 5 - Fadiga com ritmo intenso (Priority: P1)

Com ritmo **intenso**, cada dia de marcha acrescenta **1 ponto de fadiga** ao grupo. Uma noite **ao relento** não recupera fadiga; só uma noite inteira em **Local** recupera **1** ponto (incluindo o ganho do dia que acabou). A chegada sem pernoite ainda deixa +1. O planeador mostra o **saldo**, destaca com aviso suave rotas com **saldo final > 1**, e emite um **alerta de morte** se o saldo atingir **≥ 6** em qualquer dia da simulação (WFRP).

**Why this priority**: Liga ritmo, pernoites e consequência de jogo; sem isto o “intenso” é só tempo mais curto sem trade-off.

**Independent Test**: Calcular a mesma origem/destino em normal vs intenso; em intenso ver fadiga acumulada e recuperação só nas noites em Local; noites ao relento não baixam a fadiga.

**Acceptance Scenarios**:

1. **Given** ritmo **intenso** e uma rota com N dias de marcha (N≥1), **When** o resultado é mostrado, **Then** o grupo acumula fadiga conforme as regras de ritmo intenso (detalhe de chegada no mesmo dia / ordem ganho vs recuperação nas clarificações).
2. **Given** ritmo **intenso** e um pernoite **em Local** após um dia de marcha, **When** essa noite é processada, **Then** recupera **1** ponto de fadiga (incluindo o ganho **nesse mesmo dia**, se ainda houver saldo).
3. **Given** ritmo **intenso** e um pernoite **ao relento**, **When** essa noite é processada, **Then** essa noite **não** recupera fadiga (o ponto ganho nesse dia permanece).
4. **Given** ritmo **normal**, **When** o resultado é mostrado, **Then** não se ganha fadiga por ritmo intenso (sem pontos de fadiga por este mecanismo).
5. **Given** ritmo **intenso** e pelo menos uma rota com **saldo de fadiga > 1** no fim, **When** a lista de resultados é mostrada, **Then** essas rotas estão **visualmente destacadas** como aviso; rotas com saldo 0 ou 1 mostram o saldo **sem** esse destaque extra.
6. **Given** ritmo **intenso**, **When** o utilizador compara rotas, **Then** milhas/dia, traçado e opções de ritmo **não** são alterados pela fadiga (só informação + destaque condicional).
7. **Given** ritmo **intenso** e uma rota que chega ao destino **no mesmo dia** (sem pernoites), **When** o resultado é mostrado, **Then** há **+1** fadiga por esse dia e **nenhuma** recuperação na rota (saldo 1; **sem** destaque de aviso, só o número).
8. **Given** ritmo **intenso** e uma rota cujo saldo de fadiga atinge **≥ 6** em algum dia da simulação, **When** o resultado é mostrado, **Then** essa rota exibe um **alerta de morte** (WFRP: 6 pontos de fadiga), distinto do aviso suave de saldo > 1, e a rota **permanece seleccionável**.
9. **Given** uma rota com alerta de morte, **When** o utilizador a selecciona, **Then** o mapa destaca-a normalmente (sem bloqueio); distância/tempo não mudam por causa do alerta.

---

### Edge Cases

- Distância exacta igual a um múltiplo inteiro de milhas/dia: o pernoite ocorre no ponto de fecho do dia; se esse ponto for o **destino**, não cria pernoite nessa chegada.
- Tolerância: candidatos são Locais no caminho cuja distância ao longo da rota até ao marco ideal do dia está dentro de **±** a percentagem configurada (pré-definida 20% do orçamento diário); não salta para Locais fora do caminho. Parar num Local (antes ou depois do marco) fecha o dia nesse ponto; o dia seguinte reinicia a partir dali.
- Vários Locais candidatos dentro da tolerância: escolhe o Local que exige o **menor ajuste** (menor |desvio| ao longo do caminho) face ao marco ideal (comportamento estável; ver Assumptions).
- Ajuste **antes** do marco (= dia mais curto) e **depois** (= dia mais longo, até +tolerância) são ambos válidos; o progresso da marcha para no Local escolhido.
- Waypoint no caminho **sem** `local_id`: não serve como pernoite “em Local”; só conta se houver Local ligado.
- Origem = destino ou rota vazia: sem pernoites (comportamento actual de zero rotas mantém-se).
- Ritmo/modo alterados: recalcular actualiza dias, pernoites e fadiga em conjunto (não ficam resultados stale de outro ritmo).
- Noite em Local após dia intenso: **primeiro** +1 fadiga pelo dia, **depois** −1 pela noite em Local (saldo líquido 0 para esse par dia+noite, se não havia fadiga anterior). Se já havia saldo > 0, a noite em Local só reduz **1** ponto.
- Noite ao relento após dia(s) intenso(s): fadiga ganha **não** é recuperada nessa noite.
- Sequência por dia de marcha intenso com pernoite: aplicar ganho do dia; em seguida, se o pernoite for local, aplicar recuperação (1 ponto); se relento, não recuperar.
- Último dia / chegada ao destino **sem** pernoite (incluindo viagem de um só dia): ainda assim +1 fadiga pelo dia de marcha intenso; a chegada **não** conta como noite de descanso recuperadora nesta feature.
- Destino ser um Local conhecido **não** implica recuperação automática ao chegar — só pernoites tipo **local** no meio da rota recuperam.
- Pico de fadiga ≥ 6 a meio da viagem: o alerta de morte aplica-se mesmo que o saldo final seja < 6 após recuperações posteriores. Não há alerta intermédio dedicado a pico = 5.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O cálculo de rota MUST, para cada rota devolvida, incluir a lista de **pernoites** dessa rota (pode ser vazia).
- **FR-002**: O sistema MUST simular a marcha **dia a dia** ao longo dos segmentos do caminho escolhido, acumulando distância até ao orçamento diário de milhas. Esse orçamento MUST ser **derivado** do ritmo e modo/velocidade já usados no cálculo de tempo (horas por dia × velocidade efectiva), não de uma tabela fixa de milhas/dia independente.
- **FR-003**: Ao atingir o marco ideal de um dia, se existir um Waypoint **com Local ligado** no caminho cuja distância ao longo da rota até esse marco esteja dentro de **±** a **tolerância** configurável (pré-definição **20%** do orçamento diário), o pernoite MUST ser do tipo **local** e identificar esse Local (id e nome para exibição). Entre vários candidatos, MUST escolher o de **menor |desvio|** ao marco. O dia MUST fechar nesse Local (mesmo que isso encurte ou alongue o dia face ao orçamento); o dia seguinte MUST começar aí.
- **FR-004**: Se nenhum Local no caminho estiver dentro da janela ±tolerância, o pernoite MUST ser do tipo **relento**, com posição geográfica no traçado (coordenadas relativas do mapa) interpolada no **marco ideal** de fecho do dia; o dia seguinte MUST começar nesse ponto.
- **FR-005**: A chegada ao destino MUST NOT ser registada como pernoite.
- **FR-006**: Rotas que cabem num único dia de marcha MUST ter lista de pernoites vazia.
- **FR-007**: O painel Calcular rota MUST apresentar, **em cada rota multi-dia da lista de resultados** (não só na seleccionada), um resumo legível de dias e pernoites (Local por nome ou “ao relento”), alinhado ao espírito do PRD §12.4 / §12.6. Rotas de um só dia MUST omitir esse resumo de pernoites.
- **FR-007b**: Com uma rota seleccionada/destacada, o mapa MUST mostrar marcadores de pernoite para **cada** entrada da lista dessa rota — tipo **local** e tipo **relento** — distintos dos pins de Local habituais; ao mudar ou limpar a selecção, os marcadores MUST actualizar ou desaparecer.
- **FR-008**: A **tolerância** de pernoite MUST ser configurável no mesmo espírito de outras definições da aplicação (pré-definição 20%); jogadores não a editam na UI pública. O orçamento diário em si **não** é uma tabela fixa editável de milhas — acompanha ritmo/modo.
- **FR-009**: Alterar ritmo, modo de transporte ou outros factores que mudem o orçamento diário MUST recalcular pernoites de forma consistente com o tempo/dias já mostrados para essa mesma rota.
- **FR-010**: Encontros aleatórios ou cruzamento de pernoites ao relento com tabelas de encontro estão **fora de escopo** (PRD §12.4 / §13).
- **FR-011**: O ritmo de viagem MUST definir a **distância máxima** que o grupo cobre por dia de marcha (orçamento diário), em conjunto com o modo/velocidade já usados.
- **FR-012**: Com ritmo **intenso**, o sistema MUST atribuir **1 ponto de fadiga** ao final de cada dia de marcha da simulação **antes** de aplicar a recuperação dessa noite (se houver pernoite). Isto inclui o dia de **chegada ao destino** quando esse dia não gera pernoite.
- **FR-013**: Fadiga MUST recuperar-se à razão de **exactamente 1 ponto por pernoite tipo local**. Com saldo acumulado > 1, uma única noite em Local MUST reduzir o saldo em 1 (não zera tudo). Pernoite **relento** MUST NOT recuperar fadiga. A mera chegada a um Local de destino MUST NOT recuperar fadiga.
- **FR-014**: Com ritmo **normal**, o mecanismo de ganho de fadiga por ritmo intenso MUST NOT aplicar-se.
- **FR-015**: O resultado do cálculo MUST expor o **saldo de fadiga** (e, se útil, ganhos/recuperações) de forma visível no painel junto dos pernoites, em ritmo intenso.
- **FR-016**: Fadiga MUST ser **apenas informativa + aviso condicional**: MUST NOT reduzir o orçamento diário, bloquear ritmo intenso, nem alterar o grafo/rotas calculadas. O saldo MUST ser mostrado sempre (em intenso). O **destaque visual de aviso** na lista MUST aplicar-se **somente** quando o saldo final for **> 1** (fadiga além do ponto típico do dia de chegada sem pernoite recuperador).
- **FR-017**: Em ritmo normal, saldo/destaque por fadiga MUST NOT aplicar-se.
- **FR-018**: Se, em qualquer passo da simulação dia a dia, o saldo de fadiga atingir **≥ 6**, a rota MUST apresentar um **alerta de morte** explícito (WFRP: 6 pontos de fadiga = morte), baseado no **pico** durante a viagem — não só no saldo final. MUST NOT existir um escalão separado de “quase morte” (ex. pico = 5); o aviso suave de saldo final > 1 (FR-016) cobre o resto.
- **FR-019**: O alerta de morte (FR-018) MUST ser visualmente e textualmente **mais grave** que o aviso suave de saldo final > 1 (FR-016). MUST NOT bloquear selecção da rota, despromovê-la na ordenação, nem alterar distância/tempo/grafo.
- **FR-020**: Fadiga (avisos e alerta de morte) MUST permanecer **não mecânica** no planeador: nunca reduz orçamento diário nem impede ritmo intenso.

### Key Entities

- **Pernoite**: Paragem nocturna numa rota — dia da marcha (1-based), tipo (`local` | `relento`), e ou referência ao Local (id + nome) ou posição no mapa (x, y relativos) para relento. Pernoite **local** é descanso válido para recuperar fadiga; **relento** não é.
- **Fadiga (ponto)**: Consequência de marcha em ritmo **intenso**; +1 ao final de cada dia de marcha intenso; recupera apenas com noite completa em Local. Pico ≥ 6 durante a viagem = limiar de **morte** (WFRP) e dispara alerta.
- **Orçamento diário de marcha**: Distância máxima percorrida por dia, **derivada** do ritmo e modo/velocidade do cálculo actual; determina quando fecha cada dia na simulação.
- **Tolerância de pernoite**: Janela relativa (± percentagem do orçamento diário) em torno do marco ideal de fecho do dia, ao longo do caminho, dentro da qual um Local ligado pode ser escolhido em vez de dormir ao relento.
- **Rota planeada** (existente): Caminho entre origem e destino; passa a expor também `dias` de marcha (se ainda não explícito para o utilizador), a lista de pernoites e a informação de fadiga.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das rotas com marcha de 2+ dias no mesmo cálculo, o utilizador vê **na lista** (em cada uma dessas linhas) **pelo menos um** pernoite descrito (Local ou relento) sem abrir documentação externa.
- **SC-002**: Em rotas de 1 dia de marcha, **0** pernoites são mostrados (sem falsos positivos).
- **SC-003**: Quando o fecho do dia cai junto a um Local no caminho dentro da tolerância, o resumo usa o **nome correcto** desse Local em ≥ 95% dos casos de teste manuais com dados de seed/campanha conhecidos.
- **SC-004**: Um jogador consegue, em menos de **30 segundos** após ver o resultado, dizer em voz alta onde o grupo dorme na primeira noite da rota seleccionada (usando lista e/ou marcadores no mapa).
- **SC-005**: Para cada rota no resultado, o número de pernoites listados é igual a `max(0, dias_de_marcha − 1)`, coerente com a duração mostrada para essa rota.
- **SC-006**: Com uma rota multi-dia seleccionada que tenha pernoites mistos, o jogador vê no mapa **o mesmo número** de marcadores de pernoite que entradas na lista dessa rota.
- **SC-007**: Em ritmo intenso, o jogador consegue identificar em menos de **30 segundos** o saldo de fadiga e se a rota tem aviso (saldo > 1) vs só o ponto típico de chegada (saldo 1).
- **SC-008**: Em ritmo normal, **0** pontos de fadiga por este mecanismo aparecem no resultado.
- **SC-009**: Em ritmo intenso, a fadiga **nunca** muda a distância/tempo da mesma rota (só labels/destaque).
- **SC-010**: Uma rota intensa só com pernoites em Local (e chegada sem pernoite) termina com saldo **1** e **sem** destaque de aviso; a mesma rota com ≥1 noite ao relento que eleve o saldo acima de 1 **tem** destaque.
- **SC-011**: Em ≥ 95% dos casos de teste com uma rota cujo pico de fadiga ≥ 6, o jogador vê o alerta de morte em menos de **15 segundos** após o resultado, mesmo que o saldo final seja < 6.
- **SC-012**: Com alerta de morte visível, o jogador consegue seleccionar essa rota e vê-la no mapa em **uma** acção (sem passo extra de “desbloquear”).

## Assumptions

- Feature construída **em cima** do Calcular rota já existente (painel do jogador, §12.6); não cria ecrã novo.
- O **orçamento diário em milhas** deriva **sempre** do modelo de viagem já usado (ritmo + modo/velocidade → milhas por dia = horas/dia × velocidade), para alinhar pernoites com `tempo_dias` / texto de duração. Os números de referência do PRD (24 / 32 milhas/dia) **não** são uma tabela paralela de ritmos; servem só como guia de calibração do modelo existente (`normal` / `intenso`), não como milhas/dia fixas independentes do modo.
- Tolerância pré-definida: **±20%** do orçamento diário em torno do marco ideal ao longo do caminho (não só “esticar para a frente”).
- Entre vários Locais candidatos dentro da tolerância, escolhe-se o que exige **menor |ajuste|** face ao marco ideal.
- Fechar o dia num Local (antes ou depois do marco) **avança** o progresso da marcha até esse ponto (não é só um rótulo): dias seguintes acumulam distância a partir dali.
- Exibição **obrigatória** do resumo de pernoites em **todas** as linhas multi-dia da lista; marcadores no mapa só para a rota seleccionada (User Story 4 / FR-007b).
- Coordenadas de pernoite ao relento usam o mesmo sistema relativo 0–1 dos pins/waypoints.
- Sem fog of war: Locais no caminho já conhecidos/ligados à rede são elegíveis; não se inventam Locais novos.
- Fadiga nesta feature é **informativa + destaque condicional**: mostrar sempre o saldo em intenso; destacar suave se **saldo final > 1**; **alerta de morte** (só avisa, não bloqueia) se o **pico** de saldo na simulação for **≥ 6** (WFRP); sem escalão “quase morte”. O alerta MUST mencionar morte e o limiar de 6 (mostrar o pico ajuda). Ordem no fecho do dia: **+1** (intenso) depois eventual **−1** (noite em Local, 1 ponto). Chegada sem pernoite ainda gera +1 e não recupera. Simulação começa com saldo **0**.
- Fora de escopo: encontros aleatórios ao relento; UI pública para editar milhas/dia ou tolerância; renomear ritmos da app para “cauteloso/arriscado”; fadiga persistente entre cálculos / input de fadiga inicial pelo jogador.
