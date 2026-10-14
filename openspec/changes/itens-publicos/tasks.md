# Tasks

## 1. Client HTTP e i18n

- [ ] 1.1 Adicionar `listItens`/`getItem` a `frontend/src/api/campaign.ts` (mesmo padrão de `listSessoes`: `api.get<{ itens: Item[] }>(p('/itens'))` e `api.get<Item>(p('/itens/:id'))`), reaproveitando o tipo `Item`/`ItemRefSessao`/`ItemRefEvento` já existente em `frontend/src/types/index.ts`; verificar com um teste que mocka a chamada e confirma o shape da resposta.
- [ ] 1.2 Criar o namespace de i18n `itens` (pt-BR + en) em `frontend/src/locales/{pt-BR,en}/itens.json`, com as chaves de título da página, estado vazio, busca, chips de sessão/evento e link para o gerenciador de GM; verificar alternando o idioma e confirmando que todos os textos novos aparecem traduzidos.

## 2. Navegação

- [ ] 2.1 Adicionar `'itens'` a `CampaignNavId` e uma entrada em `campaignNavItems(slug)` (`frontend/src/components/layout/campaignNav.ts`) com rota `/c/:slug/itens`, ícone Tabler apropriado (ex. `IconBox`/`IconPackage`) e `labelKey: 'itens'`; atualizar `activeCampaignNavId` para reconhecer essa rota; verificar que a nova aba aparece em `CodexHeader`/`CampaignBottomNav` e fica marcada como ativa na rota `/c/:slug/itens`.
- [ ] 2.2 Registrar a rota `/c/:slug/itens` em `frontend/src/App.tsx`, dentro do mesmo grupo de rotas de campanha das demais abas; verificar navegando direto para a URL e confirmando que a página carrega sem precisar passar por outra tela primeiro.

## 3. Tela de listagem e detalhe

- [ ] 3.1 Criar `frontend/src/pages/ItensPage.tsx`: lista lateral com busca por nome (reaproveitando `Input`/`EmptyState` do kit de UI), consumindo `campaignApi.listItens()`; verificar com uma campanha com múltiplos Itens e confirmar que a busca filtra corretamente.
- [ ] 3.2 Implementar o painel de detalhe do Item selecionado: nome, descrição via `MarkdownSafe`, chips de sessões/eventos associados (estilo `<Link>` igual ao já usado em `LinhaTempoPage`, navegando para `/c/:slug/sessoes` e `/c/:slug/linha-do-tempo` conforme Decision 2 de `design.md`); verificar com um Item com descrição em Markdown e referências e confirmar renderização sanitizada e chips navegáveis.
- [ ] 3.3 Implementar o estado vazio (nenhum Item cadastrado/visível) usando `EmptyState`; verificar abrindo uma campanha sem Itens e confirmando a mensagem, não uma tela em branco ou erro.
- [ ] 3.4 Em Modo GM (`useEditMode`), mostrar um link/botão para abrir a Linha do Tempo com o `ItemManager`, sem nenhuma ação de criar/editar/excluir na própria `ItensPage` (Decision 3); verificar que o link leva à Linha do Tempo e que não há nenhum botão de CRUD na tela nova.

## 4. Verificação de visibilidade e paridade com o backend

- [ ] 4.1 Adicionar aos fixtures de seed usados por `frontend/e2e/` (`seed_e2e.py` ou equivalente) pelo menos: um Item com `visivel_para_todos=false`, e um Item visível associado a uma sessão visível **e** a uma sessão oculta; verificar que o seed roda sem erro e que os dois Itens aparecem no banco de teste com os campos esperados.
- [ ] 4.2 Escrever um teste e2e Playwright (`frontend/e2e/`) confirmando que o Item oculto da task 4.1 **não aparece na lista** de `ItensPage` e que acessá-lo diretamente por id (sem sessão de dono) resulta no mesmo estado de "não encontrado" usado para um id inexistente — isto é obrigatório, não uma checagem manual opcional; verificar que o teste falha se a regra de visibilidade for removida (rodar uma vez com o filtro comentado no backend local, só para confirmar que o teste pega a regressão, e depois reverter).
- [ ] 4.3 Escrever um teste e2e Playwright confirmando que, no detalhe do Item visível associado a uma sessão oculta (task 4.1), o chip dessa sessão **não aparece**, só o da sessão visível — também obrigatório, não checagem manual.
- [ ] 4.4 Rodar `backend/tests/test_itens_crud.py` e a suíte de testes públicos (`test_public_reads.py`) para confirmar que nenhum contrato foi alterado; verificar que a suíte passa sem modificação.
- [ ] 4.5 Escrever um teste e2e Playwright cobrindo o fluxo feliz: abrir a aba Itens → buscar por nome → selecionar um Item → ver descrição e chips; verificar que o teste passa localmente.

## Workflow follow-up

- Arquivar esta change (`/openspec-archive-change`) depois que as tasks acima estiverem concluídas.
- Quando `frontend-v2-paper-parchment` for implementada, confirmar que a paridade da Linha do Tempo/Itens também inclui esta tela (já é exigido pela Requirement de paridade daquela change, sem necessidade de editá-la).
