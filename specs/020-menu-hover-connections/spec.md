# Feature Specification: Hover no menu mostra conexões

**Feature Branch**: `020-menu-hover-connections`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Agora que temos a spec 017, precisamos ajustar a funcionalidade de mouse hover no menu lateral para que ela mostre as linhas de conexão que estão saindo daquele local (pin)"

## Clarifications

### Session 2026-08-03

- Q: Com um local selecionado e hover em outro na lista, quais linhas mostrar? → A: Só hover quando não há seleção — com pin aberto/selecionado, hover não troca as linhas (só destaca o pin).
- Q: Hover na lista GM de locais também mostra linhas (sem seleção)? → A: Sim — mesma regra; paridade com o menu jogador.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pré-visualizar rotas ao percorrer a lista (Priority: P1)

Como jogador (ou GM) na aba Locais do menu lateral — ou na lista GM de locais — ao passar o mouse sobre um local quero ver no mapa as **linhas de saída** daquele local (mesmas conexões da 017), além do destaque do pin já existente (016), **sem** pan/zoom da vista — para explorar rotas varrendo a lista sem abrir cada pin.

**Why this priority**: É o pedido central; hoje o hover só destaca o pin e a 017 reservou linhas à seleção, o que impede essa pré-visualização.

**Independent Test**: Com local A tendo saídas para B (e preferencialmente C) e **nenhum** local selecionado, passar o mouse sobre A na aba Locais; linhas A→B (e A→C) aparecem; o pin A destaca; pan/zoom não mudam; ao sair o mouse da lista, as linhas somem.

**Acceptance Scenarios**:

1. **Given** o local A tem saídas cadastradas para B e C e nenhum local está selecionado, **When** o usuário passa o mouse sobre A na aba Locais (ou na lista GM de locais), **Then** o mapa mostra as linhas de saída de A (estilo atual das conexões) e o destaque de hover do pin A, **sem** alterar pan/zoom.
2. **Given** nenhum local selecionado e o usuário está com hover sobre A (linhas visíveis), **When** move o mouse para o local D na lista (com suas próprias saídas), **Then** as linhas passam a ser as saídas de D (não as de A) e o destaque de pin acompanha D; pan/zoom permanecem fixos.
3. **Given** nenhum local selecionado e o usuário está com hover sobre um local, **When** tira o mouse da lista (sem clicar), **Then** as linhas de conexão desaparecem e o destaque de hover some.
4. **Given** um local sem saídas cadastradas e nenhum local selecionado, **When** o usuário passa o mouse sobre ele na aba Locais, **Then** o pin destaca normalmente e **nenhuma** linha de conexão aparece.

---

### User Story 2 - Seleção manda; hover não troca linhas com pin aberto (Priority: P2)

Como usuário, quero que abrir/selecionar um local continue mostrando as linhas da 017, e que o hover na lista **só pré-visualize saídas quando não há seleção**. Com um local selecionado/aberto, o hover ainda destaca o pin (016) mas **não** troca as linhas — elas permanecem as do local em foco.

**Why this priority**: Evita regressão na seleção/abertura do pin e define o conflito hover vs seleção (clarificação: seleção prevalece para linhas).

**Independent Test**: Selecionar A (linhas de A); hover em B na lista → pin B destaca, linhas continuam de A; sair do hover → linhas de A; fechar seleção → sem linhas; hover em B → linhas de B.

**Acceptance Scenarios**:

1. **Given** o local A está selecionado/aberto (linhas de A visíveis), **When** o usuário passa o mouse sobre B na aba Locais, **Then** o pin B recebe destaque de hover, pan/zoom não mudam, e as linhas **permanecem** as saídas de **A** (não as de B).
2. **Given** A selecionado e hover em B, **When** o mouse sai da lista, **Then** as linhas de A continuam e o destaque de hover some.
3. **Given** A selecionado, **When** o usuário passa o mouse sobre A na lista, **Then** as linhas de A continuam visíveis e o pin mantém destaque coerente.
4. **Given** nenhum local selecionado, **When** o usuário apenas percorre a lista com hover, **Then** as linhas só aparecem durante o hover do item correspondente (comportamento US1).

---

### User Story 3 - Clique e demais gestos intactos (Priority: P3)

Como usuário, quero que clicar no item do menu ou no pin continue selecionando/abrindo o local e focando conforme regras já entregues (015/016), e que o estilo das linhas (019) e o cadastro de saídas (017) não mudem nesta feature.

**Why this priority**: Garante que a pré-visualização por hover não quebra fluxos já estáveis.

**Independent Test**: Após hover em vários itens, clicar em um local; pin abre/seleciona; linhas passam a seguir a seleção; pan/zoom no clique de foco (se aplicável) continua como antes.

**Acceptance Scenarios**:

