# Proposal

## Why

O usuário reportou que a Linha do Tempo no modo "Por arcos" aparece "completamente fora de ordem". Investigação, confirmada com dados reais de uma campanha de produção (Crônicas de Saphyr), achou a causa exata: o comparador de ordenação em `frontend-v2/src/lib/timelineLayout.ts:69-77` ordena corretamente por data decrescente (mais nova primeiro) quando as datas são diferentes, mas o **critério de desempate entre sessões do mesmo mês está invertido** — usa `a.sessao.numero - b.sessao.numero` (crescente) em vez de `b.sessao.numero - a.sessao.numero` (decrescente), contrariando a própria regra "mais nova no topo" que o resto do comparador implementa.

Como o número da sessão cresce junto com a cronologia real de jogo (sessão 9 aconteceu antes da 12, que aconteceu antes da 13, etc.), duas sessões do mesmo mês deveriam ficar com a de número maior (mais recente) no topo — mas hoje fica a de número menor. Com uma campanha real de 21 sessões e datas que se repetem no mesmo mês com frequência (vários pares do tipo "sessão X e sessão Y no mesmo mês"), isso produz um zig-zag visível: cada grupo de mês fica na posição certa entre si, mas a ordem *dentro* de cada grupo empatado fica invertida — exatamente o "completamente fora de ordem" relatado.

**Confirmado que não é uma regressão de `linha-tempo-arcos-conectores`** (implementada mais cedo nesta sessão): aquela change documenta explicitamente, em `design.md`, que **não muda a ordem de exibição de nenhum dos 3 modos da Linha do Tempo**, e de fato nunca toca a linha 76 de `timelineLayout.ts` — só adiciona lógica de `branchOrigins`/`sequentialPairs` mais abaixo no arquivo. Este bug já existia antes, só nunca foi notado com um elenco de sessões pequeno o bastante pra não ter empates de mês.

**Achado adicional preocupante**: o único teste que já exercita um empate de data (`timelineLayout.test.ts`, `"branches equal dates and leaves undated sessions last by number"`) **trava o comportamento errado como esperado** — sua asserção (`[1, 3, 2, 4]`) assume a ordem crescente que é o próprio bug. Corrigir o comparador exige também corrigir essa asserção, não só preservá-la.

## Atualização: sessões sem data quebram o agrupamento por arco

O desempate de mesmo mês foi corrigido e validado (ver tasks 1.1-1.4, implementadas), mas o usuário reportou que a ordenação "ainda está totalmente fora" depois dessa correção, com um exemplo concreto: "não faz sentido o evento 9 ser anterior ao evento 16". Investigação — confirmada de novo com dados reais e com o comportamento visualmente observado em `http://.../c/wfrp/linha-do-tempo` (mesmo sem login de GM, qualquer visitante vê o problema) — achou a causa raiz de verdade, mais profunda que o desempate: a campanha real tem **21 sessões, das quais só 10 têm evento com data** (11 sem nenhuma); hoje (`timelineLayout.ts:69-77`), toda sessão sem data é jogada pra um bloco único no **fim de toda a lista**, ordenado só por número — sem relação nenhuma com o arco a que pertence.

Isso quebra exatamente a garantia que a Requirement já arquivada promete ("agrupando as sessões por arco... ordenadas pela data real") quando um arco tem uma mistura de sessões com e sem data (o caso comum, não a exceção, nesta campanha real): o arco "A Voz na Neblina de Altdorf" tem 5 sessões (13-17), mas só 13 e 17 têm data — as sessões 14, 15 e 16 (sem data) ficam arrancadas do bloco do próprio arco e empurradas pro fim da lista inteira, misturadas com sessões sem data de **outros arcos completamente diferentes**. Resultado visual real: a sessão 9 (com data, Julho, arco "O Coração de Grosslin") aparece visivelmente *acima* da sessão 16 (sem data, mas do arco "A Voz na Neblina de Altdorf", cujas sessões datadas são de Agosto — mais recentes que Julho) — o oposto do que faz sentido, já que o arco de 16 é cronologicamente mais recente que o de 9.

