# Review — Arquiteto de Soluções

**Change:** resolver-fios-no-preparo
**Data:** 2026-10-27
**Veredito geral:** Aprovado com ressalvas

## 1. Definição da arquitetura técnica
Veredito: OK
- Mudança de um único componente de frontend (`SessionReadBlocks.tsx`), reaproveitando `fiosApi.update(slug, id, { estado })` → `PATCH /admin/fios/{id}`. O backend já aceita `estado` em `FioUpdate` e protege a rota com `require_dono` (`routers/admin/fios.py`). Sem API, banco, exportação ou migração novos.
- Escala: um PATCH por clique, com limite de 30 por minuto na rota; irrelevante para o uso real.

## 2. Integração com a infraestrutura existente
Veredito: OK
- Sem deploy, variável, migração ou impacto em backup. Rollback é reverter o código.

## 3. Qualidade de arquitetura e trade-offs
Veredito: Atenção
- **Condição de corrida com a recarga do bloco.** O bloco guarda `result` com uma chave (`slug:sessao:fiosRevision`) e hoje descarta respostas tardias (teste «descarta resposta tardia…»). A atualização local pela resposta do PATCH deve respeitar a mesma chave: se a sessão trocar ou `fiosRevision` mudar enquanto o PATCH está em voo, a resposta não pode escrever no estado de outra sessão. Registrar essa regra no design (Decisão 2) e cobrir com um teste.
- **Limite de 30 pedidos por minuto.** Resolver muitos fios em sequência rápida pode esbarrar no limite; o erro cai no aviso do bloco e o fio permanece no estado anterior (já especificado). Aceitável; vale citar no design.
- **Efeito sobre a IA.** Resolver um fio o retira dos «fios em aberto» que alimentam o próximo rascunho. É o comportamento esperado e já especificado em `fios-narrativos`; basta dizer isso no design para o mestre saber que a ação tem efeito além da tela.
- **Dependência entre changes.** O delta modifica o requisito «Fios da sessão no bloco de Fios Narrativos», que `pagina-fios-narrativos` também modifica (link para a página «Fios»). O design e o proposal já pedem para arquivar a outra primeiro e o delta parte do texto dela; conferir o texto principal depois do sync, sem restaurar o link antigo.
- **Localização da ação (premissa do proposal).** O pedido falava em «Notas de Preparo»; a ação foi posta no bloco «Fios Narrativos», que fica colado a ele. Decisão razoável e registrada, mas depende de o produto confirmar; o custo de mudar é baixo.
- Segurança: sem mudança; bloco só para o mestre dono com o Modo GM ligado.

## 4. Documentação e decisões (ADRs)
Veredito: OK
- O design traz contexto, metas/não-metas, 5 decisões com alternativa rejeitada (lista dentro das Notas), riscos, migração e questão aberta. Diagrama desnecessário.

## 5. Ponte entre produto e técnico
Veredito: OK
- O pedido («resolver o fio direto no preparo, para reduzir telas») foi traduzido em ação por fio no bloco da sessão, limitada aos fios criados nela (resposta do produto). Atualização imediata e falha tratada, como pedido.

## Bloqueantes antes de implementar
- nenhum

## Ajustes recomendados (não bloqueantes)
1. Registrar no design que a resposta do PATCH só atualiza o estado se a chave do bloco ainda for a mesma (sessão e revisão) e cobrir com teste.
2. Citar o limite de 30/min e o efeito sobre os «fios em aberto» do rascunho.
3. Reconferir o requisito principal depois de arquivar `pagina-fios-narrativos`.
