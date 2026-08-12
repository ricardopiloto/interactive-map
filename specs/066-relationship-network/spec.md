# Feature Specification: Relationship Network

**Feature Branch**: `066-relationship-network`

**Created**: 2026-08-11

**Status**: Implemented

**Input**: User description: "Leia o documento docs/relationship-map.md e vamos criar a spec para a nova funcionalidade para a aplicação" — fonte: [docs/relationship-map.md](../../docs/relationship-map.md)

**Depends on**: Codex existente (Mapa, Modo GM, NPCs com retrato/status/facção); design system Nocturne

## Clarifications

### Session 2026-08-11

- Q: Personagem unifica NPC do mapa, ou entidades separadas? → A: Unificar — uma entidade Personagem (pj|npc); migrar NPCs existentes do mapa
- Q: Posições arrastadas dos nós persistem onde? → A: Só sessão do browser; reload restaura anéis calculados
- Q: O que um jogador (fora de Modo GM) vê em Relações? → A: Vê personagens; vínculos só se o GM os marcar como públicos
- Q: Qual o default da flag “público” em novos vínculos? → A: Não público por defeito (GM marca para revelar a jogadores)
- Q: Ao remover um personagem em Modo GM, o que acontece? → A: Apagar personagem + todos os seus vínculos; some também do mapa (entidade única)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorar quem conhece quem (Priority: P1)

Um jogador (ou GM fora de edição) abre a tela **Relações**, vê PJs no centro e NPCs à volta **sem linhas**, selecciona um personagem e o grafo reorganiza-se: o foco no centro, vínculos directos **visíveis para o seu papel** no anel interno, restantes esmaecidos no exterior; só depois surgem as linhas coloridas. **Jogadores** só vêem vínculos marcados como públicos; **Modo GM** vê todos. Desmarcar devolve a vista limpa inicial.

**Why this priority**: É o núcleo da funcionalidade — responder “quem este personagem conhece, e como”.

**Independent Test**: Abrir Relações → estado inicial sem linhas → seleccionar um PJ/NPC → animação + linhas só do foco → desmarcar → volta ao anel PJ/NPC sem linhas.

**Acceptance Scenarios**:

1. **Given** a tela Relações aberta sem selecção, **When** o utilizador observa o palco, **Then** vê PJs num anel interno e NPCs num anel externo, **sem** linhas de vínculo.
2. **Given** um personagem seleccionado e vínculos públicos (jogador) ou todos (GM), **When** a animação de posição termina (~0,6s), **Then** o seleccionado está no centro, vínculos directos **permitidos ao papel** no anel interno, os demais no anel externo esmaecidos (~28% opacidade), e **só então** aparecem as linhas do seleccionado (fade-in).
3. **Given** um jogador e um vínculo **não** público entre A e B, **When** selecciona A, **Then** esse vínculo **não** aparece como linha nem na lista do painel.
4. **Given** um personagem seleccionado com linhas visíveis, **When** o utilizador clica no fundo do palco, no mesmo nó, ou no × do painel, **Then** tudo anima de volta à organização inicial sem linhas.
5. **Given** linhas visíveis, **When** o utilizador lê o meio de uma linha, **Then** vê o tipo de vínculo (conforme política de etiquetas: no foco, sempre, ou ao pairar — ver Assunções).

---

### User Story 2 - Filtrar, isolar e inspecionar detalhe (Priority: P1)

O utilizador usa a coluna esquerda (busca, chips de tipo de vínculo, “Isolar selecção”, legenda) e o painel de detalhe (retrato, status, facção, descrição, lista de vínculos clicáveis) para explorar sem perder o contexto do grafo.

**Why this priority**: Torna o grafo utilizável com muitos personagens e fecha o ciclo “ver → detalhar → saltar para outro”.

**Independent Test**: Buscar um nome; filtrar por tipo de vínculo; isolar selecção; abrir detalhe e clicar noutro nome na lista de vínculos.

**Acceptance Scenarios**:

1. **Given** vários personagens, **When** o utilizador escreve na busca, **Then** encontra o personagem pelo nome de forma utilizável.
2. **Given** chips de tipo de vínculo, **When** activa/desactiva um tipo, **Then** só os vínculos daqueles tipos permanecem relevantes na vista (filtros alternáveis; cores = tipos da secção de vínculos).
3. **Given** um personagem focado e “Isolar selecção” activo, **When** observa o palco, **Then** vê só esse personagem e os vínculos directos (resto oculto).
4. **Given** um personagem seleccionado, **When** abre o painel de detalhe, **Then** vê tipo PJ/NPC, papel, nome, retrato, status, facção, descrição e lista “Vínculos (n)” **apenas com vínculos visíveis ao papel** (jogador: só públicos; GM: todos), com cor, nome clicável, tipo e nota.
5. **Given** a lista de vínculos, **When** clica no nome de outro personagem, **Then** o foco do grafo passa para esse personagem (mesmo comportamento de selecção).

---

### User Story 3 - Navegar Codex Mapa ↔ Relações (Priority: P1)

O utilizador alterna entre **Mapa** e **Relações** na barra superior partilhada, com a mesma identidade “Codex da Campanha” e o mesmo acesso a Modo GM.

