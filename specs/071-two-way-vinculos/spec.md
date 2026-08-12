# Feature Specification: Two-Way Vínculos

**Feature Branch**: `071-two-way-vinculos`

**Created**: 2026-08-11

**Status**: Implemented

**Input**: User description: "Agora vamos adicionar a opção de conexão de duas vias. Exemplo: Elara Voss vê o Marcus Stein como um aliado, porém, Marcus Stein vê Elara como um possível romance, é uma relação com visão diferente (dependendo da direção), temos que deixar isso claro tanto na visão geral, quanto na visão de personagem selecionado."

**Depends on**: `066-relationship-network` (vínculos tipados); `068-focus-edge-opacity` (linhas ténues / foco)

## Clarifications

### Session 2026-08-11

- Q: Como mostrar as duas naturezas na vista geral (sem seleccionar)? → A: Uma linha, duas cores + etiquetas junto a cada extremo (também na vista geral); no meio as cores fundem-se com um fade
- Q: A flag público é por par ou por sentido? → A: Por par — uma flag; jogador vê as duas vias ou nenhuma

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visão geral mostra as duas perspectivas (Priority: P1)

No palco **Relações**, um observador vê que a ligação Elara–Marcus **não é a mesma nos dois sentidos**. Sem seleccionar ninguém (e também com a rede ténue de fundo), fica óbvio que um lado é *aliado* e o outro *romance* — não uma única etiqueta no meio que esconda a assimetria.

**Why this priority**: Pedido explícito — a vista geral tem de tornar a “visão diferente” legível, não só a ficha.

**Independent Test**: Par com tipos distintos em cada direcção; olhar o palco sem selecção e confirmar as duas naturezas.

**Acceptance Scenarios**:

1. **Given** Elara vê Marcus como **aliado** e Marcus vê Elara como **romance**, **When** o utilizador olha o palco sem selecção, **Then** a linha tem a cor de *aliado* junto a Elara, a de *romance* junto a Marcus, um **fade** a fundir as duas no meio, e uma etiqueta curta em cada extremo.
2. **Given** o mesmo par, **When** o utilizador compara com um vínculo **recíproco** (mesmo tipo nos dois sentidos), **Then** o recíproco continua a ler-se como uma só natureza (como hoje: uma etiqueta / uma cor).
3. **Given** chips de tipo, **When** o utilizador desliga “Romance” e deixa “Aliado”, **Then** o par Elara–Marcus **permanece** na vista (há pelo menos uma direcção aliado); some só se **nenhuma** das duas naturezas estiver activa.

---

### User Story 2 - Ficha do seleccionado é da perspectiva dele (Priority: P1)

Ao seleccionar Elara, a ficha e o destaque no palco mostram **o que ela vê** e, com igual clareza, **o que o outro vê dela**. Ao seleccionar Marcus, as etiquetas invertem: romance do lado dele, aliado do lado dela. Ninguém lê a relação “ao contrário”.

**Why this priority**: Sem isto, a opção de duas vias não serve para jogar a partir de um PJ/NPC.

**Independent Test**: Seleccionar cada extremo do par e ler palco + lista de vínculos.

**Acceptance Scenarios**:

1. **Given** o par Elara/Marcus acima, **When** o utilizador selecciona **Elara**, **Then** na lista de vínculos vê Marcus como **Aliado** (visão de Elara) **e** que Marcus a vê como **Romance**.
2. **Given** a mesma selecção, **When** olha a linha no palco após o realce, **Then** a natureza junto a Elara corresponde a *aliado* e a junto a Marcus a *romance*.
3. **Given** o utilizador selecciona **Marcus**, **When** lê ficha e linha, **Then** a visão dele (romance) está em primeiro plano na entrada de Elara, e a visão dela (aliado) continua indicada.

---

### User Story 3 - GM cria ou edita duas vias (Priority: P2)

O GM pode marcar uma conexão como **duas vias** e escolher o tipo (e nota) em cada sentido; ou deixar **recíproco** (um tipo, uma nota — comportamento actual). Novos vínculos continuam **não públicos** até o GM marcar. Jogador só vê o par se o vínculo for público (as duas perspectivas, quando existirem).

**Why this priority**: Sem edição, o exemplo de produção não entra na campanha.

**Independent Test**: Criar o par Elara→aliado / Marcus→romance; editar de volta a recíproco; jogador vs GM.

**Acceptance Scenarios**:

