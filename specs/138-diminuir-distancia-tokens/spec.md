# Feature Specification: Diminuir a distância entre tokens no grafo de Relações

**Feature Branch**: `138-diminuir-distancia-tokens`
**Backlog**: [BKLG-027](../../docs/v2/backlog.md#bklg-027-design--diminuir-a-distância-entre-os-tokens-no-grafo-de-relações-em-30)
**Created**: 2026-09-24
**Status**: Draft

**Input**: User description: "Diminua a distância entre os tokens em 30%."

**Decision source**: causa raiz confirmada no item `BKLG-027` do backlog.

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; ajuste de layout visual sobre dados já carregados, sem rota nova.
- Testes primeiro: UI de polimento — Constitution II permite validação só por quickstart manual (visual).
- Produção legada: N/A.
- Simplicidade: ajusta a constante-base de espaçamento já existente, preservando os fatores relativos (compacto/esparso) já calibrados em specs anteriores (086-089).
- i18n: N/A.
- Migrações: N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tokens mais próximos no grafo (Priority: P1)

Como mestre ou jogador, quero que os tokens de personagens no grafo de Relações fiquem mais próximos entre si (cerca de 30% menos distantes que hoje), pra que o grafo ocupe menos espaço e seja mais fácil de visualizar de uma vez.

**Why this priority**: É o pedido central — a distância atual entre tokens é considerada excessiva pelo usuário.

**Independent Test**: Abrir o grafo de Relações com vários personagens (visão geral, sem seleção) e comparar visualmente a distância entre tokens adjacentes antes/depois da mudança, confirmando uma redução perceptível e consistente.

**Acceptance Scenarios**:

1. **Given** o grafo de Relações em visão geral (nenhum personagem selecionado), **When** os tokens são posicionados, **Then** a distância entre tokens adjacentes é reduzida em torno de 30% em relação ao valor atual.
2. **Given** um personagem selecionado (visão de foco, com anel interno de vínculos diretos), **When** os tokens são reposicionados ao redor dele, **Then** a mesma redução proporcional de distância se aplica, preservando os ajustes já existentes pra quando há poucos (esparso) ou muitos (compacto) vínculos diretos.
3. **Given** a nova distância reduzida, **When** o grafo é exibido com o maior número de personagens/vínculos esperado numa campanha, **Then** os tokens continuam sem se sobrepor uns aos outros.

### Edge Cases

- Poucos personagens no grafo (ex.: 2-3): a redução de distância não deve fazer os tokens se sobreporem ou ficarem colados um no outro.
- Muitos personagens no grafo (dezenas): a redução de distância não deve fazer o grafo parecer mais confuso a ponto de dificultar identificar quem é quem — o objetivo é compactar, não amontoar.
- Zoom mínimo/máximo already existentes: a redução de distância entre tokens não deve exigir mudança nos limites de zoom já configurados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A distância-base entre tokens adjacentes no grafo MUST ser reduzida em aproximadamente 30% em relação ao valor atual, tanto na visão geral quanto na visão de foco.
- **FR-002**: Os ajustes proporcionais já existentes pra quando um personagem selecionado tem poucos (esparso) ou muitos (compacto) vínculos diretos MUST continuar se aplicando sobre a nova distância-base reduzida, não sendo descartados.
- **FR-003**: Em nenhuma quantidade de personagens/vínculos esperada numa campanha os tokens MUST se sobrepor uns aos outros após a redução.

### Key Entities

Não aplicável — ajuste de constante de layout visual; nenhuma entidade nova.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A distância entre tokens adjacentes na visão geral do grafo é, em média, cerca de 30% menor que a distância atual.
- **SC-002**: Nenhum caso de sobreposição visual entre tokens é observado em grafos com o maior número de personagens/vínculos testado.
- **SC-003**: Os casos de anel compacto (muitos vínculos diretos) e esparso (poucos vínculos diretos) continuam visualmente distintos entre si após a redução, não convergindo pro mesmo espaçamento.

## Assumptions

- "30%" é aplicado à constante-base de espaçamento (usada tanto na visão geral quanto como base da visão de foco); o valor final exato pode ser ajustado durante o planejamento/implementação com checagem visual, desde que a redução resultante fique próxima de 30% e não cause sobreposição.
- Os fatores relativos já calibrados em specs anteriores (anel compacto, anel esparso) continuam sendo aplicados sobre a nova base — esta mudança não reabre a calibração desses fatores, só a distância-base sobre a qual eles operam.
