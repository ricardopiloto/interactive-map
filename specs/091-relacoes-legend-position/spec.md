# Feature Specification: Legenda da Rede no mesmo sítio que no mapa

**Feature Branch**: `091-relacoes-legend-position`

**Created**: 2026-08-14

**Status**: Implemented

**Input**: User description: "altere a posição das legendas para ser igual as legendas do mapa."

**Depends on**: Rede de Relações ([066](../066-relationship-network/spec.md)); coluna com lista, Isolar e filtro de estado ([086](../086-relacoes-list-compact/spec.md), [090](../090-relacoes-status-filter/spec.md)); palco com controlos de zoom; mapa geográfico com legenda no canto inferior esquerdo do palco

## Clarifications

### Session 2026-08-14

- Q: Overlay compacta em linha como o mapa, lista vertical actual, ou compacta com título? → A: Lista **vertical** (opção B), o **mais compacta possível** sem perder sentido (mantém PJ, NPC e o nome de cada tipo); **sem cor de fundo**; **opacidade reduzida** para não atrapalhar a leitura do grafo. Sem título «Legenda» (os próprios itens já explicam).
- Q: Clique e hover na zona da legenda actuam nela ou no grafo por baixo? → A: Atravessam a legenda e actuam nos discos e linhas (a chave é só visual).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Encontrar a legenda da Rede no mesmo sítio que no mapa (Priority: P1)

Na vista **Relações**, a legenda (PJ vs NPC e as cores dos tipos de vínculo) deixa de ocupar o fundo da coluna esquerda. Passa a viver **sobre o palco**, no **canto inferior esquerdo** (o mesmo canto que a do mapa). É uma **lista vertical compacta**: cada linha um significado (disco PJ, disco NPC, traço de cada tipo), sem título, sem fundo, com opacidade reduzida para o grafo por baixo continuar legível. Clique e hover **atravessam** a chave e actuam no grafo. A coluna fica só com busca, tipos, lista, estado e Isolar. Os botões de zoom continuam no canto inferior direito e não se sobrepõem à legenda.

**Why this priority**: A coluna já está cheia (lista, filtro de estado, Isolar); a legenda no fundo compete com a lista e não corresponde ao hábito visual do mapa, onde a chave de cores está no palco.

**Independent Test**: Abrir `/mapa` e notar a legenda no canto inferior esquerdo do palco; abrir `/relacoes` e encontrar a chave da Rede no mesmo canto, em lista vertical compacta (PJ/NPC + tipos), sem fundo e mais transparente que a do mapa; clicar um disco por baixo da chave selecciona-o; a coluna já não tem bloco «Legenda»; zoom +/− / 1:1 continua utilizável.

**Acceptance Scenarios**:

1. **Given** a vista Relações em ecrã de secretária, **When** o utilizador olha o palco, **Then** vê a legenda no **canto inferior esquerdo** da área do grafo (não na coluna).
2. **Given** a vista Mapa, **When** compara com Relações, **Then** as duas legendas ocupam o **mesmo canto** do palco (inferior esquerdo), como overlay que não se desloca com pan/zoom.
3. **Given** a coluna esquerda em Relações, **When** percorre os controlos, **Then** **não** há bloco de legenda abaixo de Isolar; busca, tipos, lista, estado e Isolar mantêm-se.
4. **Given** a legenda no palco, **When** o utilizador lê os itens, **Then** vê uma lista **vertical** compacta e distingue PJ vs NPC e cada tipo de vínculo (mesmas cores e traços dos chips); **não** há título «Legenda» nem caixa com fundo.
5. **Given** discos ou linhas por baixo da chave, **When** o utilizador observa o canto, **Then** o grafo continua visível através da legenda (opacidade reduzida; sem placa opaca).
6. **Given** os controlos de zoom no palco, **When** observa o canto inferior, **Then** a legenda **não** tapa + / − / 1:1; o zoom continua no canto inferior direito.
7. **Given** pan ou zoom no grafo, **When** os discos se movem, **Then** a legenda permanece fixa no canto do palco (como a do mapa).
8. **Given** um disco ou linha na zona da chave, **When** o utilizador clica ou passa o rato aí, **Then** o palco reage como se a legenda não existisse (selecciona, destaca, arrasta); a chave não intercepta o gesto.

---

### Edge Cases

