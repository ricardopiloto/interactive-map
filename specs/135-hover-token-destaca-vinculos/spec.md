# Feature Specification: Hover no token do personagem destaca seus vínculos (Relações)

**Feature Branch**: `135-hover-token-destaca-vinculos`
**Backlog**: [BKLG-024](../../docs/v2/backlog.md#bklg-024-design--hover-no-token-do-personagem-grafo-de-relações-não-destaca-os-vínculos-dele)
**Created**: 2026-09-24
**Status**: Draft

**Input**: User description: "No mouse hover sobre o token do personagem no mapa de relações, nós temos que dar um breve destaque em todos os bonds que ele tem."

**Decision source**: causa raiz confirmada no item `BKLG-024` do backlog.

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; mudança de UI sobre dados já carregados na tela, sem rota nova.
- Testes primeiro: UI de polimento — Constitution II permite validação só por quickstart manual.
- Produção legada: N/A.
- Simplicidade: reaproveita o mecanismo de destaque por `hoveredId`/`previewId` já implementado e usado hoje pela lista lateral — só adiciona o gatilho de hover no token do grafo.
- i18n: nenhuma copy nova.
- Migrações: N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hover no token destaca os vínculos dele (Priority: P1)

Como mestre ou jogador, ao passar o mouse sobre o token de um personagem no grafo de Relações, quero ver os vínculos dele brevemente destacados, pra identificar rápido quem se conecta com quem sem precisar clicar/selecionar.

**Why this priority**: É o pedido central — hoje o hover no token não tem nenhum efeito visual, apesar do grafo já ter esse destaque disponível (usado hoje só pela lista lateral).

**Independent Test**: Passar o mouse sobre um token no canvas do grafo (sem clicar) e confirmar que os vínculos daquele personagem ficam visualmente destacados (mesmo destaque já visto ao passar o mouse sobre o nome dele na lista lateral); tirar o mouse de cima e confirmar que o destaque desaparece.

**Acceptance Scenarios**:

1. **Given** o grafo de Relações com vários personagens e vínculos visíveis, **When** o usuário passa o mouse sobre o token de um personagem (sem clicar), **Then** os vínculos diretos daquele personagem ficam destacados, com o restante do grafo levemente esmaecido — mesmo efeito já usado ao passar o mouse sobre o nome dele na lista lateral.
2. **Given** um token com o destaque de hover ativo, **When** o usuário move o mouse pra fora do token (sem clicar em nada), **Then** o destaque desaparece e o grafo volta ao estado normal.
3. **Given** um personagem já selecionado (clicado) no grafo, **When** o usuário passa o mouse sobre um token diferente, **Then** o comportamento de hover não deve quebrar nem substituir de forma confusa o destaque de seleção já ativo — a seleção clicada continua sendo a referência principal.

### Edge Cases

- Hover no próprio token já selecionado: não deve causar nenhum efeito estranho (duplo destaque, flicker) — o destaque de seleção já cobre esse caso.
- Hover rápido passando por vários tokens em sequência (mouse em movimento): o destaque deve acompanhar o token atual sob o cursor, sem "travar" no anterior.
- Personagem sem nenhum vínculo: hover no token dele não destaca nada (nenhum vínculo pra destacar), sem erro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Passar o mouse sobre o token de um personagem no canvas do grafo MUST destacar os vínculos diretos daquele personagem, usando o mesmo mecanismo visual já usado pelo hover na lista lateral de personagens.
- **FR-002**: Tirar o mouse do token MUST remover o destaque imediatamente.
- **FR-003**: O destaque por hover no token MUST usar o mesmo estado/mecanismo já existente (reaproveitado, não duplicado) que hoje só é acionado pela lista lateral.

### Key Entities

Não aplicável — efeito visual de hover sobre dados (`Personagem`/`Vinculo`) já existentes; nenhuma entidade nova.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cem por cento dos hovers sobre um token no canvas do grafo produzem o mesmo destaque visual já visto hoje ao passar o mouse sobre o nome do personagem na lista lateral.
- **SC-002**: O destaque desaparece em cem por cento dos casos assim que o mouse sai do token, sem depender de nenhuma outra ação.

## Assumptions

- "Breve destaque" reaproveita o efeito visual de foco (`previewId`/`graph-node--preview`, esmaecimento das arestas não relacionadas) já implementado e usado hoje pela lista lateral — não é um efeito novo, só um gatilho novo pro efeito existente.
- Não há delay artificial (debounce) especificado — o destaque acompanha o hover em tempo real, mesmo comportamento já usado pela lista lateral.
