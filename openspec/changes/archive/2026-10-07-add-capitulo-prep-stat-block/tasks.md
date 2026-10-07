# Tasks

## 1. Backend — modelo e migração de Capítulo

- [x] 1.1 Criar `backend/app/models/capitulo.py` (`Capitulo`: `id`, `arco_id` FK `arco.id` `ondelete="CASCADE"`, `titulo`, `ordem`, `corpo_markdown` `max_length=50000`, `sessao_id` FK `sessao.id` nullable `unique=True` `ondelete="SET NULL"`, `visivel_para_todos`) e verificar que `alembic revision --autogenerate` (ou migração manual seguindo `alembic_campaign/versions/009_item.py` como referência) gera `010_capitulo.py` criando a tabela com as FKs e o índice único em `sessao_id`
- [x] 1.2 Rodar a migração contra um banco de campanha de teste e verificar com `sqlite3`/inspeção que a tabela `capitulo` existe com as colunas e constraints esperadas

## 2. Backend — CRUD de Capítulo

- [x] 2.1 Criar `backend/app/schemas/capitulo.py` (`CapituloCreate`, `CapituloUpdate`, `CapituloAdmin`/`CapituloRead`, `CapituloListAdmin`) espelhando `schemas/sessao.py`
- [x] 2.2 Criar `backend/app/services/capitulo_service.py` com `create_capitulo`, `update_capitulo`, `delete_capitulo`, `get_admin`, `list_admin(arco_id)`, validando `arco_id` pertence à campanha e rejeitando `sessao_id` já vinculado a outro Capítulo (erro estruturado, ex. `CAPITULO_SESSAO_JA_VINCULADA`) e `arco_id` inexistente (`CAPITULO_ARCO_INVALIDO`); verificar com `uv run pytest backend/tests/test_capitulos_crud.py` (a criar) cobrindo criação, atualização de `ordem`, vínculo/desvínculo de sessão e o caso de vínculo duplicado
- [x] 2.3 Criar `backend/app/routers/admin/capitulos.py` (GET lista por arco, GET por id, POST, PATCH, DELETE) protegido por `require_membro`/`require_dono` como em `routers/admin/sessoes.py`, e registrar o router; verificar com um teste de autenticação (requisição sem sessão de membro recebe 401/403) em `backend/tests/test_capitulos_crud.py`
- [x] 2.4 Criar `backend/app/routers/public/capitulos.py` retornando apenas Capítulos com `visivel_para_todos=True`; verificar com `backend/tests/test_capitulos_crud.py` (ou um `test_capitulos_visibility.py` dedicado) que um Capítulo oculto não aparece na rota pública mas aparece na admin
- [x] 2.5 Confirmar cascade: apagar um Arco remove seus Capítulos sem apagar Sessões vinculadas a eles; verificar com `backend/tests/test_arco_sessao_vinculo.py` ou um novo teste dedicado que, após apagar o Arco, a Sessão antes vinculada ao Capítulo continua existindo e consultável
- [x] 2.6 Criar `backend/tests/test_capitulos_isolation.py` espelhando `test_arcos_isolation.py`, verificando que Capítulos de uma campanha não aparecem em listagens/buscas de outra campanha

## 3. Backend — stat block por sistema

- [x] 3.1 Criar `backend/app/services/stat_blocks/base.py` definindo a interface de um template de sistema (`FIELDS`, `validate(payload) -> dict`, `render_markdown(payload) -> str`) e `registry.py` mapeando `sistema -> template`
- [x] 3.2 Criar `backend/app/services/stat_blocks/wfrp.py` com os campos de WFRP (CA, HPr, FOR, RES, IN, AG, DES, INT, VON, CAM, Perícias, Talentos, Pertences) baseado na ficha usada em `NPCs/Sigurd Ugenhauer.md` do vault de referência do usuário; verificar com `uv run pytest backend/tests/test_stat_blocks.py` (a criar) que um payload válido passa e um payload com campo desconhecido é rejeitado
- [x] 3.3 Criar `backend/app/services/stat_blocks/wod.py` com os campos equivalentes para o sistema WoD já ativo em produção; verificar com o mesmo `test_stat_blocks.py`
- [x] 3.4 Adicionar `stat_block: dict[str, Any]` (JSON) a `backend/app/models/npc.py` e migração `011_npc_stat_block.py` (coluna nullable/default vazio, sem backfill); verificar que NPCs existentes continuam sendo lidos sem erro após a migração
- [x] 3.5 Atualizar `backend/app/schemas/npc.py` (`NPCCreate`/`NPCUpdate` aceitam `stat_block`; `NPCRead`/`NPCAdmin` o expõe) e o service de NPC para validar `stat_block` via `stat_blocks.registry` usando o `sistema` da campanha do NPC, rejeitando sistema sem template (`STAT_BLOCK_SISTEMA_DESCONHECIDO`) e campo desconhecido; verificar com `backend/tests/test_npc_stat_block.py` (a criar)
- [x] 3.6 Garantir que o schema de resposta pública de NPC (`routers/public/npcs.py` / schema público) nunca inclui `stat_block`; verificar com um teste que lê publicamente um NPC com `stat_block` preenchido e confirma a ausência do campo na resposta
- [x] 3.7 Adicionar um endpoint (ou campo na resposta de configuração de campanha já existente, ex. `GET /api/c/{slug}/config`) que expõe `FIELDS` do sistema da campanha, para a UI montar o formulário; verificar com um teste que o schema retornado para uma campanha `wfrp` difere do de uma campanha `wod`

