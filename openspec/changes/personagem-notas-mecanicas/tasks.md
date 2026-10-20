# Tasks

## 1. Backend — modelo e migração

- [x] 1.1 Adicionar o campo `notas_mecanicas: str` (default `""`, `max_length=10000`), consistente com o campo `descricao` já existente no mesmo modelo, ao `NPC` em `backend/app/models/npc.py` e verificar que `python -c "from app.models.npc import NPC"` não levanta erro
- [x] 1.2 Antes de criar o arquivo, rodar, de dentro de `backend/`, `uv run alembic -c alembic_campaign.ini heads` pra confirmar a revisão de topo real no momento da implementação — **não hardcodar `010_...`/`down_revision="009_item"`**: a change `sessao-notas-preparo` também propõe uma migração nova no mesmo diretório, e aplicar as duas fora de ordem com o mesmo `down_revision` causa "Multiple heads" no Alembic (ver `design.md` — Migration Plan). Criar a migração nova em `backend/alembic_campaign/versions/` com o número/`down_revision` que o head real exigir, seguindo o padrão de `009_item.py`; verificar que `upgrade head` (ou o fluxo automático de `_upgrade_or_bridge_campaign`) aplica sem erro num banco de teste e que `downgrade` remove a coluna sem quebrar

## 2. Backend — schema e filtragem GM-only

- [x] 2.1 Adicionar `notas_mecanicas` a `PersonagemCreate`, `PersonagemUpdate` e `PersonagemRead` em `backend/app/schemas/personagem.py`
- [x] 2.2 Em `personagem_to_read()` (`backend/app/routers/public/personagens.py`), forçar `notas_mecanicas=""` quando `for_player=True` e passar o valor real quando `for_player=False`; verificar manualmente (ou via teste da tarefa 2.3) que `GET /api/personagens` (público) nunca devolve o conteúdo real do campo
- [x] 2.3 Escrever teste em `backend/tests/test_visibility_relacoes.py` (reaproveitando `seed_personagem` de `backend/tests/helpers.py`) cobrindo: Personagem com `tipo=npc` e nota preenchida não aparece na listagem pública nem no detalhe público; Personagem com `tipo=pj` e nota preenchida tem o mesmo comportamento; verificar com `pytest backend/tests/test_visibility_relacoes.py`
- [x] 2.4 Verificar que o CRUD admin (`backend/app/routers/admin/personagens.py`, `create_personagem`/`update_personagem`) grava e devolve `notas_mecanicas` corretamente via `personagem_to_read(row, for_player=False)`, com teste em `backend/tests/` cobrindo criar e atualizar o campo

## 3. Frontend — formulário de edição

- [x] 3.1 Adicionar `notas_mecanicas` ao tipo `Personagem`/payloads em `frontend-v2/src/api/relacoes.ts`
- [x] 3.2 Adicionar textarea para `notas_mecanicas` em `frontend-v2/src/components/codex/RelationEditors.tsx`, seguindo o mesmo padrão do campo `descricao` já existente (linhas ~145-148), com rótulo `personagemForm.notasMecanicas`
- [x] 3.3 Adicionar as chaves de tradução novas em `frontend-v2/src/locales/pt-BR/relacoes.json` e `frontend-v2/src/locales/en/relacoes.json`; verificar visualmente que o campo aparece e salva no formulário de edição de um Personagem

## 4. Frontend — painel de leitura rápida

- [x] 4.1 Em `frontend-v2/src/routes/relacoes.tsx`, exibir `notas_mecanicas` (quando preenchida) no painel de leitura do Personagem, reaproveitando o gate `isGm` já usado ali (próximo à linha que exibe `fadiga`, ~linha 610); quando a nota estiver vazia, não renderizar a seção
- [x] 4.2 Verificar manualmente no navegador: como mestre, selecionar um NPC e um PJ com nota mecânica preenchida e confirmar que o painel de leitura mostra o texto nos dois casos; confirmar que a seção não aparece quando a nota está vazia

## 5. Verificação final

- [x] 5.1 Rodar a suíte completa de testes do backend (`pytest backend/tests/`) e confirmar que nenhum teste existente quebrou
- [x] 5.2 Rodar `tsc --noEmit` em `frontend-v2/` e a suíte de testes do frontend, confirmando que passam sem erro novo
- [x] 5.3 Verificar, como jogador (sessão não-GM), que o campo `notas_mecanicas` não aparece em nenhuma tela nem na resposta de rede (inspecionar `GET /api/personagens` via devtools) para um Personagem com a nota preenchida

## Workflow follow-up

- [x] Atualizar `docs/backlog/backlog.md` — marcar BKLG-042 como implementado, com link para esta change.
- Arquivar esta change (`openspec archive personagem-notas-mecanicas`) depois da revisão do mestre usuário-teste.
