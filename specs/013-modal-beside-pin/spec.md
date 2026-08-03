# Feature Specification: Modal ao lado do pin

**Feature Branch**: `013-modal-beside-pin`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Quando o usuário clicar no local no menu lateral e nós centralizarmos no pin que ele selecionou, posicione o modal com as informações do pin ligeramente ao lado, de maneira que o pin ainda fique visivel para o usuário"

## Clarifications

### Session 2026-08-03

- Q: Lado preferido do painel de detalhe relativo ao pin? → A: Preferir o lado oposto ao menu lateral; flip se necessário.
- Q: Interação com o mapa enquanto o detalhe está aberto? → A: Mapa bloqueado sob o backdrop (pan/zoom só após fechar).
- Q: Escurecimento do fundo (backdrop) enquanto o detalhe está aberto? → A: Manter backdrop escurecido como hoje (pin fora do painel, ainda sob o dim).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver o pin enquanto lê o detalhe (Priority: P1)

Como jogador, ao clicar um local no menu lateral (o mapa centraliza o pin e o detalhe abre), quero que o painel de informações fique **ao lado** do pin — não por cima — para eu continuar vendo o marcador no mapa enquanto leio nome, descrição e vínculos.

**Why this priority**: É o pedido central; resolve o conflito visual entre o pin centrado e o modal centrado.

**Independent Test**: Com o mapa carregado, clicar um local na aba Locais; após o foco, o pin permanece visível na área do mapa e o painel de detalhe aparece deslocado lateralmente em relação a ele (não o cobre por completo).

**Acceptance Scenarios**:

1. **Given** o usuário está em modo jogador com mapa carregado e menu lateral à esquerda, **When** clica um local no menu lateral, **Then** o mapa centraliza o pin (comportamento existente) **e** o painel de detalhe abre preferencialmente no lado oposto ao menu (à direita do pin), de forma que o marcador permanece visível e não fica oculto sob o painel.
2. **Given** o painel de detalhe está aberto ao lado do pin, **When** o usuário observa a área do mapa, **Then** consegue identificar o pin selecionado sem fechar o painel.
3. **Given** o usuário clica outro local Y no menu, **When** o foco e o detalhe atualizam para Y, **Then** o painel permanece ao lado do novo pin (Y também permanece visível).

---

### User Story 2 - Fechar e interagir sem regressão (Priority: P2)

Como jogador, quero fechar o detalhe e usar o mapa como antes, e quero que o deslocamento do painel não quebre o fluxo ao abrir pelo pin no mapa ou em telas estreitas.

**Why this priority**: Evita regressão e cobre o mesmo detalhe quando aberto por outros caminhos.

**Independent Test**: Abrir detalhe pelo menu e pelo pin no mapa; fechar pelo controle existente; em viewport estreita, o detalhe permanece utilizável sem cobrir o pin de forma bloqueante quando houver espaço, ou com fallback legível.

**Acceptance Scenarios**:

1. **Given** o detalhe está aberto ao lado do pin, **When** o usuário tenta pan/zoom no mapa, **Then** a interação no mapa não ocorre (mapa bloqueado); **When** fecha o detalhe (gesto/controle já existente), **Then** o painel some e o mapa volta a aceitar pan/zoom.
2. **Given** o usuário abre o detalhe clicando o pin no mapa (modo jogador), **When** o painel abre, **Then** o pin também permanece visível (mesmo princípio de não cobrir o marcador), para não haver dois comportamentos conflitantes.
3. **Given** a viewport é estreita (ex.: mobile), **When** o detalhe abre após selecionar um local, **Then** o conteúdo do detalhe continua legível e fechável; se não houver espaço útil “ao lado”, o sistema usa um posicionamento de fallback que prioriza legibilidade sem travar a interface.

---

### Edge Cases

