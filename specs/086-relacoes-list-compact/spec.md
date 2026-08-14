# Feature Specification: Lista na coluna, hover no palco e anéis mais compactos (Relações)

**Feature Branch**: `086-relacoes-list-compact`

**Created**: 2026-08-14

**Status**: Implemented

**Input**: User description: "Duas novas melhorias. 1. Na tela de relações, adicione no menu da lateral esquerda, abaixo dos tipos de vinculos, uma lista (com scroll) de todos os NPCs. 2. Outra melhoria que gostaria de fazer é diminuir um pouco a distancia entre os discos quando há mais de 6 (>6) conexões. 3. Na lista de personagens, sempre ao mouse hover, destacar no mapa o personagem e as conexões que ele tem (efeito simples)."

**Depends on**: Rede de Relações existente ([066](../066-relationship-network/spec.md) e follow-ups de visibilidade)

## Clarifications

### Session 2026-08-14

- Q: Quem deve aparecer na lista da coluna esquerda? → A: Todos os personagens visíveis ao papel (PJ e NPC), ordenados por nome.
- Q: Quando deve apertar a distância entre discos? → A: Só o anel interior do foco, se o seleccionado tiver mais de 6 conexões directas visíveis. A vista geral não muda.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Encontrar personagem pela lista da coluna (Priority: P1)

Na Rede de Relações, a coluna esquerda passa a ter, **por baixo dos chips de tipo de vínculo**, uma **lista com scroll** de **todos os personagens visíveis** ao papel (PJ e NPC). O utilizador percorre nomes sem depender só do palco; ao escolher um nome, o palco foca esse personagem como se tivesse clicado no disco.

**Why this priority**: Com muitas fichas no grafo, achar alguém no palco é lento; a lista é o atalho de consulta (o mesmo papel da lista de Locais/NPCs no mapa).

**Independent Test**: Abrir `/relacoes` com ≥8 personagens visíveis ao papel; a lista aparece abaixo dos tipos, faz scroll; clicar um nome selecciona no palco e abre o painel de detalhe.

**Acceptance Scenarios**:

1. **Given** a Rede com PJs e NPCs visíveis, **When** o utilizador olha a coluna esquerda, **Then** vê a lista de **todos** esses personagens (não só NPCs) imediatamente abaixo da secção de tipos de vínculo, com scroll próprio se os nomes não couberem.
2. **Given** a lista visível, **When** clica num nome, **Then** esse personagem fica seleccionado no palco (mesmo resultado que clicar no disco) e o painel de detalhe abre.
3. **Given** texto no campo **Buscar personagem…**, **When** a lista actualiza, **Then** só mostra nomes que correspondem à busca (mesma regra da busca já existente no palco).
4. **Given** um jogador (sem Modo GM), **When** vê a lista, **Then** não aparece nenhum personagem que as regras de visibilidade já escondam no palco.

---

### User Story 2 - Anel mais junto quando há muitas conexões (Priority: P1)

Quando o layout coloca **mais de 6** discos no anel das conexões directas (personagem seleccionado com >6 vínculos visíveis), a folga entre discos **diminui um pouco** em relação ao espaçamento actual — os vizinhos ficam mais perto, sem sobrepor nomes/discos.

**Why this priority**: Com 7+ ligações, o anel interior fica demasiado largo e o foco perde-se; apertar um pouco recupera leitura sem mudar o modelo de anéis.

**Independent Test**: Seleccionar um personagem com 4 conexões visíveis (anel como hoje) e outro com 8 (anel visivelmente mais compacto, sem colisão).

**Acceptance Scenarios**:

1. **Given** um personagem seleccionado com **6 ou menos** conexões directas visíveis, **When** se observa o palco, **Then** a distância entre discos no anel interior é a de sempre (sem regressão).
2. **Given** um personagem seleccionado com **mais de 6** conexões directas visíveis, **When** se observa o anel interior, **Then** os discos estão **mais juntos** do que com o espaçamento antigo, e nomes/discos **não** se sobrepõem.
3. **Given** a vista geral (nenhum personagem seleccionado) com **mais de 6** discos num anel, **When** se observa o palco, **Then** o espaçamento permanece o de sempre (o apertar **não** se aplica à vista geral).

---

### User Story 3 - Pré-ver personagem e vínculos ao passar o rato na lista (Priority: P2)

