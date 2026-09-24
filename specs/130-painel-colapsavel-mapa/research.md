# Research: MapSidePanel colapsável no desktop

Sem `[NEEDS CLARIFICATION]` — modelo de interação já fechado no brainstorming que originou a spec. Este documento registra o que mudou de entendimento ao reconferir o código durante o planejamento.

## Decisão 1 — O trabalho real está no CSS de desktop, não em reescrever a lógica de expandir

**Decisão**: adicionar `[data-expanded='false']`/`='true'` na regra `@media (min-width: 861px)` de `MapSidePanel.css`, em vez de reescrever o estado `expanded` do zero.

**Racional**: confirmado que `MapPage.tsx` e `RelacoesPage.tsx` já têm `expanded` + `setExpanded(true)` disparado por `onFocus` da busca e por handlers de seleção (7 e 5 pontos de chamada, respectivamente). O CSS de desktop hoje é estático (`width: 372px` sempre), ignorando `data-expanded` — só o `@media (max-width: 860px)` lê o atributo. A lacuna real é visual, não de estado.

**Alternativas consideradas**: reescrever o gerenciamento de estado do zero num hook compartilhado (`useCollapsiblePanel`) — descartado por desproporcional; as três páginas já têm o padrão (estado local + `setExpanded`), só precisa completar a metade que falta (colapsar de volta) em cada uma, não centralizar prematuramente.

## Decisão 2 — Falta lógica de auto-colapsar (FR-004); implementar como estado de foco + efeito

**Decisão**: cada página ganha um estado `searchFocused` (ou equivalente pro formulário, na Rota) e um efeito que chama `setExpanded(false)` quando `!searchFocused && <nada selecionado>`.

**Racional**: hoje `setExpanded` só é chamado com `true` em toda a base — não existe nenhum caminho de volta automático, só o toggle manual do grabber (mobile). Um efeito combinando os dois sinais (foco da busca E seleção) evita o bug óbvio de "colapsar no blur mesmo com algo selecionado" — importante, porque a spec (Edge Case) exige que selecionar algo mantenha expandido independente da busca.

**Alternativas consideradas**: colapsar direto no `onBlur` do campo de busca, sem checar seleção — rejeitado, quebraria o caso "selecionei um pino, depois cliquei fora da busca" (painel fecharia mostrando o detalhe por um instante e sumindo, contrariando a User Story 2).

## Decisão 3 — Rota não tem campo de busca livre; o gatilho equivalente é o formulário/seleção de rota

**Decisão**: em `RotaPage`, o "foco expande" do FR-002 se aplica aos campos do formulário De/Para (via `RoutePlannerPanel`); a seleção de uma opção de rota (`onSelectIndex`) já chama `setExpanded(true)` e continua funcionando como gatilho de seleção (equivalente ao FR-003).

**Racional**: confirmado em `RotaPage.tsx` — o `head` do painel ali é sempre o formulário do planejador (`RoutePlannerPanel`), não uma busca livre como nas outras duas telas. Não existe, hoje, um "campo de busca" pra focar. Tratar os campos do formulário como o equivalente funcional evita inventar uma busca que não faz sentido nesse contexto (planejamento é sempre dirigido, não exploratório — ponto já levantado na discussão do `BKLG-016`).

**Alternativas consideradas**: adicionar um campo de busca genérico só pra Rota ficar visualmente igual — rejeitado, contradiz a própria natureza da tela e não foi pedido.
