# Feature Specification: Vínculos Sort by Name

**Feature Branch**: `072-vinculos-sort-name`

**Created**: 2026-08-12

**Status**: Implemented

**Input**: User description: "Na tela de relações, ao selecionar um usuário, ajuste a ordenação da lista de vínculos [RelacoesDetailPanel]: Adicione ordenação crescente por nome do personagem"

**Depends on**: ficha ao seleccionar em Relações (`066`, detalhe; `071` duas vias)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Lista de vínculos em ordem A→Z (Priority: P1)

O utilizador selecciona um personagem na tela **Relações** e abre a ficha (painel direito). Em **Vínculos (n)**, os nomes dos outros personagens aparecem em **ordem alfabética crescente** (A → Z), para encontrar alguém mais depressa do que na ordem actual (ex.: ordem de criação / id).

**Why this priority**: É o único pedido — ordenação previsível na lista da ficha.

**Independent Test**: Seleccionar um personagem com ≥3 vínculos cujos nomes não estejam já ordenados por acaso; confirmar A→Z pelo nome mostrado.

**Acceptance Scenarios**:

1. **Given** um personagem com vários vínculos visíveis (ex. Brother Tomas com ≥3), **When** o utilizador o selecciona, **Then** a lista **Vínculos** mostra os nomes dos outros em ordem crescente (A→Z).
2. **Given** a mesma ficha, **When** compara dois nomes consecutivos na lista, **Then** o de cima vem antes do de baixo no alfabeto (ignorando maiúsculas/minúsculas de forma natural para português, quando o sistema o permitir).
3. **Given** um personagem com **0** ou **1** vínculo, **When** selecciona, **Then** o comportamento permanece correcto (lista vazia ou um único item; sem erro).

---

### Edge Cases

- Nome em falta / personagem removido (rótulo tipo “Personagem removido”): esses itens ficam **no fim** da lista (depois dos nomes válidos), para não misturar com a ordenação A→Z.
- Acentos e cedilha (ex. “Irmã”, “Capitã”): ordenação usa comparação local adequada ao português (locale da UI), não só código Unicode cru, se a plataforma o permitir.
- Empate de nome (dois com o mesmo nome): ordem estável e determinística (ex. por id do vínculo); não há requisito de UI extra.
- Duas vias / notas / botões GM: a ordenação afecta **só a ordem das linhas**; o conteúdo de cada linha (tipo, “vê-te como…”, editar) não muda.
- Fora de escopo: ordenar o grafo, a coluna esquerda, ou por tipo de vínculo; controlo de ordenação pelo utilizador; ordenação descendente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na ficha de detalhe de Relações, a lista **Vínculos** MUST apresentar as entradas ordenadas por **nome do outro personagem** em ordem **crescente** (A→Z).
- **FR-002**: A ordenação MUST basear-se no nome **visível** na linha (o vizinho), não no tipo de vínculo nem na nota.
- **FR-003**: Entradas sem personagem resolvido (nome de fallback) MUST aparecer depois das entradas com nome válido.
- **FR-004**: A ordenação MUST NOT alterar filtros de visibilidade (jogador vs GM / público) nem o conteúdo de cada vínculo.
- **FR-005**: O sistema MUST NOT exigir acção extra do utilizador para aplicar esta ordem (sempre activa ao abrir a ficha).

### Key Entities

- **Lista de vínculos da ficha**: linhas do painel ao seleccionar um personagem; cada linha identifica o outro personagem pelo nome.
- **Nome do vizinho**: texto usado para ordenar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 3 personagens com ≥3 vínculos cada, **100%** das listas na ficha estão em ordem A→Z pelo nome do vizinho.
- **SC-002**: Um observador localiza um nome conhecido no meio da lista em menos de **5 segundos** (lista ordenada vs ordem arbitraria anterior).
- **SC-003**: **0** regressões no conteúdo das linhas (tipo, nota, duas vias, acções GM) após a mudança de ordem.

## Assumptions

- Superfície: apenas `RelacoesDetailPanel` (ficha ao seleccionar em `/relacoes`).
- Locale de comparação: português (`pt`), case-insensitive.
- Sem UI de “ordenar por…” — a ordem fixa A→Z é suficiente.
