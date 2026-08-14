# Feature Specification: Anel de foco ainda mais compacto (>6 conexões)

**Feature Branch**: `088-relacoes-focus-tighter`

**Created**: 2026-08-14

**Status**: Implemented

**Input**: User description: "baseado no que fizemos na spec 086, vamos diminuir mais ainda a distancia entre os discos quando um personagem é selecionado, quando ele tem >6 conexões."

**Depends on**: Rede de Relações ([066](../066-relationship-network/spec.md)); compactação do anel interior de foco ([086](../086-relacoes-list-compact/spec.md)); vista geral compacta ([087](../087-relacoes-overview-compact/spec.md))

**Supersedes (parcial)**: [086](../086-relacoes-list-compact/spec.md) FR-006 / SC-003 — o anel interior com **>6** conexões directas visíveis passa a ficar **ainda mais junto** do que o compacto da 086. O gatilho (>6, só anel interior, ≤6 intacto) mantém-se.

## Clarifications

### Session 2026-08-14

- Q: Até onde apertar o anel interior face à compactação da 086? → A: Reduzir a distância em **30%** da distância actual (a nova folga é 70% da compacta da 086). Os textos dos vínculos nas linhas têm de permanecer legíveis.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Anel interior mais junto com muitas conexões (Priority: P1)

Quando o utilizador selecciona um personagem com **mais de 6** conexões directas visíveis, o anel dessas conexões fica **30% mais compacto** do que após a 086: os vizinhos aproximam-se, sem sobrepor nomes ou discos, e os **textos dos vínculos** nas linhas continuam legíveis. Com 6 ou menos conexões, o anel continua exactamente como hoje.

**Why this priority**: A 086 já apertou «um pouco»; com 7+ ligações o anel ainda ocupa demasiado palco. Esta frente só afina essa compactação extra — o mesmo gatilho, menos folga, sem sacrificar a leitura dos vínculos.

**Independent Test**: Seleccionar um personagem com 4 conexões visíveis (anel como hoje) e outro com 8 (anel ~30% mais junto que o compacto da 086; nomes, discos e textos dos vínculos nas linhas legíveis, sem colisão). Confirmar que a vista geral (087) e o anel exterior do foco não mudam.

**Acceptance Scenarios**:

1. **Given** um personagem seleccionado com **6 ou menos** conexões directas visíveis, **When** se observa o palco, **Then** a distância entre discos no anel interior é a de sempre (sem regressão face a 086/087).
2. **Given** um personagem seleccionado com **mais de 6** conexões directas visíveis, **When** se observa o anel interior, **Then** a distância entre discos vizinhos é **cerca de 30% menor** do que com a compactação da 086, nomes/discos **não** se sobrepõem, e os **textos dos vínculos** nas linhas continuam **legíveis**.
3. **Given** a vista geral (nenhum personagem seleccionado), **When** se observa o palco, **Then** a folga permanece a da 087 (esta frente **não** altera a vista sem selecção).
4. **Given** um personagem seleccionado com **mais de 6** conexões, **When** se observa o anel **exterior** (restantes personagens, sem vínculo directo), **Then** esse anel mantém a folga actual — só o anel interior aperta mais.

---

### Edge Cases

