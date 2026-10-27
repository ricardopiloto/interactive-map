# Review — Arquiteto de Soluções

**Change:** fix-timeline-arco-sem-data
**Data:** 2026-10-27
**Veredito geral:** Aprovado com ressalvas

## 1. Definição da arquitetura técnica
Veredito: OK
- Escopo confirmado contra o código real: `layoutArcs` (`frontend-v2/src/lib/timelineLayout.ts`) é consumida só por `ArcTimeline.tsx`, por sua vez usada só em `cronologia.tsx` sob `mode === "arcs"` — confirmei com grep que nenhum outro ponto do frontend chama `layoutArcs`. O proposal.md afirma isso ("O modo 'Chronological' ... não são afetados") e bate com o código; não é uma alegação não verificada.
- Não há componente novo (sem serviço, sem rota de API, sem dependência): é uma função pura de ordenação que já existe, ganhando um passo a mais. Coerente com a stack (React + TS no frontend-v2, Vite, Vitest) sem introduzir nada.
- Escala: a doc `docs/test-performance.md` descreve a campanha de referência com dúzias de sessões/eventos, não milhares; a busca linear "uma vez" pelo array `numero`-ordenado (design.md, Decisão 2) é O(sessões) por arco sem data, portanto O(sessões × arcos-sem-data) no pior caso — trivial nessa escala. Não é um requisito que precise ser declarado à parte aqui.

## 2. Integração com a infraestrutura existente
Veredito: N/A
- Não há mudança de backend, schema, deploy, containers ou dados (proposal.md, "Impact": "Nenhuma mudança de backend, schema ou dado de campanha" — confirmado, a change toca só `frontend-v2/src/lib/timelineLayout.ts` e seu teste). Esta dimensão não se aplica a uma função pura de frontend.

## 3. Qualidade de arquitetura e trade-offs
Veredito: Atenção
- Segurança/permissões: nenhuma superfície nova, mantém o mesmo dado já visível ao jogador/mestre na Linha do Tempo. OK.
- Performance: sem gargalo previsível na escala real do produto (ver item 1). OK.
- Manutenibilidade — **achado**: o design (Decisão 1 e 2) deixa claro que a nova lógica fica confinada a popular `arcAnchor` antes do `sort`, sem tocar `ranges`/`columns`/`branchOrigins`/`sequentialPairs`. Essa separação é o que torna o risco "baixo", mas ela depende de uma invariante implícita do código atual (que hoje só `sortKey` lê `arcAnchor`) que não está testada como tal hoje — só decorre de leitura do código. O próprio design.md já reconhece isso como risco e propõe um teste de regressão (tasks.md 1.4/2.2) comparando colunas/bifurcações do arco com fallback contra a baseline "sem âncora". Recomendação: esse teste de regressão é bloqueante para considerar a invariante preservada — não deixar como "nice to have"; hoje o tasks.md já o lista, então o ponto é garantir que ele não seja pulado na implementação.
- Mudança de contrato de comportamento especificado: este fix altera uma regra que estava **deliberadamente especificada** (`linha-tempo-por-arcos`, antes desta change: "sem data inventada... ordenada pelo número da sessão... abaixo de todas"). O proposal.md já nomeia isso explicitamente ("Esse comportamento é hoje documentado e intencional na spec... não é um bug de implementação silencioso") — isso é exatamente o tipo de mudança de requisito que merece registro de ADR, e o design.md cumpre isso nas 3 Decisions com alternativas rejeitadas. Nenhum achado bloqueante aqui, só reforço de que a seção "Decisions" é o ponto certo a auditar em revisão de código, não apenas o diff.

## 4. Documentação e decisões (ADRs)
Veredito: OK
- `design.md` segue o padrão já usado em `openspec/changes/indice-campanha-ia` (Context / Goals-NonGoals / Decisions com alternativa rejeitada e motivo / Risks → Mitigation / Migration Plan / Open Questions). As 3 decisões relevantes (onde popular o anchor, como buscar o vizinho mais próximo por `numero`, e o desempate) têm alternativa considerada e motivo de rejeição — não é só a escolha final.
- Não há fluxo de dados novo nem múltiplos componentes interagindo (é uma função só), então um diagrama não agregaria nada aqui; corretamente omitido.
- A seção "Open Questions" (estender o fallback a sessões sem arco) está corretamente marcada como não-bloqueante e não muda o approach desta change — uso correto da seção.

## 5. Ponte entre produto e técnico
Veredito: OK
- O "Why" do proposal.md traça a causa raiz até o código real (`arcAnchor` nunca é populado quando nenhuma sessão do arco tem evento datado) e não só até o sintoma visual — isso dá ao design.md uma base concreta para as decisões técnicas, em vez de ficar como promessa vaga.
- O "What Changes" mapeia 1:1 para as Decisions do design.md (cada bullet do proposal corresponde a uma decisão técnica correspondente), e a delta de spec (`specs/linha-tempo-por-arcos/spec.md`) formaliza exatamente os mesmos limites (não altera `row.date` exibido, não entra em colunas/tempo decorrido) — a tradução produto → spec → design está consistente nos três artefatos, sem lacuna.

## Bloqueantes antes de implementar
- nenhum
