# Feature Specification: Remover destaque de hover na linha de vínculo (Relações)

**Feature Branch**: `136-remover-hover-linha-vinculo`
**Backlog**: [BKLG-025](../../docs/v2/backlog.md#bklg-025-design--remover-destaque-ao-passar-o-mouse-sobre-uma-linha-de-vínculo-grafo-de-relações)
**Created**: 2026-09-24
**Status**: Draft

**Input**: User description: "Remova o efeito de mouse hover ao passar sobre uma linha de relacionamento."

**Decision source**: causa raiz confirmada no item `BKLG-025` do backlog.

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; mudança de UI sobre um efeito visual já existente, sem rota nova.
- Testes primeiro: UI de polimento — Constitution II permite validação só por quickstart manual.
- Produção legada: N/A.
- Simplicidade: remoção de comportamento existente, sem substituir por nada novo.
- i18n: N/A — nenhuma copy é adicionada ou removida.
- Migrações: N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Linha de vínculo não reage ao hover (Priority: P1)

Como mestre ou jogador, ao passar o mouse sobre a linha de um vínculo no grafo de Relações, não quero ver nenhum efeito visual de destaque só por causa do hover — o rótulo do tipo deve aparecer apenas quando o vínculo já está em foco (por seleção), não ao simplesmente passar o cursor por cima da linha.

**Why this priority**: É o pedido central — o efeito de hover na linha hoje mostra um rótulo que o usuário não quer ver só de passar o mouse.

**Independent Test**: Passar o mouse sobre a linha de um vínculo sem selecionar nenhum personagem e confirmar que nada muda visualmente na linha (nenhum rótulo aparece, nenhuma mudança de espessura/opacidade); clicar num vínculo e confirmar que o comportamento de edição/seleção continua funcionando normalmente.

**Acceptance Scenarios**:

1. **Given** o grafo de Relações com vínculos visíveis, **When** o usuário passa o mouse sobre a linha de um vínculo que não está em foco/selecionado, **Then** nenhum efeito visual (rótulo, destaque, mudança de espessura) aparece só por causa do hover.
2. **Given** um vínculo já em foco (por seleção de um personagem relacionado a ele), **When** o usuário passa o mouse sobre a linha desse vínculo, **Then** o rótulo/destaque de foco continua aparecendo normalmente — esse comportamento (foco por seleção) não é afetado.
3. **Given** a linha de um vínculo, **When** o usuário clica sobre ela, **Then** o comportamento de clique (abrir edição do vínculo) continua funcionando exatamente como antes.

### Edge Cases

- Vínculo com linha dupla (pattern "double", duas vias): remover o hover deve valer pros dois traços da linha igualmente.
- Área de clique invisível mais larga que a linha visível (hit area): o clique continua funcionando normalmente mesmo sem o efeito de hover — só o efeito visual de passar o mouse é removido, não a capacidade de clicar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Passar o mouse sobre a linha de um vínculo MUST NOT produzir nenhum efeito visual (rótulo, destaque) que não esteja já presente por outro motivo (ex.: foco por seleção).
- **FR-002**: O rótulo do tipo de vínculo no meio da linha MUST continuar aparecendo quando o vínculo está em foco por seleção, independente de hover.
- **FR-003**: Clicar na linha de um vínculo MUST continuar acionando o comportamento de edição/seleção já existente, sem nenhuma mudança.

### Key Entities

Não aplicável — remoção de efeito visual sobre dados (`Vinculo`) já existentes; nenhuma entidade nova.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cem por cento dos hovers sobre uma linha de vínculo fora de foco não produzem nenhuma mudança visual.
- **SC-002**: Cem por cento dos cliques em linhas de vínculo continuam abrindo a edição, sem regressão.

## Assumptions

- "Remover o efeito de hover" cobre apenas o destaque/rótulo acionado por hover — não afeta o destaque por foco (seleção de personagem relacionado), que é um mecanismo diferente e deve continuar funcionando.
- Nenhum outro efeito de hover (cursor, tooltip do navegador) está em escopo — só o destaque visual customizado da aplicação.
