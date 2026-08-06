# Feature Specification: Fix NPC Portrait Expand Sizing

**Feature Branch**: `057-fix-npc-portrait-expand`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "O retrato do personagem aparece quebrado quando expandido, o tamanho da caixa não redimensiona automaticamente. Lembrando que isso não pode quebrar a tela."

## Problem

Quando o utilizador **expande** um personagem (NPC) no menu lateral, o **retrato** aparece visualmente quebrado: a caixa do retrato **não se ajusta** ao tamanho/proporção da imagem (altura fixa / corte incorrecto). O reparo MUST preservar o layout geral da aplicação — a imagem expandida **não pode “partir” o ecrã** (overflow destrutivo, empurrar o mapa para fora, ou tornar a UI inutilizável).

## Clarifications

### Session 2026-08-05

- Q: Caixa vs altura máxima? → A: Altura da caixa = altura da imagem já escalada, limitada pelo máximo (shrink-to-fit); sem moldura vazia presa na altura máxima.
- Q: Qual o tecto de altura do retrato expandido? → A: ≤ ~50% da altura da viewport.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver o retrato completo ao expandir o NPC (Priority: P1)

O jogador (ou GM) abre o separador de personagens, selecciona um NPC com retrato, e na área expandida vê o retrato **inteiro e legível**, com a caixa a acompanhar a proporção da imagem em vez de um bloco fixo que corta ou distorce o rosto.

**Why this priority**: É o defeito reportado; afecta a leitura do personagem.

**Independent Test**: Expandir um NPC com retrato vertical e outro com retrato mais largo; confirmar que a imagem não parece “partida” e que a caixa cresce/encolhe de forma coerente com a imagem (dentro de limites seguros).

**Acceptance Scenarios**:

1. **Given** um NPC com retrato carregado, **When** o utilizador o expande no menu de personagens, **Then** o retrato expandido mostra a imagem de forma completa e reconhecível (sem corte agressivo que “parta” o retrato).
2. **Given** o mesmo NPC expandido, **When** a proporção do ficheiro de imagem muda (retrato alto vs mais largo), **Then** a caixa do retrato **redimensiona** para acomodar essa proporção em vez de forçar uma altura fixa independente da imagem — a altura da caixa segue a imagem escalada, sem espaço vazio forçado até ao tecto máximo.
3. **Given** um NPC sem retrato, **When** expandido, **Then** o comportamento actual de ausência de imagem (só texto/metadados) mantém-se — sem caixa vazia partida.
4. **Given** um retrato abaixo do limite máximo de altura, **When** expandido, **Then** a caixa NÃO ocupa a altura máxima completa só para “preencher”; fica justa à imagem.

---

### User Story 2 - Expandir sem partir o ecrã (Priority: P1)

Ao expandir o retrato, o layout da aplicação permanece utilizável: o menu, o mapa e o resto da UI não ficam irrecuperavelmente cobertos, deslocados ou com scroll horizontal indesejado; se o retrato for grande, a experiência usa limites (altura/largura máximas e/ou scroll do painel) em vez de estourar a viewport.

**Why this priority**: Restrição explícita do pedido (“não pode quebrar a tela”).

**Independent Test**: Expandir NPC com retrato grande em desktop e em viewport estreita; mapa e controlos principais continuam acessíveis; sem scroll horizontal da página.

**Acceptance Scenarios**:

1. **Given** viewport desktop típica, **When** um NPC com retrato alto é expandido, **Then** o retrato cabe na largura do cartão/menu e **não** empurra o conteúdo para fora da largura da janela.
2. **Given** viewport estreita / móvel, **When** o mesmo NPC é expandido, **Then** a UI permanece utilizável (scroll vertical do menu é aceitável; partir o layout global ou scroll horizontal da página **não** é).
3. **Given** um retrato muito alto, **When** expandido, **Then** a altura do bloco de imagem **não excede ~50% da altura da viewport**; o utilizador ainda consegue ver nome, descrição e fechar/colapsar o cartão (Clarifications 2026-08-05).

---

### User Story 3 - Miniatura colapsada intacta (Priority: P2)

Com o cartão **fechado**, a miniatura circular (ou equivalente) junto ao nome continua compacta e estável — a correcção do estado expandido MUST NOT aumentar ou partir a lista colapsada.

**Why this priority**: Regressão fácil ao “consertar” só o expandido.

**Independent Test**: Lista de NPCs colapsados; miniaturas iguais ao comportamento esperado pré-fix; só o expandido muda.

**Acceptance Scenarios**:

