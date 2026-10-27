# Review — Desenvolvedor Fullstack

**Change:** indice-campanha-ia
**Data:** 2026-10-27
**Veredito geral:** Aprovado com ressalvas

## 1. Desenvolvimento do backend
Veredito: Atenção
- **Campanhas legadas não passam pela `013`.** `ensure_campaign_schema` faz `migrate_sqlite_legacy` + `stamp head` quando o banco não tem revisão Alembic, sem rodar migrações. Nesse caminho as tabelas `indice_ia` e `indice_ia_estado` não existem. O design assume que "migração `013` roda por campanha" (Migration Plan). Recomendação: o serviço deve tratar tabela ausente como estado «ausente» e `reconstruir` deve criar a estrutura de forma idempotente (`CREATE VIRTUAL TABLE IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`), com a `013` apenas fazendo o mesmo.
- **`_orcamento` é quadrático.** Cada candidato recalcula `_tamanho` (serializa JSON da lista inteira). Um item de catálogo por registro (design, Decisão 6, "uma linha por personagem, local...") com milhares de registros reintroduz o custo que o índice quer evitar. Recomendação: o catálogo é um único `ItemContextoIa` (ou dois: visível e oculto) já truncado em `ia_indice_catalogo_max_chars`.
- **Visibilidade do catálogo.** Um item tem uma só flag `visivel_para_todos`. Catálogo agregado misturaria nomes ocultos e visíveis; separar em `catalogo` (visível) e `catalogo_oculto` para que `montar_contexto` marque `oculto` e `usou_conteudo_oculto` continue correto.
- **Ordem de prioridade não é a ordem da lista hoje.** `coletar_registros` devolve ordenado por `-registro_id` entre tipos distintos, e `_orcamento` inclui na ordem da lista. A composição precisa montar a lista na ordem de prioridade explícita (fixos, fios, recentes, catálogo, trechos) e não reaproveitar o `sorted`. Em `assistir` os fios abertos são prefixados depois de `coletar_registros`; manter essa ordem.
- **`MIN_REGISTROS` / "contexto insuficiente".** `assistir` conta `len(registros)`. Com catálogo agregado e poucos trechos a contagem muda; definir que o critério usa o número de registros reais (não de itens compostos), para não mudar o comportamento «vazio» em campanha pequena.
- **`coletar_registros` e `coletar_fios` compartilhados** com arcos, associações e fios: criar função nova de composição e deixar essas intactas (concordo com o arquiteto).
- **`after_flush`:** reaproveitar o filtro de campanha de `_track_campaign_writes`; em `after_flush`, `session.new/dirty/deleted` ainda estão disponíveis e ids de novos já foram atribuídos. Usar `session.connection()` e, ao falhar, marcar `desatualizado` na mesma conexão sem reenviar exceção. Cuidado com recursão: as escritas no índice são SQL cru, não ORM, então não disparam o ouvinte.
- Autorização das rotas está suficiente (`require_dono`, `IA_MODULO_DESABILITADO`, `limiter`), igual a `/ia/assistir` em `routers/admin/ia.py`.

## 2. Desenvolvimento do frontend
Veredito: OK
- O painel (`routes/painel.tsx`) renderiza um cartão por campanha com o interruptor `ia_arcos` (l.192–205); a seção do índice entra logo abaixo, condicionada a `modulos_ativos.includes("ia_arcos")`. Precisa de estado local por campanha (lista de cartões) — acrescentar à task 3.3 que o estado e o carregamento são por `slug`.
- Cliente em `frontend-v2/src/api/` no padrão de `fios.ts`/`fios.test.ts`; i18n em `comum.json` com teste de paridade; mobile 320 px já previsto.

## 3. Deploy e operação
Veredito: Atenção
- Sem variável de ambiente obrigatória: as configurações novas têm padrão (`config.py` já usa `pydantic` com `Field`). Documentar `IA_INDICE_*` se houver prefixo de env.
- FTS5 em produção: a imagem Docker usa o SQLite do Python base; confirmar com `PRAGMA compile_options`/`CREATE VIRTUAL TABLE` na imagem antes do deploy (o recuo cobre o caso negativo).
- Observabilidade: logs só com contagens (já previsto). Acrescentar contagem de falhas de atualização do índice e o log do tempo de reconstrução, para depurar em produção.

## 4. Qualidade de código
Veredito: OK
- tasks.md tem testes para serviço, contexto (campanha grande, hostil, recuo, oculto), rotas (matriz de permissão) e painel, no padrão das changes anteriores. Verificação fora do sandbox do codex está prevista.
- Acrescentar testes: (a) campanha legada sem tabelas do índice; (b) rollback da gravação não deixa trechos órfãos; (c) tempo de `_orcamento` com catálogo grande (sem regressão quadrática); (d) `coletar_fios` e motores de arcos inalterados (já em 2.4).
- Em testes unitários que usam `Session` em memória, o ouvinte não age (filtro de caminho); os testes do índice precisam de banco de campanha real em `DATA_DIR` temporário, como `test_campaign_modified_at.py`.

## 5. Execução das decisões arquiteturais
Veredito: OK
- tasks.md segue as Decisões 1–9. Nada reaberto.

## Bloqueantes antes de implementar
- nenhum

## Limitações técnicas a reportar ao Arquiteto
- Campanhas legadas com `stamp head` não executam a `013`: a criação da estrutura deve ser lazy e idempotente no serviço (Decisão 4 deveria dizer isso).
- Catálogo por linha-registro com o `_orcamento` quadrático: o catálogo precisa ser agregado (afeta a Decisão 6 e a semântica de visibilidade).
