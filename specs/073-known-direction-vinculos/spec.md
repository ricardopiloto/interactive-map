# Feature Specification: Known Direction Vínculos

**Feature Branch**: `073-known-direction-vinculos`

**Created**: 2026-08-12

**Status**: Implemented

**Input**: User description: "Baseado na spec 071, vamos melhorar. O mestre tem que ter a opção de distinguir se o vínculo é conhecido nas duas direções, exemplo: Brother Thomas vê Lila Natch como um romance, porém Lila vê Brother Tomas como um amigo, mas Lila não sabe que Brother Tomas a vê dessa maneira. Neste cenário somente o GM poderá ver as duas vias, ele diz qual é a via que os usuários verão no mapa de relações."

**Depends on**: `071-two-way-vinculos` (pares recíprocos / duas vias; vista geral e ficha)

## Clarifications

### Session 2026-08-12

- Q: Como se relacionam o interruptor público do par e as marcas “conhecido” por sentido? → A: Público = interruptor mestre; sentidos conhecidos só contam quando o par é público (privado ⇒ jogador não vê nada)
- Q: Na ficha do jogador, ao seleccionar o personagem do sentido secreto (ex. Tomas), o que aparece? → A: Mostrar a entrada com só o sentido conhecido (ex. “vê-te como Amizade”), sem revelar o romance / “eu vejo” secreto
- Q: No palco do jogador, com exactamente um sentido conhecido, como se vê a linha? → A: Uma natureza só (cor + etiqueta como recíproco); sem fade assimétrico que sugira segunda via
- Q: Ao criar duas vias novas, predefinição das marcas conhecido? → A: Ambos os sentidos conhecidos por omissão; o GM desliga o que for secreto

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jogador só vê a via conhecida (Priority: P1)

Num par de duas vias em que **só um sentido é conhecido** pelos jogadores — ex.: Lila vê Brother Tomas como **amizade**, e Brother Tomas vê Lila como **romance**, mas esse romance **não é conhecido** — o jogador no mapa de **Relações** vê **apenas** a via que o mestre marcou como conhecida. Não vê fade de duas cores, nem a natureza secreta, nem na ficha o “vê-te como…” dessa via oculta. O mestre, em Modo GM, continua a ver as **duas** vias completas.

**Why this priority**: É o valor novo face a 071 (onde o público do par revelava sempre as duas perspectivas).

**Independent Test**: Par Tomas/Lila com romance A→B secreto e amizade B→A conhecida; comparar vista jogador vs GM no palco e na ficha.

**Acceptance Scenarios**:

1. **Given** Brother Tomas vê Lila como **romance** (sentido **não** conhecido) e Lila vê Tomas como **amizade** (sentido **conhecido**), e o par é **público**, **When** um jogador olha o palco, **Then** a ligação aparece como vínculo de **uma** natureza (amizade) — cor e etiqueta como um recíproco, **sem** fade de duas vias nem revelar romance.
2. **Given** o mesmo par, **When** o jogador selecciona **Lila**, **Then** na lista de vínculos vê Tomas como **Amizade** e **não** vê indicação de que Tomas a vê como romance.
3. **Given** o mesmo par, **When** o jogador selecciona **Brother Tomas**, **Then** a entrada de Lila aparece **sem** o tipo romance (“eu vejo”); mostra só o sentido conhecido (ex. que Lila o vê como **Amizade** / “vê-te como…”), sem revelar o sentimento secreto.
4. **Given** o mesmo par, **When** o mestre (Modo GM) olha o palco e as fichas de ambos, **Then** vê as duas vias (romance e amizade), como em 071.

---

### User Story 2 - GM escolhe o que é conhecido em cada sentido (Priority: P1)

Ao criar ou editar um vínculo **duas vias**, o mestre indica, para **cada sentido**, se essa perspectiva é **conhecida** (visível a jogadores) ou **só para o GM**. Pode marcar os dois sentidos como conhecidos (comportamento actual de 071 para um par público), só um, ou nenhum. A escolha define o que os jogadores vêem no mapa e nas fichas.