1. **Given** a lista de NPCs sem nenhum expandido (ou outros colapsados), **When** o utilizador percorre a lista, **Then** as miniaturas do cabeçalho permanecem pequenas e alinhadas, sem herdar o tamanho do retrato expandido.

---

### Edge Cases

- Retrato muito largo (paisagem): escala à largura do cartão; altura acompanha proporção até ao máximo permitido.
- Retrato muito alto (retrato clássico): respeita proporção até ao máximo de altura; não estica o ecrã sem limite.
- Imagem em falha de carga: não deixa um buraco de layout gigante; fallback discreto.
- Vários NPCs: só o expandido mostra o retrato grande; trocar de NPC colapsa o anterior (comportamento actual de selecção).
- Modo GM / formulário de upload do NPC: fora do âmbito **salvo** se partilhar o mesmo componente visual quebrado no expandido do menu; o foco é o retrato no cartão expandido do menu de personagens.
- Mapa, pins, Calcular rota, digitizer: não devem ser afectados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: No cartão **expandido** de um personagem com retrato, o produto MUST apresentar o retrato de forma que a **caixa se ajuste à proporção da imagem** (redimensionamento automático coerente), em vez de uma altura fixa que corte ou “parta” o retrato.
- **FR-001a**: A altura da caixa do retrato expandido MUST ser a altura da imagem **já escalada** à largura útil (e limitada pelo máximo de FR-003) — shrink-to-fit; MUST NOT reservar sempre a altura máxima com bandas vazias quando a imagem é mais baixa (Clarifications 2026-08-05).
- **FR-002**: O retrato expandido MUST permanecer **contido** na largura útil do cartão/menu (sem overflow horizontal da página).
- **FR-003**: O retrato expandido MUST respeitar altura máxima de **cerca de 50% da altura da viewport** (Clarifications 2026-08-05), para que um ficheiro muito alto não destrua o layout do ecrã; scroll interno do menu é permitido. A caixa continua shrink-to-fit abaixo desse tecto (FR-001a).
- **FR-004**: Com retrato expandido, o utilizador MUST continuar a conseguir ler o resto do cartão (descrição, facção, locais) e colapsar/seleccionar outro item sem a UI ficar bloqueada.
- **FR-005**: A miniatura do cabeçalho (estado colapsado) MUST permanecer compacta e MUST NOT herdar o tamanho do retrato expandido.
- **FR-006**: Personagens sem `retrato` MUST continuar a expandir só com texto/metadados, sem caixa de imagem partida.
- **FR-007**: Esta correcção MUST NOT alterar o mapa, pins, redes de rotas ou o fluxo de Calcular rota.

### Key Entities

- **Retrato expandido**: Imagem grande do personagem no corpo do cartão quando o NPC está seleccionado/expandido.
- **Miniatura do cabeçalho**: Imagem pequena no botão do cartão (lista).
- **Limite seguro de ecrã**: Largura = largura útil do cartão; altura máxima do retrato expandido ≈ 50% da viewport; caixa shrink-to-fit até esse tecto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em revisão visual com ≥2 retratos de proporções diferentes, 100% dos casos expandido mostram o rosto/figura reconhecível sem corte fixo “partido” reportado.
- **SC-002**: Em viewport estreita (~375px de largura) e desktop, expandir um NPC com retrato **nunca** introduz scroll horizontal na página (0 ocorrências no smoke).
- **SC-003**: Com retrato muito alto, a altura visível do bloco de imagem no cartão permanece **≤ ~50% da altura da viewport**, e o utilizador ainda vê controlos/texto do cartão sem “ecrã só imagem”.
- **SC-004**: Spot-check: lista colapsada de NPCs inalterada em densidade; mapa e Calcular rota intactos.

## Assumptions

- O problema reportado refere-se ao **retrato no cartão expandido do menu de personagens (NPCs)**, não a um lightbox a ecrã inteiro separado.
- “Caixa não redimensiona” = a área do retrato expandido usa dimensão fixa inadequada; a solução é adaptar à imagem **com** limites máximos, em modo shrink-to-fit (Clarifications 2026-08-05).
- “Não quebrar a tela” = não causar overflow destrutivo, scroll horizontal, nem monopolizar a viewport sem escape; scroll vertical no menu é aceitável.
- Preferência por mostrar a imagem completa (`contain` / altura automática) em vez de `cover` agressivo no estado expandido; a miniatura pode continuar a cortar em círculo.
- Não se exige zoom/lightbox fullscreen nesta feature.

## Out of Scope

- Novo upload ou recorte de retratos no admin (salvo bug visual idêntico no mesmo sítio expandido).
- Redesign completo do menu lateral.
- Lightbox / galeria a ecrã inteiro.
- Alterações ao mapa, rotas ou pins.