1. **Given** Modo GM, **When** cria uma conexão **duas vias** entre dois personagens, **Then** define tipo (e nota opcional) **de A para B** e **de B para A**; a rede e as fichas reflectem ambos.
2. **Given** um vínculo recíproco existente, **When** o GM o passa a duas vias (ou o inverso), **Then** a vista actualiza sem duplicar o par (continua a ser **uma** ligação entre as duas pessoas).
3. **Given** um jogador, **When** o par é privado, **Then** não vê linha nem entradas; quando o GM o torna público, vê **as duas** perspectivas (não só uma).

---

### Edge Cases

- Os dois sentidos com o **mesmo** tipo: trata-se como recíproco (uma natureza), mesmo que o GM tenha preenchido os dois lados iguais.
- Só um sentido preenchido: não permitido ao gravar — duas vias exige os dois tipos; recíproco exige um tipo.
- Filtro “Isolar”: o par conta como vizinho se existir qualquer sentido entre o foco e o outro.
- Apagar personagem: os dois sentidos do par desaparecem (cascade já existente).
- Muitos pares duas vias no palco ocioso: fade + etiquetas nos extremos distinguem as naturezas sem tapar nomes; recíprocos continuam sem etiqueta ociosa (068).
- Fora de escopo: mais de duas pessoas no mesmo vínculo; tipos novos além dos seis actuais; gravar posições do grafo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir, para o mesmo par de personagens, uma ligação **recíproca** (uma natureza nos dois sentidos) **ou** **duas vias** (natureza distinta em cada sentido).
- **FR-002**: Entre dois personagens MUST existir no máximo **um** par (não duas ligações soltas para o mesmo casal).
- **FR-003**: Na **vista geral** (sem selecção), um par duas vias MUST usar **uma** linha: cor da natureza de cada extremo junto a esse personagem, **fade** a mesclar as duas cores no troço central, e etiqueta curta junto a cada extremo. Recíprocos MUST NOT ganhar estas etiquetas ociosas (068).
- **FR-004**: Com um personagem **seleccionado**, a ficha MUST listar cada vizinho com a visão **de quem está seleccionado** para essa pessoa **e** a visão **dessa pessoa** para o seleccionado, quando as naturezas diferem.
- **FR-005**: No palco, com selecção, as etiquetas da linha duas vias MUST alinhar-se à perspectiva de cada extremo (tipo junto de quem “vê” com aquela natureza).
- **FR-006**: Vínculos recíprocos MUST manter o aspecto actual (uma cor, uma etiqueta ao centro, uma entrada na ficha com um tipo).
- **FR-007**: Filtros por tipo MUST incluir o par se **qualquer** dos sentidos corresponder a um chip activo.
- **FR-008**: O GM MUST poder criar e editar recíproco vs duas vias; jogadores MUST NOT criar/editar; a flag **público** aplica-se ao **par** (jogador vê as duas perspectivas ou nenhuma).
- **FR-009**: Novos pares MUST continuar **não públicos** por omissão (066). Notas: uma no recíproco; uma por sentido nas duas vias.
- **FR-010**: Pares já existentes MUST ler-se como recíprocos (mesmo tipo nos dois sentidos) sem acção do GM.

### Key Entities

- **Par de vínculo**: uma ligação entre exactamente duas pessoas; recíproca ou duas vias.
- **Perspectiva (sentido)**: “A vê B como [tipo]”, com nota opcional; nas duas vias existem dois sentidos.
- **Visibilidade**: flag público do par (igual para os dois sentidos).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dado o exemplo Elara/Marcus, **3 em 3** observadores identificam *aliado* e *romance* na vista geral em menos de **10 segundos**, sem abrir a ficha.
- **SC-002**: Ao seleccionar Elara e depois Marcus, **100%** das leituras da ficha atribuem o tipo correcto a **quem vê** (0 inversões).
- **SC-003**: Um GM cria o par duas vias e vê-o no palco e nas duas fichas em menos de **2 minutos**.
- **SC-004**: Com ≥5 pares recíprocos e ≥1 duas vias no mesmo palco, os recíprocos **não** mudam de leitura (uma natureza) e o duas vias continua distinguível.
- **SC-005**: Um jogador **nunca** vê um par marcado privado; num par público duas vias vê **as duas** naturezas.

## Assumptions

- “Duas vias” é **opcional**; o caso por omissão continua a ser recíproco (um tipo, como hoje).
- Uma linha (não duas paralelas): duas cores com **fade** no meio; etiquetas duas vias visíveis mesmo sem selecção; recíprocos seguem 068 (etiqueta só no realce).
- Público é **por par**, não por sentido (confirmado: o jogador não vê só “metade” da relação).
- Os seis tipos actuais servem os dois sentidos; “possível romance” usa o tipo **Romance** (a nuance vai na nota).
- Seed/campanha existente não precisa de recodificar à mão: tudo o que já existe é recíproco.
