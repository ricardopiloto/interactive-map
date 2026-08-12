# Feature Specification: Focus Edge Opacity

**Feature Branch**: `068-focus-edge-opacity`

**Created**: 2026-08-11

**Status**: Implemented

**Input**: User description: "Vamos mudar um pouco o jeito que as informações são exibidas, se o usuário não selecionar nenhum personagem, nós vamos mostrar as linhas com uma opacidade menor, bem fracas, quando o usuário selecionar um personagem, nós vamos realçar as relações daquele personagem, e ainda exibir as outras com opacidade reduzida. Mantendo ainda assim, a questão do foco no personagem selecionado e reorganização com base no personagem selecionado."

**Depends on**: `066-relationship-network` (tela Relações, anéis, foco); `067-disc-edge-anchor` (linhas centro-a-centro do disco)

## Clarifications

### Session 2026-08-11

- Q: Quão ténues são as linhas sem foco? → A: Fraca mas legível (~18%)
- Q: Quando as linhas do foco passam a ~90%? → A: Rede a 18% durante a animação; linhas do foco sobem a ~90% só no fim

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rede visível sem selecção (Priority: P1)

O utilizador abre **Relações** sem ninguém seleccionado. Continua a ver PJs no anel interno e NPCs no externo, mas **já vê todas as linhas de vínculo permitidas ao seu papel**, com opacidade **muito baixa** (a rede existe, sem competir com os nós). Não precisa de clicar para perceber que há relações.

**Why this priority**: Inverte a regra 066 “sem selecção = zero linhas”; é o novo estado de descanso da tela.

**Independent Test**: Abrir `/relacoes` sem clicar num nó; contar linhas fracas iguais aos vínculos visíveis (públicos para jogador; todos para GM).

**Acceptance Scenarios**:

1. **Given** a tela Relações sem selecção, **When** o utilizador observa o palco, **Then** vê PJs no anel interno, NPCs no externo, e **todas** as linhas permitidas ao papel a **~18%** de opacidade (fracas mas legíveis; claramente mais ténues que uma linha em foco).
2. **Given** um jogador, **When** há vínculos não públicos, **Then** essas linhas **não** aparecem (nem fracas).
3. **Given** zero vínculos visíveis, **When** não há selecção, **Then** o palco não mostra linhas (só nós).

---

### User Story 2 - Foco realça as relações do seleccionado (Priority: P1)

O utilizador selecciona um personagem. O grafo **reorganiza-se como hoje**: seleccionado ao centro, vínculos directos no anel interno, restantes esmaecidos no anel externo. As linhas **desse** personagem passam a **realçadas** (opacidade plena, cor de tipo legível); as **outras** linhas da rede **permanecem visíveis mas fracas**. Desmarcar devolve anéis PJ/NPC e **todas** as linhas outra vez fracas.

**Why this priority**: Pedido explícito de manter o foco/reorganização e de não esconder o resto da rede.

**Independent Test**: Seleccionar um personagem com ≥1 vínculo e outros vínculos no grafo; confirmar realce só nas arestas do foco + resto ténue + layout de foco.

**Acceptance Scenarios**:

1. **Given** um personagem seleccionado, **When** a animação de posição **ainda corre**, **Then** **todas** as linhas visíveis permanecem a **~18%** (nenhum realce a 90% a meio do movimento).
2. **Given** a animação de posição **terminou** (~0,6s), **Then** o nó está no centro, directos no anel interno, demais no externo (~28% nos nós não relacionados), linhas **do seleccionado** a **~90%** e as **restantes** a **~18%**.
3. **Given** linhas do foco realçadas, **When** o utilizador desmarca (fundo, mesmo nó, ou × do painel), **Then** o realce cai de imediato para **~18%** em todas as linhas; o layout anima de volta a PJ interno / NPC externo; a rede **não** desaparece.
4. **Given** “Isolar selecção” activo e um foco, **When** observa o palco, **Then** só vê o seleccionado, os directos e as linhas entre eles (as outras linhas fracas da rede **não** aparecem, coerente com isolar nós).
5. **Given** etiquetas de tipo, **When** há selecção **e** a animação já terminou, **Then** as etiquetas seguem a política actual **só nas arestas do foco**. Sem selecção (e durante a animação), as linhas fracas **não** exigem etiquetas.

---

### User Story 3 - Filtros e papel continuam a mandar (Priority: P2)

Chips de tipo, busca e regras jogador/GM aplicam-se **tanto** às linhas fracas como às realçadas. O utilizador não vê de repente uma rede “secreta” só porque as linhas passaram a existir no estado inicial.

**Why this priority**: Evitar regressão de visibilidade (066) ao mostrar a rede em descanso.

**Independent Test**: Desligar um chip de tipo; as linhas desse tipo desaparecem no estado sem selecção e com selecção.

**Acceptance Scenarios**:

