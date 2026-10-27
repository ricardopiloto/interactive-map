# Proposal

## Why

Na Linha do Tempo da campanha WFRP (`/c/1/wfrp/linha-do-tempo`, modo "Por arcos"), o arco "A Corrupção do Grande Hospício" (sessões 22, 23 e 24) aparece jogado para o final da lista, depois até de arcos muito mais antigos. A causa: nenhuma das três sessões desse arco tem um evento datado próprio — o único evento que narra essa visita ("O Expurgo do Grande Hospício") ficou registrado na sessão 21, que pertence a outro arco. `layoutArcs` (`frontend-v2/src/lib/timelineLayout.ts`) só consegue posicionar um arco pela data quando pelo menos uma das suas sessões tem evento datado; quando nenhuma tem, o arco inteiro fica sem data de referência e a regra atual — especificada em `linha-tempo-por-arcos` — manda empurrá-lo para baixo de tudo, ordenado só pelo número da sessão. Isso quebra a leitura cronológica real da campanha (confirmada contra o resumo narrativo do mestre): as sessões 22-24 são a continuação direta da mesma visita ao hospício da sessão 21 e deveriam aparecer entre o arco anterior (18-21) e o seguinte (25-28).

Esse comportamento é hoje documentado e intencional na spec (não é um bug de implementação silencioso), mas a regra escolhida — "sem data inventada, ordenar por número lá no fim" — produz um resultado que contraria a cronologia real sempre que um arco inteiro fica sem nenhuma sessão datada. Esta mudança revisa essa regra especificamente para esse caso.

## What Changes

- Quando um arco não tem nenhuma sessão com evento datado, o modo "Por arcos" passa a posicionar as sessões desse arco usando, como referência de ordenação, a data da sessão datada mais próxima por número de sessão (buscando nos dois sentidos a partir do intervalo de números do arco), em vez de empurrar o arco inteiro para o fim da lista.
- Em caso de empate de distância entre uma sessão datada de número menor e outra de número maior, prevalece a de número menor (decisão determinística).
- Essa data de referência serve só para a posição na lista e para o desempate por data igual já existente; ela **não** passa a ser exibida como data da sessão (continua mostrando o indicador de "sem data") e **não** entra no cálculo de colunas, bifurcações ou texto de tempo decorrido — mantém a mesma exclusão que já existe hoje para a data herdada por uma sessão sem data dentro do próprio arco.
- O comportamento para sessões que não pertencem a nenhum arco **não muda**: continuam no fim da lista, ordenadas por número, sem data inventada.
- O modo "Chronological" (que não usa `layoutArcs`) e o modo "By discovery" não são afetados.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `linha-tempo-por-arcos`: a regra de posicionamento de um arco sem nenhuma sessão datada muda de "fim da lista, por número de sessão" para "posição herdada da sessão datada mais próxima por número de sessão, entre arcos", com a mesma exclusão de colunas/tempo decorrido já aplicada à data herdada dentro de um arco.

## Impact

- `frontend-v2/src/lib/timelineLayout.ts`: função `layoutArcs`, cálculo do `arcAnchor`.
- `frontend-v2/src/lib/timelineLayout.test.ts`: um teste existente ("keeps undated sessions with their dated arc above older arcs and leaves unanchored rows last") documenta o comportamento antigo para este exato cenário e precisa ser atualizado.
- `frontend-v2/src/components/codex/ArcTimeline.tsx`: nenhuma mudança esperada (consome `rows` já ordenadas; `row.date` continua null como hoje).
- Nenhuma mudança de backend, schema ou dado de campanha.
