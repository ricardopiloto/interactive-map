# Tasks

## 1. Conteúdo — redação das tabelas (entregável de redação, não só tradução)

- [x] 1.1 Redigir a tabela de nomes de PNG para `wfrp4e` e para `wod`, com pelo menos 30 entradas cada, em pt-BR e en; revisar que nenhuma entrada se repete dentro da mesma tabela
- [x] 1.2 Redigir a tabela de rumores/ganchos para `wfrp4e` e para `wod`, com pelo menos 20 entradas cada, em pt-BR e en
- [x] 1.3 Redigir a tabela de condições de clima/ambiente para `wfrp4e` e para `wod`, com pelo menos 15 entradas cada, em pt-BR e en
- [x] 1.4 Redigir a tabela de itens/loot genérico para `wfrp4e` e para `wod`, com pelo menos 20 entradas cada, em pt-BR e en
- [x] 1.5 Redigir um conjunto de fallback genérico (não específico de ambientação) para cada uma das quatro tabelas, em pt-BR e en, usado quando `Campanha.sistema` não bate com `wfrp4e` nem `wod`

## 2. Backend — serviço de geradores e rota GM-only

- [x] 2.1 Criar `backend/app/services/geradores.py` com as quatro tabelas (conteúdo da seção 1, estruturado como `{tipo: {sistema: [itens]}}` com chave de fallback) e uma função de sorteio por tipo que recebe o `sistema` da campanha e evita repetir o resultado imediatamente anterior
- [x] 2.2 Criar `backend/app/routers/admin/geradores.py` com um endpoint por tipo de gerador (ou um endpoint único parametrizado), registrado em `backend/app/routers/admin/__init__.py` (herda `require_membro` do grupo); verificar com `pytest` que uma chamada sem autenticação de mestre é rejeitada
- [x] 2.3 Escrever teste em `backend/tests/` cobrindo: cada um dos quatro geradores retorna um resultado não vazio pra uma campanha `wfrp4e`, pra uma campanha `wod`, e pra uma campanha com `sistema` desconhecido (usa o fallback sem erro); verificar com `pytest backend/tests/`

## 3. Frontend — tela de geradores e navegação condicional

- [x] 3.1 Criar a página nova (ex.: `frontend-v2/src/routes/ferramentas.tsx`) com um painel por gerador, cada um com um botão de sortear e exibição do resultado
- [x] 3.2 Registrar a rota nova em `frontend-v2/src/routes/campaignRoutes.tsx` (ex. path `ferramentas`)
- [x] 3.3 Adicionar o item de navegação condicional em `frontend-v2/src/components/codex/Shell.tsx`, visível quando `canEdit` for `true` (permissão de mestre) — **não** usar `enabled` (o toggle de "Modo GM"): o item deve continuar visível mesmo com o toggle de edição desligado (ver `design.md`)
- [x] 3.4 Adicionar as chaves de tradução novas (rótulos da tela, dos quatro geradores, e o conteúdo das tabelas da seção 1) em `frontend-v2/src/locales/pt-BR/` e `frontend-v2/src/locales/en/`
- [x] 3.5 Verificar manualmente no navegador: como mestre, acessar a tela nova e sortear cada um dos quatro geradores numa campanha WFRP e numa campanha WoD, confirmando conteúdo diferente entre as duas; confirmar que o item de navegação continua visível com o toggle de "Modo GM" desligado (`enabled=false`), e que não aparece pra um jogador (`canEdit=false`)

## 4. Verificação final

- [x] 4.1 Rodar a suíte completa de testes do backend (`pytest backend/tests/`) e confirmar que nenhum teste existente quebrou
- [x] 4.2 Rodar `tsc --noEmit` em `frontend-v2/` e a suíte de testes do frontend, confirmando que passam sem erro novo
- [x] 4.3 Verificar, como jogador (sessão não-GM), que a rota nova não é acessível (nem pelo menu, nem navegando direto pra URL) e que a chamada à API correspondente retorna erro de autorização

## 5. Atalho «Enviar para preparo»

- [x] 5.1 Criar o helper de montagem do texto em `frontend-v2/src/api/geradores.ts` (ou módulo próprio): dado `notas_preparo` atual, rótulo e resultado, devolve o novo texto acrescentando `- {rótulo}: {resultado}` ao fim, sem linha em branco inicial quando as notas estão vazias; cobrir com teste unitário
- [x] 5.2 Adicionar em `geradores.ts` a chamada que lê as sessões ocultas (`GET admin/sessoes`, filtrando `visivel_para_todos === false`) e a que acrescenta ao destino (`GET admin/sessoes/{id}` fresco + `PATCH` só com `notas_preparo`)
- [x] 5.3 Em `frontend-v2/src/routes/ferramentas.tsx`, botão «Enviar para preparo» em cada resultado, com seletor das sessões ocultas (número e título), mensagem de confirmação com o número da sessão e mensagem orientando «Preparar próxima sessão» quando não há sessão oculta; tratar erro (inclusive limite de tamanho de `notas_preparo`)
- [x] 5.4 Adicionar as chaves de tradução novas em `frontend-v2/src/locales/{pt-BR,en}/ferramentas.json`
- [x] 5.5 Escrever testes em `frontend-v2/src/routes/FerramentasPage.test.tsx` cobrindo: acrescenta ao fim sem tocar o texto existente; notas vazias; sem sessão oculta; sessões visíveis nunca listadas
- [x] 5.6 Teste de backend em `backend/tests/test_geradores.py` (ou `test_sessoes_visibility.py`) provando que `PATCH` parcial só com `notas_preparo` preserva os demais campos da sessão e que o texto não aparece em `GET /api/sessoes`
- [x] 5.7 Verificar no navegador: sortear um rumor, enviar para uma sessão oculta, abrir a sessão e conferir a nota; confirmar no mobile

## Workflow follow-up

- Atualizar `docs/backlog/backlog.md` — marcar BKLG-045 como implementado, com link para esta change.
- Arquivar esta change (`openspec archive geradores-apoio-mestre`) depois da revisão do mestre usuário-teste.
- Avaliar o BKLG-047 (tornar as tabelas editáveis por campanha) depois de observar o uso real desta entrega.