1. **Given** o usuário fez hover em vários locais, **When** clica em um local no menu, **Then** a seleção/abertura ocorre normalmente e as linhas passam a seguir esse local focado.
2. **Given** linhas visíveis por hover ou seleção, **When** o usuário faz zoom/pan deliberado no mapa, **Then** as linhas acompanham os pins (como na 017) e o hover na lista continua sem forçar pan/zoom.

---

### Edge Cases

- Local com muitas saídas (≥5): hover mostra todas as saídas daquele local; lista permanece usável; pan/zoom não disparam.
- Destino inexistente / órfão: mesma regra da 017 (não desenhar segmento fantasma).
- Hover rápido pela lista: linhas e destaque acompanham o item atual sem deixar linhas “presas” de um item anterior após mouse leave.
- Aba do menu que não é Locais: hover desta feature não se aplica (sem linhas por hover de outras abas).
- Tela estreita / menu sobreposto: hover ainda controla linhas; não bloqueia fechar pin nem usar o mapa.
- Fora de escopo: mudar cadastro de saídas; mudar estilo visual das linhas (019); mostrar linhas de *entrada* (só saídas); overlay permanente de todas as conexões.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Quando **nenhum** local está selecionado/aberto e o usuário passa o mouse sobre um local na aba Locais do menu lateral **ou** na lista GM de locais, o sistema MUST exibir no mapa as linhas de **saída** daquele local (mesmas conexões e regras de desenho da 017/019), além do destaque de pin já existente.
- **FR-002**: Quando um local **está** selecionado/aberto, o hover na lista (jogador ou GM) MUST NÃO alterar quais linhas estão desenhadas — as linhas MUST permanecer as saídas do local selecionado (017); o hover MUST apenas destacar o pin correspondente (016).
- **FR-003**: Ao encerrar o hover na lista sem seleção ativa, o sistema MUST ocultar as linhas. Com seleção ativa, o leave do hover MUST NÃO mudar as linhas (continuam as da seleção).
- **FR-004**: O hover na aba Locais / lista GM MUST NÃO alterar pan ou zoom da vista do mapa (comportamento 016 permanece).
- **FR-005**: Local sem saídas sob hover (e sem seleção) MUST destacar o pin e MUST NÃO desenhar linhas.
- **FR-006**: Sem hover e sem seleção, o sistema MUST NÃO exibir linhas de conexão.
- **FR-007**: Clique para selecionar/abrir local, foco por clique (015), estilo das linhas (019) e cadastro de `saídas` (017) MUST permanecer com o comportamento já entregue; esta feature só amplia quando as linhas aparecem no hover **na ausência de seleção**.
- **FR-008**: Hover em pins do mapa (se distinto do menu) MUST NÃO ser obrigatório para mostrar linhas nesta feature — o gatilho é o hover na aba Locais do menu jogador **e** na lista GM de locais (paridade), somente quando não há local selecionado.
- **FR-009**: Abas ou painéis que não listam locais MUST NÃO disparar linhas por hover.

### Key Entities

- **Linha de conexão de saída**: Traço visual origem→destino já definido na 017; nesta feature, também acionado pelo hover do menu sobre a origem.
- **Hover de local (menu)**: Estado temporário ao passar o mouse sobre um item de local na aba Locais; já usado para destacar o pin (016).
- **Seleção/foco de local**: Estado ao selecionar ou abrir o detalhe; continua a mostrar linhas (017).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com local A tendo ≥2 saídas, **nenhuma** seleção, e mapa estável, 2 observadores confirmam em ≤10 s que hover em A na aba Locais mostra as linhas de saída de A sem mover pan/zoom.
- **SC-002**: Em sequência hover A → hover B → mouse leave (sem seleção), as linhas de A e B somem após o leave; nenhuma linha “presa” permanece.
- **SC-003**: Com A selecionado e hover em B, as linhas permanecem as de A durante todo o hover; o pin B destaca — verificação em ≤5 s.
- **SC-004**: Percorrer ≥5 itens da lista com hover não dispara pan/zoom da vista (016) e não impede clicar um item em seguida.

## Assumptions

- Depende da 017 (conexões `saídas` + desenho de linhas) e da 016 (hover sem pan/zoom + destaque de pin).
- Estilo visual das linhas permanece o da 019 (vermelho claro visitado, opacidade, sombra); sem restyling nesta feature.
- Precedência (clarificada): linhas por hover **somente** quando não há local selecionado/aberto; com seleção ativa, hover só destaca o pin e **não** troca as linhas (seleção manda).
- Listas GM de locais (clarificado): **sim** — mesmo comportamento de linhas no hover que a aba Locais do jogador (sem seleção).
- Não se exige mostrar linhas ao pairar o mouse só sobre o pin no mapa, salvo se esse gesto já compartilhar o mesmo estado de hover do menu.
- Fora de escopo: grafo completo sempre visível; setas; filtros por arco; linhas de entrada.
