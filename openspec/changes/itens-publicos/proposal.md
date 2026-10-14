# Proposal

## Why

O backend já modela Itens da campanha como uma entidade de primeira classe — o mestre já cadastra e associa Itens a sessões/eventos pelo `ItemManager` dentro da Linha do Tempo, e `openspec/specs/linha-tempo-por-descoberta/spec.md` já trata Itens como um dos 4 tipos rastreados na visualização "Por descoberta" (junto com Personagens, Locais e Facções). O backend também já expõe `GET /api/c/{slug}/itens` e `GET /api/c/{slug}/itens/{id}` como rotas públicas, filtradas por visibilidade exatamente como as demais entidades — mas hoje nenhum frontend chama essas rotas. O jogador não tem como ver os Itens da campanha em lugar nenhum da interface, mesmo quando o mestre já os cadastrou e marcou como visíveis. Esta proposta fecha essa lacuna com uma tela pública dedicada, sem exigir nenhuma mudança no backend.

## What Changes

- Nova rota `/c/:slug/itens` em `frontend/`, com uma tela de listagem (busca por nome) e detalhe de Item (nome, descrição em Markdown sanitizado, chips de sessões/eventos associados), consumindo `GET /api/c/{slug}/itens` e `GET /api/c/{slug}/itens/{id}` — os mesmos endpoints públicos que já existem e já filtram por visibilidade.
- Nova aba "Itens" na navegação da campanha (`frontend/src/components/layout/campaignNav.ts`), seguindo o mesmo padrão das abas existentes (Mapa/Relações/Rota/Sessões/Linha do Tempo): ícone Tabler, rota própria, chave i18n em `comum.nav.*`, entrada em `activeCampaignNavId`.
- Novo namespace de i18n `itens` (pt-BR + en), seguindo o padrão de `sessoes`/`linhaTempo`.
- Em Modo GM, a tela nova mostra um link de conveniência para o `ItemManager` (dentro de Linha do Tempo) para cadastrar/editar Itens — **não duplica o CRUD**, que continua vivendo só ali.
- **Sem nenhuma mudança no backend**: os dois endpoints públicos já existem, já filtram por `visivel_para_todos`, e já filtram as referências de sessão/evento por visibilidade individual de cada uma. `backend/tests/test_itens_crud.py` não precisa de alteração.
- **Fora do escopo desta proposta**: `frontend-v2/` (a migração de frontend tratada pela change `frontend-v2-paper-parchment`) não é tocada aqui. Essa tela nova em `frontend/` passa a ser, a partir de agora, parte do que a Requirement "Paridade funcional com o frontend atual" daquela change exige cobrir — sem precisar editar a spec dela.

## Capabilities

### New Capabilities
- `itens-publicos`: permite que qualquer visitante de uma campanha (jogador ou mestre) veja a lista e o detalhe dos Itens marcados como visíveis, incluindo suas referências a sessões e eventos, pelos mesmos endpoints públicos e regras de visibilidade já aplicadas a Locais/Personagens/Arcos/Sessões/Eventos — sem introduzir CRUD novo (o CRUD de GM já existe em `ItemManager` e não muda).

### Modified Capabilities
(nenhuma — `linha-tempo-por-descoberta` já trata Itens como tipo rastreado e seu texto não muda; esta proposta só adiciona a superfície de leitura dedicada que faltava, consumindo dados que já respeitam essas regras.)

## Impact

- **Frontend (`frontend/`)**: nova página `ItensPage.tsx`, nova rota em `App.tsx`, nova entrada em `campaignNav.ts`, novo método `listItens`/`getItem` em `frontend/src/api/campaign.ts` (client público, mesmo padrão de `listSessoes`), novo namespace i18n `itens` (pt-BR + en). Reaproveita componentes/padrões já existentes do design atual: `CodexHeader`, `MarkdownSafe`, `EmptyState`/`Input` do kit de UI, `useInstanceConfig`, estilo de chip-link (`<Link>` estilizado) já usado em `LinhaTempoPage`/`SessoesPage`.
- **Backend**: nenhuma mudança — endpoints, schemas e testes já existentes continuam como estão.
- **`frontend-v2-paper-parchment`**: nenhuma edição nessa change; esta tela nova entra automaticamente no escopo de paridade que ela já exige, a ser coberta quando aquela migração for implementada.
- **Dados/migrações**: nenhuma.
