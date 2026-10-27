# Proposal

## Why

Um mestre preparando uma sessão de jogo precisa de um lugar pra anotar o lado mecânico de um Personagem (PV, ataque, perícia relevante, condição em andamento) — hoje o `Personagem` (PJ ou NPC) só tem campos narrativos (`descricao`, `papel`, `faccao`, `status`). O único campo mecânico existente, `extensoes_mecanica`, é um mecanismo de módulos ativados por campanha (hoje só reconhece `fadiga`) — não serve como bloco de notas sempre disponível, porque exigiria criar e habilitar um módulo novo só pra isso. Falta um campo de texto livre, sempre disponível, nunca visível a jogadores, onde o mestre anota o que quiser sobre a mecânica daquele Personagem.

## What Changes

- Adiciona o campo `notas_mecanicas` (texto Markdown livre, opcional) ao `Personagem` (modelo `NPC`, que já representa tanto `tipo=pj` quanto `tipo=npc`).
- O campo é sempre GM-only: nunca é serializado pra um jogador (`for_player=True`), independente de `visivel_para_todos` (que controla a visibilidade do Personagem inteiro, não de um campo específico).
- O campo aparece em dois lugares da interface do mestre: no formulário de edição do Personagem e no painel de leitura rápida (o mesmo que abre ao selecionar um Personagem na Rede de Relações) — não só na edição, porque o mestre consulta mecânica durante o jogo, não só no preparo.
- Migração de banco (Alembic, aplicada por campanha) adiciona a coluna nova com valor padrão vazio — nenhum dado existente é alterado.

## Capabilities

### New Capabilities
- `personagem-notas-mecanicas`: o sistema armazena uma nota mecânica livre por Personagem (PJ ou NPC) e garante que ela só é exposta ao mestre, nunca a jogadores, em qualquer superfície (API pública, painel de leitura, formulário de edição).

### Modified Capabilities
_Nenhuma — não há spec existente que cubra dados do Personagem além de `retratos-personagem` (retrato) e `rede-relacoes` (grafo/layout), nenhuma delas trata de campos de dados mecânicos ou de visibilidade GM-only por campo._

## Impact

- **Backend**: `backend/app/models/npc.py` (campo novo), `backend/app/schemas/personagem.py` (`PersonagemCreate`/`PersonagemUpdate`/`PersonagemRead`), `backend/app/routers/public/personagens.py` (`personagem_to_read`: forçar `None` quando `for_player=True`), `backend/app/routers/admin/personagens.py` (sem mudança de lógica, só o campo passando pelo CRUD existente), nova migração em `backend/alembic_campaign/versions/`.
- **Frontend (`frontend-v2/`, único frontend em produção)**: `frontend-v2/src/components/codex/RelationEditors.tsx` (textarea novo, mesmo padrão do campo `descricao`), `frontend-v2/src/routes/relacoes.tsx` (exibição no painel de leitura, reaproveitando o gate `isGm` já usado ali), `frontend-v2/src/api/relacoes.ts` (tipo `Personagem`/payloads), locales `frontend-v2/src/locales/{pt-BR,en}/relacoes.json`.
- **Testes**: `backend/tests/` — teste novo (ou extensão de um existente) garantindo que `notas_mecanicas` nunca aparece em `GET /api/personagens` nem `GET /api/personagens/{id}` (endpoints públicos), seguindo o padrão de `backend/tests/test_visibility_relacoes.py`.
- **Sem impacto** em `frontend/` nem `frontend-next/` (não deployados, fora de escopo).
