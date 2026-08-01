# Feature Specification: Borda escura no pin do grupo

**Feature Branch**: `004-group-pin-border`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Adicione uma borda escura no pin do grupo"

## Clarifications

### Session 2026-08-01

- Q: Relação com a borda accent atual do ícone do grupo? → A: Substituir a borda accent por borda escura

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Grupo legível sobre o mapa (Priority: P1)

Um jogador (ou o GM) olha o mapa e distingue claramente o ícone do grupo porque ele tem uma **borda escura** ao redor da forma (bandeira ou brasão), contrastando com o fundo do mapa e com a cor de preenchimento do ícone.

**Why this priority**: É o único pedido da feature; melhora legibilidade imediata do marcador do grupo.

**Independent Test**: Abrir o Codex com posição do grupo visível e confirmar borda escura contínua em torno do ícone (ambos os formatos, se disponíveis).

**Acceptance Scenarios**:

1. **Given** o mapa com o ícone do grupo no formato bandeira, **When** o usuário observa o marcador, **Then** vê uma borda escura nítida ao redor da forma do grupo — **sem** borda accent (blurple) remanescente.
2. **Given** o ícone do grupo no formato brasão, **When** o usuário observa o marcador, **Then** a mesma borda escura está presente e legível, também sem borda accent.
3. **Given** o mapa com pins de locais e o ícone do grupo, **When** o usuário compara os marcadores, **Then** o grupo permanece distinguível dos pins de local e a borda escura não “some” sobre áreas claras ou escuras do mapa.

---

### Edge Cases

- Zoom alto/baixo: a borda permanece visível e proporcional (não some nem domina o ícone).
- Sem posição/grupo ainda não criado: nada a mostrar (comportamento atual inalterado).
- Legenda “Grupo”: a miniatura da legenda MUST usar a mesma borda escura (não accent).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O ícone do grupo no mapa MUST exibir uma borda escura ao redor de sua forma.
- **FR-002**: A borda escura MUST aplicar-se a ambos os formatos do grupo (bandeira e brasão).
- **FR-003**: A borda MUST ter contraste suficiente com o preenchimento do ícone para ser perceptível a olho nu em uso normal do mapa.
- **FR-004**: Pins de local e demais elementos do mapa MUST permanecer visualmente inalterados por esta feature (escopo limitado ao ícone do grupo).
- **FR-005**: A borda escura MUST **substituir** a borda accent anterior do ícone do grupo (não coexistir com ela).
- **FR-006**: A miniatura do grupo na legenda do mapa MUST usar a mesma borda escura.

### Key Entities

- **Ícone do grupo**: marcador de posição do grupo no mapa; formatos bandeira e brasão; agora com borda escura.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em revisão visual no mapa (desktop ou mobile), 100% dos formatos de grupo disponíveis mostram borda escura identificável sem zoom extremo.
- **SC-002**: Um avaliador confirma, em até 10 segundos, que o ícone do grupo tem borda escura (sem accent) e que os pins de local não mudaram de aparência por causa desta alteração.
- **SC-003**: Com zoom mínimo e máximo usuais do mapa, a borda do grupo continua visível (não desaparece por completo).
- **SC-004**: A legenda “Grupo” mostra miniatura com borda escura, alinhada ao ícone no mapa.

## Assumptions

- “Borda escura” significa contorno escuro (próximo de preto / fundo do tema), no mesmo papel visual da borda dos pins de local — **não** a cor de accent.
- A espessura da borda segue a proporção visual já usada em marcadores semelhantes no Codex (suficiente para ler, sem redesenhar o ícone).
- A borda accent do grupo é removida em favor da borda escura (decisão da sessão de clarificação).
- Não há mudança de dados, autenticação ou fluxos GM — apenas aparência do pin do grupo.
- Fora de escopo: alterar cor de preenchimento do grupo, forma dos pins de local, ou novas opções de estilo no painel GM.
