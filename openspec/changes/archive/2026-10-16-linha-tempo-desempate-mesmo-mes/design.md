# Design

## Context

Ver `proposal.md` - Why pra causa raiz completa, confirmada com dados reais (campanha "Crônicas de Saphyr", cópia local de produção). Trecho relevante de `frontend-v2/src/lib/timelineLayout.ts:69-77`, como está hoje:

```ts
rows.sort((a, b) =>
  a.date === null
    ? b.date === null
      ? a.sessao.numero - b.sessao.numero
      : 1
    : b.date === null
      ? -1
      : b.date - a.date || a.sessao.numero - b.sessao.numero,
);
```

`b.date - a.date` (datas diferentes) já está certo — decrescente, mais nova primeiro. O termo depois do `||` só entra em ação quando `b.date - a.date === 0` (mesmo mês): `a.sessao.numero - b.sessao.numero` é crescente, na direção oposta da regra que o próprio termo anterior implementa.

Os dois ramos de `a.date === null`/`b.date === null` (linhas 70-73, sessões sem data) não são afetados por esta mudança — já usam `a.sessao.numero - b.sessao.numero` crescente, e é isso que a spec arquivada já pede ("sessões sem data ficam ao final, ordenadas pelo número da sessão", sem ligação com "mais nova primeiro", já que não há data pra comparar).

## Atualização: sessões sem data precisam ficar dentro do bloco do próprio arco

**Confirmado com dados reais e observação visual direta** (`http://.../c/wfrp/linha-do-tempo`, modo "Por arcos", visível mesmo sem login de GM): a campanha real tem 21 sessões, só 10 com evento datado — os outros 11 ramos de `a.date === null`/`b.date === null` descritos acima jogam TODA sessão sem data pra um bloco único no fim da lista inteira, ordenado só por número, **sem nenhuma relação com o arco**. Isso quebra o agrupamento por arco quando um arco tem sessões com e sem data misturadas (o caso comum nesta campanha, não a exceção): o arco "A Voz na Neblina de Altdorf" tem sessões 13-17, mas só 13 e 17 têm data (Agosto) — as sessões 14/15/16 (sem data) são arrancadas do bloco do arco e empurradas pro fim, misturadas com sessões sem data de outros arcos. Resultado real observado: a sessão 9 (datada, Julho, arco "O Coração de Grosslin") aparece acima da sessão 16 (sem data, arco "A Voz na Neblina de Altdorf" — cujas datadas são de Agosto, mais recente que Julho) — o oposto do esperado.

### 3. Data de referência por arco, só pra posicionar sessões sem data
**Decisão**: antes do `rows.sort`, calcular um `Map<number, number>` (`arcAnchor`) de `arco_id` pra **a data mais recente (`Math.max`) entre as sessões datadas desse arco**, usando o mesmo `dates` map já calculado por sessão. Trocar a chave de ordenação (não o campo `row.date` em si, que continua `null` quando a sessão não tem data — nenhuma data inventada) por uma função `sortKey(row)`:

```ts
const sortKey = (row: TimelineRow): number | null =>
  row.date ?? (row.arcId !== null ? (arcAnchor.get(row.arcId) ?? null) : null);

rows.sort((a, b) => {
  const ka = sortKey(a);
  const kb = sortKey(b);
  if (ka === null) return kb === null ? a.sessao.numero - b.sessao.numero : 1;
  if (kb === null) return -1;
  return kb - ka || b.sessao.numero - a.sessao.numero;
});
```

