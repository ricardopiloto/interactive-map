# Feature Specification: Detail Portrait Layout

**Feature Branch**: `070-detail-portrait-layout`

**Created**: 2026-08-11

**Status**: Implemented

**Input**: User description: "Agora vamos fazer um ajuste que peguei em produção, quando texto da descrição do personagem é muito grande, ele quebra a formatação do espaço de imagem quando eu seleciono um personagem, ajuste isso para não quebrar a exibição da imagem"

**Depends on**: ficha de personagem ao seleccionar (Relações 066; retrato 069)

## Clarifications

### Session 2026-08-11

- Q: Qual superfície corrigir (Relações, mapa, ou ambas)? → A: Só Relações — painel ao seleccionar no grafo

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Retrato intacto com descrição longa (Priority: P1)

O utilizador selecciona um personagem cuja descrição é longa (vários parágrafos, texto de produção). A ficha abre com o retrato no sítio habitual. O texto extra **não** esmaga, distorce, tapa nem desloca o espaço da imagem: o retrato continua a ver-se completo e bem enquadrado. A descrição permanece legível por baixo, com scroll na ficha se não couber no ecrã.

**Why this priority**: Bug de produção — a ficha fica ilegível/feia exactamente quando o lore é rico.

**Independent Test**: Personagem com retrato e descrição longa; seleccionar no palco Relações e confirmar retrato + texto.

**Acceptance Scenarios**:

1. **Given** um personagem **com retrato** e descrição longa (≥ 4 parágrafos ou texto que ultrapasse a altura da ficha), **When** o utilizador o selecciona, **Then** o espaço da imagem mantém o retrato visível, sem compressão, corte pelo texto, nem proporção distorcida.
2. **Given** o mesmo personagem, **When** o utilizador lê a descrição, **Then** consegue ver o texto completo (a ficha faz scroll se necessário); nada da descrição cobre o retrato.
3. **Given** um personagem **sem retrato** e descrição longa, **When** selecciona, **Then** o espaço reservado à imagem (placeholder “Sem retrato”) também se mantém estável; o texto não o esmaga.

---

### User Story 2 - Descrição curta não muda (Priority: P2)

Personagens com descrição curta ou vazia continuam com o mesmo aspecto de ficha de hoje: retrato (ou placeholder), etiquetas, texto, vínculos. O ajuste não “encolhe” o retrato nem adiciona scroll desnecessário nesses casos.

**Why this priority**: Evitar regressão no caso mais comum.

**Independent Test**: Seleccionar um personagem com uma ou duas frases de descrição (ou “Sem descrição.”).

**Acceptance Scenarios**:

1. **Given** um personagem com descrição curta e retrato, **When** o utilizador selecciona, **Then** o retrato e o texto aparecem como hoje, sem barra de scroll extra só por causa deste ajuste.
2. **Given** um personagem sem descrição, **When** selecciona, **Then** vê “Sem descrição.” e o retrato (ou placeholder) intacto.

---

### Edge Cases

- Descrição com muitas quebras de linha ou uma linha muito longa sem espaços: o texto quebra/envolve dentro da ficha; não empurra a imagem para fora nem estica a largura do painel.
- Retrato alto ou largo: continua a caber no espaço de imagem da ficha (como hoje: imagem completa, sem recorte de “preencher”), e esse espaço não colapsa quando a descrição cresce.
- Muitos vínculos abaixo da descrição: o scroll da ficha cobre retrato + texto + lista; o retrato no topo permanece com o tamanho correcto ao fazer scroll (não fica esmagado para “fazer caber” vínculos).
- Largura estreita (ficha em ecrã pequeno / folha inferior): a mesma regra — imagem estável, texto a scrollar.
- Fora de escopo: cartão/NPC no **mapa**; truncar ou resumir a descrição; alterar o recorte do disco no grafo (069); mudar o conteúdo da descrição.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao seleccionar um personagem na tela **Relações**, a ficha MUST mostrar o retrato (ou o placeholder) num espaço de imagem **estável**: a descrição, por mais longa que seja, MUST NOT reduzir, distorcer nem tapar esse espaço. O cartão de NPC no mapa está **fora de escopo**.
- **FR-002**: A descrição completa MUST permanecer acessível (leitura integral; scroll na ficha quando o conteúdo não cabe).
- **FR-003**: Com descrição curta ou vazia, o aspecto da ficha MUST permanecer equivalente ao actual (sem scroll inútil nem retrato mais pequeno).
- **FR-004**: Texto longo sem espaços (ou com muitas linhas) MUST ficar contido na largura da ficha e MUST NOT alargar nem partir o espaço da imagem.
- **FR-005**: O sistema MUST NOT alterar o significado do retrato (mesmo ficheiro; na ficha a imagem continua a ver-se completa, não o recorte circular do disco).

### Key Entities

- **Ficha do personagem**: painel que abre ao seleccionar (nome, retrato, etiquetas, descrição, vínculos).
- **Espaço da imagem**: região fixa da ficha dedicada ao retrato ou ao placeholder.
- **Descrição**: texto livre da ficha; pode ser curto ou muito longo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 3 personagens de produção (ou equivalentes) com descrição que force scroll, **100%** mantêm o retrato (ou placeholder) com aspecto nítido e sem distorção visível.
- **SC-002**: Um observador percorre a ficha e lê a descrição **completa** sem o texto sobrepor ou cortar a imagem.
- **SC-003**: Em 3 personagens com descrição curta, a ficha **não** introduz scroll extra nem reduz o retrato face ao comportamento actual.
- **SC-004**: **0** casos em que uma linha de descrição larga o painel para além da largura habitual da ficha.

## Assumptions

- Superfície: **apenas** a ficha ao seleccionar na tela **Relações**. Mapa / menu de NPCs não entra neste conserto.
- A descrição não é truncada; o excesso resolve-se com scroll da ficha, não com cortar lore.
- Não se pede um tamanho de retrato novo; só que o espaço já previsto deixe de ceder quando o texto cresce.