## 4. Frontend — gestão de Capítulo

- [x] 4.1 Criar componente de listagem de Capítulos dentro da gestão de Arco (reaproveitando o padrão de `ArcoAdminList.tsx`), com reordenação; verificar manualmente via `preview_start` que a lista reflete a `ordem` do backend
- [x] 4.2 Criar `CapituloFormDialog.tsx` (criar/editar, campo de texto markdown para `corpo_markdown`, seletor de Sessão para vínculo opcional, toggle `visivel_para_todos`) seguindo o padrão de `ArcoFormDialog.tsx`
- [x] 4.3 Adicionar textos pt-BR e en para os novos rótulos/mensagens, seguindo o mecanismo de i18n já usado nas telas de Arco; verificar trocando o idioma da interface e confirmando ausência de strings fixas em português
- [x] 4.4 Criar `frontend/e2e/capitulo-management.spec.ts` espelhando `e2e/arco-management.spec.ts` (criar, editar, reordenar, apagar) e `frontend/e2e/capitulo-visibility.spec.ts` espelhando `e2e/arco-visibility.spec.ts` (capítulo oculto não aparece para jogador); verificar com `npx playwright test capitulo-management capitulo-visibility`

## 5. Frontend — editor de stat block por sistema

- [x] 5.1 Atualizar `NpcFormDialog.tsx` para buscar o schema de campos do sistema da campanha (task 3.7) e renderizar um formulário dirigido por esse schema no lugar do textarea único atual, mantendo `descricao` como campo narrativo separado
- [x] 5.2 Verificar manualmente via `preview_start` que abrir o formulário de NPC numa campanha `wfrp` mostra os campos de WFRP e numa campanha `wod` mostra os campos de WoD
- [x] 5.3 Criar `frontend/e2e/npc-stat-block.spec.ts` cobrindo: preencher e salvar um stat block, reabrir o NPC e confirmar persistência, e confirmar que a visão pública do NPC não expõe o stat block; verificar com `npx playwright test npc-stat-block`

## 6. Documentação

- [x] 6.1 Atualizar a seção "Funcionalidades" do `README.md` descrevendo Capítulo (prep de aventura) e stat block por sistema, e adicionar uma entrada ao `CHANGELOG.md`; verificar lendo o diff e confirmando que reflete exatamente o que foi implementado

## 7. Correção pós-aplicação — Arco opcional e Sessão N:1 Capítulo

> Os grupos 1–6 já foram implementados (v1: `arco_id` obrigatório, `Capitulo.sessao_id` 1:1). Este grupo corrige o modelo para a hierarquia revisada: Arco (opcional) 1:N Capítulo 1:N Sessão, com `Sessao.arco_id` sincronizado a partir do Capítulo. Ver `design.md` para a justificativa completa.