- Sessão **com** data: `sortKey` = a própria data — comportamento idêntico ao de hoje, nenhuma mudança.
- Sessão **sem** data, arco **com** pelo menos uma sessão datada: `sortKey` = a data mais recente desse arco — cai dentro do bloco contíguo do próprio arco, desempatada (mesmo "mês"/data de referência) pela mesma regra já corrigida (Decision 1, número decrescente) junto com as sessões datadas do mesmo arco.
- Sessão sem data, arco sem nenhuma sessão datada (ou sem arco nenhum, `arcId === null`): `sortKey` = `null` — continua no bloco genérico do fim, ordenada por número, exatamente como hoje (não há informação de data em lugar nenhum pra usar; esperado, não um bug).
**Por quê**: é a menor mudança que resolve o problema real — `row.date` (usado por `ranges`, bifurcação, `sequentialPairs`, tempo decorrido) permanece inalterado e correto (`null` quando não há data real), só a *posição de exibição* passa a considerar a data de referência do arco. Como `ranges`/colunas/`branchOrigins` dependem só de `row.date !== null` (nunca da nova `sortKey`), e a ordem relativa entre sessões *datadas* do mesmo arco não muda (duas datas diferentes nunca empatam por `arcAnchor`), **a lógica de bifurcação em si (quais colunas abrem, pra qual arco) fica exatamente igual à de hoje** — só a posição das sessões sem data no array `rows` muda, o que só afeta a leitura visual de "previous"/tempo decorrido pra essas linhas (ver Risk abaixo) e nada mais.
**Alternativa considerada**: usar a data **mais antiga** do arco (`Math.min`) em vez da mais recente (`Math.max`) como âncora. Rejeitada — com arcos sequenciais sem sobreposição (o caso real desta campanha), min ou max dão o mesmo resultado de ordem entre arcos; mas `Math.max` é mais consistente com a convenção "mais nova no topo" já usada em todo o resto do comparador (a referência de um arco deveria ser a evidência mais recente de quando ele esteve ativo, não a mais antiga).

### 4. Corrigir o rastreamento de "sessão anterior" pra não ser resetado por uma sessão sem data no meio do bloco
**Achado ao implementar a Decision 3**: a Decision 3 passa a intercalar sessões sem data **entre** sessões datadas do mesmo arco no array `rows` (ex. no arco "A Voz na Neblina de Altdorf", a ordem final fica 17 (datada) → 16, 15, 14 (sem data) → 13 (datada)) — isso nunca acontecia antes (sessões sem data sempre vinham depois de **todas** as datadas). O cálculo de `previous` em `layoutArcs` (perto do fim da função, `const last = new Map(...)`, usado por `ArcTimeline.tsx` pra montar o texto "· 2 meses" / "· No mesmo período" ao lado de cada sessão) faz `last.set(row.arcId, row.date)` **sempre**, inclusive quando `row.date` é `null` — então, ao passar por uma sessão sem data do mesmo arco, o "último valor conhecido" daquele arco é resetado pra `null`, e a **próxima sessão datada do mesmo arco perde seu tempo decorrido** em relação à sessão datada anterior de verdade (ex. 13 perderia o "· No mesmo período" em relação a 17, porque 16/15/14 passaram no meio e resetaram o rastreamento).
**Decisão**: trocar `last.set(row.arcId, row.date)` (incondicional) por uma atualização condicional — só sobrescrever o "último valor conhecido" quando `row.date !== null`:
```ts
const previous = last.get(row.arcId);
if (row.date !== null) last.set(row.arcId, row.date);
return { ...row, previous };
```
Assim, uma sessão sem data só "passa por cima" sem apagar o rastreamento; a próxima sessão datada do mesmo arco continua recebendo a data da sessão datada anterior de verdade, não importa quantas sessões sem data existam entre elas.
**Por quê**: sem essa correção, a Decision 3 resolveria o agrupamento visual mas introduziria uma regressão nova e visível (texto de tempo decorrido sumindo entre sessões datadas que antes o mostravam corretamente) — bastante fácil de passar despercebido numa verificação rápida, já que o sintoma (ausência de texto) é mais sutil que posição errada na lista.

## Goals / Non-Goals (atualização)

**Novo Goal**: uma sessão sem data, cujo arco tem pelo menos uma sessão datada, SHALL aparecer dentro do bloco contíguo do próprio arco (posicionada pela data de referência do arco), não num bloco genérico desconectado do arco no fim da lista. O texto de tempo decorrido entre duas sessões datadas do mesmo arco SHALL continuar sendo exibido corretamente mesmo quando sessões sem data desse arco ficarem posicionadas entre elas.

## Goals / Non-Goals

**Goals:**
- Duas sessões com a mesma data (ano/mês) SHALL ficar com a de número maior (mais recente na cronologia real de jogo) acima da de número menor — consistente com a regra geral "mais nova no topo".
- Não alterar o comportamento já correto: ordenação entre datas diferentes, posição de sessões sem data. O cálculo de `branchOrigins`/`sequentialPairs` em si (a lógica de quais colunas abrem e por quê) não muda — mas ver Risk abaixo: quando o empate é entre sessões de **arcos diferentes**, o resultado concreto de `branchOrigins` pode trocar de lado, porque esse cálculo é sensível à ordem de `rows`.

