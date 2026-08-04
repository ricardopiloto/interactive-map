# Feature Specification: Scroll e busca no menu lateral

**Feature Branch**: `037-side-menu-scroll-search`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Nenhuma das abas no menu lateral tem scroll, necessário adicionar scroll e um filtro de busca para facilitar navegação do usuário"

## Clarifications

### Session 2026-08-04

- Q: O que o filtro cobre na aba História → A: Título do arco **ou** nome de qualquer local ligado a esse arco
- Q: Texto do filtro ao mudar de aba → A: Manter o texto e reaplicar o filtro na nova aba
- Q: Campo de busca na aba Grupo → A: Ocultar o campo de busca na aba Grupo (scroll do conteúdo continua)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Percorrer listas longas com scroll (Priority: P1)

Um jogador ou GM abre o menu lateral, muda entre as abas (Locais, NPCs, História, e Grupo quando aplicável) e, quando a lista ou o painel da aba ultrapassa a altura disponível, consegue deslocar o conteúdo verticalmente sem perder o cabeçalho, as abas ou o campo de busca (quando visível).

**Why this priority**: Sem scroll, conteúdo abaixo da dobra fica inacessível — bloqueia a navegação básica do codex.

**Independent Test**: Com conteúdo suficiente para ultrapassar a altura do painel em cada aba listável, verificar que o corpo da aba rola e que cabeçalho/abas permanecem utilizáveis.

**Acceptance Scenarios**:

1. **Given** a aba Locais (ou equivalente) com mais itens do que cabem na altura do menu, **When** o utilizador desliza/rola na área de conteúdo, **Then** os itens inferiores tornam-se visíveis e o cabeçalho/abas não desaparecem com o scroll do corpo.
2. **Given** a mesma situação nas outras abas com listas ou painéis longos (NPCs, História, Grupo/administração quando presentes), **When** o utilizador rola o conteúdo da aba, **Then** o scroll funciona de forma equivalente.
3. **Given** o menu em viewport estreita (ex. overlay móvel), **When** o conteúdo da aba excede a altura, **Then** o scroll do corpo continua disponível.

---

### User Story 2 - Filtrar a lista da aba actual (Priority: P1)

O utilizador digita no filtro de busca do menu lateral e vê apenas os itens da aba actual cujo nome (ou título equivalente) corresponde ao texto; limpar o filtro restaura a lista completa dessa aba.

**Why this priority**: Listas longas sem filtro tornam a descoberta lenta mesmo com scroll; o pedido junta scroll e busca como navegação essencial.

**Independent Test**: Em Locais (e nas outras abas com lista), digitar parte de um nome conhecido e confirmar que só restantes matches; limpar e ver a lista completa de novo.

**Acceptance Scenarios**:

1. **Given** a aba Locais com vários itens, **When** o utilizador digita parte de um nome no filtro, **Then** só permanecem itens cujo nome contém esse texto (sem distinguir maiúsculas/minúsculas).
2. **Given** a aba NPCs, **When** o utilizador filtra, **Then** a lista estreita pelo nome do NPC.
3. **Given** a aba História com vários arcos, **When** o utilizador digita texto que coincide com o título de um arco **ou** com o nome de um local ligado a um arco, **Then** esse arco permanece na lista (mesmo que o título do arco em si não contenha o texto).
4. **Given** um filtro activo, **When** o utilizador limpa o texto, **Then** a lista completa da aba volta a aparecer.
5. **Given** texto sem correspondências, **When** o filtro está activo, **Then** o utilizador percebe que não há resultados (lista vazia ou mensagem equivalente), sem erro que bloqueie a UI.

---

### User Story 3 - Busca disponível no modo em que o utilizador navega (Priority: P2)

Tanto no modo jogador como no modo GM, as abas que apresentam listas navegáveis oferecem filtro de busca coerente com a aba actual, para que o GM não fique sem o atalho que o jogador já espera (e vice-versa, nas abas partilhadas).

**Why this priority**: Completa o pedido “facilitar navegação” em todos os papéis; o scroll (US1) já cobre a área, mas a busca deve existir onde há listas.

**Independent Test**: Entrar como jogador e como GM; em cada aba com lista, confirmar presença do filtro e filtragem funcional.

**Acceptance Scenarios**:

1. **Given** modo jogador nas abas com lista, **When** o utilizador usa o filtro, **Then** a filtragem aplica-se aos itens visíveis dessa aba.
2. **Given** modo GM nas abas equivalentes com lista administrativa ou de conteúdo, **When** o utilizador usa o filtro, **Then** consegue restringir a lista da aba actual da mesma forma conceptual (por nome/título).
3. **Given** a aba Grupo, **When** o utilizador está nessa aba, **Then** o campo de busca não é mostrado e o conteúdo longo continua rolável.
---

### Edge Cases

