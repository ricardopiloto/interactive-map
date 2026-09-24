# Feature Specification: Exibição da imagem do personagem no painel de detalhe (Relações)

**Feature Branch**: `137-imagem-retrato-painel-detalhe`
**Backlog**: [BKLG-026](../../docs/backlog/backlog.md#bklg-026-bugdesign--exibição-da-imagem-do-personagem-no-painel-de-detalhe-relações-desproporcional)
**Created**: 2026-09-24
**Status**: Draft

**Input**: User description: "Ajuste a exibição da imagem do personagem na descrição (print)." — print anexado mostra o retrato exibido pequeno e centralizado, com a moldura tracejada de placeholder visível nas laterais.

**Decision source**: causa raiz confirmada no item `BKLG-026` do backlog.

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; ajuste visual de CSS sobre um componente já existente, sem rota nova.
- Testes primeiro: UI de polimento — Constitution II permite validação só por quickstart manual.
- Produção legada: N/A.
- Simplicidade: replica o padrão de exibição já usado e validado noutro contexto do mesmo componente (`ImageSlot`), em vez de criar uma solução nova.
- i18n: N/A — nenhuma copy nova.
- Migrações: N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Retrato do personagem preenche o painel de detalhe corretamente (Priority: P1)

Como mestre ou jogador, ao ver o retrato de um personagem no painel de detalhe do grafo de Relações, quero que a imagem preencha o espaço disponível de forma proporcional, sem sobrar moldura tracejada de placeholder visível nas laterais.

**Why this priority**: É o pedido central — hoje a imagem aparece pequena e "espremida" no centro do painel, com a moldura de placeholder aparecendo como se a imagem não tivesse carregado direito.

**Independent Test**: Abrir o painel de detalhe de um personagem com retrato cadastrado (de proporção retrato, ou seja, mais alto que largo) e confirmar visualmente que a imagem preenche a largura do painel sem sobrar moldura tracejada visível nas laterais.

**Acceptance Scenarios**:

1. **Given** um personagem com retrato cadastrado, **When** o usuário abre o painel de detalhe dele, **Then** a imagem é exibida preenchendo a largura disponível do painel, mantendo sua proporção original sem distorcer.
2. **Given** um retrato com proporção diferente da área de exibição (ex.: muito mais alto que largo, ou muito mais largo que alto), **When** exibido no painel de detalhe, **Then** a imagem não é cortada nem distorcida — o espaço extra (se houver) é mínimo e não aparenta erro de carregamento.
3. **Given** um personagem sem retrato cadastrado, **When** o usuário abre o painel de detalhe dele, **Then** nenhuma imagem/placeholder de retrato é exibido (mesmo comportamento condicional já existente hoje).

### Edge Cases

- Retrato muito largo e baixo (paisagem): não deve estourar a altura máxima do painel nem ficar cortado.
- Retrato quadrado: deve exibir sem distorção, preenchendo a largura disponível.
- Painel de detalhe em tela estreita (mobile): a imagem deve continuar proporcional, sem quebrar o layout do painel.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A imagem do retrato no painel de detalhe MUST preencher a largura disponível do painel, sem sobrar moldura de placeholder visível nas laterais quando há retrato carregado.
- **FR-002**: A proporção original da imagem MUST ser preservada — sem distorcer (esticar/espremer) pra caber no espaço.
- **FR-003**: A altura máxima de exibição do retrato no painel de detalhe MUST continuar limitada (não deve permitir que uma imagem muito alta empurre o resto do conteúdo do painel pra fora de vista sem necessidade).

### Key Entities

Não aplicável — ajuste visual sobre exibição de imagem (`Personagem.retrato_url`) já existente; nenhuma entidade nova.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em cem por cento dos personagens com retrato cadastrado, a imagem exibida no painel de detalhe preenche a largura do painel, sem moldura de placeholder visível nas laterais.
- **SC-002**: Nenhuma imagem aparece distorcida (esticada fora da proporção original) no painel de detalhe, em nenhum caso testado.

## Assumptions

- O ajuste reaproveita o padrão de `width: 100%; height: auto; object-fit: contain` já usado e validado nos formulários de NPC/Local (mesmo componente `ImageSlot`), adaptado ao `max-height` já existente no painel de detalhe (hoje 140px) — não é uma solução visual nova.
- O comportamento condicional de "sem retrato → nenhuma imagem exibida" já existente é preservado, sem mudança de escopo.
