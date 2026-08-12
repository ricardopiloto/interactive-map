# Feature Specification: Disc Edge Anchor

**Feature Branch**: `067-disc-edge-anchor`

**Created**: 2026-08-11

**Status**: Implemented

**Input**: User description: "Com base nisso, gere uma nova /speckit-specify para efetuar essa correção" — âncora das linhas de vínculo no **centro do disco** (não no centro da caixa disco+nome+papel).

**Depends on**: `066-relationship-network` (tela Relações, palco do grafo, linhas de vínculo)

## Clarifications

### Session 2026-08-11

- Q: Como a linha encontra o disco? → A: Geometria até ao centro do disco; linha atrás do disco (sem vão)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Linhas entram no centro do disco (Priority: P1)

Um utilizador selecciona um personagem na Rede de Relações e vê as linhas de vínculo. Cada linha aponta para o **centro geométrico do disco** (o círculo com as iniciais), não para o meio do bloco que inclui nome e papel. Como as linhas ficam **atrás** dos discos, visualmente parecem tocar a borda do círculo, alinhadas ao centro.

**Why this priority**: É a correção pedida; o estado actual ancora no centro da caixa 172×112, ~25px abaixo do disco, e a linha parece “entrar” entre o disco e o nome.

**Independent Test**: Seleccionar um personagem com ≥1 vínculo visível; confirmar que cada extremo da linha coincide com o centro do disco (não com o texto abaixo).

**Acceptance Scenarios**:

1. **Given** um personagem seleccionado e linhas visíveis, **When** o utilizador observa um extremo, **Then** a linha aponta para o **centro do disco** desse personagem (não para o centro da caixa nome/papel).
2. **Given** o mesmo grafo, **When** compara dois nós (foco e um vínculo directo), **Then** a linha é recta **centro-a-centro dos discos**.
3. **Given** linhas visíveis, **When** o disco cobre o extremo, **Then** a linha continua **atrás** do disco (não por cima das iniciais nem do halo de selecção).

---

### User Story 2 - Layout e etiquetas não pioram (Priority: P2)

A organização em anéis, nomes, papéis e etiquetas de tipo no meio da linha mantêm-se utilizáveis: só muda o ponto de âncora da linha. Arrastar um nó (posição de sessão) move disco e âncora juntos.

**Why this priority**: Evitar que a correção desalinhe etiquetas ou faça linhas atravessar nomes de forma pior.

**Independent Test**: Foco com painel aberto e fechado; arrastar um nó; etiquetas continuam a meio do segmento visual.

**Acceptance Scenarios**:

1. **Given** um nó arrastado na sessão, **When** há linhas visíveis, **Then** a âncora acompanha o **disco** na nova posição.
2. **Given** etiquetas no meio da linha (`foco` / `sempre` / `hover`), **When** as âncoras passam a ser os centros dos discos, **Then** a etiqueta permanece no ponto médio entre os **dois centros de disco**.
3. **Given** painel de detalhe aberto (palco mais estreito), **When** o layout recalcula, **Then** as linhas continuam centro-a-centro dos discos.

---

### Edge Cases

- Personagem sem papel: a caixa é mais baixa visualmente, mas a âncora continua no centro do disco (não no centro do texto restante).
- Personagem morto (disco dessaturado + nome riscado): âncora inalterada (centro do disco).
- Halo de selecção à volta do disco: a linha não passa por cima do halo/disco (continua por baixo até ao centro).
- Sem vão na borda: o extremo geométrico é o centro do disco; o disco tapa o último troço.
- Zoom/pan: a âncora permanece o centro do disco no espaço do palco.
- Isolar / filtros: só nós visíveis; âncora igual nos que restam.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada extremo de uma linha de vínculo MUST ancorar no **centro geométrico do disco** do personagem (círculo das iniciais), não no centro da caixa que inclui nome e papel.
- **FR-002**: As linhas MUST continuar rectas entre esses dois centros de disco.
- **FR-003**: As linhas MUST permanecer desenhadas **atrás** dos discos (e do halo de selecção), de forma a parecerem tocar a borda do círculo; MUST NOT haver vão entre linha e circunferência nem recorte na borda (**confirmado** Clarifications 2026-08-11).
- **FR-004**: Após arrastar um nó (posição só de sessão), a âncora MUST acompanhar o disco na posição actual.
- **FR-005**: Etiquetas de tipo de vínculo MUST usar o ponto médio entre os centros dos **discos** (não o médio da caixa antiga).
- **FR-006**: O sistema MUST NOT alterar tipos de vínculo, visibilidade pública, animação de selecção (~0,6s) nem a regra “linhas só depois da animação”.

### Key Entities

- **Disco**: Círculo visual do personagem (iniciais); único ponto de âncora das linhas.
- **Caixa do nó**: Disco + nome + papel; continua a servir o **espaçamento dos anéis**, não a âncora da linha.
- **Linha de vínculo**: Segmento recto entre dois centros de disco, atrás dos círculos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em amostragem de ≥5 pares de nós (foco + vínculo directo), **100%** das linhas alinhadas ao centro do disco em ambos os extremos (desvio visual óbvio = 0).
- **SC-002**: **0** linhas que pareçam terminar no nome/papel em vez do disco, no mesmo conjunto de testes.
- **SC-003**: Após arrastar um nó e soltar, a linha actualiza para o novo centro do disco sem recarregar a página.
- **SC-004**: Um observador identifica “a linha entra no meio do círculo” em menos de **5 segundos** após seleccionar um personagem com linhas visíveis.

## Assumptions

- Correção visual na tela Relações já entregue em 066; sem mudança de modelo de dados nem de APIs.
- “Centro a centro” (**confirmado** Clarifications 2026-08-11): geometria até ao centro do disco; linha atrás do disco; **sem** recorte nem vão na circunferência; o disco tapa o último troço e a linha parece tocar a **borda** alinhada ao centro.
- Folga/layout dos anéis continua a usar a caixa real do nó (nome/papel) para evitar sobreposições; só a âncora da linha muda.
- Fora de escopo: novas formas de nó, setas, linhas curvas, persistência de posições.
