# Tasks

## 1. Backend — modelo e migração

- [x] 1.1 Adicionar o campo `notas_preparo: str` (default `""`, `max_length=50000`, igual a `resumo`) ao modelo `Sessao` em `backend/app/models/sessao.py` e verificar que `python -c "from app.models.sessao import Sessao"` não levanta erro
- [x] 1.2 Antes de criar o arquivo, rodar, de dentro de `backend/`, `uv run alembic -c alembic_campaign.ini heads` pra confirmar a revisão de topo real no momento da implementação — **não hardcodar `011_...`/`down_revision="009_item"`**: a change `personagem-notas-mecanicas` também propõe uma migração nova no mesmo diretório, e aplicar as duas fora de ordem com o mesmo `down_revision` causa "Multiple heads" no Alembic (ver `design.md` — Migration Plan). Criar a migração nova em `backend/alembic_campaign/versions/` com o número/`down_revision` que o head real exigir, seguindo o padrão de `009_item.py`; verificar que a migração aplica e reverte sem erro num banco de teste

## 2. Backend — schema e visibilidade GM-only

- [x] 2.1 Adicionar `notas_preparo` a `SessaoCreate`, `SessaoUpdate` e `SessaoAdmin` em `backend/app/schemas/sessao.py` — **não** adicionar a `SessaoPublic`
- [x] 2.2 Verificar que o CRUD existente (`backend/app/routers/admin/sessoes.py`) grava e devolve `notas_preparo` corretamente, sem mudança de lógica adicional (o campo passa pelo fluxo de `SessaoCreate`/`SessaoUpdate` já existente)
- [x] 2.3 Escrever teste em `backend/tests/test_sessoes_visibility.py` (reaproveitando `seed_sessao` de `backend/tests/helpers.py`) cobrindo: uma Sessão com `notas_preparo` preenchida não aparece em `GET /api/sessoes` (público), mesmo quando `visivel_para_todos=true`; verificar com `pytest backend/tests/test_sessoes_visibility.py`
- [x] 2.4 Escrever teste garantindo que preencher `resumo` numa Sessão que já tinha `notas_preparo` preenchida não apaga nem altera `notas_preparo`
- [x] 2.5 Escrever teste de borda: pré-criar duas Sessões com o mesmo `numero` (simulando o conflito de reserva concorrente) retorna um erro tratável (4xx com corpo de erro padrão do projeto), não um 500

## 3. Frontend — formulário de edição de Sessão

- [x] 3.1 Adicionar `notas_preparo` ao tipo/payload de Sessão usado por `frontend-v2/src/components/codex/SessionEditor.tsx` e pela chamada de API correspondente
- [x] 3.2 Adicionar textarea para `notas_preparo` em `SessionEditor.tsx`, seguindo o mesmo padrão do campo `resumo` já existente (linhas ~791-792 do fluxo de edição)
- [x] 3.3 Adicionar as chaves de tradução novas em `frontend-v2/src/locales/pt-BR/sessoes.json` e `frontend-v2/src/locales/en/sessoes.json`; verificar visualmente que o campo aparece e salva no formulário de edição de uma Sessão

## 4. Frontend — pré-criar próxima sessão e indicador na Linha do Tempo

- [x] 4.1 Adicionar o botão/ação "preparar próxima sessão" (na tela de Sessões ou no editor) que chama `GET /sessoes/proximo-numero` e abre o formulário de criação de Sessão já com o `numero` sugerido preenchido
- [x] 4.2 Nesse fluxo específico de "preparar próxima sessão", pré-marcar `visivel_para_todos=false` por padrão no formulário (diferente do padrão `true` usado na criação normal de Sessão), já com o campo de notas de preparo em foco; verificar que salvar nesse fluxo cria a Sessão oculta corretamente
- [x] 4.3 Em `frontend-v2/src/routes/cronologia.tsx`, exibir uma indicação (reaproveitando o gate `gm && x.visivel_para_todos === false`, já usado para Eventos na linha ~433) de que a próxima sessão oculta tem notas de preparo preenchidas
- [x] 4.4 Verificar manualmente no navegador: como mestre, usar o fluxo de "preparar próxima sessão" (4.1-4.2) com notas de preparo, confirmar a indicação na Linha do Tempo (4.3), preencher o resumo depois e confirmar que as notas de preparo continuam visíveis junto do resumo

## 5. Verificação final

- [x] 5.1 Rodar a suíte completa de testes do backend (`pytest backend/tests/`) e confirmar que nenhum teste existente quebrou
- [x] 5.2 Rodar `tsc --noEmit` em `frontend-v2/` e a suíte de testes do frontend, confirmando que passam sem erro novo
- [x] 5.3 Verificar, como jogador (sessão não-GM), que `notas_preparo` não aparece em nenhuma tela nem na resposta de rede (`GET /api/sessoes` via devtools) para nenhuma Sessão

## Workflow follow-up

- Atualizar `docs/backlog/backlog.md` — marcar BKLG-044 como implementado, com link para esta change.
- Arquivar esta change (`openspec archive sessao-notas-preparo`) depois da revisão do mestre usuário-teste.
