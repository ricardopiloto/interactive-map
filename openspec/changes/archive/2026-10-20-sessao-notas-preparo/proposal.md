# Proposal

## Why

A Linha do Tempo e a tela de Sessões só registram o que **já aconteceu** — resumo, arcos, descoberta. Não existe um lugar pra o mestre preparar a **próxima** sessão: anotar cenas previstas, ganchos a puxar, segredos a revelar, antes de jogar. O mestre precisa de um campo de notas de preparo sempre privado (nunca visível a jogadores), e de um jeito de registrar essas notas antes mesmo de a sessão ter acontecido — sem exigir um conceito novo de "sessão em rascunho" no sistema.

## What Changes

- Adiciona o campo `notas_preparo` (texto Markdown livre, opcional) à `Sessao`, espelhando o campo `resumo` já existente mas para o momento **antes** da sessão.
- `notas_preparo` é sempre GM-only por construção do schema (entra em `SessaoAdmin`, nunca em `SessaoPublic`) — não depende de `visivel_para_todos`.
- Reaproveita o campo `visivel_para_todos` (já existente em `Sessao`) como o controle de "sessão ainda não pronta pra jogadores": o mestre pré-cria a próxima sessão (reservando o número via o endpoint já existente de próximo número) com `visivel_para_todos=False` enquanto só tem notas de preparo, e muda pra `True` quando a sessão é jogada e o resumo é preenchido. Nenhum estado novo de "rascunho/planejada" é criado.
- `notas_preparo` não é apagado quando `resumo` é preenchido depois — os dois ficam lado a lado, permitindo ao mestre comparar o que planejou com o que de fato aconteceu.
- A Linha do Tempo passa a indicar quando a próxima sessão (ainda oculta) tem notas de preparo registradas.

## Capabilities

### New Capabilities
- `sessao-notas-preparo`: o sistema permite ao mestre registrar e manter notas de preparo privadas numa Sessão, antes dela ser jogada e revelada, sem introduzir um estado de ciclo de vida novo além do já existente (`visivel_para_todos`).

### Modified Capabilities
_Nenhuma — `linha-tempo-por-arcos`, `linha-tempo-por-descoberta` e `sessoes-layout` tratam de agrupamento/layout/descoberta de sessões já jogadas; nenhuma delas cobre dados de preparo pré-sessão ou o uso de `visivel_para_todos` como indicador de "ainda não pronta". A indicação na Linha do Tempo descrita abaixo é um requisito novo desta capability, não uma mudança de requisito das existentes._

## Impact

- **Backend**: `backend/app/models/sessao.py` (campo novo), `backend/app/schemas/sessao.py` (`SessaoCreate`/`SessaoUpdate`/`SessaoAdmin` — nunca `SessaoPublic`), migração nova em `backend/alembic_campaign/versions/`. Sem endpoint novo — reaproveita o CRUD de `Sessao` e `GET /sessoes/proximo-numero` (`backend/app/routers/admin/sessoes.py`).
- **Frontend (`frontend-v2/`, único frontend em produção)**: `frontend-v2/src/components/codex/SessionEditor.tsx` (textarea novo), `frontend-v2/src/routes/cronologia.tsx` (indicador de notas de preparo na próxima sessão oculta), locales `frontend-v2/src/locales/{pt-BR,en}/sessoes.json` e/ou `linhaTempo.json`.
- **Testes**: `backend/tests/` — teste garantindo que `notas_preparo` nunca aparece em `SessaoPublic`/endpoint público (padrão de `backend/tests/test_sessoes_visibility.py`), e teste de borda pro conflito de `numero` duplicado ao pré-criar a próxima sessão.