Ao passar o rato sobre um nome na lista da coluna, o palco **destaca de forma simples** aquele personagem e as **conexões directas visíveis** (linhas de vínculo), sem clicar e sem mudar o layout. Ao sair do nome, o destaque de hover desaparece.

**Why this priority**: Liga lista e palco como o hover dos nomes na aba Locais liga lista e pins; permite reconhecer alguém na Rede antes de seleccionar.

**Independent Test**: Com ≥3 personagens visíveis, passar o rato num nome: o disco correspondente e as suas linhas de vínculo visíveis ficam evidentes; sair do nome remove o destaque; o painel de detalhe **não** abre só por hover.

**Acceptance Scenarios**:

1. **Given** a lista com vários nomes e o palco visível, **When** o utilizador passa o rato sobre um nome, **Then** o disco desse personagem e as linhas das suas conexões directas visíveis ficam destacados de forma clara.
2. **Given** um nome em hover, **When** o rato sai desse nome (ou passa a outro), **Then** o destaque de hover anterior some; se o rato for para outro nome, passa a destacar esse personagem e as respectivas conexões.
3. **Given** hover sobre um nome, **When** o utilizador **não** clica, **Then** o personagem **não** fica seleccionado, o layout **não** muda e o painel de detalhe **não** abre (hover ≠ clique).
4. **Given** um personagem já seleccionado no palco, **When** o utilizador faz hover noutro nome da lista, **Then** o palco mostra o destaque de hover desse outro personagem **sem** substituir a selecção; ao sair do hover, o estado de selecção permanece.

---

### Edge Cases

- Lista vazia (nenhum personagem visível, ou busca sem correspondência): mostrar estado vazio amigável, não um bloco em branco sem explicação.
- Lista longa: o **scroll é da lista**, não deve «comer» os chips de tipo nem impedir chegar à legenda no rodapé da coluna.
- Personagem oculto: jogador não o vê na lista; GM vê-o (como no palco), com o mesmo tipo de indicação de oculto se já existir no grafo.
- Clicar o nome já seleccionado: o mesmo que clicar de novo no disco (desselecciona / fecha detalhe).
- Isolar selecção activo: a lista continua a mostrar o conjunto da busca/visibilidade da coluna (não se reduz só aos vizinhos), para poder saltar para outro personagem; o palco continua a isolar como hoje.
- Anel com exactamente 6 conexões: **não** usa o espaçamento compacto (o limiar é **>6**).
- Vista geral com muitos discos num anel: **não** compacta; só o anel interior do foco.
- Anel compacto ainda tem de caber na vista com zoom/pan actuais; o utilizador pode aproximar se quiser.
- Hover num nome cujo disco não está no palco (ex.: Isolar selecção escondeu-o): **não** há destaque no palco; Isolar **não** se desliga só por hover.
- Personagem sem conexões visíveis: só o disco desse personagem fica destacado.
- Vínculos que as regras de visibilidade já escondem (ex.: secreto para o jogador): o hover **não** os revela.
- Touch / dispositivo sem hover: o clique na lista continua a funcionar; o destaque por hover simplesmente não ocorre.
- Disco fora da área visível (pan/zoom): o hover destaca-o se estiver desenhado; o palco **não** é obrigado a recentrar só pelo hover.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A coluna esquerda da Rede MUST incluir uma lista com scroll **imediatamente abaixo** da secção de tipos de vínculo (antes de Isolar selecção e da legenda).
- **FR-002**: A lista MUST mostrar **todos os personagens visíveis ao papel** (PJ e NPC), ordenados por nome (A→Z), com o mesmo conjunto visível que o palco para aquele papel.
- **FR-003**: Clicar um item da lista MUST seleccionar esse personagem no palco e abrir o painel de detalhe (paridade com clicar o disco).
- **FR-004**: A busca já existente na coluna MUST filtrar também esta lista.
- **FR-005**: A lista MUST ter altura limitada e scroll interno quando há mais nomes do que o espaço; chips de tipo e legenda permanecem acessíveis sem perder a lista de vista.
- **FR-006**: Com personagem seleccionado e **mais de 6** conexões directas visíveis, o anel interior MUST usar folga **menor** que a folga padrão; com 6 ou menos, a folga padrão mantém-se.
- **FR-007**: No anel compacto, discos e rótulos (nome/papel) MUST NOT sobrepor-se.
- **FR-008**: O apertar extra MUST aplicar-se **apenas** ao anel interior do foco (conexões directas do personagem seleccionado). Os anéis da vista geral MUST manter a folga padrão, mesmo com mais de 6 discos.
- **FR-009**: Ao passar o rato sobre um nome na lista da coluna, o palco MUST destacar o disco desse personagem e as linhas das suas **conexões directas visíveis** (efeito simples, temporário).
- **FR-010**: Ao sair o rato do nome (sem hover noutro item da lista), o destaque causado pelo hover MUST ser removido; a selecção por clique, se existir, MUST permanecer.
- **FR-011**: Hover na lista MUST NOT, por si só, seleccionar o personagem, alterar o layout dos anéis, abrir o painel de detalhe, nem recentrar/alterar o zoom do palco.
- **FR-012**: O destaque de hover MUST respeitar as mesmas regras de visibilidade que o palco (não mostrar vínculos ou personagens que aquele papel já não vê).
- **FR-013**: Em viewports sem hover (ex.: toque), a lista MUST continuar utilizável só com clique; esta frente MUST NOT depender do hover para navegar.

