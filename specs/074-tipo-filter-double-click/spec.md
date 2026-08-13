# Feature Specification: Tipo Filter Double-Click

**Feature Branch**: `074-tipo-filter-double-click`

**Created**: 2026-08-12

**Status**: Implemented

**Input**: User description: "Vamos melhorar a filtragem em RelacoesSideColumn (Tipos de vínculo). Eu quero que ao dar double click em um dos itens, ele filtre somente aquele item, e caso ele de um double click novamente, ele remova qualquer filtro e traga todos os tipos de vínculo."

**Depends on**: Relações side column tipo chips (`066` / rede de relações)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Isolar um tipo com duplo clique (Priority: P1)

Na coluna esquerda de **Relações**, em **Tipos de vínculo**, o utilizador dá **duplo clique** num chip (ex. Romance). A rede passa a mostrar **apenas** vínculos desse tipo; os outros chips ficam inactivos. Um segundo **duplo clique** no **mesmo** chip restaura **todos** os tipos activos — equivalente a “sem filtro de tipo”.

**Why this priority**: É o único pedido — atalho rápido para foco num tipo e regresso ao panorama completo.

**Independent Test**: Duplo clique em Romance → só romance na rede; duplo clique outra vez no mesmo chip → todos os tipos de volta.

**Acceptance Scenarios**:

1. **Given** todos (ou vários) tipos activos, **When** o utilizador faz duplo clique em **Romance**, **Then** só Romance fica activo e a rede reflecte apenas vínculos desse tipo (respeitando as regras de match já existentes, incl. duas vias).
2. **Given** o filtro isolado em Romance, **When** o utilizador faz duplo clique outra vez em **Romance**, **Then** todos os seis tipos ficam activos de novo.
3. **Given** o filtro isolado em Romance, **When** o utilizador faz duplo clique em **Aliado**, **Then** o isolamento passa para Aliado (só Aliado activo), sem precisar de restaurar todos primeiro.

---

### User Story 2 - Clique simples continua a alternar (Priority: P2)

O **clique simples** em cada chip mantém o comportamento actual: liga/desliga aquele tipo de forma independente (permite combinações personalizadas). O duplo clique não substitui esse modo; é um atalho à parte.

**Why this priority**: Evita regressão para quem já usa multi-selecção.

**Independent Test**: Clique simples em dois chips desliga/liga como hoje; depois usar duplo clique e confirmar que o isolador ainda funciona.

**Acceptance Scenarios**:

1. **Given** todos activos, **When** o utilizador clica uma vez em Inimizade, **Then** Inimizade desliga e os restantes ficam como estavam.
2. **Given** um conjunto misto de chips, **When** faz duplo clique num tipo, **Then** esse tipo fica sozinho activo (substitui o conjunto misto pelo isolamento).

---

### Edge Cases

- Duplo clique não deve deixar o estado “zero tipos activos” no caminho do isolamento/restauração (isolamento = exactamente um; restauração = todos).
- Se o utilizador, com clique simples, desligar todos os chips manualmente, o comportamento actual da rede nesse caso extremo não é o foco desta feature; o atalho de duplo clique MUST NOT introduzir esse estado por si.
- “Isolar selecção” (checkbox) e a busca de personagem continuam independentes do filtro de tipos.
- Fora de escopo: gestos long-press; menu de contexto; atalho de teclado dedicado (salvo o que o browser já faça no botão); alterar a legenda.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Em cada chip de **Tipos de vínculo**, um **duplo clique** MUST activar **somente** esse tipo (desactivar os outros).
- **FR-002**: Um **duplo clique** no chip que já é o **único** activo MUST reactivar **todos** os tipos de vínculo.
- **FR-003**: Um **duplo clique** noutro chip enquanto um tipo está isolado MUST passar o isolamento para esse outro tipo.
- **FR-004**: O **clique simples** MUST continuar a alternar apenas o chip clicado (comportamento actual de multi-selecção).
- **FR-005**: A rede e a listagem filtrada MUST actualizar de imediato conforme o conjunto de tipos activos após duplo clique ou clique simples.
- **FR-006**: A feature MUST limitar-se à secção **Tipos de vínculo** da coluna lateral de Relações (`RelacoesSideColumn`).

### Key Entities

- **Chip de tipo**: controlo por natureza de vínculo (Aliado, Amizade, Inimizade, Romance, Família, Conhecido).
- **Conjunto de tipos activos**: quais naturezas estão a ser mostradas na rede.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em **3 em 3** tentativas, um observador isola um tipo com duplo clique e confirma na rede em menos de **5 segundos**.
- **SC-002**: Um segundo duplo clique no mesmo chip restaura os **6** tipos activos em **100%** das tentativas de teste.
- **SC-003**: Após a mudança, o clique simples ainda permite combinações multi-tipo (**0** regressões observáveis nesse fluxo).

## Assumptions

- “Remover qualquer filtro” = voltar a **todos** os tipos activos (não “nenhum tipo”).
- O segundo duplo clique de restauração é no **mesmo** chip isolado; duplo clique noutro chip muda o isolamento (US1.3).
- Clique simples e duplo clique partilham o mesmo controlo visual; o sistema distingue o gesto.
- UI em português; sem emoji.