1. **Given** um tipo de vínculo desactivado no chip, **When** não há selecção, **Then** nenhuma linha desse tipo (nem fraca) aparece.
2. **Given** o mesmo filtro e um personagem seleccionado, **When** esse personagem tem um vínculo do tipo desligado, **Then** essa aresta **não** é realçada nem listada como visível no palco.
3. **Given** busca activa, **When** nós não correspondem, **Then** o esmaecimento de nós mantém-se; as linhas não “saltam” para opacidade plena sem selecção.

---

### Edge Cases

- Um único vínculo no grafo: em descanso fica fraco; ao seleccionar um extremo, essa linha passa a plena (não há “outras” para deixar fracas).
- Personagem sem vínculos: selecção centra-o; anel interno vazio; só linhas **alheias** fracas (se existirem) + nós esmaecidos.
- Isolar sem selecção: sem efeito visível nas linhas até haver foco (comportamento actual do isoliar).
- Muitos vínculos: linhas fracas não devem tapar nomes; realce do foco continua a ser o mais legível.
- Clique na linha fraca (GM): continua a poder abrir edição; hit-target não exige a linha estar realçada.
- Zoom/pan e âncora no centro do disco (067) inalterados.
- Durante a animação de posição: **todas** as linhas visíveis a ~18%; etiquetas de foco ainda ocultas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sem selecção, o sistema MUST desenhar **todas** as linhas de vínculo **visíveis ao papel** (e aos filtros de tipo activos) com opacidade **fraca ≈ 18%** (**confirmado** Clarifications 2026-08-11).
- **FR-002**: Sem selecção, o layout MUST permanecer PJs no anel interno e NPCs no externo (inalterado).
- **FR-003**: Ao seleccionar um personagem, o sistema MUST **reorganizar** o grafo como em 066 (foco ao centro, directos no anel interno, restantes no externo esmaecidos) com animação ~0,6s.
- **FR-004**: Com selecção **e** palco já assentado, as linhas que tocam o personagem seleccionado (e passam nos filtros/papel) MUST aparecer a **~90%**; as restantes linhas visíveis MUST permanecer a **~18%**.
- **FR-004a**: Durante a animação de reorganização (~0,6s), **todas** as linhas visíveis MUST permanecer a **~18%**; o realce a ~90% MUST ocorrer **só depois** da animação (**confirmado** Clarifications 2026-08-11). Ao desmarcar, o realce MUST cair de imediato para ~18%.
- **FR-005**: Ao desmarcar, o sistema MUST voltar ao layout inicial e MUST manter as linhas visíveis no estado **fraco** (não voltar a esconder a rede).
- **FR-006**: “Isolar selecção” MUST ocultar nós e linhas que não sejam o foco nem os seus vínculos directos visíveis.
- **FR-007**: Regras de visibilidade jogador/GM e chips de tipo MUST aplicar-se igualmente a linhas fracas e realçadas.
- **FR-008**: Etiquetas de tipo MUST NOT aparecer em massa nas linhas fracas; com selecção, MUST seguir a política de etiquetas **só nas arestas do foco** (default `foco`).
- **FR-009**: O sistema MUST NOT alterar âncora das linhas no centro do disco, tipos de vínculo, CRUD GM, nem persistência de posições.

### Key Entities

- **Linha de vínculo (estado visual)**: a mesma aresta pode estar **fraca** (contexto da rede) ou **realçada** (incide no personagem seleccionado).
- **Vista do grafo**: selecção, filtros e isolamento continuam em memória de sessão; passam a ter linhas no estado sem selecção.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sem selecção, um observador identifica que **existe uma rede** (linhas fracas) em menos de **5 segundos**, sem confundir com o estado “grafo vazio”.
- **SC-002**: Com um personagem seleccionado **e** palco assentado, **100%** das linhas do foco (visíveis ao papel/filtros) estão a **~90%** e as restantes a **~18%** no mesmo ecrã; durante a animação, **0** linhas a ~90%.
- **SC-003**: Em teste com o seed, desmarcar devolve anéis PJ/NPC e a rede **ainda visível** (fraca) — **0** regressões a “zero linhas”.
- **SC-004**: Isolar + foco mostra **apenas** o seleccionado, vizinhos e as suas linhas; **0** linhas alheias fracas nesse modo.
- **SC-005**: Alternar um chip de tipo remove/restaura as linhas correspondentes **tanto** sem selecção como com selecção, no primeiro clique.

## Assumptions

- Substitui a regra 066 “sem selecção / após desmarcar = sem linhas” e “linhas só as do seleccionado”.
- Opacidade **fraca** (**confirmado** Clarifications 2026-08-11): **~18%** (fraca mas legível); opacidade **plena** do foco: **~90%**.
- Nós não relacionados ao foco continuam ~28% de opacidade; isso é independente da opacidade das linhas alheias.
- Linhas a ~18% aparecem de imediato sem selecção. Realce a ~90% **só após** a animação de posição (**confirmado** Clarifications 2026-08-11); durante o movimento (seleccionar ou desmarcar) nada fica a 90%.
- Cores e estilos por tipo (incl. conhecido tracejado) mantêm-se; só muda a opacidade.
- Fora de escopo: novas formas de linha, persistência de layout, mudar regras de `publico`.