### Out of Scope

- Persistência da posição arrastada dos nós.
- Nova busca só para a lista (reutiliza o campo actual).
- Agrupar a lista por arco, facção ou tipo PJ/NPC em secções.
- Controlos para o utilizador escolher o valor da folga.
- Alterar tamanho dos discos ou das etiquetas.
- Destaque por foco de teclado na lista (melhoria futura; esta frente é hover de rato).
- Destacar a rede completa (amigos-de-amigos); só conexões **directas**.
- Animação elaborada ou efeito que mude posições dos discos.

### Key Entities

- **Lista da coluna**: todos os personagens visíveis ao papel (PJ e NPC), abaixo dos tipos de vínculo; scroll próprio; ordenação A→Z.
- **Anel de conexões**: no layout de selecção, os personagens com vínculo directo ao focado; a folga compacta aplica-se só a este anel quando há **>6** conexões visíveis.
- **Destaque de hover**: estado visual temporário no palco (disco + linhas de vínculo directo visíveis) ligado ao nome sob o ponteiro na lista; distinto da selecção por clique.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com ≥8 nomes na lista, o utilizador encontra e selecciona um personagem **pelo nome na coluna** em menos de **15 segundos**, sem procurar o disco no palco.
- **SC-002**: **100%** dos nomes na lista, para um dado papel, coincidem com os discos visíveis no palco (zero extras, zero omissões por visibilidade).
- **SC-003**: Em **3 em 3** observações, um anel com 8 conexões directas está visivelmente mais compacto do que o mesmo anel com a folga antiga, e nenhum par de discos/nomes se sobrepõe.
- **SC-004**: Um anel com 4 conexões directas **não** muda de aspecto face ao estado anterior (comparação lado a lado).
- **SC-005**: A vista geral com ≥7 discos num anel **não** muda de folga face ao estado anterior.
- **SC-006**: Em teste com ≥3 personagens visíveis, um avaliador identifica o disco correspondente e as suas linhas de vínculo em **≤2 segundos** após iniciar o hover no nome.
- **SC-007**: Em **100%** dos testes, hover sozinho **não** abre o painel de detalhe nem muda o layout; sair o rato remove o destaque de hover (salvo o estilo da selecção por clique, se ainda activa).

## Assumptions

- Clicar na lista = mesmo gesto que clicar no disco (incluindo desseleccionar se já estava seleccionado).
- A busca da coluna filtra palco e lista em conjunto.
- Regras de visibilidade (personagem oculto, vínculo secreto) não mudam — a lista não é um canal para ver o que o palco esconde.
- «Diminuir um pouco» a folga: redução perceptível (cerca de um terço da folga padrão), afinada no planeamento; nunca abaixo do mínimo que evita sobreposição. Só no anel interior do foco.
- A lista inclui PJs e NPCs; não exige rótulo PJ/NPC em cada linha (a legenda da coluna já distingue os tipos).
- Isolar selecção e chips de tipo continuam a governar o palco; a lista não substitui esses filtros, só a navegação por nome.
- Sem dados novos nem migração.
- Hover na lista = pré-visualização visual, no mesmo espírito do destaque de pin ao hover na aba Locais: efeito simples (disco + linhas directas visíveis), sem isolar o palco nem rearranjar anéis.
- O estilo de hover pode aproximar-se do realce já usado no foco por clique, desde que hover e clique permaneçam comportamentos distintos.