**Non-Goals:**
- Qualquer mudança na forma como a data de uma sessão é calculada (`key(e)`, `Math.min` sobre eventos vinculados) — já está correta (usa a data mais antiga entre os eventos da sessão, como a spec já pede).
- Qualquer mudança nos outros 2 modos da Linha do Tempo (Cronológico, Por descoberta) — nenhum dos dois usa este comparador (são ordenados separadamente, já confirmado hoje mais cedo durante `linha-tempo-arcos-conectores`).
- Qualquer mudança em `linha-tempo-arcos-conectores` (curvas de bifurcação, conectores tracejados) — não depende da direção do desempate entre duas sessões de mesma data, só de quais arcos/colunas existem.

## Decisions

### 1. Inverter só o termo de desempate, não reescrever o comparador
**Decisão**: trocar `a.sessao.numero - b.sessao.numero` por `b.sessao.numero - a.sessao.numero` na linha 76, sem tocar em mais nada do comparador.
**Por quê**: é a menor mudança que corrige exatamente o comportamento errado identificado, sem risco de alterar os outros três ramos do `?:` (datas diferentes, sessão `a` sem data, sessão `b` sem data) que já estão corretos.
**Alternativa considerada**: reescrever o comparador inteiro de forma mais legível (ex. extrair uma função nomeada `compareRows`). Rejeitada por enquanto — aumentaria o diff sem necessidade pra corrigir um bug de uma linha; pode ser uma limpeza separada se o código for mexido de novo por outro motivo.

### 2. Corrigir a asserção do teste existente, não só adicionar um teste novo
**Decisão**: a asserção `[1, 3, 2, 4]` em `timelineLayout.test.ts`, caso `"branches equal dates and leaves undated sessions last by number"`, muda pra `[3, 1, 2, 4]` (`s(3, 2)` e `s(1, 1)` empatam no mesmo mês; com o desempate corrigido, a sessão de número maior — 3 — fica acima da 1).
**Por quê**: esse teste hoje passa *porque* trava o bug como comportamento esperado — deixá-lo como está depois da correção faria o teste falhar (o que é o resultado certo de ter achado um teste que encodava o bug), então a asserção precisa ser corrigida junto, não só "continuar passando".

## Risks / Trade-offs

- **Revisão de arquitetura encontrou um efeito colateral real, de escopo estreito, no cálculo de coluna/bifurcação (`branchOrigins`) pra empates entre arcos diferentes** (não afeta o bug motivador, que é um empate dentro do **mesmo** arco — sessões 18/21, ambas do arco "A Sombra do Grande Hospício"). O loop de atribuição de coluna em `timelineLayout.ts` (dentro de `layoutArcs`, depois do `rows.sort`) é guloso e sensível à ordem: pra cada arco, a primeira linha encontrada em `rows` já ordenada "reivindica" a coluna-tronco (sem curva de bifurcação), e a segunda é registrada em `branchOrigins` como originária da primeira. Hoje, com duas sessões de **arcos diferentes** empatadas no mesmo mês, a ordem de desempate decide qual arco é tronco e qual bifurca; invertendo o desempate (Decision 1), esse resultado troca de lado — não é "a sessão errada aparece", é "a curva de bifurcação passa a nascer do arco oposto ao de hoje", um efeito visual real, ainda que sem um critério documentado de qual dos dois lados é "o certo" (a spec nunca definiu isso — é um empate arbitrário de qualquer forma, só que arbitrário na direção oposta depois da correção).
  - **Aceito como efeito colateral esperado, não um bug a evitar**: como não há regra especificada pra decidir qual arco deveria ser tronco num empate de data entre arcos diferentes, não há uma resposta "certa" sendo trocada por uma "errada" — só uma escolha arbitrária trocando de lado. Mitigado exigindo cobertura de teste explícita pra esse cenário específico (task 1.4, atualizada) em vez de deixá-lo implícito/não verificado.

## Migration Plan

Não há migração de dados — ordenação é 100% calculada em tempo de render no frontend. Entrega é aditiva/corretiva, reversível trocando o sinal de volta sem efeito em dados.