- [x] 7.1 Migração Alembic (`alembic_campaign/versions/`, modo batch por causa do SQLite): tornar `capitulo.arco_id` nullable; adicionar `sessao.capitulo_id` (nullable, FK `capitulo.id`, `ondelete="SET NULL"`, sem `unique`); copiar, linha a linha, cada `capitulo.sessao_id` existente para o `capitulo_id` da `sessao` correspondente; remover a coluna `capitulo.sessao_id` e seu índice único. Verificar rodando a migração contra um banco de teste com uma linha de exemplo (capítulo com `sessao_id` preenchido) e confirmando que o valor aparece em `sessao.capitulo_id` depois, e que `capitulo.sessao_id` não existe mais
- [x] 7.2 Atualizar `backend/app/models/capitulo.py` (`arco_id: Optional[int]`, nullable; remover o campo `sessao_id`) e `backend/app/models/sessao.py` (adicionar `capitulo_id: Optional[int]` com a FK); verificar que `uv run pytest` carrega os modelos sem erro
- [x] 7.3 Atualizar `backend/app/schemas/capitulo.py` (remover `sessao_id` de todos os schemas; `arco_id` opcional em `CapituloCreate`/`CapituloUpdate`/`CapituloRead`/`CapituloAdmin`) e `backend/app/schemas/sessao.py` (adicionar `capitulo_id` opcional em `SessaoCreate`/`SessaoUpdate`/`SessaoAdmin`)
- [x] 7.4 Atualizar `backend/app/services/capitulo_service.py`: `_require_arco` só roda quando `arco_id` é informado; remover `_assert_sessao_livre`, o erro `CAPITULO_SESSAO_JA_VINCULADA` e `desvincular_sessao` (não fazem mais sentido nesse lado); `list_admin`/`list_public` passam a aceitar `arco_id: int | None` — quando `None`, listam todos os Capítulos da campanha (com e sem Arco); quando informado, filtram por Arco
- [x] 7.5 Atualizar `backend/app/services/sessao_service.py`: ao criar/atualizar uma Sessão com `capitulo_id`, validar que o Capítulo existe na campanha (erro estruturado `SESSAO_CAPITULO_INVALIDO` caso contrário) e sincronizar `arco_id = Capitulo.arco_id` (sobrescrevendo qualquer valor enviado); rejeitar com erro estruturado (`SESSAO_ARCO_DERIVADO_DE_CAPITULO`) uma tentativa de enviar um `arco_id` diferente do sincronizado quando a Sessão já tem `capitulo_id` definido; verificar com `uv run pytest backend/tests/test_sessao_capitulo_sync.py` (a criar) cobrindo vincular, mudar de capítulo, tentar sobrescrever arco manualmente e desvincular
- [x] 7.6 Atualizar `backend/app/services/capitulo_service.update_capitulo`: quando o `arco_id` do Capítulo muda, propagar (`UPDATE` em lote) o novo `arco_id` para todas as Sessões que têm esse `capitulo_id`; verificar com teste que, após mudar o arco de um Capítulo com duas Sessões vinculadas, ambas refletem o novo `arco_id`
- [x] 7.7 Atualizar `backend/app/routers/admin/capitulos.py` e `backend/app/routers/public/capitulos.py`: `arco_id` deixa de ser `Query(...)` obrigatório e vira `Query(None)` opcional nos endpoints de listagem; verificar com teste que listar sem `arco_id` retorna capítulos de arcos diferentes e capítulos avulsos juntos
- [x] 7.8 Reescrever `backend/tests/test_capitulos_crud.py` e `backend/tests/test_capitulos_isolation.py` para o modelo corrigido (capítulo sem arco, listagem sem filtro, capítulo com N sessões); atualizar ou criar o teste equivalente a `test_arco_sessao_vinculo.py` para cobrir a sincronização de arco via capítulo e a rejeição de edição direta de `arco_id` numa sessão vinculada
- [x] 7.9 Frontend: no formulário de Capítulo, tornar a seleção de Arco opcional e remover o seletor de Sessão (não faz mais sentido nesse lado); no formulário/listagem de Sessão, adicionar o seletor de Capítulo e desabilitar/ocultar a edição direta de Arco quando um Capítulo está selecionado, deixando claro que o arco vem do Capítulo; atualizar `frontend/e2e/capitulo-management.spec.ts` e criar `frontend/e2e/sessao-capitulo-sync.spec.ts` cobrindo: vincular sessão a capítulo sincroniza o arco exibido, e tentar editar o arco diretamente fica bloqueado enquanto o vínculo existe
- [x] 7.10 Atualizar `README.md`/`CHANGELOG.md` para refletir o modelo corrigido (Capítulo opcionalmente vinculado a Arco; Sessão referencia o Capítulo jogado; arco da sessão sincronizado automaticamente)

## 8. Correção — atributos numéricos como tabela (edição, visualização e markdown)

> O grupo 5 já foi implementado, mas apresenta as características (campos `tipo == "int"`) como campos soltos empilhados, não como a tabela única que o mestre já usa no Obsidian. Este grupo corrige a apresentação, sem mudar o schema de campos nem a validação.

- [x] 8.1 Atualizar `backend/app/services/stat_blocks/base.py` (`render_characteristics`): trocar a linha separadora da tabela markdown de `"---"` por coluna para `":-:"`, replicando o alinhamento centralizado já usado pelo mestre em `NPCs/*.md` no vault Obsidian; verificar com um teste em `backend/tests/test_stat_blocks.py` comparando a string exata gerada (cabeçalho, separador `:-:`, linha de valores)
- [x] 8.2 Atualizar `frontend/src/components/admin/StatBlockFields.tsx`: agrupar os campos com `tipo === 'int'` (na ordem recebida do schema) numa única tabela HTML editável — uma linha de cabeçalho com os rótulos e uma linha com um `<input type="number">` por coluna — no lugar do campo isolado empilhado por atributo; os campos `list[str]`/`str` continuam renderizados como hoje, fora dessa tabela
- [x] 8.3 Atualizar `StatBlockSummary` (mesmo arquivo) para exibir os campos `tipo === 'int'` como uma tabela de visualização (cabeçalho + linha de valores) no lugar do grid `<dl>` atual, mantendo colunas sem valor visíveis (vazias), e mantendo os demais campos como estão
- [x] 8.4 Verificar manualmente via `preview_start` que abrir o editor de um NPC `wfrp` mostra `CA | HPr | FOR | RES | IN | AG | DES | INT | VON | CAM` como uma única tabela, e que a visualização do mesmo NPC preenchido mostra a mesma tabela com os valores
- [x] 8.5 Atualizar `frontend/e2e/npc-stat-block.spec.ts` para verificar que os campos numéricos aparecem dentro de um elemento `<table>` tanto na edição quanto na visualização