- Anel com exactamente 6 conexões: **não** usa a compactação extra (o limiar continua **>6**).
- Anel com 7 conexões: já usa a compactação extra, agora 30% mais apertada que na 086.
- Anel com muitas conexões (ex.: 12+): a redução de 30% aplica-se na mesma; se isso tornasse discos, nomes ou textos de vínculo ilegíveis, a **legibilidade prevalece** (não se aperta além do último ponto em que tudo continua distinguível).
- Textos de vínculo longos ou vários no mesmo sector do anel: têm de continuar lidos sem se fundirem uns com os outros nem com os nomes dos discos.
- Vista geral: **não** muda (087 permanece).
- Anel exterior do foco: **não** muda.
- Isolar selecção: o palco continua a isolar como hoje; a compactação aplica-se ao anel interior visível das conexões directas.
- Discos arrastados na sessão: o apertar aplica-se ao layout calculado; offsets de arrasto da sessão comportam-se como hoje.
- Zoom/pan: o anel compacto ainda tem de ser legível com os controlos actuais; o utilizador pode aproximar se quiser.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Com personagem seleccionado e **mais de 6** conexões directas visíveis, o anel interior MUST usar folga **30% menor** que a folga compacta da 086 (ou seja, **70%** dessa distância).
- **FR-002**: Com personagem seleccionado e **6 ou menos** conexões directas visíveis, a folga do anel interior MUST permanecer a folga padrão de foco (sem compactação extra).
- **FR-003**: No anel compacto, discos, rótulos (nome/papel) e **textos dos vínculos nas linhas** MUST permanecer distinguíveis e legíveis — MUST NOT sobrepor-se nem tapar-se mutuamente. Se a redução de 30% (FR-001) violar esta regra, a **legibilidade prevalece**: a compactação MUST parar na última folga em que cada item e cada texto de vínculo continua legível.
- **FR-004**: O apertar extra MUST aplicar-se **apenas** ao anel interior do foco (conexões directas do personagem seleccionado). O anel exterior do foco e a vista geral MUST manter a folga actual.
- **FR-005**: O limiar MUST permanecer o da 086: compactação extra só quando há **>6** conexões directas visíveis (6 exactos não compacta).

### Out of Scope

- Alterar o limiar (>6).
- Compactar o anel exterior do foco.
- Alterar a vista geral (já coberta pela 087).
- Controlo para o utilizador escolher a folga.
- Alterar tamanho dos discos ou das etiquetas (incluindo o tamanho da tipografia dos vínculos).
- Alterar o intervalo de zoom.
- Persistência da posição arrastada dos nós.
- Lista da coluna, hover, ou qualquer outra frente da 086 que não seja a folga do anel interior.

### Key Entities

- **Anel de conexões (interior)**: no layout de selecção, os personagens com vínculo directo ao focado; a folga compacta aplica-se só a este anel quando há **>6** conexões visíveis, **30% menor** que na 086.
- **Texto de vínculo**: o rótulo na linha que liga dois personagens (tipo/qualificador); tem de continuar legível após a compactação.
- **Chão de legibilidade**: a folga mínima em que discos, nomes e textos de vínculo continuam distinguíveis; a compactação não desce abaixo deste chão, mesmo que isso signifique menos de 30% de redução.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em **3 em 3** observações, a distância entre discos vizinhos num anel com 8 conexões directas é **cerca de 30% menor** do que com a compactação da 086 (salvo se SC-003 obrigar a parar antes).
- **SC-002**: Um anel com 4 conexões directas **não** muda de aspecto face ao estado actual (comparação lado a lado).
- **SC-003**: **Zero** sobreposições de discos, nomes ou textos de vínculo no anel compacto (casos de teste com 7, 8 e 12 conexões directas visíveis); um avaliador consegue **ler** o texto de cada vínculo destacado **sem** adivinhar — critério **não negociável**.
- **SC-004**: A vista geral com ≥7 discos num anel **não** muda de folga face à 087.
- **SC-005**: Com personagem seleccionado e >6 conexões, o anel exterior (não-directos) **não** muda de folga face ao estado actual.

## Assumptions

- «Diminuir mais ainda» aplica-se **só** ao anel interior do foco com **>6** conexões directas visíveis — o mesmo âmbito da compactação da 086, agora com redução de **30%** dessa folga compacta.
- «Textos dos links» = os rótulos visíveis nas linhas de vínculo (não os nomes dos personagens).
- Se 30% de redução tornar esses textos (ou nomes/discos) ilegíveis, reduz-se menos — a legibilidade ganha.
- O limiar >6, a folga padrão com ≤6, a vista geral e o anel exterior não são negociados nesta frente.
- Sem dados novos nem migração.
- Lista, hover e restantes comportamentos da 086 permanecem.