**A correção do desempate (já implementada) continua certa e necessária, mas não é suficiente sozinha** — o problema real e maior é este: sessão sem data precisa continuar fazendo parte do bloco visual do seu arco, posicionada pela data de referência do próprio arco (não jogada pra um limbo genérico no fim).

## What Changes (atualização)

- Calcular, pra cada arco, uma **data de referência** = a data mais recente entre as sessões *datadas* desse arco (reaproveitando o mesmo `key(e)` já usado por sessão, só agregado por arco). Essa é a chave usada **só pra decidir a posição de exibição** de uma sessão sem data — o campo `row.date` da sessão continua `null` (sem data inventada, como a spec já exige; `ranges`/bifurcação/`sequentialPairs`/tempo decorrido continuam só considerando sessões com data real, inalterados).
- Uma sessão sem data, cujo arco tem pelo menos uma sessão com data, passa a ordenar como se estivesse na posição da data de referência do arco — na prática, cai dentro do bloco contíguo do próprio arco, desempatada pelas mesmas regras já corrigidas (número de sessão decrescente) junto com as sessões datadas do mesmo arco.
- Uma sessão sem data cujo arco **não tem nenhuma** sessão datada (ou sem arco nenhum) continua sem nenhuma data de referência disponível — permanece no bloco genérico do fim, ordenada por número, exatamente como hoje (não há nenhuma informação de data em lugar nenhum pra usar; isso é esperado, não um bug).

## What Changes

- Inverter o critério de desempate em `timelineLayout.ts:76`, de `a.sessao.numero - b.sessao.numero` pra `b.sessao.numero - a.sessao.numero` — duas sessões do mesmo mês passam a ficar com a de número maior (mais recente na cronologia real) acima da de número menor, consistente com o resto do comparador.
- **Sem mudança** no ramo de sessões sem data (`a.date === null`/`b.date === null`, linhas 70-73) — essas continuam ordenadas crescente por número, como já é hoje e como a spec já documenta ("sessões sem data ficam ao final, ordenadas pelo número da sessão"), sem implicar "mais nova primeiro" (não há data pra isso fazer sentido).
- Corrigir a asserção do teste existente que hoje trava o comportamento errado (`timelineLayout.test.ts`, caso `"branches equal dates..."`).
- Adicionar cobertura de teste nova especificamente para o cenário real que expôs o bug: duas sessões do **mesmo arco** empatadas no mesmo mês (o caso real — sessões 18/21 do mesmo arco, ambas em 2511/10), que hoje não tem nenhum teste dedicado.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `linha-tempo-por-arcos`: a Requirement já arquivada "Modo 'Por arcos' na Linha do Tempo" diz que sessões ficam "ordenadas pela data do evento associado... com as sessões mais recentes acima das mais antigas", mas nunca especificou o critério de desempate entre sessões do mesmo mês — esta proposta adiciona esse critério explicitamente (mesmo mês → sessão de número maior acima), fechando a lacuna que permitiu o bug.

## Impact

- **Frontend (`frontend-v2/`)**: `src/lib/timelineLayout.ts` (um sinal invertido numa linha), `src/lib/timelineLayout.test.ts` (asserção corrigida + teste novo).
- **Backend**: nenhuma mudança — ordenação é 100% client-side, sobre dados já existentes.
- **Dados/migração**: nenhuma.
- **Outras changes de Linha do Tempo**: `linha-tempo-arcos-conectores` (implementada antes desta) não precisa de nenhum ajuste — as curvas de bifurcação e os conectores tracejados são calculados a partir das mesmas `rows`, já ordenadas, e continuam corretos independente da direção do desempate (não dependem de qual sessão empatada fica visualmente acima da outra).
