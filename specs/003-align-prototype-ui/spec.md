# Feature Specification: Alinhamento total com o protótipo

**Feature Branch**: `003-align-prototype-ui`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Avalie novamente o design do prototipo, alinhe a nossa versão com exatamente a versão do prototipo (cores, design, formas, zoom, etc), incluindo a área logada do GM para edição, o pin clicavel com um modal para leitura das informações sobre o pin, etc, tudo deve seguir o que foi montado no protótipo."

## Clarifications

### Session 2026-08-01

- Q: Como o GM entra e edita (shell)? → A: Mesma tela do jogador: canto GM → dialog de senha → Modo GM in-page (como o protótipo)
- Q: Como o GM troca a imagem do mapa? → A: Em Modo GM, substituir o mapa no próprio fundo (arrastar/escolher imagem no slot do mapa), como no protótipo
- Q: Imagens de local e NPC no fluxo GM? → A: Slots visuais (arrastar/placeholder) para imagem do local e retrato do NPC, como no protótipo
- Q: O dialog de senha mostra a dica “(demonstração: gm123)”? → A: Mesmo dialog visual, sem qualquer dica/revelação de senha
- Q: Formato do ícone do grupo no mapa? → A: GM escolhe entre bandeira e brasão na UI

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Experiência visual e de mapa idêntica ao protótipo (Priority: P1)

Um jogador abre o Codex e reconhece imediatamente a mesma experiência do protótipo: fundo escuro Nocturne, tipografia e espaçamentos do design system, sidebar com marca “Codex da Campanha”, seletor de abas em segmento, cards de lista, mapa com zoom/pan e botões +/−/1:1, legenda Local vs Grupo, pin em forma de marcador (gota) vermelho e ícone do grupo distinto (formato de bandeira/brasão conforme o protótipo).

**Why this priority**: Sem paridade visual e de interação no mapa, o produto não cumpre o pedido de seguir “exatamente” o protótipo.

**Independent Test**: Abrir a app pública lado a lado com `prototype/Mapa da Campanha.dc.html` (modo jogador) e verificar cores, tipografia, layout, formas dos pins/grupo, controles de zoom e legenda.

**Acceptance Scenarios**:

1. **Given** a visão pública aberta, **When** o usuário compara com o protótipo no mesmo viewport, **Then** fundo, superfícies, texto, accent (blurple), divisórias e tipografia batem com o Nocturne do protótipo (não o tema âmbar/marrom atual).
2. **Given** o mapa visível, **When** o usuário usa zoom (+/−/1:1, rodinha/gesto) e pan, **Then** o comportamento e a disposição dos controles equivalem ao protótipo.
3. **Given** pins e grupo no mapa, **When** o usuário observa as formas, **Then** o pin de local usa a forma de marcador do protótipo e o grupo usa a forma escolhida (bandeira ou brasão); a legenda corresponde.
4. **Given** desktop, **When** a página carrega, **Then** a composição sidebar + mapa + header do mapa espelha o protótipo (marca, abas, listas em cards).

---

### User Story 2 — Pin abre modal de leitura como no protótipo (Priority: P1)

Ao clicar/tocar num pin (ou num local na lista), abre-se um **modal/dialog** (backdrop + painel central), não apenas um card flutuante discreto: imagem do local (ou slot), título, meta de sessão, descrição, chip do arco e chips de NPCs clicáveis, ação Fechar — como no protótipo.

**Why this priority**: O usuário pediu explicitamente o pin clicável com modal de leitura alinhado ao protótipo.

**Independent Test**: Clicar um pin com dados e comparar o dialog com o do protótipo (estrutura e hierarquia visual).

**Acceptance Scenarios**:

1. **Given** um pin no mapa, **When** o usuário clica nele, **Then** abre modal com backdrop; o mapa permanece atrás escurecido/bloqueado para clique no backdrop fechar (como no protótipo).
2. **Given** o modal aberto, **When** o usuário vê o conteúdo, **Then** encontra imagem (slot visual do local), nome, data/rótulo de sessão (se houver), descrição, arco e NPCs no mesmo padrão visual (tags/chips) do protótipo.
3. **Given** chips de arco ou NPC no modal, **When** o usuário clica, **Then** o modal fecha e a navegação leva à aba/seção correspondente (História ou NPCs), como no protótipo.
4. **Given** o modal aberto, **When** o usuário clica Fechar ou no backdrop, **Then** o modal fecha.

---

### User Story 3 — Menu jogador (Locais / NPCs / História) como no protótipo (Priority: P2)

As três abas usam o controle segmentado do protótipo; listas usam cards (kicker de arco, título); busca de locais; NPCs com retrato circular, tag de status e expansão; História com arcos expansíveis e eventos com data — layout e componentes visuais fiéis.

**Why this priority**: Completa a paridade da jornada de consulta entre sessões.

**Independent Test**: Percorrer as três abas no protótipo e na app e confirmar mesma estrutura de componentes e hierarquia.

**Acceptance Scenarios**:

