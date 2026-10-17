# Proposal

## Why

O backend já modela Itens da campanha como uma entidade de primeira classe — o mestre já cadastra e associa Itens a sessões/eventos pelo gerenciador de Itens dentro da Linha do Tempo (`frontend-v2/src/routes/cronologia.tsx`), e `openspec/specs/linha-tempo-por-descoberta/spec.md` já trata Itens como um dos 4 tipos rastreados na visualização "Por descoberta". O backend também já expõe `GET /api/c/{slug}/itens` e `GET /api/c/{slug}/itens/{id}` como rotas públicas, filtradas por visibilidade exatamente como as demais entidades — mas hoje nenhum frontend chama essas rotas públicas (só o client admin existe). O jogador não tem como ver os Itens da campanha em lugar nenhum da interface, mesmo quando o mestre já os cadastrou e marcou como visíveis. Esta proposta fecha essa lacuna com uma tela pública dedicada, sem exigir nenhuma mudança no backend.

**Nota de redirecionamento**: esta proposta foi originalmente escrita mirando o frontend legado (`frontend/`). `openspec/changes/frontend-v2-paper-parchment/design.md` já excluiu explicitamente essa tela do escopo da migração ("fica fora do escopo desta change; será proposta como uma OpenSpec separada") — esta é essa proposta separada, mas `frontend/` é removido do repositório na task 12.4 (cutover) daquela change, já com a seção de validação de paridade (11) fechada e sem nenhuma task que "pegaria" automaticamente uma tela nova adicionada depois. Implementar em `frontend/` agora significa construir e descartar no cutover. Reescrita para mirar `frontend-v2/` diretamente.

## What Changes

- Nova rota `/c/:id/:slug/itens` (e compatibilidade `/c/:slug/itens`, mesmo padrão das demais abas pós `campanha-slug-com-id`) em `frontend-v2/`, com uma tela de listagem (busca por nome) e detalhe de Item (nome, descrição em Markdown sanitizado via `RichContent`, chips de sessões associadas), consumindo um client novo para `GET /api/c/{slug}/itens` (os eventos/sessões de cada item já vêm completos nessa resposta — não é necessário um segundo endpoint de detalhe).
- Nova aba "Itens" na navegação da campanha (`frontend-v2/src/components/codex/Shell.tsx`, array `lenses`), seguindo o mesmo padrão das abas existentes.
- Novo namespace de i18n `itens` (pt-BR + en), registrado em `frontend-v2/src/i18n/index.ts`.
- Em Modo GM (`isDono`), a tela mostra **todos** os Itens (inclusive os ocultos, com indicação visual), reaproveitando o client admin já existente (`timelineApi.items`) em vez do client público — mesmo padrão já usado por `sessoes.tsx`/`MapPage` para outras entidades, onde o dono sempre vê o conjunto completo. Um link de conveniência leva à Linha do Tempo (onde o gerenciador de Itens já vive) para criar/editar/excluir — **não duplica o CRUD**.
- Deep-link `?item=ID` para selecionar um Item diretamente (mesmo padrão já usado por `?local=ID`/`?personagem=ID`). Chip de sessão associada navega para `/sessoes?s={numero}` (a página de Sessões já reconhece esse parâmetro, pré-selecionando a sessão) — diferente da proposta original (que não tinha esse deep-link disponível no frontend legado).
- **Sem nenhuma mudança no backend**: o endpoint público já existe, já filtra por `visivel_para_todos`, e já filtra as referências de sessão/evento por visibilidade individual de cada uma. `backend/tests/test_itens_crud.py` não precisa de alteração.

## Capabilities

### New Capabilities
- `itens-publicos`: permite que qualquer visitante de uma campanha (jogador ou mestre) veja a lista e o detalhe dos Itens marcados como visíveis, incluindo suas referências a sessões e eventos, pelos mesmos endpoints públicos e regras de visibilidade já aplicadas a Locais/Personagens/Arcos/Sessões/Eventos — sem introduzir CRUD novo (o CRUD de GM já existe dentro da Linha do Tempo e não muda).

### Modified Capabilities
(nenhuma — `linha-tempo-por-descoberta` já trata Itens como tipo rastreado e seu texto não muda; esta proposta só adiciona a superfície de leitura dedicada que faltava.)

## Impact

- **Frontend (`frontend-v2/`)**: nova página `routes/itens.tsx`, nova rota em `routes/campaignRoutes.tsx`, nova entrada em `components/codex/Shell.tsx` (`lenses`), novo client público em `api/timeline.ts` (ou um `api/itens.ts` dedicado) com um tipo `ItemPublico` (sem `visivel_para_todos`, diferente do `Item` admin já existente) e `listItensPublicos(slug)`, novo namespace i18n `itens` (pt-BR + en) registrado em `i18n/index.ts`. Reaproveita `RichContent` (Markdown sanitizado), o padrão de chip já usado em `sessoes.tsx` (`EntityChip`/`badgeVariants`), e `?s={numero}` já reconhecido por `sessoes.tsx` para o deep-link de sessão associada.
- **Backend**: nenhuma mudança — endpoints, schemas e testes já existentes continuam como estão.
- **`frontend-v2-paper-parchment`**: nenhuma edição nessa change em si; esta tela passa a fazer parte do produto entregue por `frontend-v2/`, mas como uma capability própria (não uma task daquela change, que já a excluiu explicitamente do escopo).
- **Dados/migrações**: nenhuma.
