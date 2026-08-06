# Feature Specification: Fix NPC Portrait in Edit Mode

**Feature Branch**: `058-fix-npc-portrait-edit`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "Ajuste também a caixa que aparece no modo de edição, ela está com tamanho fixo e corta a imagem quase inteira."

## Problem

No **modo de edição** de personagem (formulário GM de criar/editar NPC), a caixa do **retrato** tem **tamanho fixo** e **corta quase toda a imagem** — o mesmo tipo de defeito já corrigido na vista expandida do menu (057), mas no diálogo de edição. O GM precisa ver (e confirmar após upload) o retrato de forma legível, sem a caixa “partir” o diálogo ou o ecrã.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver o retrato completo ao editar o NPC (Priority: P1)

O GM abre o formulário de criar ou editar personagem, vê ou carrega um retrato, e a área da imagem mostra o retrato **inteiro e reconhecível**, com a caixa a acompanhar a proporção da imagem em vez de uma faixa baixa que corta quase tudo.

**Why this priority**: Pedido directo; bloqueia validação visual do upload/edição.

**Independent Test**: Abrir edição de um NPC com retrato alto; confirmar que a face/figura não fica reduzida a uma faixa cortada; após upload de nova imagem, a caixa ajusta-se.

**Acceptance Scenarios**:

1. **Given** o diálogo de editar/criar NPC com retrato já definido, **When** o GM olha a caixa do retrato, **Then** a imagem aparece completa e reconhecível (sem corte fixo que esconda quase toda a figura).
2. **Given** o diálogo aberto, **When** o GM faz upload de um retrato com proporção diferente, **Then** a caixa **redimensiona** (shrink-to-fit) para essa proporção, dentro de limites seguros.
3. **Given** diálogo sem retrato ainda, **When** o GM vê o placeholder de upload, **Then** a área de drop/upload permanece utilizável e clara (não precisa ser enorme; após haver imagem, aplica-se o sizing do retrato).

---

### User Story 2 - Editar sem partir o diálogo / ecrã (Priority: P1)

O retrato no formulário MUST NOT destruir o layout: o diálogo continua utilizável (campos Nome, Descrição, Facção, Status, Guardar/Cancelar acessíveis); sem overflow horizontal da página; imagens muito altas respeitam um tecto de altura.

**Why this priority**: Mesma restrição de 057 (“não partir o ecrã”), aplicada ao contexto modal.

**Independent Test**: Editar NPC com retrato alto em desktop e viewport estreita; scroll do diálogo/corpo é aceitável; botões de acção alcançáveis.

**Acceptance Scenarios**:

1. **Given** viewport desktop, **When** o diálogo mostra um retrato alto, **Then** a altura do bloco de imagem **não excede ~50% da viewport** e o resto do formulário permanece acessível (scroll no corpo do diálogo se necessário).
2. **Given** viewport estreita, **When** o mesmo diálogo está aberto, **Then** não há scroll horizontal da página; o modal permanece utilizável.
3. **Given** um retrato abaixo do tecto de altura, **When** mostrado, **Then** a caixa fica **justa à imagem** (shrink-to-fit) — não reserva sempre a altura máxima vazia.

---

### User Story 3 - Upload e edição continuam a funcionar (Priority: P2)

O slot continua **editável** (clique / arrastar para enviar retrato); guardar e cancelar o formulário comportam-se como hoje. A vista do menu expandido (057) MUST NOT regredir.

**Why this priority**: Corrigir visual sem perder o fluxo GM.

**Independent Test**: Upload de um ficheiro de retrato no diálogo; URL actualiza; Guardar persiste; menu expandido ainda mostra bem (057).

**Acceptance Scenarios**:

1. **Given** o diálogo de NPC, **When** o GM faz upload de uma imagem válida, **Then** o retrato no formulário actualiza e permanece legível com o novo sizing.
2. **Given** alterações guardadas, **When** o jogador/GM expande o NPC no menu, **Then** o comportamento de 057 (expandido) mantém-se.

---

### Edge Cases

- Retrato muito largo: escala à largura útil do diálogo; altura acompanha até ao máximo.
- Retrato muito alto: limitado a ~50% da viewport; shrink-to-fit abaixo disso.
- Sem retrato: placeholder de upload; sem caixa “partida” vazia gigante.
- Falha de carga da imagem: não deixa buraco de layout destrutivo.
- Formulário de **Local** (imagem com altura fixa semelhante): **fora de âmbito** desta feature — o pedido é o retrato no modo de edição de personagem; Locais podem ser uma follow-up.
- Mapa, pins, Calcular rota: não afectados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: No diálogo de criar/editar NPC (modo de edição GM), a caixa do retrato MUST **ajustar-se à proporção da imagem** (shrink-to-fit), em vez de uma altura fixa que corte quase toda a imagem.
- **FR-002**: Com imagem presente, a altura da caixa MUST ser a da imagem já escalada à largura útil do diálogo, limitada pelo máximo de FR-003 — MUST NOT reservar sempre a altura máxima com bandas vazias quando a imagem é mais baixa.
- **FR-003**: A altura do bloco de retrato no diálogo MUST respeitar no máximo **~50% da altura da viewport**.
- **FR-004**: O retrato MUST permanecer contido na largura útil do diálogo (sem overflow horizontal da página).
- **FR-005**: Campos do formulário e acções Guardar/Cancelar MUST permanecer acessíveis com o retrato visível (scroll do corpo do diálogo permitido).
- **FR-006**: O slot MUST continuar a permitir upload/substituição de retrato (comportamento editável actual).
- **FR-007**: Personagens sem retrato MUST mostrar o placeholder de upload de forma clara, sem layout partido.
- **FR-008**: A correcção do menu expandido (057) MUST NOT regredir; mapa/rotas MUST NOT mudar.

### Key Entities

- **Retrato no formulário de edição**: Área de preview + upload no diálogo NPC.
- **Limite seguro**: Largura do diálogo; altura máxima ~50vh; shrink-to-fit.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em revisão visual no diálogo de edição com ≥1 retrato alto, 100% dos casos mostram a figura reconhecível (não uma faixa que corta “quase toda” a imagem).
- **SC-002**: Altura do bloco de retrato no diálogo ≤ ~50% da viewport; formulário permanece operável no smoke.
- **SC-003**: Em viewport ~375px e desktop, abrir o diálogo com retrato **nunca** introduz scroll horizontal na página.
- **SC-004**: Spot-check: upload ainda funciona; expandido no menu (057) intacto.

## Assumptions

- “Modo de edição” = diálogo GM de criar/editar **NPC** (`NpcFormDialog` / equivalente), não o digitizer nem edição de Locais.
- Alinhar política visual com 057: shrink-to-fit + tecto ~50vh.
- Placeholder sem imagem pode manter uma altura mínima razoável para a zona de drop; o shrink-to-fit aplica-se quando há `retrato_url`.
- Não se exige lightbox fullscreen no editor.

## Out of Scope

- Formulário de imagem de Local (altura fixa semelhante) — follow-up opcional.
- Redesign completo do diálogo admin.
- Alterações ao mapa, rotas ou pins.
- Recorte/crop tool no upload.
