# Review — Desenvolvedor Fullstack

**Change:** fix-timeline-arco-sem-data (com a extensão: empate de data entre arcos sem intercalação e ligações para arco sem data)
**Data:** 2026-10-27
**Veredito geral:** Aprovado com ressalvas

## 1. Desenvolvimento do backend
Veredito: N/A
- Mudança só de frontend (`frontend-v2/src/lib/timelineLayout.ts`, possivelmente `components/codex/ArcTimeline.tsx`); sem API, banco, migração ou dado.

## 2. Desenvolvimento do frontend
Veredito: Atenção
- **A causa do "21 → 28" está confirmada.** Executei `layoutArcs` com os dados reais da campanha: o arco 5 (18–21) sai na coluna 1 com `branchOrigins{5 ← 7, fromDate = atDate = 30141}` porque as datas empatam (2511/10) com o arco 7, e o arco 6 (22–24) não entra em `ranges` nem em `sequentialPairs`. O único par sequencial existente é 5↔4. Isso bate com a descrição e com a Extensão do design. O trecho a alterar são os dois pontos: o conflito por `equalDates` no cálculo de `columns`/`branchOrigins` e o `arcsOverlapOrTie` (que só impede o par).
- **Dois testes de layout existentes fixam o comportamento antigo e vão mudar** (`timelineLayout.test.ts`): «branches equal dates and leaves undated sessions last by number» (arcos 1 e 2 com sessões 3 e 1, faixas disjuntas, espera colunas diferentes) e «orders same-month sessions across arcs and assigns the lower-numbered arc to the branch» (18 e 21 em arcos 1 e 2, espera `branchOrigins`). Pela nova regra ambos viram sequenciais. Listar os dois nas tasks 4.1/4.2 como atualização intencional, com a expectativa nova explícita. Os testes de `ArcTimeline.test.tsx` com `auto-branch` usam datas distintas e intercaladas (100/101/102; 100/110/101/105/103) e não devem mudar; confirmar na execução.
- **`ArcTimeline.tsx`.** O rótulo do par sequencial já faz `elapsed(newer.date, older.date)` e `formatElapsed` devolve nulo para ponta sem data, então o rótulo some sem alteração. `visibleSequential`/`sequentialGradients` usam `shown[p.newerRowIndex]` e `colX(row.column)`: com pontas sem data continuam válidos. Uma ressalva: com datas iguais nas duas pontas (arcos empatados e datados) o rótulo mostrará «no mesmo mês» (`arcos.elapsedSame`); decidir se é aceitável ou se esse rótulo deve ser omitido.
- **Ligação `arc` por arco.** `arcLinks` percorre a cadeia de cada arco e só pula segmentos de arcos diferentes cobertos por par sequencial; os novos pares (entre blocos) não colidem com isso.
- **Passada nova de pares.** Definir na implementação: "blocos consecutivos" sobre `withPrevious` (índices, não `rows` original), usando `seenPair` para não duplicar, e bloquear quando houver linha sem arco entre os blocos, como faz a passada de lacunas (`gapBlocked`); os testes existentes «does not form a sequential pair across a Sem arco row» e «still finds sequential arcs when a bifurcation sits between…» devem continuar verdes.

## 3. Deploy e operação
Veredito: OK
- Sem variável, migração, container ou script. Rollback é reverter o código.

## 4. Qualidade de código
Veredito: Atenção
- O grupo 4 de tasks.md cobre o caso WFRP, intercalado, rótulo, transição explícita, filtro e arcos não adjacentes, e a verificação final (vitest, tsc, eslint, e2e `linha-tempo`, dados reais). Acrescentar: (a) a atualização dos dois testes acima; (b) um teste de que arcos empatados e **intercalados** mantêm coluna diferente e curva (regressão da regra antiga); (c) um teste de arco de uma sessão só em empate (efeito da regra ampla, que o arquiteto sinalizou).
- A tasks.md mistura os idiomas e mantém as tarefas 3.1/3.2 (manuais) abertas com o texto atualizado; as tarefas novas (grupo 4) aparecem antes do grupo 3 por ordem de arquivo. Sem impacto funcional.
- Rodar a suíte completa do frontend e o e2e `linha-tempo` (já passam com a primeira parte da change).

## 5. Execução das decisões arquiteturais
Veredito: OK
- Mantém a decisão de que a data herdada só ordena; as faixas por número de sessão são a fonte nova e ficam restritas a conflito de coluna e ligação.

## Bloqueantes antes de implementar
- nenhum

## Limitações técnicas a reportar ao Arquiteto
- A regra de empate usa só o número da sessão; arcos paralelos reais no mesmo mês com faixas disjuntas passam a ser sequenciais (já anotado pelo arquiteto como trade-off de produto).
