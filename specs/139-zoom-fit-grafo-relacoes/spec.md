# Feature Specification: Botão "1:1" ajusta a tela pra mostrar todos os tokens (Relações)

**Feature Branch**: `139-zoom-fit-grafo-relacoes`
**Backlog**: [BKLG-028](../../docs/v2/backlog.md#bklg-028-bugdesign--botão-11-no-grafo-de-relações-não-ajusta-a-tela-para-mostrar-todos-os-tokens)
**Created**: 2026-09-24
**Status**: Draft

**Input**: User description: "A função 1:1 no mapa de relações deveria ajustar a tela para que todos os tokens fiquem visíveis."

**Decision source**: causa raiz confirmada no item `BKLG-028` do backlog.

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; mudança de comportamento de um controle de UI já existente, sem rota nova.
- Testes primeiro: UI de polimento — Constitution II permite validação só por quickstart manual.
- Produção legada: N/A.
- Simplicidade: cálculo geométrico local (bounding box dos tokens visíveis), sem dependência nova.
- i18n: o rótulo do botão MUST continuar literalmente "1:1" (pt-BR e en) — só o comportamento do clique muda, o texto não. Nenhuma copy nova é necessária.
- Migrações: N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Botão ajusta a tela pra mostrar todos os tokens (Priority: P1)

Como mestre ou jogador, ao clicar no botão que hoje reseta o zoom pra "1:1", quero que a tela se ajuste automaticamente (zoom e posição) pra que todos os tokens visíveis no grafo caibam na área visível, em vez de simplesmente voltar pro zoom padrão.

**Why this priority**: É o pedido central — hoje o botão faz um reset literal de zoom/posição, que pode deixar tokens fora da área visível se o grafo for grande ou se o usuário tiver navegado/dado zoom antes.

**Independent Test**: Com um grafo grande o suficiente pra que nem todos os tokens caibam na tela no zoom padrão, dar zoom/pan manualmente pra qualquer posição e depois clicar no botão; confirmar que todos os tokens visíveis (não ocultos por filtro) ficam dentro da área visível após o clique.

**Acceptance Scenarios**:

1. **Given** um grafo com tokens espalhados além da área visível atual, **When** o usuário clica no botão de ajustar a tela, **Then** o zoom e a posição do grafo mudam de forma que todos os tokens atualmente visíveis (não ocultos por filtro/busca) ficam dentro da área visível.
2. **Given** um grafo pequeno o bastante pra já caber inteiro na área visível no zoom padrão, **When** o usuário clica no botão, **Then** o resultado ainda mostra todos os tokens visíveis, sem cortar nenhum (pode manter o zoom padrão ou ajustar livremente, desde que todos caibam).
3. **Given** um filtro ativo escondendo parte dos personagens do grafo, **When** o usuário clica no botão de ajustar a tela, **Then** o ajuste considera apenas os tokens atualmente visíveis (não os escondidos pelo filtro).

### Edge Cases

- Um único token visível no grafo: o ajuste deve centralizá-lo de forma razoável, sem aplicar um zoom exageradamente próximo.
- Nenhum token visível (ex.: filtro esconde todos): o botão não deve quebrar — mantém o estado atual ou volta a um estado neutro razoável.
- Grafo com tokens muito dispersos (poucos personagens, mas bem afastados uns dos outros por causa de vínculos): o ajuste deve ainda assim caber todos, mesmo que o zoom resultante fique bem reduzido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O botão MUST continuar rotulado "1:1" (o texto não muda) — só o efeito do clique muda: ao ser clicado, MUST ajustar zoom e posição pra que todos os tokens atualmente visíveis no grafo caibam dentro da área visível, em vez de resetar pro zoom literal 1:1.
- **FR-002**: O cálculo de "quais tokens considerar" MUST usar apenas os tokens atualmente visíveis (respeitando filtros/busca ativos), não a lista completa de personagens da campanha.
- **FR-003**: O ajuste de zoom resultante MUST respeitar os limites mínimo/máximo de zoom já existentes no grafo.
- **FR-004**: Com zero ou um único token visível, o botão MUST continuar funcionando sem erro, produzindo um resultado visualmente razoável (não quebrar nem aplicar zoom inválido).

### Key Entities

Não aplicável — mudança de comportamento de um controle de UI existente sobre posições já calculadas; nenhuma entidade nova.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Após clicar no botão, cem por cento dos tokens atualmente visíveis no grafo ficam dentro da área visível da tela.
- **SC-002**: O botão nunca produz um erro ou estado quebrado, independente do número de tokens visíveis (incluindo zero ou um).

## Assumptions

- O rótulo do botão continua sendo "1:1" — decisão confirmada com o usuário em 2026-09-24 (correção explícita a uma primeira versão desta spec, que erroneamente deixava a mudança do texto em aberto). O nome não descreve mais literalmente o comportamento (não é mais um reset de zoom exato), mas o texto não muda mesmo assim.
- "Caber na tela" considera a área do canvas do grafo disponível no momento do clique (respeitando o tamanho atual do painel/janela).
