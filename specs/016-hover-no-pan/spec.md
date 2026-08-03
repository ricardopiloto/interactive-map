# Feature Specification: Hover no menu sem pan/zoom

**Feature Branch**: `016-hover-no-pan`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Ajuste o comportamento do mouse hover no menu lateral quando na aba de locais, atualmente o mouse hover está ativando o zoom:pan no pin, isso não pode acontecer, o mouse hover no menu lateral (na aba locais) deve ser apenas a animação de destaque do item no mapa, sem zoom:pan."

## Clarifications

### Session 2026-08-03

- Q: O que “sem zoom/pan” cobre no hover? → A: Mapa fixo (sem pan/zoom da vista); destaque do pin pode incluir escala/brilho local.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Percorrer a lista sem mover o mapa (Priority: P1)

Como jogador ou usuário na aba Locais, ao passar o mouse pelos nomes/cartões de locais no menu lateral, quero ver **apenas o destaque visual do pin correspondente no mapa**, sem que o mapa faça pan ou zoom — para eu poder varrer a lista sem perder a posição/zoom atuais da vista.

**Why this priority**: Corrige o comportamento indesejado relatado; hover não deve competir com o foco intencional (clique).

**Independent Test**: Fixar pan/zoom do mapa; passar o mouse por vários locais na aba Locais; o pin sob hover destaca-se; a posição e o nível de zoom do mapa permanecem os mesmos durante todo o hover.

**Acceptance Scenarios**:

1. **Given** o mapa está em uma posição e zoom estáveis, **When** o usuário passa o mouse sobre um local na aba Locais do menu, **Then** o pin correspondente recebe o destaque de hover (escala/brilho local permitidos) **e** a **vista** do mapa (pan/zoom da superfície) **não** muda.
2. **Given** o usuário move o mouse rapidamente por vários locais na lista, **When** cada hover ocorre, **Then** só o destaque do pin ativo muda; a **vista** do mapa permanece fixa (sem animações de pan/zoom da superfície por hover).
3. **Given** o usuário está com hover sobre um local, **When** ele sai o mouse da lista (sem clicar), **Then** o destaque de hover some e o pan/zoom da vista continuam iguais aos de antes do hover.

---

### User Story 2 - Clique continua focando; hover no item do menu intacto (Priority: P2)

Como usuário, quero que o clique no menu ou no pin continue podendo focar o mapa (comportamentos já entregues), e que o hover leve no cartão do menu (014) continue, desde que nenhum desses hovers dispare pan/zoom.

**Why this priority**: Evita regressão nos gestos de clique/foco e no feedback do item da lista.

**Independent Test**: Hover sem pan/zoom; em seguida clicar um local no menu — aí sim o foco pan/zoom ocorre; cartão do menu ainda mostra fundo sutil no hover.

**Acceptance Scenarios**:

1. **Given** hover não moveu o mapa, **When** o usuário **clica** um local no menu, **Then** o foco pan/zoom (menu → pin) continua ocorrendo como já especificado.
2. **Given** o usuário passa o mouse sobre um cartão de local, **When** observa o menu, **Then** o efeito de hover no item da lista (fundo sutil) permanece disponível.
3. **Given** o usuário clica um pin no mapa (modo jogador), **When** o foco ocorre, **Then** esse foco por **clique** não é removido por esta correção (só o hover fica sem pan/zoom).

---

### Edge Cases

- Hover enquanto um foco por clique ainda está animando: o hover MUST NOT iniciar um segundo pan/zoom; o destaque de hover pode coexistir visualmente com o pin selecionado conforme regras já existentes.
- Touch / sem hover: sem mudança obrigatória; clique permanece a via de foco.
- Lista vazia: nada a hover; mapa inalterado.
- Modo GM: se a lista de cartões Locais do jogador não estiver visível, esta regra aplica-se onde o hover de local no menu existir; o requisito crítico é: hover de local no menu **nunca** dispara pan/zoom.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao passar o mouse sobre um item de local na aba Locais do menu lateral, o sistema MUST destacar o pin correspondente no mapa (comportamento de destaque já existente).
- **FR-002**: O mesmo hover MUST NOT alterar pan nem zoom da **vista do mapa** (nenhuma animação nem salto da superfície do mapa causados pelo hover). Destaque **local** do pin (escala, brilho, anel) MAY permanecer.
- **FR-003**: Ao sair o mouse do item (sem hover em outro local), o destaque de hover do pin MUST ser removido sem alterar pan/zoom da vista.
- **FR-004**: Pan/zoom de foco MUST permanecer disponíveis apenas em gestos de **clique** já definidos (menu e/ou pin no mapa), não por hover.
- **FR-005**: O efeito de hover no cartão/item do menu (fundo sutil), quando aplicável, MUST NOT depender de pan/zoom do mapa.
- **FR-006**: Esta correção MUST NOT impedir a abertura do detalhe por clique.

### Key Entities

- **Destaque de hover do pin**: Estado visual temporário do pin ligado ao item sob o ponteiro no menu; distinto de seleção e de foco de mapa.
- **Foco de mapa**: Pan/zoom intencional disparado por clique (não por hover).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes manuais, após hover em ≥3 locais na aba Locais, pan e zoom da **vista do mapa** são indistinguíveis dos valores imediatamente anteriores ao primeiro hover (sem deslocamento perceptível da superfície). Destaque local do pin pode ocorrer.
- **SC-002**: Em 100% dos mesmos testes, o pin sob hover fica visualmente destacado em relação aos demais.
- **SC-003**: Em 100% dos testes, um clique no local no menu (após a correção) ainda consegue focar o pin com pan/zoom quando esse gesto de clique já existir no produto.
- **SC-004**: Hover sozinho não abre o detalhe em 100% dos testes.

## Assumptions

- “Sem zoom/pan” refere-se à **vista do mapa** (transform de pan/zoom da superfície), não ao destaque local do pin (escala/brilho).
- O destaque visual do pin no hover (feature 005) permanece desejado; o problema é pan/zoom da vista associado ao hover.
- Qualquer causa de movimento da vista no hover (ex.: foco indevido) deve ser eliminada: hover = só destaque.
- Clique no menu / no pin continua responsável por focar a vista.
- Sem mudança de dados persistidos nem de API.