**Why this priority**: Sem controlo do mestre, o cenário secreto não se configura.

**Independent Test**: Em Modo GM, gravar o exemplo Tomas/Lila com um sentido conhecido e outro não; alternar e confirmar a vista jogador.

**Acceptance Scenarios**:

1. **Given** Modo GM e um par duas vias **público**, **When** o mestre marca só o sentido Lila→Tomas como conhecido e grava, **Then** os jogadores passam a ver só essa via; o mestre continua a ver ambas.
2. **Given** o mesmo par **público**, **When** o mestre marca **os dois** sentidos como conhecidos, **Then** os jogadores voltam a ver as duas vias (fade + etiquetas / “vê-te como…”), como em 071.
3. **Given** Modo GM a **criar** um par duas vias, **When** abre o formulário pela primeira vez, **Then** ambos os sentidos estão marcados como conhecidos (o mestre desliga o que for secreto).
4. **Given** um par duas vias **privado**, **When** um jogador abre Relações, **Then** não vê linha nem entradas desse par (mesmo que algum sentido esteja marcado conhecido); o mestre vê o par completo.
5. **Given** um par duas vias **público** com **nenhum** sentido conhecido, **When** um jogador abre Relações, **Then** não vê linha nem entradas desse par; o mestre vê o par completo.

---

### User Story 3 - Recíprocos e privacidade de par (Priority: P2)

Vínculos **recíprocos** (uma só natureza) mantêm o modelo simples: ou o jogador vê o par, ou não — não há “meia” via. A distinção “conhecido por sentido” aplica-se aos pares **duas vias**. Pares novos continuam ocultos aos jogadores até o mestre os tornar visíveis na campanha, como hoje.

**Why this priority**: Evita regressão na maioria dos vínculos da campanha.

**Independent Test**: Criar/editar um recíproco público e um privado; confirmar que a UI de “conhecido por sentido” não complica o caso recíproco.

**Acceptance Scenarios**:

1. **Given** um vínculo recíproco **visível** a jogadores, **When** jogador e mestre o vêem, **Then** ambos lêem a mesma natureza única (sem controlos de sentido extra).
2. **Given** um vínculo recíproco **oculto**, **When** um jogador consulta a rede, **Then** não o vê; o mestre vê.

---

### Edge Cases