**Why this priority**: A Rede de Relações é segunda aba do produto, não um ecrã isolado.

**Independent Test**: Da home do mapa ir a Relações e voltar; marcar Relações como activo na nav.

**Acceptance Scenarios**:

1. **Given** o utilizador no Mapa, **When** escolhe “Relações” na nav superior, **Then** entra na tela de Rede de Relações (sem mapa de fundo).
2. **Given** a tela Relações, **When** escolhe “Mapa”, **Then** regressa ao mapa da campanha.
3. **Given** Relações activo, **When** olha a nav, **Then** “Relações” está visualmente activo (ex. contorno accent) e “Mapa” é navegável.

---

### User Story 4 - GM cria e edita personagens e vínculos (Priority: P2)

Em Modo GM, o mestre adiciona personagens e conexões, edita/remove vínculos a partir do painel ou clicando numa linha, e o retrato do personagem continua alinhado ao uso no mapa (mesmo recurso visual de ficha).

**Why this priority**: Sem conteúdo editável a rede não cresce com a campanha; depende do Modo GM já existente.

**Independent Test**: Activar GM → + Personagem / + Conexão → editar vínculo na lista e na linha → remover vínculo.

**Acceptance Scenarios**:

1. **Given** Modo GM, **When** usa “+ Personagem”, **Then** cria um personagem (nome, PJ ou NPC, papel, facção, descrição) e ele aparece no grafo.
2. **Given** Modo GM, **When** usa “+ Conexão” (ou edita um vínculo existente), **Then** define os dois personagens, tipo, nota e se o vínculo é **público** (visível a jogadores) ou não; **novos** vínculos começam **não públicos** até o GM marcar; o vínculo passa a contar na exploração conforme o papel.
3. **Given** Modo GM e um personagem seleccionado, **When** usa Editar/Remover num item da lista de vínculos, **Then** actualiza (incl. flag público) ou remove essa ligação.
4. **Given** Modo GM e linhas visíveis, **When** clica directamente numa linha, **Then** abre a edição desse vínculo.
5. **Given** um NPC que também existe no mapa, **When** actualiza o retrato em Relações (ou no mapa), **Then** o mesmo retrato reflecte-se em ambos os contextos (recurso partilhado).
6. **Given** Modo GM, **When** remove um personagem, **Then** o registo é apagado, **todos** os seus vínculos são removidos em cascata, e deixa de aparecer no mapa e em Relações.

---

### Edge Cases

- Zero personagens: estado vazio claro; GM pode criar o primeiro.
- Remover personagem (GM): cascade de vínculos + remoção da entidade partilhada (mapa e Relações).
- Personagem sem vínculos: selecção centra-o; anel interno vazio; sem linhas; painel com “Vínculos (0)”.
- Personagem morto: aparência dessaturada e nome riscado; continua seleccionável.
- Painel de detalhe aberto: o palco recalcula anéis para a largura útil (painel sobrepõe à direita, não empurra a coluna esquerda).
- Mobile: coluna esquerda permanece coluna (não flutuante); painel de detalhe vira folha inferior.
- Zoom/pan: roda = zoom; arrastar fundo = pan; arrastar nó = reposiciona **só na sessão do browser** (não persiste no servidor; reload restaura anéis calculados — Clarifications).
- Filtros de tipo + isolar: combinações não deixam o palco ilegível; legenda na coluna permanece coerente.
- Vínculo é simétrico (A↔B); relações unilaterais ficam fora de escopo nesta versão.
- Vínculo **não público**: invisível a jogadores (sem linha, sem lista); visível e editável em Modo GM.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST expor uma tela dedicada “Relações” / Rede de Relações, navegável a partir do Codex ao lado de “Mapa”, sem mapa de campanha de fundo.
- **FR-002**: A barra superior partilhada MUST incluir marca Codex, nav Mapa | Relações, e em Modo GM os controlos “+ Personagem”, “+ Conexão” e acesso ao Modo GM.
- **FR-003**: O layout MUST incluir coluna esquerda fixa (busca, chips de tipo, isolar, legenda), palco do grafo com zoom (+ / − / 1:1), e painel de detalhe sobreposto à direita (folha inferior no mobile).
- **FR-004**: Sem selecção, o grafo MUST colocar PJs no anel interno e NPCs no externo, **sem** linhas visíveis.
- **FR-005**: Ao seleccionar um personagem, o sistema MUST animar (~0,6s, easing suave) o foco ao centro, directos **visíveis ao papel** no anel interno, restantes no anel externo esmaecidos; MUST mostrar linhas **apenas** após a animação de posição, só as do seleccionado **e permitidas ao papel**.
- **FR-005a**: Fora de Modo GM, o sistema MUST expor apenas vínculos com flag **público**; em Modo GM MUST expor todos os vínculos. Personagens (nós) permanecem visíveis a jogadores.
- **FR-006**: Desmarcar (fundo, mesmo nó, ou fechar painel) MUST animar de volta ao estado inicial sem linhas.
- **FR-007**: Nós MUST distinguir PJ vs NPC, morto, seleccionado e “não relacionado ao foco”; linhas MUST ser rectas centro-a-centro, atrás dos discos, com cor/estilo por tipo (aliado, amizade, inimizade, romance, família, conhecido — conhecido tracejado).
- **FR-008**: O layout dos anéis MUST basear-se na caixa real do nó de forma a evitar sobreposições de nome/papel/etiquetas em qualquer largura útil (com painel aberto ou fechado).
- **FR-009**: O utilizador MUST poder filtrar por tipo de vínculo (chips), isolar a selecção, e pesquisar por nome.
- **FR-010**: O painel de detalhe MUST mostrar identidade, retrato, status, facção, descrição e lista de vínculos directos **visíveis ao papel**, com navegação por clique no outro personagem.
- **FR-011**: Em Modo GM, o sistema MUST permitir criar personagens, criar/editar/remover vínculos (diálogos + atalho na linha), incluindo definir se cada vínculo é **público**; novos vínculos MUST nascer com **público = false** (GM marca para revelar); com notas curtas de mesa.
- **FR-011a**: Em Modo GM, remover um personagem MUST apagar o registo unificado (some do mapa e de Relações) e MUST remover em cascata **todos** os vínculos desse personagem.
- **FR-012**: Retrato, status e facção de personagens do tipo NPC MUST permanecer coerentes com a ficha correspondente no mapa — **fonte única de verdade**: a entidade Personagem unifica o antigo NPC (migração obrigatória; ver Clarifications).
- **FR-013**: Conteúdo inicial de demonstração (seed) MUST incluir ~4 PJs, ~7 NPCs e ~15 vínculos com notas, alinhados ao exemplo Ubersreik/Reikwald do documento de origem.
- **FR-014**: Textos da interface MUST estar em português; MUST NOT usar emoji como elementos de UI.