- **Telemóvel** (coluna acima do palco): a legenda continua no canto inferior esquerdo **do palco**, não volta para a coluna.
- **Painel de detalhe aberto** (secretária, à direita): a legenda permanece no canto inferior esquerdo do palco; não precisa de saltar para outro canto.
- **Folha de detalhe no telemóvel** (embaixo): pode tapar temporariamente a legenda, como já pode tapar o zoom; ao fechar o detalhe a legenda volta a estar visível.
- **Muitos tipos visíveis**: a lista continua **vertical** (um tipo por linha); compacta-se em altura/tipografia, não passa a grelha horizontal. Não invade o zoom.
- **Palco vazio** (filtro de estado sem personagens): a legenda continua visível — explica as cores mesmo sem discos.
- **Idioma PT/EN**: rótulos da legenda acompanham o idioma da interface, como hoje.
- **Mapa**: esta alteração **não** mexe na legenda do mapa.
- **Gesto na zona da chave**: clique, arrasto e hover passam ao grafo; a chave não é clicável (os chips da coluna continuam a filtrar tipos).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A legenda da Rede MUST aparecer como overlay no **canto inferior esquerdo do palco**, o mesmo canto em que a legenda do mapa aparece no palco geográfico.
- **FR-002**: A coluna esquerda MUST NOT mostrar o bloco de legenda (PJ/NPC e tipos). MUST continuar a mostrar busca, chips de tipo, lista, filtro de estado e Isolar.
- **FR-003**: A overlay MUST mostrar o mesmo significado que a legenda actual: distinção PJ vs NPC e as cores/traços dos tipos de vínculo (um item por linha, nomes visíveis). MUST NOT omitir um tipo para poupar espaço.
- **FR-004**: A overlay MUST permanecer fixa no palco (não se move com pan nem com zoom dos discos).
- **FR-005**: A overlay MUST NOT tapar os controlos de zoom (+ / − / 1:1) no canto inferior direito.
- **FR-006**: Em viewport estreita, a overlay MUST continuar no palco (canto inferior esquerdo), não regressar à coluna.
- **FR-007**: A overlay MUST permanecer visível mesmo quando o palco não tem discos (lista/filtro vazios).
- **FR-008**: Os textos da overlay MUST seguir o idioma da interface (PT-BR e EN), como a legenda actual.
- **FR-009**: A overlay MUST ser uma lista **vertical** o mais compacta possível (tipografia e espaçamento mínimos ainda legíveis). MUST NOT ter cor de fundo (sem placa). MUST usar opacidade reduzida em relação ao resto da UI, de modo a não tapar a leitura do grafo, sem tornar os rótulos ilegíveis.
- **FR-010**: A overlay MUST NOT mostrar o título «Legenda» (os itens bastam).
- **FR-011**: Clique, arrasto e hover na área da overlay MUST actuar no palco (discos, linhas, pan) como se a chave não estivesse lá. A overlay MUST NOT ser um alvo de clique.

### Out of Scope

- Alterar conteúdo, cores ou tipos da legenda do **mapa**.
- Novos itens na chave da Rede (estados vivo/morto, visibilidade GM, etc.).
- Botão para esconder/mostrar a legenda.
- Mover os chips de filtro de tipo (continuam na coluna).
- Mudar o canto dos controlos de zoom.

### Key Entities

- **Legenda da Rede**: chave visual de PJ vs NPC e dos tipos de vínculo; deixa de ser um bloco da coluna e passa a overlay do palco.
- **Legenda do mapa**: chave de Visitado / Conhecido / Grupo no canto inferior esquerdo do palco geográfico — **referência de posição**, não de conteúdo.
- **Palco da Rede**: área do grafo (discos e linhas) onde a overlay se ancora, à semelhança do palco do mapa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em secretária, um utilizador que já conhece a legenda do mapa encontra a da Rede no **mesmo canto do palco** sem abrir a coluna, em menos de 5 segundos.
- **SC-002**: 100% dos significados actuais da chave (PJ, NPC, cada tipo de vínculo) continuam identificáveis na overlay, em lista vertical, sem título.
- **SC-003**: A coluna esquerda, após Isolar, **não** contém bloco de legenda; a lista de personagens ganha o espaço que a legenda ocupava.
- **SC-004**: Em secretária, zoom + / − / 1:1 permanece clicável com a overlay visível (nenhuma sobreposição).
- **SC-005**: Pan e zoom do grafo **não** deslocam a overlay do canto do palco.
- **SC-006**: Em viewport estreita, a overlay continua no palco (não na coluna empilhada).
- **SC-007**: A overlay não tem fundo próprio; o grafo por baixo permanece visível (opacidade reduzida). Um utilizador consegue ler tanto um rótulo da chave como um nome de disco na mesma zona do palco.
- **SC-008**: Em secretária, clicar um disco visível na zona da chave selecciona-o à primeira tentativa (a overlay não «come» o clique).

## Assumptions

- «Igual às legendas do mapa» refere-se à **posição no palco** (canto inferior esquerdo, overlay fixa), não a copiar itens, fundo nem a barra horizontal do mapa.
- Compactar = reduzir tamanho e espaço entre linhas, **não** fundir itens nem esconder nomes.
- A chave da Rede é só leitura; filtrar tipos continua a ser pelos chips da coluna.
- Não é necessário persistir preferências: a legenda está sempre visível, como a do mapa quando o palco geográfico a mostra.

## Notes

- Actualizar o manual da Rede: a legenda passa a descrever-se no palco, não na coluna.
- Filtro de estado (090) e Isolar não mudam de sítio nem de comportamento.
