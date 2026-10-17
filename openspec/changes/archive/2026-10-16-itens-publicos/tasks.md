# Tasks

## 1. Client HTTP e i18n

- [x] 1.1 Adicionar `listItensPublicos(slug)` a `frontend-v2/src/api/timeline.ts` (ou um `api/itens.ts` dedicado), consumindo `GET /api/c/{slug}/itens` e retornando um tipo `ItemPublico` (reaproveitar o shape já tipado para `Item`/`ItemDraft` em `timeline.ts:61-72`, sem o campo `visivel_para_todos`); não criar nenhum método de detalhe por id (ver `design.md`, Decision 4) — a tela consome só a lista. Verificar com um teste que mocka a chamada e confirma o shape da resposta.
- [x] 1.2 Criar o namespace de i18n `itens` (pt-BR + en) em `frontend-v2/src/locales/{pt-BR,en}/itens.json`, com as chaves de título da página, estado vazio, busca, indicação visual de "oculto" (Modo GM), chips de sessão/evento e link para o diálogo de Itens da Linha do Tempo; registrar o namespace em `frontend-v2/src/i18n/index.ts` (import + `resources[lang][ns]` + array `ns`). Verificar alternando o idioma e confirmando que todos os textos novos aparecem traduzidos.

## 2. Navegação

- [x] 2.1 Adicionar uma entrada ao array `lenses` em `frontend-v2/src/components/codex/Shell.tsx` (path, label, ícone), seguindo o mesmo padrão das abas já existentes, com label traduzido via `t(\`v2.${labels[path]}\`)` no namespace `comum`; verificar que a nova aba aparece na navegação (desktop e mobile) e fica marcada como ativa na rota de Itens.
- [x] 2.2 Registrar a rota de Itens em `frontend-v2/src/routes/campaignRoutes.tsx` (função `campaignChildren()`), seguindo o padrão de `/c/:id/:slug/*` com compatibilidade `/c/:slug/*` já estabelecido por `campanha-slug-com-id`; verificar navegando direto para a URL (com e sem id no path) e confirmando que a página carrega sem precisar passar por outra tela primeiro.

## 3. Tela de listagem e detalhe

- [x] 3.1 Criar `frontend-v2/src/routes/itens.tsx`: lista lateral com busca por nome, consumindo `listItensPublicos` quando a pessoa não está em Modo GM, ou `timelineApi.items` quando está (`isDono`, ver `design.md` Decision 3); verificar com uma campanha com múltiplos Itens (visíveis e ocultos) que a lista pública mostra só os visíveis e a lista de GM mostra todos.
- [x] 3.2 Marcar visualmente os Itens ocultos quando em Modo GM (ex. badge "oculto" ao lado do nome na lista); verificar que a marcação aparece só para itens com `visivel_para_todos=false` e só em Modo GM.
- [x] 3.3 Implementar o painel de detalhe do Item selecionado: nome, descrição via `RichContent`, chips de sessões associadas (estilo `EntityChip` de `sessoes.tsx:70-91`, navegando para `/sessoes?s={numero}`) e de eventos associados (navegando para a Linha do Tempo, sem pré-seleção — Decision 2); a seleção vem dos dados já carregados na lista, sem chamada HTTP adicional. Verificar com um Item com descrição em Markdown e referências de sessão/evento, confirmando renderização sanitizada e chips navegáveis.
- [x] 3.4 Implementar o deep-link `?item=ID` (mesmo padrão de `?local=ID` em `index.tsx:70`), selecionando no painel de detalhe o Item correspondente dentro da lista já carregada; quando o `ID` não está na lista carregada (oculto para quem não é GM, ou inexistente), mostrar o mesmo estado de "não encontrado" nos dois casos. Verificar com os três casos: Item visível, Item oculto acessado sem Modo GM, `ID` inexistente.
- [x] 3.5 Implementar o estado vazio (nenhum Item cadastrado/visível), seguindo o componente de estado vazio já usado em outras telas de `frontend-v2/`; verificar abrindo uma campanha sem Itens e confirmando a mensagem, não uma tela em branco ou erro.
- [x] 3.6 Mostrar, em Modo GM, um link para abrir a Linha do Tempo com o diálogo de Itens já existente, sem nenhuma ação de criar/editar/excluir na própria tela de Itens; verificar que o link leva à Linha do Tempo e que não há nenhum botão de CRUD na tela nova.

## 4. Verificação de visibilidade

- [x] 4.1 Adicionar aos fixtures de seed usados pelos testes de `frontend-v2/` pelo menos: um Item com `visivel_para_todos=false`, e um Item visível associado a uma sessão visível **e** a uma sessão oculta; verificar que o seed roda sem erro e que os itens aparecem no banco de teste com os campos esperados.
- [x] 4.2 Escrever um teste e2e Playwright (`frontend-v2/e2e/`) confirmando que, sem Modo GM: o Item oculto da task 4.1 não aparece na lista; acessar `?item={id-do-item-oculto}` mostra o mesmo estado de "não encontrado" que `?item=id-inexistente`; e com Modo GM ativo, o mesmo Item aparece na lista com a indicação visual de oculto e é selecionável via `?item=ID`. Verificar que o teste cobre os três casos.
- [x] 4.3 Escrever um teste e2e Playwright confirmando que, no detalhe do Item visível associado a uma sessão oculta (task 4.1), o chip dessa sessão **não aparece** para quem não é GM, só o da sessão visível; e que o chip de sessão visível navega para `/sessoes` com a sessão pré-selecionada.
- [x] 4.4 Rodar `backend/tests/test_itens_crud.py` e a suíte de testes públicos (`test_public_reads.py`) para confirmar que nenhum contrato de backend foi alterado por esta proposta; verificar que a suíte passa sem modificação.
- [x] 4.5 Escrever um teste e2e Playwright cobrindo o fluxo feliz: abrir a aba Itens → buscar por nome → selecionar um Item → ver descrição e chips → navegar por um chip de sessão; verificar que o teste passa localmente.

## Workflow follow-up

- Arquivar esta change (`/openspec-archive-change`) depois que as tasks acima estiverem concluídas.
