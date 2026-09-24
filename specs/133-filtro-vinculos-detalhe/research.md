# Research: Filtro de tipo de vínculo no painel de detalhe (Relações)

Sem `[NEEDS CLARIFICATION]` — a decisão de UX (filtro próprio, não compartilhado) já foi confirmada com o usuário antes desta spec existir. Este documento registra as decisões técnicas de planejamento.

## Decisão 1 — Filtro reseta ao trocar de personagem via `key={personagem.id}`, não via `useEffect`

**Decisão**: no call site de `PersonagemDetailBody` (`RelacoesPage.tsx:578`), adicionar `key={personagem.id}`.

**Racional**: confirmado no código — `PersonagemDetailBody` é invocado hoje **sem** `key`, então trocar de personagem selecionado só re-renderiza o componente com novas props; um `useState` local de filtro sobreviveria à troca (violando FR-004). Adicionar `key={personagem.id}` faz o React desmontar/remontar o componente a cada pessoa diferente — um jeito idiomático e mais simples de garantir "sempre começa limpo" do que escrever um `useEffect` pra sincronizar o filtro com o `personagem.id` manualmente.

**Alternativas consideradas**: subir o estado do filtro pro componente pai (`RelacoesPage`) e resetá-lo num `useEffect` atado a `selectedId` — funciona, mas é mais código pra um resultado idêntico ao que `key` já resolve de graça, e afasta o estado do componente que realmente o usa.

## Decisão 2 — Vínculo duas-vias com tipos diferentes por sentido: visível se qualquer sentido bater

**Decisão**: ao filtrar, um vínculo entra na lista se `tipoFromPerspective(v, personagem.id)` **ou** o tipo do outro sentido estiver no conjunto de tipos ativos do filtro.

**Racional**: confirmado no código de `PersonagemDetailBody` já existente — a linha de um vínculo já mostra os dois sentidos quando são diferentes (`showPrimary`/`showReturn`, `myTipo`/`theirTipo`). Esconder a linha inteira só porque um dos dois sentidos não bate com o filtro esconderia informação real que a linha já mostra hoje; contar como visível se qualquer sentido bater preserva o comportamento atual de exibição da linha, só decidindo se ela aparece ou não.

**Alternativas consideradas**: filtrar só pelo tipo "principal" (`myTipo`, a perspectiva do personagem selecionado) — mais simples, mas esconderia vínculos onde o outro lado é do tipo procurado (ex.: "Fulano me vê como Amizade, mas eu vejo Fulano como Romance" — filtrar por "Romance" devia mostrar essa linha, já que ela é sobre um vínculo de Romance, mesmo que não seja o lado do personagem selecionado).

## Decisão 3 — Reaproveitar `VINCULO_TIPOS`/`getVinculoTipoLabel`/`vinculoStyle`, sem widget novo de design system

**Decisão**: o controle de filtro usa os mesmos dados que os chips do filtro do grafo geral já usam (`VINCULO_TIPOS` pra listar, `getVinculoTipoLabel` pro rótulo, `vinculoStyle(tipo).color` pra cor) — só o estado (`Set<VinculoTipo>`) é local e novo.

**Racional**: mantém consistência visual com o filtro do grafo (mesmas cores, mesmos rótulos) sem duplicar a fonte de verdade dos tipos/cores — já resolvida centralmente em `vinculoStyles.ts`.
