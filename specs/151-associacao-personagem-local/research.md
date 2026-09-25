# Research: Associar personagens a Locais

**Feature**: `151-associacao-personagem-local`
**Date**: 2026-09-25

## 1. Modelo de personagem e relação

**Decision**: reutilizar a entidade `NPC` unificada, que tem `tipo` `pj|npc`, e a tabela N:N `LocalNPCLink` existente. Não criar uma entidade de associação nova nem uma migration.

**Rationale**: `backend/app/models/npc.py` documenta que a tabela `npc` contém personagens PJ e NPC. `Local` e `NPC` já se relacionam através de `LocalNPCLink` em `backend/app/models/links.py`, com chave composta de `local_id` e `npc_id`. O endpoint de atualização `_sync_npcs` busca qualquer linha `NPC` por ID e não filtra por tipo.

**Alternatives considered**: criar `LocalPersonagemLink` e migrar relações existentes — rejeitado, pois duplicaria uma relação que já aceita qualquer tipo e aumentaria o risco de perda de dados.

## 2. Contrato de leitura e gravação

**Decision**: preservar os payloads `npc_ids` de `LocalCreate`, `LocalUpdate` e `LocalRead`, além dos endpoints atuais. O nome legado é mantido por compatibilidade; os IDs podem referir-se a personagens de ambos os tipos.

**Rationale**: `frontend/src/types/index.ts` já declara `Personagem` como a forma unificada de `NPC` acrescida de `tipo`; as APIs públicas e administrativas retornam personagens nessa estrutura. `/api/locais` serializa IDs de todos os tipos, filtrando para jogador as entidades não visíveis, e `/api/admin/locais` inclui todos.

**Alternatives considered**: renomear `npc_ids` para `personagem_ids` agora — rejeitado por ser mudança de contrato sem necessidade funcional; pode ser avaliado numa migração futura, separada e compatível.

## 3. Causa do bloqueio atual

**Decision**: tratar o filtro de tipos no carregamento de dados do Mapa como causa primária. Fazer a lista usada na edição e na leitura de Local conter os PJs e NPCs disponíveis para aquela pessoa.

**Rationale**: `frontend/src/hooks/useCampaignData.ts` recebe a resposta de personagens mas aplica `filter((n) => (n.tipo ?? 'npc') === 'npc')`. A resposta de `local.npc_ids` já pode conter PJ, então esse filtro também os omite da exibição dos vínculos no detalhe do Local.

**Alternatives considered**: alterar o backend para permitir associação PJ — desnecessário: `LocalNPCLink`, `_sync_npcs`, os schemas e a serialização não filtram o tipo para edição.

## 4. Identificação de tipo e visibilidade

**Decision**: identificar cada personagem como PJ ou NPC nas opções editáveis e na apresentação do Local, com labels localizadas. Reusar as regras existentes: mestres veem registros ocultos; jogadores só recebem personagens e Locais visíveis.

**Rationale**: o editor atual em `LocalFormDialog.tsx` mostra chips com nomes sem o tipo; o detalhe em `MapPage.tsx` usa o rótulo `npcsHere`, apesar de os tipos já serem distinguíveis no detalhe individual do personagem. `personagem_to_read` e `_to_read` já aplicam regras de visibilidade diferentes para jogador e mestre.

**Alternatives considered**: expor personagens ocultos ao jogador para que apareçam como associação — rejeitado por violar regras de privacidade existentes.

## 5. Segurança e isolamento

**Decision**: não adicionar superfície de escrita. Preservar rotas administrativas sob o router de campanha autenticado e acrescentar regressões para associação e leitura por tipos/visibilidade; verificar isolamento no caminho existente de campanha. Para esta aplicação, a permissão de edição existente é a sessão autenticada que pertence à campanha (`require_membro`), também usada pelo endpoint de sessão administrativa que habilita `canEdit` no frontend. A validação negativa deve cobrir pessoa anónima e conta autenticada sem associação à campanha; não há hoje um papel de jogador com acesso somente de leitura para contas membros.

**Rationale**: `backend/app/routers/admin/__init__.py` aplica `require_membro` às rotas administrativas, e `frontend/src/context/EditModeContext.tsx` usa `/admin/session` como verificação de edição. Campanhas usam bancos separados; os IDs são resolvidos somente no banco da campanha presente na requisição. Testes existentes cobrem ocultação de personagem/local e a leitura de `local_ids`.

**Alternatives considered**: introduzir papel de editor/leitor ou nova autorização por papel — fora do escopo, pois mudaria o modelo de permissões de toda a aplicação. Um ID recebido é sempre resolvido no banco da campanha atual e nunca permite consultar o banco de outra campanha.

## 6. Cobertura de validação

**Decision**: acrescentar testes para mestre associar/desassociar PJ e NPC, persistência após recarga, apresentação com tipo, filtro de ocultos para jogador e rejeição de operação sem autorização/fora do contexto de campanha. Cobrir o fluxo do Mapa nos E2Es em pt-BR e en.

**Rationale**: não há E2E focado na associação de personagem a Local; testes de visibilidade em backend já estabelecem padrões reutilizáveis em `test_visibility_local_arco.py` e `test_visibility.py`.

**Alternatives considered**: depender apenas da checagem manual — insuficiente para relações persistidas e regras de visibilidade.
