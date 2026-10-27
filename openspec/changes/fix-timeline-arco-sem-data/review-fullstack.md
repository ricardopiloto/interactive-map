# Review — Desenvolvedor Fullstack

**Change:** fix-timeline-arco-sem-data
**Data:** 2026-10-27
**Veredito geral:** Aprovado com ressalvas

## 1. Desenvolvimento do backend
Veredito: N/A
- Não há rota, modelo, migração ou dado de backend envolvido (proposal.md, "Impact"). Confirmado: nenhum arquivo em `backend/` consta no escopo da change, e a mudança é só em `frontend-v2/src/lib/timelineLayout.ts`.

## 2. Desenvolvimento do frontend
Veredito: OK
- Reconfirmei no código (`frontend-v2/src/lib/timelineLayout.ts:58-82`) a leitura que o design.md faz: `arcAnchor` só é populado por linhas com `row.date !== null` (linha 70-72), e `sortKey` (linha 73-74) é o único ponto que lê `arcAnchor` como fallback. A Decisão 1 do design ("pré-popular `arcAnchor`... `sortKey` já lê isso") é implementável sem tocar `sortKey`, `ranges`, `columns` nem `ArcTimeline.tsx` — bate com o código real, não é uma suposição.
- Confirmei por grep que `layoutArcs`/`ArcTimeline` não são usados em nenhum outro lugar do frontend-v2 além de `cronologia.tsx` (`mode === "arcs"`), então a afirmação "Chronological/By discovery não são afetados" (proposal.md) é verificável e verdadeira no código atual, não só uma intenção.
- Nenhuma necessidade de ajuste de UI (desktop/mobile) — `ArcTimeline.tsx` apenas consome `rows` já ordenadas; o design confirma que `row.date` continua `null` e o texto "—" não muda.

## 3. Deploy e operação
Veredito: N/A
- Sem variável de ambiente, porta, script de build ou migração nova. `frontend-v2/package.json` já tem `test`/`lint`/`build` suficientes; nenhuma mudança de pipeline necessária.

## 4. Qualidade de código
Veredito: Atenção
- **Lacuna de teste não coberta em tasks.md**: um arco sem nenhuma sessão datada que fique na borda da campanha (só tem vizinho datado de um lado — por número de sessão menor **ou** maior, nunca os dois) não tem teste dedicado em 1.1-1.5. A Decisão 2 do design.md descreve "encontra o mais próximo abaixo e o mais próximo acima" mas não diz o que acontece quando só um dos dois existe (deve cair para o único candidato existente; se nenhum existir, o arco deve continuar caindo no fim da lista como hoje). Isso é uma lacuna real de especificação de implementação — sem um teste explícito para esse caso, é fácil uma implementação ingênua comparar distâncias com `undefined`/`Infinity` incorretamente e produzir `NaN` ou escolher o candidato errado silenciosamente. Recomendação: adicionar a tasks.md um caso 1.x cobrindo "arco sem data só com vizinho datado de um lado" e outro para "arco sem data sem nenhum vizinho datado dos dois lados" (deve permanecer no comportamento atual, fim da lista por número).
- **Comando de verificação sem diretório de trabalho explícito**: tasks.md usa `npx vitest run timelineLayout.test.ts` em várias tasks (1.1, 1.4, 2.1); o script real do projeto é `"test": "vitest run"` dentro de `frontend-v2/package.json` — funciona, mas só se executado a partir de `frontend-v2/`. Não é bloqueante (comando válido), só uma imprecisão menor a esclarecer na hora de rodar.
- **Suite e2e dedicada não mencionada**: existe `frontend-v2/e2e/linha-tempo.spec.ts` (Playwright, `npm run test:e2e`), separado da suite unitária que tasks.md 3.3 já cobre (`npm test`). Conferi o conteúdo desse spec: hoje ele não fixa a ordem exata de um arco sem data (só cobre CRUD de arco, filtro "Sem arco" e contagem), então não deve quebrar com esta mudança — mas tasks.md não cita rodá-lo. Não é bloqueante dado o que o spec cobre hoje, mas vale adicionar como verificação manual já que ele exercita o mesmo "Por arcos" ponta a ponta.
- Fora esses pontos, a divisão de tasks segue o padrão esperado: testes antes da implementação (grupo 1 antes do 2), cada task tem critério de verificação, e o teste de regressão de colunas/bifurcação (1.4) está no mesmo grupo que a mudança que ele protege — não foi empurrado para o final.

## 5. Execução das decisões arquiteturais
Veredito: OK
- `tasks.md` 2.1 segue exatamente a Decisão 2 do design (busca no array ordenado por `numero`, construído uma vez, não por arco) e 2.2 verifica explicitamente a invariante que o design aponta como o que torna o risco baixo (`ranges`/`columns`/`branchOrigins` não leem `arcAnchor`). Nenhuma decisão arquitetural foi reaberta ou contornada nas tasks.
- Não encontrei limitação técnica que contradiga o design proposto — a única lacuna encontrada (edge case de vizinho único/nenhum) é de cobertura de teste, não de arquitetura.

## Bloqueantes antes de implementar
- nenhum

## Limitações técnicas a reportar ao Arquiteto
- nenhuma