1. **Given** a aba Locais, **When** o usuário busca e seleciona um item, **Then** o card e a busca se comportam/aparentam como no protótipo e o mapa centra no pin abrindo o modal.
2. **Given** a aba NPCs, **When** o usuário expande um NPC, **Then** vê retrato em slot visual (circular/expansão conforme o protótipo), status em tag, descrição, facção e chips de locais no padrão do protótipo.
3. **Given** a aba História, **When** o usuário expande um arco, **Then** vê resumo e lista de eventos com rótulo de sessão, clicáveis para o pin/modal.

---

### User Story 4 — Mobile como no protótipo (Priority: P2)

Em tela estreita: mapa em tela cheia, barra inferior de abas, painel lateral em overlay com botão “‹ Mapa”, sem quebrar a paridade visual.

**Why this priority**: O protótipo trata mobile de forma explícita; a app deve seguir.

**Independent Test**: Viewport ~375–800px na app vs protótipo.

**Acceptance Scenarios**:

1. **Given** viewport mobile, **When** o usuário toca uma aba na barra inferior, **Then** o painel overlay abre com o mesmo conteúdo/estilo do protótipo.
2. **Given** o painel aberto, **When** o usuário toca “‹ Mapa”, **Then** volta ao mapa.

---

### User Story 5 — Área logada do GM alinhada ao protótipo (Priority: P1)

O GM entra **na mesma tela** do jogador (não em uma área/rota de edição separada): canto “Acesso restrito (GM)” abre o dialog “Acesso do Mestre”; com senha correta, a mesma composição passa a Modo GM (badge, abas incluindo Grupo, listas admin). Sair do Modo GM volta à visão de jogador. Fluxos de CRUD, banners de posicionamento e dialogs de formulário seguem o protótipo.

**Why this priority**: Pedido explícito de incluir a área logada do GM “exatamente” como no protótipo.

**Independent Test**: Na mesma URL/tela do jogador, usar o canto GM, autenticar e comparar CRUD/grupo com o protótipo.

**Acceptance Scenarios**:

1. **Given** a visão de jogador, **When** o usuário aciona o canto “Acesso restrito (GM)”, **Then** abre o dialog de senha do protótipo (sem navegar para outra “página admin” distinta) e **sem** texto que revele ou sugira o valor da senha.
2. **Given** senha correta, **When** o GM entra, **Then** a mesma tela mostra badge “Modo GM”, abas de edição (incl. Grupo) e listas/cards como no protótipo.
3. **Given** “+ Novo local”, **When** o GM posiciona no mapa, **Then** vê o banner de posicionamento e o dialog de formulário como no protótipo.
4. **Given** edição de local/NPC/arco, **When** o GM salva ou cancela, **Then** os dialogs e confirmações de exclusão seguem o padrão do protótipo; formulários de local e NPC usam slots visuais de imagem/retrato (não apenas campo de arquivo “seco”).
5. **Given** a aba Grupo, **When** o GM move o ícone ou escolhe o formato (bandeira ou brasão), **Then** o fluxo, o feedback visual e a forma no mapa batem com as opções do protótipo; a escolha persiste para jogadores.
6. **Given** visitante sem senha (ou senha errada), **When** tenta o Modo GM, **Then** permanece sem acesso às listas/ações de edição; Cancelar no gate volta ao modo jogador.
7. **Given** Modo GM ativo, **When** o GM escolhe sair (canto “Modo GM · Sair”), **Then** a tela volta à visão de jogador sem painel de edição.
8. **Given** Modo GM ativo e sem (ou com) mapa, **When** o GM arrasta/escolhe uma imagem no fundo do mapa, **Then** a imagem de campanha é substituída pelo slot no próprio mapa (como no protótipo); no modo jogador o fundo não oferece esse slot de edição.

---

### Edge Cases

