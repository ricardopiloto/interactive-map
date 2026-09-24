# Feature Specification: Filtro de tipo de vínculo passa a isolar/somar tipos ao clicar (Relações)

**Feature Branch**: `134-paridade-clique-filtro-detalhe`
**Backlog**: [BKLG-023](../../docs/backlog/backlog.md#bklg-023-bugdesign--filtro-do-painel-de-detalhe-relações-não-tem-paridade-de-clique-com-o-filtro-do-grafo-geral)
**Created**: 2026-09-24
**Status**: Implementado

**Input**: User description original: "Para os filtros quando eu tenho um personagem selecionado, o comportamento de double click, single click, tem que ser o mesmo de quando não estou com nenhum personagem selecionado."

**Correção de escopo (2026-09-24), feita ao vivo com o usuário depois de reproduzir o problema no ambiente de dev:** a paridade de clique entre os dois filtros (painel de detalhe vs. grafo geral) **já estava correta** — os dois já usavam exatamente a mesma mecânica (`useVinculoTipoChipClicks`: clique único com pausa antes de alternar, duplo-clique isola). O problema real, confirmado ao vivo nos dois filtros, não era falta de paridade — era que **o resultado do clique não correspondia à expectativa do usuário**: clicar num tipo (ex. "Ally") **removia** esse tipo do conjunto "todos ativos" (estado inicial), em vez de **mostrar só esse tipo**. Com um personagem que só tinha vínculo de um tipo, clicar nesse tipo fazia a lista inteira sumir ("nenhum vínculo visível") — o oposto do esperado. O usuário confirmou o comportamento desejado: "quando eu tenho um personagem selecionado e eu seleciono um filtro... deveria aplicar o filtro e dessa maneira eu veria apenas os tipos de relacionamento que eu filtrei."

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; mudança de UI sobre um filtro já existente, sem rota nova.
- Testes primeiro: UI de polimento — Constitution II permite validação só por quickstart manual.
- Produção legada: N/A.
- Simplicidade: os dois filtros (painel de detalhe e grafo geral) continuam compartilhando a mesma implementação (`useVinculoTipoChipClicks`), agora com a semântica corrigida — nenhum filtro novo/paralelo foi criado.
- i18n: nenhuma copy nova — só o comportamento e o estado inicial dos chips mudam.
- Migrações: N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clicar num tipo mostra só aquele tipo (Priority: P1)

Como mestre ou jogador, ao clicar num chip de tipo de vínculo (no painel de detalhe de um personagem selecionado, ou no filtro do grafo geral), quero ver **apenas** vínculos daquele tipo, não o oposto (tudo, menos aquele tipo).

**Why this priority**: É o pedido central e a causa raiz confirmada ao vivo — o comportamento anterior (clique remove o tipo clicado de um conjunto que começa "todo ativo") produzia o resultado oposto ao esperado, inclusive fazendo a lista sumir por completo quando o personagem só tinha vínculos de um único tipo.

**Independent Test**: Selecionar um personagem com vínculos de mais de um tipo, clicar num chip de tipo específico e confirmar que só os vínculos desse tipo aparecem; clicar num segundo chip e confirmar que os vínculos dos dois tipos aparecem juntos; clicar de novo nos dois pra desativá-los e confirmar que a lista volta a mostrar tudo.

**Acceptance Scenarios**:

1. **Given** um personagem selecionado com vínculos de mais de um tipo, sem nenhum filtro ativo, **When** o usuário clica num chip de tipo, **Then** a lista passa a mostrar somente vínculos daquele tipo, e o chip clicado fica com destaque visual de "ativo".
2. **Given** um filtro já ativo num tipo, **When** o usuário clica num segundo chip de tipo diferente, **Then** a lista passa a mostrar vínculos de **ambos** os tipos selecionados (filtro aditivo, não exclusivo a um único tipo).
3. **Given** um ou mais chips ativos, **When** o usuário clica em todos os chips ativos até desativar o último, **Then** o filtro volta ao estado "nenhum filtro" e a lista mostra todos os vínculos novamente — igual ao estado inicial.
4. **Given** o filtro do grafo geral (sem nenhum personagem selecionado), **When** o usuário repete os cenários 1-3 nos chips do grafo geral, **Then** o mesmo comportamento se aplica (paridade mantida entre os dois filtros).

---

### User Story 2 - Duplo-clique isola um tipo, substituindo qualquer seleção anterior (Priority: P2)

Como mestre ou jogador, quero um atalho pra pular direto pra "só esse tipo", mesmo já tendo outros tipos selecionados, sem precisar desativar um por um.

**Why this priority**: Comportamento secundário/atalho — já existia antes desta correção e continua fazendo sentido com a nova semântica; não é o caminho principal, mas vale preservar.

**Independent Test**: Com dois ou mais tipos já ativos no filtro, dar duplo-clique num terceiro chip (inativo) e confirmar que o filtro passa a mostrar só esse terceiro tipo, descartando a seleção anterior. Duplo-clicar de novo no mesmo chip (agora o único ativo) e confirmar que o filtro volta a "nenhum filtro" (mostra tudo).

**Acceptance Scenarios**:

1. **Given** dois tipos já ativos no filtro, **When** o usuário dá duplo-clique num terceiro tipo, **Then** o filtro passa a ter só esse terceiro tipo ativo, descartando os outros dois.
2. **Given** um único tipo ativo (isolado), **When** o usuário dá duplo-clique nesse mesmo tipo, **Then** o filtro volta a "nenhum filtro" (mostra todos os vínculos).

### Edge Cases

- Clique único seguido rapidamente de outro clique único em chips diferentes: cada clique respeita sua própria pausa de confirmação antes de alternar, sem interferir um no outro.
- Trocar de personagem selecionado: o filtro do painel de detalhe já reseta pra "nenhum filtro" ao trocar de pessoa (spec 133, via `key={personagem.id}`), cancelando qualquer clique pendente do personagem anterior.
- Personagem sem nenhum vínculo do(s) tipo(s) ativo(s) no filtro: mostra o estado vazio já existente, não um erro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O estado "nenhum filtro ativo" (conjunto vazio) MUST significar "mostrar todos os tipos" — não "não mostrar nada". Este é o estado inicial de ambos os filtros.
- **FR-002**: Clicar num chip de tipo inativo MUST adicioná-lo ao filtro (passando a restringir a exibição aos tipos no conjunto); clicar num chip já ativo MUST removê-lo do conjunto. Removendo o último tipo ativo, o filtro MUST voltar ao estado "nenhum filtro" (FR-001).
- **FR-003**: O filtro MUST ser aditivo — múltiplos tipos podem estar ativos simultaneamente, mostrando a união dos vínculos de todos eles.
- **FR-004**: Duplo-clique num chip MUST isolar exclusivamente aquele tipo (substituindo qualquer seleção anterior); duplo-clique no único tipo já isolado MUST voltar ao estado "nenhum filtro".
- **FR-005**: Um duplo-clique MUST cancelar o clique único pendente no mesmo chip (mecânica de delay já existente, inalterada).
- **FR-006**: O painel de detalhe e o filtro do grafo geral MUST continuar compartilhando exatamente a mesma mecânica de clique (paridade original do BKLG-023, preservada).
- **FR-007**: Trocar de personagem selecionado MUST cancelar qualquer interação de clique pendente do filtro do painel de detalhe.

### Key Entities

Não aplicável — mudança de comportamento sobre um filtro de UI já existente; nenhuma entidade nova.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com um único tipo ativado no filtro, cem por cento dos vínculos exibidos são desse tipo (nunca o oposto).
- **SC-002**: Ativar um segundo tipo sempre amplia a lista (união), nunca a restringe além do primeiro tipo.
- **SC-003**: Desativar todos os tipos sempre retorna à lista completa, sem exceção.
- **SC-004**: O comportamento é idêntico entre o filtro do painel de detalhe e o filtro do grafo geral, em cem por cento dos casos testados.

## Assumptions

- "Nenhum filtro ativo" é representado por um conjunto vazio, tanto no painel de detalhe quanto no grafo geral — não há mais um estado "todos os tipos explicitamente marcados como ativos" (que era a causa raiz da confusão original).
- Nenhuma mudança visual nos chips em si (cor, formato, rótulo) além do destaque de "ativo" já existente — só a semântica do que "ativo" significa muda.

## Implementação

- `frontend/src/components/relacoes/useVinculoTipoChipClicks.ts` — `soloOrRestoreTipo` (duplo-clique) passou a restaurar pra `new Set()` em vez de `new Set(VINCULO_TIPOS)`.
- `frontend/src/components/relacoes/vinculoDirection.ts` — `edgeMatchesTipos` ganhou `if (active.size === 0) return true` no topo (conjunto vazio = mostra tudo).
- `frontend/src/pages/RelacoesPage.tsx` — estado inicial de `activeTipos` (grafo geral) e `activeDetailTipos` (painel de detalhe) mudou de `new Set(VINCULO_TIPOS)` pra `new Set()`; o filtro `visibleVinculos` do painel de detalhe ganhou o mesmo early-return de conjunto vazio; a função `toggleDetailTipo` (que tinha um auto-restore especial ao esvaziar) foi removida — o painel de detalhe passou a usar o `defaultToggle` padrão do hook compartilhado, igual ao grafo geral.
- Verificado ao vivo (ambiente de dev): clique único isola, cliques em tipos adicionais somam (união), desativar todos volta a mostrar tudo — testado em ambos os filtros.
