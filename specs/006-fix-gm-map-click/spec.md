# Feature Specification: Evitar diálogo de mapa ao clicar em modo GM

**Feature Branch**: `006-fix-gm-map-click`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Temos um bug na aplicação, se eu estiver em modo GM, mesmo que eu já tenha um mapa carregado, toda vez que clico na tela ele me mostra a janela para eu carregar um novo arquivo de mapa."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Usar o mapa em modo GM sem diálogo de arquivo (Priority: P1)

Um mestre de jogo (GM) entra no modo GM com o mapa da campanha já carregado. Ao clicar no mapa para interagir (pan implícito via controles, posicionar pin, reposicionar local/grupo, ou simplesmente clicar na área do mapa), **não** deve aparecer a janela do sistema para escolher um novo arquivo de imagem. O mapa permanece e as ações de GM previstas continuam disponíveis.

**Why this priority**: Bloqueia o fluxo principal do modo GM — qualquer clique dispara um seletor de arquivo indesejado, tornando o mapa inutilizável para administração.

**Independent Test**: Com mapa já carregado e sessão em modo GM, clicar várias vezes na área do mapa (sem estar em um fluxo explícito de “trocar mapa”) e verificar que o seletor de arquivo **nunca** abre; ações de posicionamento existentes (quando ativas) ainda funcionam.

**Acceptance Scenarios**:

1. **Given** modo GM ativo e um mapa já carregado/visível, **When** o GM clica na área do mapa (sem ter iniciado um fluxo explícito de substituição de mapa), **Then** a janela de seleção de arquivo **não** aparece.
2. **Given** modo GM ativo, mapa carregado e modo de posicionamento ativo (ex.: adicionar pin, reposicionar local ou mover grupo), **When** o GM clica no mapa para definir a posição, **Then** a posição é registrada conforme o fluxo atual e a janela de seleção de arquivo **não** aparece.
3. **Given** modo GM ativo e mapa carregado, **When** o GM clica em controles da interface que não sejam “substituir mapa” (menu, botões, pins), **Then** o comportamento atual desses controles permanece e o seletor de arquivo de mapa **não** abre por causa desse clique.

---

### User Story 2 — Substituir o mapa de forma intencional (Priority: P2)

O GM ainda precisa poder trocar a imagem do mapa da campanha quando quiser, mas essa ação deve ser **explícita e deliberada** — não um efeito colateral de qualquer clique na tela do mapa.

**Why this priority**: Corrige o bug sem remover a capacidade legítima de atualizar o mapa; evita regressão de “não consigo mais trocar o mapa”.

**Independent Test**: Em modo GM com mapa carregado, usar o controle/ação dedicada de substituição de mapa e confirmar que o seletor de arquivo abre só nesse caso; após escolher um arquivo válido, o novo mapa passa a ser exibido.

**Acceptance Scenarios**:

1. **Given** modo GM ativo e mapa carregado, **When** o GM aciona a ação explícita de substituir/carregar mapa, **Then** a janela de seleção de arquivo aparece e, após escolha de imagem válida, o mapa exibido é atualizado.
2. **Given** modo GM ativo e **nenhum** mapa carregado (área vazia / placeholder), **When** o GM inicia o carregamento do mapa pela ação apropriada para esse estado, **Then** a janela de seleção de arquivo pode aparecer e o mapa passa a ser exibido após upload bem-sucedido.

---

### Edge Cases

- Cancelar o seletor de arquivo (quando aberto de forma intencional): o mapa atual permanece inalterado; nenhum erro bloqueante.
- Upload inválido ou falha ao substituir: o mapa anterior permanece visível; o usuário recebe feedback de falha (comportamento já esperado pelo produto).
- Modo jogador (não GM): cliques no mapa **nunca** abrem seletor de arquivo de mapa (sem regressão).
- Clique em pin / UI sobreposta: não deve disparar substituição de mapa.
- Zoom/pan e demais interações do mapa em modo GM: permanecem utilizáveis sem abrir seletor de arquivo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Em modo GM, com mapa já carregado, um clique (ou toque equivalente) na área do mapa MUST NOT abrir a janela de seleção de arquivo para carregar/substituir o mapa, salvo quando o usuário tiver iniciado explicitamente a ação de substituir mapa.
- **FR-002**: Em modo GM, fluxos de posicionamento no mapa (adicionar pin, reposicionar local, mover grupo) MUST continuar funcionando sem acionar o seletor de arquivo de mapa.
- **FR-003**: O sistema MUST oferecer uma forma explícita e descoberta pelo GM de substituir a imagem do mapa quando um mapa já estiver carregado (ação deliberada, distinta do clique genérico no mapa).
- **FR-004**: Quando não houver mapa carregado, o GM MUST ainda poder carregar a primeira imagem do mapa pela experiência adequada a esse estado vazio.
- **FR-005**: Em modo jogador, a área do mapa MUST NOT expor ou acionar seleção de arquivo de mapa.
- **FR-006**: Cancelar ou abandonar a seleção de arquivo (quando aberta intencionalmente) MUST deixar o mapa atual inalterado.

### Key Entities

- **Mapa da campanha**: imagem de fundo já carregada e exibida na tela principal.
- **Modo GM**: sessão autenticada do mestre com permissão de editar conteúdo (incluindo mapa).
- **Substituição de mapa**: ação intencional do GM para trocar a imagem de fundo; distinta de cliques operacionais no mapa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste com mapa já carregado em modo GM, 100% dos cliques genéricos na área do mapa (fora de uma ação explícita de substituir mapa) **não** abrem o seletor de arquivo.
- **SC-002**: Em 100% dos testes dos fluxos de posicionamento (add pin / reposicionar / mover grupo) com mapa carregado, o seletor de arquivo de mapa **não** aparece e a posição é aplicada com sucesso.
- **SC-003**: Um avaliador consegue substituir o mapa em modo GM em ≤30 segundos usando apenas a ação explícita de substituição, sem depender de clicar “em qualquer lugar” no mapa.
- **SC-004**: Em modo jogador, 0 aberturas do seletor de arquivo de mapa em uma sessão de clique/navegação típica no mapa.

## Assumptions

- O comportamento atual (qualquer clique no mapa em modo GM abre o seletor) é um **bug**, não um atalho desejado.
- A capacidade de o GM trocar o mapa permanece no escopo; apenas o gatilho muda para uma ação explícita (ex.: botão ou controle dedicado na UI de GM / estado vazio).
- Detalhe visual exato do controle de “substituir mapa” pode seguir o padrão visual já usado no produto (botões/controles de GM), desde que seja distinto do clique genérico no mapa.
- Upload, validação de tipo de imagem e persistência do mapa reutilizam as capacidades já existentes do produto.
- Fora de escopo: redesign amplo do modo GM, alteração de autenticação, ou novos formatos de arquivo além dos já suportados.
