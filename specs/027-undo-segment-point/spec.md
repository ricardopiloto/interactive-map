# Feature Specification: Desfazer Último Ponto do Segmento (Botão Direito)

**Feature Branch**: `027-undo-segment-point`  
**Created**: 2026-08-03  
**Status**: Draft  
**Input**: User description: "Para a funcionalidade de traçar novo segmento, vamos implementar uma melhoria, enquanto o usuário estiver traçando o novo segmento, se ele clicar com o botão direito, ele cancela o ultimo ponto feito no seguimento."

## Clarifications

### Session 2026-08-03

- Q: Com só a origem escolhida (sem pontos intermédios), o que faz o botão direito? → A: Limpa a origem e mantém o modo Traçar segmento
- Q: Botão direito em cima de um nó existente durante o traçado? → A: Desfaz o último ponto do rascunho (igual ao clique no mapa vazio)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Desfazer o último ponto ao traçar (Priority: P1)

Como Mestre na Rede de rotas, enquanto traço um novo segmento, quero clicar com o **botão direito** para remover o **último ponto** que acabei de colocar, sem abandonar o modo “Traçar segmento” nem apagar segmentos já guardados.

**Why this priority**: Corrige erros de clique sem recomeçar o segmento do zero; fluxo de digitalização mais seguro e rápido.

**Independent Test**: Entrar em Traçar segmento → escolher origem → colocar ≥1 ponto intermédio → botão direito → o último intermédio desaparece; o resto do rascunho permanece.

**Acceptance Scenarios**:

1. **Given** o Mestre está a traçar um segmento com origem escolhida e pelo menos um ponto intermédio, **When** clica com o botão direito sobre o mapa **ou sobre um nó**, **Then** o ponto intermédio mais recente é removido e o rascunho continua ativo.
2. **Given** o mesmo rascunho com vários pontos intermédios, **When** clica botão direito várias vezes, **Then** os pontos são removidos um a um, do mais recente para o mais antigo.
3. **Given** um rascunho em curso, **When** o Mestre usa o botão direito, **Then** o menu de contexto do browser **não** aparece sobre o mapa (o gesto é consumido pela app).
4. **Given** segmentos já guardados na rede, **When** o Mestre desfaz pontos do rascunho atual, **Then** nenhum segmento já salvo é alterado ou apagado.

---

### User Story 2 - Desfazer quando só a origem está escolhida (Priority: P2)

Como Mestre, se já escolhi o nó de origem mas ainda não coloquei pontos intermédios (nem fechei no destino), quero que o botão direito **limpe a origem** do rascunho para eu poder escolher outro início, sem sair do modo Traçar segmento.

**Why this priority**: Completa o “desfazer” até ao estado vazio do rascunho; evita ficar preso numa origem errada.

**Independent Test**: Traçar segmento → clicar num nó de origem → botão direito → origem deixa de estar selecionada; modo Traçar segmento continua ativo.

**Acceptance Scenarios**:

1. **Given** origem selecionada e **zero** pontos intermédios, **When** botão direito no mapa, **Then** a origem do rascunho é cancelada (volta ao estado “escolha a origem”).
2. **Given** modo Traçar segmento ativo sem origem, **When** botão direito, **Then** nada muda de forma destrutiva (sem erro; modo permanece).

---

### Edge Cases

- Botão direito fora do mapa / sobre controlos da UI fora da área de traçado (toolbar, listas laterais): comportamento normal da página.
- Botão direito **sobre um nó** na área de traçado, com rascunho ativo: **desfaz** o último ponto do rascunho (não fecha o segmento; o clique esquerdo no nó mantém o fecho/seleção atuais).
- Clique direito enquanto se grava/espera resposta de guardar: não deve corromper o estado; se o rascunho já foi limpo após gravar com sucesso, o direito não remove nada.
- Terminar o segmento (clique **esquerdo** no nó de destino / zona de fecho) continua a funcionar como hoje; o direito **não** grava nem fecha o segmento.
- Botão direito **não** remove nós ou segmentos já persistidos (isso continua a ser as ações explícitas de remover na lista/UI).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Enquanto o modo “Traçar segmento” estiver ativo e existir um rascunho com pelo menos um **ponto intermédio**, um clique com o **botão direito** na área de traçado (mapa vazio **ou nó**) DEVE remover apenas o ponto intermédio mais recente.
- **FR-002**: Cliques direitos repetidos DEVEM continuar a remover pontos intermédios na ordem inversa à da colocação até não restar nenhum.
- **FR-003**: Com origem escolhida e **sem** pontos intermédios, o botão direito na área de traçado (mapa **ou nó**) DEVE cancelar a origem do rascunho e manter o modo Traçar segmento ativo.
- **FR-004**: Com modo Traçar segmento ativo e sem origem, o botão direito NÃO DEVE alterar a rede guardada nem mostrar erro bloqueante.
- **FR-005**: O botão direito na área de traçado (incluindo nós) DEVE impedir o menu de contexto padrão do browser.
- **FR-006**: Desfazer pontos NÃO DEVE apagar, editar ou invalidar segmentos ou nós já guardados.
- **FR-007**: O gesto só se aplica durante o traçado de **novo** segmento (modo Traçar segmento); não altera o fluxo de colocar nós novos noutros modos, salvo se partilharem a mesma área sem rascunho (aí FR-004).
- **FR-008**: Botão direito sobre um nó **nunca** fecha nem grava o segmento; o fecho permanece exclusivo do clique esquerdo (ou gesto de fecho já existente).

### Key Entities

- **Rascunho de segmento**: Origem (nó existente) + lista ordenada de pontos intermédios ainda não guardados + (opcional) destino ao fechar.
- **Ponto intermédio**: Coordenada no mapa adicionada durante o traçado, ainda não persistida como parte de um segmento guardado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em ≥ 9 de 10 tentativas, um botão direito remove exatamente o último ponto intermédio (não vários de uma vez, não o destino já guardado).
- **SC-002**: Um Mestre consegue corrigir um clique errado e concluir o segmento sem reiniciar o modo Traçar segmento, em ≤ 30 segundos após o erro.
- **SC-003**: Em teste, o menu de contexto do browser **não** aparece na área do mapa em ≥ 9 de 10 cliques direitos durante o traçado.
- **SC-004**: Zero segmentos previamente guardados são removidos ou alterados só por uso do botão direito durante o rascunho.

## Assumptions

- “Cancelar o último ponto” = **desfazer** o último ponto do rascunho atual (intermédio ou, se não houver, a **origem**), sem abandonar o modo Traçar segmento (clarificação B).
- Aplica-se à vista Rede de rotas / digitalização de segmentos do Mestre.
- Clique esquerdo continua a adicionar pontos / fechar segmento como hoje.
- Não é obrigatório atalho de teclado (ex. Backspace) nesta entrega; pode ser evolução futura.
- Não há confirmação (“Tem a certeza?”) para desfazer um ponto — ação imediata e reversível só voltando a clicar o ponto.

## Out of Scope

- Histórico completo de desfazer/refazer (Ctrl+Z / Ctrl+Y) para várias ações além do rascunho atual.
- Desfazer após o segmento já ter sido guardado com sucesso.
- Remover segmentos ou nós persistidos via botão direito.
- Alterar zonas de fecho, snap ou zoom (023 / 022 / 026).