- Pin perto da borda do mapa/viewport: o painel MUST caber na área útil (flip para o outro lado ou ajuste de margem) sem cortar conteúdo essencial fora da tela.
- Menu lateral aberto (desktop): o painel MUST NOT ficar inacessível atrás do menu; o deslocamento considera a área útil do mapa.
- Conteúdo longo no detalhe: o painel pode rolar internamente; o pin continua visível fora do painel.
- Backdrop/escurecimento: o sistema MUST manter o backdrop escurecido existente; o pin MUST permanecer reconhecível por não ficar sob o retângulo do painel (ainda pode estar sob o dim). Enquanto aberto, o backdrop bloqueia pan/zoom no mapa.
- Modo GM: esta feature NÃO altera o fluxo GM (que não usa o mesmo painel de detalhe do jogador).
- Mapa sem imagem / sem pin válido: abrir detalhe não deve gerar erro bloqueante; se não houver âncora visual, fallback para posicionamento seguro (ex.: centrado ou padrão atual).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Após o jogador clicar um local no menu lateral (com centralização do pin no mapa), o sistema MUST abrir o painel de informações do local **deslocado lateralmente** em relação ao pin, de modo que o marcador do pin permaneça **visível** na área do mapa.
- **FR-002**: O painel MUST NOT cobrir completamente o pin selecionado enquanto estiver aberto (o centro visual do marcador deve ficar fora da área ocupada pelo painel).
- **FR-003**: Ao abrir o detalhe pelo clique no pin no mapa (modo jogador), o sistema MUST aplicar o mesmo princípio: pin permanece visível ao lado do painel.
- **FR-004**: O deslocamento preferido MUST ser o **lado oposto ao menu lateral** (ex.: painel à direita do pin quando o menu está à esquerda). Se esse lado não couber na viewport (pin perto da borda, menu ocupando espaço), o sistema MUST fazer flip/ajuste de margem para manter o painel legível **e** o pin visível sempre que houver espaço suficiente.
- **FR-005**: Em viewports estreitas onde “ao lado” não for viável, o sistema MUST usar um fallback utilizável (detalhe legível e fechável) sem falha bloqueante.
- **FR-006**: Fechar o painel MUST continuar disponível pelos meios já existentes e MUST restaurar a interação normal com o mapa. Enquanto o painel estiver aberto, o mapa MUST permanecer **bloqueado** para pan/zoom (backdrop captura a interação); pan/zoom só após fechar.
- **FR-007**: Enquanto o detalhe estiver aberto, o sistema MUST manter o **backdrop escurecido** existente (não remover nem clarear o dim); o pin permanece reconhecível por estar fora da área do painel.
- **FR-008**: O Modo GM MUST NOT ser alterado por esta feature quanto ao painel de detalhe do jogador.

### Key Entities

- **Local (pin)**: Marcador no mapa cuja posição âncora o deslocamento visual do painel de detalhe.
- **Painel de detalhe do pin**: Superfície com informações do local (nome, descrição, vínculos) aberta no modo jogador.
- **Área útil do mapa**: Região da viewport onde o mapa é exibido (excluindo menu lateral e barras quando aplicável), usada para decidir lado/margem do painel.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes manuais em desktop com mapa carregado, após clicar um local no menu o pin selecionado permanece visível (não coberto pelo painel de detalhe).
- **SC-002**: Em pelo menos 90% desses testes com pin longe das bordas, o painel aparece claramente ao lado do pin (deslocamento lateral perceptível em relação ao centro da área do mapa).
- **SC-003**: Em 100% dos testes, o usuário consegue ler o título do local no painel e identificar o pin no mapa sem fechar o painel, em menos de 3 segundos após o clique.
- **SC-004**: Nenhuma regressão: fechar o detalhe continua funcionando; modo GM inalterado; abrir pelo pin no mapa também deixa o pin visível; com o detalhe aberto o mapa não responde a pan/zoom até fechar.

## Assumptions

- O fluxo principal é o já entregue em **012** (clique no menu → centralizar pin + abrir detalhe no modo jogador).
- “Ligeiramente ao lado” significa deslocamento lateral suficiente para o pin não ficar sob o painel; não exige um callout/balaão ancorado pixel a pixel, desde que pin e painel coexistam visualmente.
- Lado preferido: oposto ao menu lateral, com flip quando necessário.
- O mesmo princípio vale ao abrir o detalhe pelo pin no mapa, para consistência.
- Em mobile/viewport estreita, um fallback centrado ou em folha inferior é aceitável se “ao lado” não couber.
- Backdrop escurecido existente **permanece** (não se remove o dim); o requisito crítico é o painel não cobrir o pin. Com o detalhe aberto, o mapa fica bloqueado (sem pan/zoom) até fechar.
- Não há mudança de dados persistidos nem de API.
- Modo GM permanece fora do escopo desta feature para o painel de detalhe.
