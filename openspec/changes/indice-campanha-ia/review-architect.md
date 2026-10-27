# Review — Arquiteto de Soluções

**Change:** indice-campanha-ia
**Data:** 2026-10-27
**Veredito geral:** Aprovado com ressalvas

## 1. Definição da arquitetura técnica
Veredito: OK
- FTS5 no SQLite da própria campanha é coerente com a stack (SQLite por campanha + Alembic `alembic_campaign`) e não adiciona dependência nem serviço (design.md, Decisão 1). Verificado: o ambiente local tem SQLite 3.51.2 com FTS5.
- Escala-alvo implícita ("centenas de sessões", milhares de registros) está declarada no design (Decisão 4) e é adequada a SQLite local; o tamanho do contexto deixa de crescer com o histórico, que é o objetivo.
- Atenção menor: a escala suportada não está escrita como meta. Registrar uma ordem de grandeza (ex.: até ~10 mil registros, reconstrução em segundos) ajuda a decidir depois se a reconstrução síncrona na primeira chamada de IA é aceitável.

## 2. Integração com a infraestrutura existente
Veredito: Atenção
- **`coletar_registros` é compartilhado.** `motor_ia_arcos`, `motor_ia_sessao_associacoes`, `motor_ia_evento_associacoes` e `coletar_fios` (que o chama com `rascunho_sessao`) dependem dele. A tasks.md 2.3 diz "em `contexto_ia.py`, montar o contexto por composição" sem dizer como isso preserva esses motores, embora o proposal os declare fora de escopo. Recomendação: explicitar no design que a composição é uma função nova (ex.: `compor_contexto`) chamada só por `motor_ia_assistente`, e que `coletar_registros` fica intacto (também é o caminho de recuo da Decisão 7).
- **Ouvinte `after_flush` precisa do mesmo filtro do `before_flush`.** `_track_campaign_writes` (campaign_db.py) só age em `campanha.db` de campanhas. O novo ouvinte deve reutilizar esse filtro, senão roda no control.db e em bancos de teste. Além disso, deve consultar o estado do índice (em cache por sessão) e não escrever quando for `indisponivel`, pois a tabela virtual não existe nesse caso.
- Importação já usa `session.add` de ORM com ids explícitos (`campaign_import._insert_content`), então o `after_flush` indexa durante a importação; a "reconstrução ao final" (tasks 1.4) fica redundante, mas é um bom seguro. Manter, apenas deixar claro que a importação não deve indexar duas vezes (reconstruir é idempotente, então é seguro). `legacy_import` pode usar SQL cru; ali a reconstrução é necessária.
- Exportação monta por tabelas explícitas (`build_content_dict`), então a tabela virtual não entra: confirmado, nenhum ajuste.
- Deploy: uvicorn em processo único (Dockerfile), então o `Lock` por campanha em memória basta. Documentar a premissa: com mais de um worker o `Lock` não protege, e a idempotência da reconstrução (apagar e repovoar em uma transação) é a defesa real.
- Backup/migração: o índice vive no `campanha.db`, entra nos backups por arquivo e é regenerável. Backup que use `.dump`/exportador SQL pode falhar com tabelas virtuais FTS5 em SQLite sem a extensão; vale uma linha no changelog/runbook.

## 3. Qualidade de arquitetura e trade-offs
Veredito: Atenção
- **Segurança:** consulta só com termos entre aspas, ligados por `OR`, é a mitigação certa para injeção na sintaxe MATCH, e há teste previsto. Reforçar: o termo deve ser parametrizado (`MATCH ?`) e as aspas internas, se houver, removidas pela extração alfanumérica. Rotas com `require_dono` + módulo ativo + `3/minute` seguem o padrão existente.
- **Conteúdo oculto (relevante):** a paridade atual (`visivel` copiado da sessão, inclusive para notas de preparo) é decisão explícita e foi registrada como questão aberta. Como o índice é privado do mestre e `montar_contexto` aplica o marcador, não há vazamento novo. Concordo em manter paridade.
- **Performance:** o ponto de atenção é a reconstrução síncrona dentro da primeira requisição de IA (mantém uma transação de escrita em SQLite, bloqueando gravações da campanha). Aceitável para milhares de registros; recomendo medir na tarefa 4.2 e, se passar de ~1 s, reindexar fora do caminho da requisição.
- **Custo de gravação:** `DELETE` + `INSERT` por registro alterado é aceitável; porém `after_flush` dispara a cada flush de qualquer objeto indexado, inclusive reordenações em lote. Garantir que só registros cujos campos indexados mudaram sejam reindexados (comparar com `inspect(obj).attrs.<campo>.history`), ou aceitar o custo e registrar.
- **Manutenibilidade:** uma peça nova (serviço + ouvinte + 2 rotas + seção de painel) é proporcional ao problema. O recuo para a leitura completa mantém o risco baixo.
- **Qualidade da busca:** sem stemming, "emboscada"/"emboscadas" não casam. Para pt-BR isso é limitação real e relevante; o design a registra como risco aceito. Sugestão barata e sem dependência: usar prefixo (`"termo"*`) em termos com 5+ letras, mantendo o termo entre aspas. Decisão do produto, não bloqueante.

## 4. Documentação e decisões (ADRs)
Veredito: OK
- design.md traz 9 decisões com alternativas rejeitadas nas principais (embeddings, `LIKE`, motor externo, gatilhos SQL), riscos com mitigação, plano de migração com rollback e questões abertas, no padrão das changes anteriores.
- Fluxo novo não trivial (gravação → ouvinte → índice; chamada de IA → recuperação → composição → recuo). Um diagrama mermaid curto do fluxo de composição/recuo ajudaria, mas não é exigido.

## 5. Ponte entre produto e técnico
Veredito: OK
- As escolhas do produto (busca por relevância, automático + Reindexar) estão traduzidas diretamente em Decisões 1, 4, 5 e 8. O escopo limitado aos assistentes de escrita está justificado (fios precisa resumir todas as sessões).
- Expectativa a alinhar com o produto: busca lexical pode não trazer um trecho que usa outras palavras; mitigado por recentes + catálogo, e já comunicado.

## Bloqueantes antes de implementar
- nenhum

## Ajustes recomendados (não bloqueantes)
1. Deixar explícito no design/tasks que `coletar_registros` e `coletar_fios` não mudam e que a composição é função nova usada apenas pelo `motor_ia_assistente`.
2. Reutilizar o filtro de campanha do `_track_campaign_writes` no `after_flush` e não escrever quando o estado for `indisponivel`.
3. Registrar a premissa de processo único (Lock) e a idempotência como defesa real.
4. Medir a reconstrução na verificação manual e definir o limite aceitável.
5. Avaliar prefixo `"termo"*` para termos longos (pt-BR sem stemming).