- Sem imagem de mapa: empty/placeholder do slot do mapa (orientação do protótipo) — sem mensagem sobre mapa já carregado (regra da feature 002 preservada); em Modo GM o slot permanece utilizável para enviar a imagem.
- Modal aberto + troca de viewport (resize): modal permanece utilizável; layout mobile/desktop recompõe como no protótipo.
- Muitos itens nas listas: scroll na sidebar como no protótipo, sem quebrar o mapa.
- Paridade “exata”: pequenas diferenças de motor de browser são aceitáveis; diferenças de cor, forma de pin, tipo de modal (dialog vs card solto) ou ausência de componentes do DS (seg, card, tag, btn, dialog) **não** são aceitáveis.
- Formato do grupo não definido ainda: assume-se **bandeira** até o GM escolher brasão (default do protótipo).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A interface MUST usar a identidade visual do design system Nocturne do protótipo (cores de fundo/superfície/texto/accent, tipografia, espaçamento, raios, sombras) em todas as telas do Codex.
- **FR-002**: O layout principal MUST espelhar o protótipo: coluna de navegação + área do mapa; em mobile, mapa + barra inferior + overlay.
- **FR-003**: Controles de zoom e pan MUST equivaler aos do protótipo em disposição e comportamento (+/−/reset e gesto).
- **FR-004**: Pins de local MUST usar a forma de marcador do protótipo; o ícone do grupo MUST ser **bandeira** ou **brasão** (formas do protótipo), com a legenda correspondente; o GM MUST poder escolher o formato na aba Grupo.
- **FR-005**: Seleção de um local (mapa ou lista) MUST abrir um **modal/dialog** de leitura no padrão do protótipo (backdrop, mídia, título, meta, corpo, chips de arco/NPCs, Fechar).
- **FR-006**: Abas Locais, NPCs e História MUST usar o padrão de navegação segmentada e cards/listas do protótipo, incluindo busca, expansão de NPC e expansão de arco com eventos.
- **FR-007**: O Modo GM MUST ocorrer na mesma tela/composição do jogador (in-page): canto de acesso → dialog de senha → badge Modo GM, CRUD por cards, banners de posicionamento, dialogs de formulário e aba Grupo — sem shell de edição separado como jornada principal.
- **FR-008**: Componentes de interface (botões, tags de status, campos, dialogs, cards) MUST seguir as classes/padrões visuais do protótipo Nocturne, não um tema alternativo.
- **FR-009**: A paridade MUST incluir estados de feedback do protótipo relevantes ao mapa (banner de posicionamento, seleção visual do pin).
- **FR-010**: Acesso ao Modo GM MUST continuar exigindo senha (dialog “Acesso do Mestre”); a fidelidade visual do protótipo NÃO autoriza deixar a edição pública; o dialog MUST NOT exibir dica, valor de demonstração ou qualquer revelação da senha.
- **FR-011**: Sair do Modo GM MUST devolver a mesma tela à visão de jogador (canto e abas sem ações de edição).
- **FR-012**: Em Modo GM, a substituição da imagem do mapa MUST ocorrer no próprio fundo do mapa (slot arrastar/escolher), no padrão do protótipo; visitantes em modo jogador MUST NOT editar o fundo pelo slot.
- **FR-013**: Imagem do local e retrato do NPC MUST usar slots visuais (placeholder/arrastar) no padrão do protótipo — no modal de leitura, nas listas/expansão de NPC e nos formulários GM correspondentes.

### Key Entities

- **Protótipo Codex** (`prototype/Mapa da Campanha.dc.html` + `prototype/nocturne.css`): fonte de verdade de UX/UI para esta feature.
- **Posição / aparência do grupo**: posição no mapa e formato do ícone (`bandeira` | `brasão`), editáveis pelo GM; default `bandeira`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em revisão lado a lado (app vs protótipo) no mesmo tamanho de tela desktop, um avaliador marca como “alinhado” cores, tipografia, formas de pin/grupo, tipo de modal do pin e layout geral — sem elementos do tema âmbar/marrom remanescentes na UI principal.
- **SC-002**: 100% dos fluxos de leitura do pin (abrir modal, fechar, navegar por chip) funcionam e visualmente correspondem ao protótipo.
- **SC-003**: Em viewport mobile típica, barra inferior + overlay + retorno ao mapa estão presentes e reconhecíveis frente ao protótipo.
- **SC-004**: Fluxos GM (gate no canto → senha → Modo GM in-page → criar/editar local com clique no mapa, NPC, arco, mover grupo, sair) são reconhecíveis como os do protótipo por um avaliador familiarizado com o arquivo de protótipo.
- **SC-005**: Tentativa de uso do Modo GM sem senha continua bloqueada em 100% dos testes; a UI do gate não revela a senha.
- **SC-006**: Em Modo GM, um avaliador consegue substituir a imagem do mapa pelo slot no fundo do mapa (sem depender de um controle exclusivo em painel separado como jornada principal).
- **SC-007**: Em revisão lado a lado, slots de imagem do local (modal) e retrato de NPC (lista/form) são reconhecíveis como os do protótipo (não como upload de arquivo genérico isolado).
- **SC-008**: Em Modo GM, trocar o formato do grupo entre bandeira e brasão atualiza o ícone no mapa; após sair do Modo GM, jogadores veem o formato escolhido.

## Assumptions

- A fonte de verdade visual/comportamental de UI é o protótipo em `prototype/` (HTML + Nocturne), não a aparência atual da SPA.
- “Exatamente” significa fidelidade de design e interação (cores, formas, componentes, zoom, modal, área GM), não necessariamente o mesmo runtime/framework do arquivo `.dc.html`.
- Regras de produto já decididas (senha obrigatória no GM, `data_sessao` texto livre, sem sync ao vivo, placeholder do mapa só se ausente) permanecem; esta feature não as reabre, só alinha a UI.
- O gate de senha espelha o dialog do protótipo **exceto** a linha de demonstração da senha, que permanece fora da UI de produto.
- Formato do ícone do grupo: default **bandeira**; o GM escolhe bandeira ou brasão na UI (aba Grupo).
- Conteúdo/dados de exemplo do protótipo não precisam ser copiados para produção; a paridade é de interface e fluxos.
- A jornada principal do GM é in-page (como o protótipo); URLs alternativas de admin, se existirem, não substituem esse fluxo como experiência alvo.
- Fora de escopo: redesenhar o Nocturne em si; novas features além do que o protótipo já demonstra (exceto a escolha persistente bandeira/brasão pelo GM, alinhada às opções do protótipo); múltiplos mapas.
