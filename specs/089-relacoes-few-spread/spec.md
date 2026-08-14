# Feature Specification: Anel de foco mais aberto (≤3 conexões)

**Feature Branch**: `089-relacoes-few-spread`

**Created**: 2026-08-14

**Status**: Implemented

**Input**: User description: "Agora vamos ajustar quando há 3 ou menos conexões, precisamos aumentar em 30% a separação para ficar mais legível."

**Depends on**: Rede de Relações ([066](../066-relationship-network/spec.md)); compactação do anel interior ([086](../086-relacoes-list-compact/spec.md), [088](../088-relacoes-focus-tighter/spec.md)); vista geral compacta ([087](../087-relacoes-overview-compact/spec.md))

**Supersedes (parcial)**: [088](../088-relacoes-focus-tighter/spec.md) FR-002 / [086](../086-relacoes-list-compact/spec.md) «≤6 usa a folga padrão» — com **3 ou menos** conexões directas visíveis a folga interior passa a ser **30% maior** que a padrão. Com **4 a 6** permanece a padrão; com **>6** permanece a compactação da 088.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Poucas conexões mais legíveis (Priority: P1)

Quando o utilizador selecciona um personagem com **3 ou menos** conexões directas visíveis, o anel dessas conexões fica **30% mais aberto** do que a folga padrão de foco: os vizinhos afastam-se, nomes e textos de vínculo lêem-se com mais folga. Com 4 a 6 conexões, o anel continua na folga padrão; com mais de 6, continua o compacto da 088.

**Why this priority**: Com 1–3 ligações o anel padrão deixa discos e rótulos demasiado juntos no centro; abrir 30% recupera leitura sem mexer nos casos já afinados (4–6 e >6).

**Independent Test**: Seleccionar um personagem com 2 conexões visíveis (anel visivelmente mais aberto que o padrão) e outro com 5 (anel padrão, sem esta abertura). Confirmar que um com 8 continua o compacto da 088 e que a vista geral não muda.

**Acceptance Scenarios**:

1. **Given** um personagem seleccionado com **3 ou menos** conexões directas visíveis, **When** se observa o anel interior, **Then** a distância entre discos vizinhos é **cerca de 30% maior** do que a folga padrão de foco, e nomes, discos e textos de vínculo continuam distinguíveis.
2. **Given** um personagem seleccionado com **4, 5 ou 6** conexões directas visíveis, **When** se observa o anel interior, **Then** a folga é a padrão de foco (sem esta abertura extra e sem a compactação da 088).
3. **Given** um personagem seleccionado com **mais de 6** conexões directas visíveis, **When** se observa o anel interior, **Then** o comportamento da 088 mantém-se (anel compacto).
4. **Given** a vista geral (nenhum personagem seleccionado), **When** se observa o palco, **Then** a folga permanece a da 087 — esta frente **não** altera a vista sem selecção.
5. **Given** um personagem seleccionado com **3 ou menos** conexões, **When** se observa o anel **exterior**, **Then** esse anel mantém a folga actual — só o anel interior abre mais.

---

### Edge Cases

- Anel com exactamente **3** conexões: **usa** a abertura extra (o limiar inclui 3).
- Anel com exactamente **4** conexões: **não** usa a abertura extra.
- Personagem seleccionado **sem** conexões visíveis (0): não há anel interior a espaçar; o disco central comporta-se como hoje.
- Uma única conexão visível: o vizinho afasta-se ~30% em relação à posição padrão (o anel de um só disco também usa a folga maior).
- Vista geral: **não** muda (087 permanece).
- Anel exterior do foco: **não** muda.
- Compactação >6 (088): **não** muda.
- Isolar selecção: a abertura aplica-se ao anel interior visível das conexões directas.
- Discos arrastados na sessão: a abertura aplica-se ao layout calculado; offsets de arrasto da sessão comportam-se como hoje.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Com personagem seleccionado e **3 ou menos** conexões directas visíveis, o anel interior MUST usar folga **30% maior** que a folga padrão de foco (ou seja, **130%** dessa distância).
- **FR-002**: Com personagem seleccionado e **4, 5 ou 6** conexões directas visíveis, a folga do anel interior MUST permanecer a folga padrão de foco.
- **FR-003**: Com personagem seleccionado e **mais de 6** conexões directas visíveis, o anel interior MUST continuar a usar a compactação da 088.
- **FR-004**: A abertura extra MUST aplicar-se **apenas** ao anel interior do foco. O anel exterior do foco e a vista geral MUST manter a folga actual.
- **FR-005**: Discos, rótulos (nome/papel) e textos dos vínculos nas linhas MUST permanecer distinguíveis após a abertura (não colar nem tapar-se).

### Out of Scope

- Alterar o limiar da compactação (>6).
- Compactar ou abrir o anel exterior do foco.
- Alterar a vista geral (087).
- Controlo para o utilizador escolher a folga.
- Alterar tamanho dos discos ou das etiquetas.
- Alterar o intervalo de zoom.
- Persistência da posição arrastada dos nós.
- Lista da coluna, hover, ou outras frentes da 086.

### Key Entities

- **Anel de conexões (interior)**: no layout de selecção, os personagens com vínculo directo ao focado; com **≤3** conexões visíveis a folga é **30% maior** que a padrão; com 4–6 a padrão; com >6 a compacta da 088.
- **Folga padrão de foco**: a distância interior usada hoje quando não se aplica compactação nem esta abertura (casos 4–6).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em **3 em 3** observações, a distância entre discos vizinhos num anel com **2** conexões directas é **cerca de 30% maior** do que a folga padrão de foco.
- **SC-002**: Um anel com **5** conexões directas **não** muda de aspecto face ao estado actual (comparação lado a lado).
- **SC-003**: Um anel com **8** conexões directas **não** muda de aspecto face à 088.
- **SC-004**: A vista geral **não** muda de folga face à 087.
- **SC-005**: Com personagem seleccionado e ≤3 conexões, o anel exterior **não** muda de folga; nomes e textos de vínculo continuam legíveis.

## Assumptions

- «3 ou menos conexões» = conexões **directas visíveis** do personagem **seleccionado** (o mesmo critério das 086/088), não a contagem de discos na vista geral.
- «Aumentar em 30% a separação» = a nova folga interior é **130%** da folga padrão de foco (não da compacta da 088).
- O limiar inclui 3 (`≤3`); 4–6 ficam na padrão; >6 fica na 088.
- Sem dados novos nem migração.
- Lista, hover e restantes comportamentos da 086 permanecem.