- Seleccionar o personagem do lado do sentido **secreto** (ex. Tomas) como jogador: a entrada do vizinho **permanece** na lista; **não** revela a natureza secreta (Tomas→Lila); mostra só sentidos conhecidos (ex. “vê-te como Amizade”). Não se inventa um “eu vejo” falso nem se esconde a entrada por completo.
- Ambos os sentidos conhecidos + par público: comportamento alinhado a 071 (jogador vê assimetria completa).
- Passar de duas vias para recíproco: deixa de haver distinção por sentido; aplica-se só a visibilidade do par.
- Filtros por tipo (chips): para o jogador, só contam naturezas dos sentidos **conhecidos**; para o mestre, contam ambos.
- Fora de escopo: revelar um sentido só a certos jogadores (por PJ); histórico de “quando passou a ser conhecido”; tipos novos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Em pares **duas vias**, o mestre MUST poder marcar cada sentido (A vê B / B vê A) como **conhecido** (visível a jogadores) ou **apenas GM**.
- **FR-002**: O Modo GM MUST continuar a mostrar **sempre** as duas perspectivas de um par duas vias (palco e ficha), independentemente das marcas de conhecimento.
- **FR-003**: O interruptor **público** do par MUST continuar a ser o **mestre**: se o par for privado, jogadores MUST NOT ver linha nem entradas, independentemente das marcas de conhecimento por sentido.
- **FR-004**: Para jogadores, e **só** quando o par for **público**, o palco MUST mostrar por par duas vias: **nenhuma** ligação se nenhum sentido conhecido; se exactamente um sentido conhecido, **uma** natureza visualmente como vínculo **recíproco** dessa natureza (cor + etiqueta; **sem** fade assimétrico); **duas vias** (assimétricas, como 071) se ambos os sentidos forem conhecidos.
- **FR-005**: Para jogadores (par público), a ficha MUST listar apenas informação dos sentidos **conhecidos**. Se o sentido “eu vejo” (seleccionado→vizinho) for secreto e o sentido inverso for conhecido, a entrada MUST permanecer e MUST mostrar só o sentido conhecido (ex. “vê-te como…”), **sem** inventar tipo falso no sentido secreto e **sem** omitir a linha só por o “eu vejo” estar oculto.
- **FR-006**: O mestre MUST poder alterar as marcas de conhecimento ao criar ou editar o par, sem duplicar a ligação entre as duas pessoas.
- **FR-007**: Pares **recíprocos** MUST NOT exigir marcas por sentido; a visibilidade continua a ser só a do par (público ou privado).
- **FR-008**: Jogadores MUST NOT criar nem editar vínculos nem marcas de conhecimento.
- **FR-009**: Pares já existentes (071) MUST, por omissão, tratar-se como: se o par era público, **ambos** os sentidos conhecidos; se era privado, as marcas por sentido podem existir para o mestre, mas o jogador continua sem ver o par até o tornar público.
- **FR-010**: Ao **criar** um par duas vias novo, ambos os sentidos MUST iniciar como **conhecidos**; o mestre desliga explicitamente o que for secreto. Ao converter recíproco → duas vias, o segundo sentido MUST também iniciar conhecido (salvo o mestre o alterar antes de gravar).

### Key Entities

- **Par de vínculo**: ligação entre duas pessoas; recíproca ou duas vias (071).
- **Sentido / perspectiva**: “A vê B como [tipo]”; nas duas vias existem dois.
- **Conhecimento do sentido**: se essa perspectiva é revelável a jogadores **quando** o par é público, ou só para o mestre.
- **Visibilidade do par (público)**: interruptor mestre; nas duas vias, o jogador só vê o que for sentido conhecido **e** par público.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No exemplo Tomas/Lila (romance secreto / amizade conhecida), **3 em 3** observadores em vista jogador **não** identificam o romance no palco nem na ficha de Lila em **30 segundos** de exploração.
- **SC-002**: O mesmo observador em Modo GM identifica **as duas** naturezas em menos de **10 segundos**.
- **SC-003**: Um mestre configura o exemplo (duas vias + um sentido conhecido) e verifica a vista jogador em menos de **3 minutos**.
- **SC-004**: Com um par público de duas vias e **ambos** os sentidos conhecidos, a vista jogador continua a mostrar a assimetria completa (**0** regressões face a 071 nesse caso).
- **SC-005**: **100%** dos vínculos recíprocos da campanha mantêm o mesmo critério simples visível/oculto, sem exigir passos extra de “sentido conhecido”.

## Assumptions

- Evolui 071: “público do par ⇒ jogador vê **sempre** as duas vias” deixa de ser verdade quando um sentido não é conhecido; **privado** continua a esconder o par por completo.
- “A via que os utilizadores vêem no mapa” = sentidos **conhecidos**, e só se o par for **público**.
- Recíprocos não ganham UI de conhecimento por sentido.
- Migração: pares públicos existentes → ambos os sentidos conhecidos; privados → jogador continua sem ver o par (público desligado).
- Novos pares duas vias / conversão a duas vias: ambos os sentidos **conhecidos** por omissão.
- Público + um sentido conhecido: no palco do jogador a linha **não** deve parecer “duas vias incompletas”; lê-se como recíproco da natureza conhecida.
- UI em português; sem emoji.