- Aba com poucos itens (não precisam de scroll): o layout não “quebra”; scroll só aparece ou só é necessário quando há overflow.
- Mudar de aba com texto ainda no filtro: o texto permanece no campo e é reaplicado imediatamente aos itens filtráveis da nova aba.
- Aba Grupo (ou painel sem lista longa de nomes): scroll do corpo continua obrigatório se o conteúdo for alto; o campo de busca MUST estar oculto nesta aba.
- Caracteres com acentos: correspondência ignora maiúsculas/minúsculas e acentos (ex.: “sao” encontra “São”), alinhado à experiência de pesquisa já desejada noutros sítios do produto.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A área de conteúdo de cada aba do menu lateral MUST permitir scroll vertical quando o conteúdo excede a altura disponível no ecrã.
- **FR-002**: Cabeçalho do menu, selector de abas e (quando visível) o campo de busca MUST permanecer acessíveis enquanto o utilizador rola o conteúdo da aba (não MUST scrollar para fora de alcance com o corpo da lista).
- **FR-003**: O menu lateral MUST oferecer um campo de filtro de busca para as abas que apresentam listas de itens navegáveis (no mínimo Locais e NPCs; também História).
- **FR-004**: Com o filtro vazio, a aba MUST mostrar a lista completa de itens elegíveis nessa aba (mesma cobertura que sem filtro).
- **FR-005**: Com texto no filtro, a aba Locais MUST filtrar pelo nome do local; a aba NPCs pelo nome do NPC; a correspondência MUST ignorar maiúsculas/minúsculas e acentos e MUST ignorar espaços só no início/fim do texto digitado.
- **FR-010**: Na aba História, um arco MUST permanecer visível se o texto do filtro corresponder ao **título do arco** **ou** ao **nome de qualquer local** ligado a esse arco (mesmas regras de correspondência que FR-005).
- **FR-006**: O filtro MUST aplicar-se à aba actualmente seleccionada; ao mudar de aba, o sistema MUST manter o texto do filtro e MUST reaplicar imediatamente o critério aos itens da nova aba (quando essa aba for filtrável).
- **FR-007**: Em modo jogador e em modo GM, abas com listas navegáveis MUST expor o filtro (não só num dos modos).
- **FR-011**: Na aba Grupo, o campo de busca MUST estar oculto; o conteúdo da aba MUST continuar a cumprir o scroll (FR-001–002).
- **FR-008**: Se nenhum item corresponder, o utilizador MUST perceber a ausência de resultados sem falha da interface.
- **FR-009**: Esta funcionalidade MUST NÃO alterar o significado dos itens (seleccionar um local/NPC/arco continua a abrir o mesmo detalhe/mapa que hoje).

### Key Entities

- **Aba do menu lateral**: Secção activa (Locais, NPCs, História, Grupo quando existir) com área de conteúdo própria.
- **Item de lista**: Entrada nomeada (local, NPC, arco/título, etc.) sujeita a scroll e, quando aplicável, a filtro.
- **Texto de filtro**: Cadeia digitada pelo utilizador; vazia = sem filtragem; não vazia = restringe a lista da aba actual.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com uma lista de pelo menos 15 itens numa aba, 100% dos itens são alcançáveis via scroll do corpo do menu (nenhum fica permanentemente cortado fora da área rolável).
- **SC-002**: Com o mesmo conjunto, um utilizador que conhece o nome encontra e selecciona o item alvo em menos de 20 segundos usando o filtro, sem percorrer a lista completa visualmente.
- **SC-003**: Em 100% dos testes manuais com filtro vazio, a contagem de itens numa aba filtrável coincide com a contagem sem campo de busca activo (lista completa).
- **SC-004**: Em viewport desktop e móvel (overlay), o scroll do conteúdo da aba funciona sempre que há overflow; cabeçalho e abas permanecem utilizáveis em ambos.
- **SC-005**: Em modo jogador e modo GM, cada aba com lista navegável oferece filtro utilizável (SC-002 aplicável em ambos).

## Assumptions

- O problema reportado (“nenhuma aba tem scroll”) inclui casos em que o scroll está conceptualmente previsto mas não funciona na prática (conteúdo cortado sem barra/gesto útil) — o resultado desejado é scroll fiável em todas as abas.
- A busca existente só em algumas abas/modos é insuficiente; o âmbito é estender filtro a todas as abas com listas e a ambos os modos (jogador e GM).
- Aba Grupo (formulário/resumo sem lista longa): prioridade é scroll (FR-001); o campo de busca fica oculto (clarification 2026-08-04) — não bloqueia o MVP de Locais/NPCs/História.
- Correspondência por substring do nome/título visível, ignorando maiúsculas e acentos; sem pesquisa no servidor nem fuzzy match. Na História, o match inclui locais ligados ao arco (clarification 2026-08-04).
- Fora de escopo: alterar o mapa, a Rede de rotas, o Calcular rota, ou a estrutura de dados dos locais/NPCs/arcos.
