# Feature Specification: Disc Portrait

**Feature Branch**: `069-disc-portrait`

**Created**: 2026-08-11

**Status**: Implemented

**Input**: User description: "Nas relações, ao invés de mostrar as iniciais do personagem dentro do disco, se ele tiver algum retrato, vamos exibir o retrato (reduzido para caber no disco)"

**Depends on**: `066-relationship-network` (nós/discos na tela Relações); retrato partilhado da ficha (`retrato_url`)

## Clarifications

### Session 2026-08-11

- Q: Como encaixar o retrato no disco circular? → A: Preencher — a imagem cobre o disco; o que não couber no círculo é recortado (centro visível)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Disco com retrato quando existe (Priority: P1)

O utilizador abre **Relações** e identifica personagens pelo **rosto** no disco, não só pelas iniciais. Se o personagem tem retrato na ficha (o mesmo da Rede / mapa), esse retrato **preenche** o círculo (recorte centrado). Nome e papel por baixo do disco mantêm-se.

**Why this priority**: É o pedido — o disco deixa de ser só um monograma quando há imagem.

**Independent Test**: Personagem com retrato no seed ou após upload GM; o disco mostra a imagem, não as iniciais.

**Acceptance Scenarios**:

1. **Given** um personagem **com** retrato, **When** o utilizador vê o palco (com ou sem selecção), **Then** o disco mostra esse retrato a preencher o círculo (sem sair da borda; recorte centrado se a imagem não for quadrada).
2. **Given** o mesmo personagem no mapa (tipo NPC) e em Relações, **When** compara os retratos, **Then** é o **mesmo** recurso visual (fonte única já usada na ficha).
3. **Given** um personagem **sem** retrato, **When** observa o disco, **Then** continua a ver as **iniciais** (2 letras), como hoje.

---

### User Story 2 - Estados visuais do disco não se perdem (Priority: P2)

PJ vs NPC (borda), seleccionado (halo), morto (dessaturado / nome riscado) e nós esmaecidos (~28%) aplicam-se **também** quando o disco tem retrato. O retrato não “apaga” esses estados.

**Why this priority**: Evitar que a foto deixe de se perceber quem está focado ou morto.

**Independent Test**: Seleccionar um NPC com retrato; um morto com retrato; um nó não relacionado ao foco.

**Acceptance Scenarios**:

1. **Given** um personagem com retrato **seleccionado**, **When** olha o disco, **Then** o halo de selecção permanece visível à volta do círculo.
2. **Given** um personagem **morto** com retrato, **When** observa o disco, **Then** a imagem aparece dessaturada (e o nome continua riscado).
3. **Given** um personagem com retrato **não relacionado** ao foco, **When** há selecção noutro nó, **Then** o disco (retrato incluído) fica esmaecido como os demais (~28%).

---

### User Story 3 - Retrato actualizado reflecte-se no grafo (Priority: P2)

O GM (ou o fluxo de ficha já existente) altera o retrato; ao voltar a Relações (ou no mesmo ecrã após guardar), o disco mostra a imagem nova. Remover o retrato devolve as iniciais.

**Why this priority**: Fecha o ciclo com a ficha partilhada (066 SC-006).

**Independent Test**: Upload/remover retrato em Relações ou no mapa; o disco actualiza sem passo extra.

**Acceptance Scenarios**:

1. **Given** um personagem sem retrato, **When** o GM associa um retrato e o grafo actualiza, **Then** o disco passa a mostrar a imagem.
2. **Given** um personagem com retrato, **When** o retrato é removido, **Then** o disco volta às iniciais.

---

### Edge Cases

- Imagem em falta / URL inválida: o disco **volta às iniciais** (não fica círculo vazio).
- Retrato muito largo ou alto: recorte centrado para preencher o círculo (nada de imagem distorcida ou a transbordar).
- Disco continua 58px; layout dos anéis e âncora das linhas (067) **não** mudam.
- Zoom/pan: o retrato escala com o palco como o disco actual.
- Personagem PJ sem pin no mapa: o retrato em Relações funciona na mesma.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Se o personagem tiver retrato, o disco na tela Relações MUST mostrar essa imagem a **preencher** o círculo (recorte centrado; laterais ou topo/fundo cortados se a imagem não for quadrada). O painel de detalhe / ficha MUST continuar a mostrar a imagem completa, sem este recorte.
- **FR-002**: Se **não** houver retrato (ou a imagem falhar), o disco MUST mostrar as iniciais (comportamento actual).
- **FR-003**: O retrato do disco MUST ser o mesmo da ficha do personagem (mapa / painel de detalhe).
- **FR-004**: Borda PJ/NPC, halo de selecção, estado morto e esmaecimento MUST aplicar-se com retrato no disco.
- **FR-005**: Nome e papel **abaixo** do disco MUST permanecer; o retrato substitui **apenas** o conteúdo interior do círculo.
- **FR-006**: O sistema MUST NOT alterar tamanho do disco, layout em anéis, opacidade das linhas (068) nem regras de visibilidade de vínculos.

### Key Entities

- **Retrato do personagem**: imagem opcional da ficha (`retrato` já existente); quando presente, é o conteúdo do disco.
- **Disco**: círculo de identidade no grafo; conteúdo = retrato **ou** iniciais.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em amostragem de ≥5 personagens **com** retrato, **100%** dos discos mostram a imagem (não as iniciais).
- **SC-002**: Em amostragem de ≥3 personagens **sem** retrato, **100%** dos discos mostram iniciais.
- **SC-003**: **0** retratos a transbordar a borda do disco ou visivelmente distorcidos (esticados) nessa amostragem.
- **SC-004**: Um observador reconhece um personagem conhecido pelo rosto no disco em menos de **5 segundos** (com retrato presente).
- **SC-005**: Após associar ou remover um retrato, o disco reflecte o estado novo no próximo refresh da vista (sem sincronização manual extra).

## Assumptions

- Recorte tipo “preencher o círculo” (centro visível; lados cortados se a imagem não for quadrada). Confirmado na clarificação: não encaixar com faixas vazias.
- Fallback para iniciais se a imagem não carregar.
- Sem novo campo de dados: usa o retrato já persistido no Personagem.
- Fora de escopo: gerar retrato automático, avatares por defeito além das iniciais, alterar o tamanho do disco.