### Key Entities

- **Personagem**: Identidade na rede **e** no mapa (substitui o modelo NPC antigo) — nome, tipo (PJ|NPC), papel, facção opcional, status (vivo|morto|desaparecido), descrição, retrato; associações a locais do mapa permanecem no mesmo registo após migração.
- **Vínculo**: Relação simétrica entre dois personagens — tipo (aliado|amizade|inimizade|romance|família|conhecido), nota curta, flag **público** (visível a jogadores quando true; **default false** ao criar).
- **Vista do grafo**: Estado de selecção, filtros, isolamento, zoom/pan e posições de nós **apenas em memória de sessão** (não entidade persistida).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste com o seed (e vínculos públicos quando como jogador), um utilizador identifica vínculos directos de um personagem seleccionado em menos de **15 segundos** (linhas + lista do painel).
- **SC-001a**: Em Modo jogador, **0** vínculos não públicos aparecem em linhas ou na lista do painel; em Modo GM os mesmos vínculos não públicos **são** visíveis.
- **SC-002**: Em **100%** dos testes de selecção, as linhas só aparecem **depois** da animação de reposicionamento (não durante).
- **SC-003**: Com painel aberto e fechado, em desktop típico, **0** sobreposições óbvias nome/papel/etiqueta em amostragem de ≥5 focos diferentes.
- **SC-004**: Alternar Mapa ↔ Relações completa-se em menos de **3 segundos** de percepção de navegação (sem reaprender a barra superior).
- **SC-005**: Em Modo GM, criar um vínculo e vê-lo no grafo após seleccionar um extremo funciona no primeiro fluxo guiado (≤ **2 minutos**).
- **SC-006**: Alterar retrato de um NPC reflecte-se no mapa e em Relações sem passo manual de sincronização.

## Assumptions

- Fonte: [docs/relationship-map.md](../../docs/relationship-map.md); decisões abertas do doc adoptadas assim:
  - **Personagem unifica NPC** (**confirmado** Clarifications 2026-08-11): uma entidade com `tipo` pj|npc; NPCs existentes migram; evita duplicar retrato/status/facção; mapa e Relações leem/escrevem a mesma ficha; **apagar** remove de ambos e faz cascade dos vínculos.
  - **Posições arrastadas** (**confirmado** Clarifications 2026-08-11): só na sessão do browser; reload restaura layout em anéis calculado; **não** há persistência no servidor nesta versão.
  - **Vínculos simétricos** apenas nesta versão.
  - **Visibilidade a jogadores** (**confirmado** Clarifications 2026-08-11): jogadores vêem todos os personagens; só vínculos com flag **público**; Modo GM vê e edita todos os vínculos; **novos vínculos default público = false**.
- Etiquetas nas linhas: default `foco` (mostrar no personagem seleccionado); configuração `sempre` / `hover` pode existir como ajuste fino.
- Folga entre nós configurável num intervalo amplo (ex. 180–380) para o layout não colidir.
- Visual alinhado ao Nocturne já usado no Codex (fundo escuro, accent); tipografia e raios seguem o design system da app (não inventar marca paralela).
- Modo GM de Relações reutiliza o mesmo conceito de autenticação/acesso GM do mapa.
- Fora de escopo: mapa geográfico nesta tela; vínculos unilaterais; persistência de posições custom no servidor (salvo feature futura).
