# Review — Arquiteto de Soluções

**Change:** fix-timeline-arco-sem-data (inclui a extensão: empate de data entre arcos sem intercalação e ligações para arco sem data)
**Data:** 2026-10-27
**Veredito geral:** Aprovado com ressalvas

## 1. Definição da arquitetura técnica
Veredito: OK
- Mudança confinada a `layoutArcs` (`frontend-v2/src/lib/timelineLayout.ts`) e, no máximo, ao tratamento de pontas sem data em `ArcTimeline.tsx`. Sem backend, schema, dado ou API. O desenho mantém o princípio já decidido: a data de referência herdada só ordena; as faixas de número de sessão (fonte nova) decidem conflito de coluna e ligação.
- Escala: dezenas de sessões e poucos arcos; as passadas adicionais (faixas por arco, pares consecutivos) são lineares/quadráticas em arcos e irrelevantes em desempenho.

## 2. Integração com a infraestrutura existente
Veredito: OK
- Sem deploy, variável, migração ou impacto em backup/exportação. Rollback é reverter o diff. O modo cronológico e o «Por descoberta» não usam `layoutArcs` e ficam fora.

## 3. Qualidade de arquitetura e trade-offs
Veredito: Atenção
- **Reversão de uma regra especificada.** O requisito «Ligação ao ponto mais próximo no tempo» diz hoje que sessões de arcos diferentes com a mesma data SHALL ocupar colunas diferentes, e dois testes de `timelineLayout.test.ts` a fixam: «branches equal dates and leaves undated sessions last by number» (arcos 1 e 2 com sessões de número 1 e 3, faixas disjuntas) e «orders same-month sessions across arcs and assigns the lower-numbered arc to the branch» (sessões 18 e 21 em arcos diferentes). Com a nova regra os dois arcos viram sequenciais (mesma coluna, sem `branchOrigin`). O delta de spec já altera o texto, mas as tarefas 4.1–4.5 só falam em testes novos: é preciso listar explicitamente a atualização desses dois testes (e conferir o e2e `linha-tempo`) para não deixar nenhum vermelho nem esconder a reversão.
- **Abrangência da regra.** Ela vale para qualquer par de arcos com a mesma data e faixas disjuntas, inclusive arcos de uma sessão só. Uma campanha com duas linhas narrativas paralelas no mesmo mês, cada uma com sessões em faixas disjuntas, passa a ser lida como sequência (antes era bifurcação). Como a data só tem ano e mês, não há como provar paralelismo; a escolha do produto é privilegiar o número da sessão. Registrar essa consequência como trade-off aceito (já há um risco semelhante no design) e, se quiser reduzir o impacto, considerar limitar a regra a arcos com mais de uma sessão. Decisão de produto, não bloqueante.
- **«Blocos consecutivos» está subespecificado.** O design (Extension) descreve a passada em «blocos consecutivos na ordem visível» e deixa em aberto as linhas sem arco entre dois blocos. Hoje a passada por lacunas (`gapBlocked`) trata linha sem arco datada entre dois arcos como bloqueio; a nova passada deveria seguir o mesmo critério (uma sessão sem arco, com ou sem data própria, entre dois blocos impede a ligação) para não criar dois comportamentos para o mesmo caso. Fixar isso no design/tarefas, junto com: blocos não contíguos por causa de bifurcação, e o par já ligado (`seenPair`).
- **Sessões de transição (`arco_transicao_id`).** A faixa de número usa `arco_id`; a sessão de transição pertence a um arco só para esse cálculo. O componente já filtra pares cobertos por transição explícita (`explicitTransitionPairs`), então não duplica traço. Basta um teste, que a tarefa 4.3 já prevê.
- **Rótulo de tempo.** `ArcTimeline.tsx` calcula `elapsed(newer.date, older.date)` e já omite o rótulo quando alguma ponta é `null`; para arcos datados e empatados no mesmo mês o rótulo seria «mesmo mês» (`arcos.elapsedSame`). Confirmar se é o desejado; é coerente com o dado.
- Manutenibilidade: `layoutArcs` ganha mais uma passada; o arquivo já é denso (~280 linhas). Aceitável; evitar duplicar a lógica de faixas já existente (`ranges` por data) criando uma segunda estrutura clara (`numeroRanges`).

## 4. Documentação e decisões (ADRs)
Veredito: OK
- O design registra o contexto real (dados da WFRP), as decisões, a alternativa rejeitada (corrigir por dados), riscos e a pergunta aberta. O delta de spec cobre as três requisitos afetados com cenários novos e mantém os existentes. Diagrama desnecessário.

## 5. Ponte entre produto e técnico
Veredito: OK
- O pedido («as sessões seguem a sequência dos números; 21 não deve ligar direto à 28; 21→22 e 24→25 devem se ligar») está traduzido em regras testáveis, com a verificação final sobre os dados reais (tarefa 4.6). Ponto a confirmar com o produto: a regra vale também para arcos de uma sessão só.

## Bloqueantes antes de implementar
- nenhum

## Ajustes recomendados (não bloqueantes)
1. Listar nas tarefas 4.1/4.2 os dois testes existentes que mudam de expectativa (linhas ~59 e ~76 de `timelineLayout.test.ts`) e a conferência do e2e.
2. Definir no design «blocos consecutivos» (sessão sem arco entre blocos bloqueia a ligação, como em `gapBlocked`).
3. Registrar como trade-off aceito que arcos paralelos no mesmo mês com faixas disjuntas passam a ser sequenciais; opcionalmente restringir a arcos com mais de uma sessão.
