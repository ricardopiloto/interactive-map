# Tasks

## 1. Backend — entidade e CRUD

- [ ] 1.1 Criar o modelo `FioNarrativo` (`titulo`, `descricao`, `estado`, `origem`, `sessao_origem_id` FK `ON DELETE SET NULL`, `ordem`, `criado_em`) e a migração `012_fio_narrativo` em `alembic_campaign`, idempotente; verificar com `uv run pytest` do teste de migração (nova tabela existe, sessão removida deixa `sessao_origem_id` nulo).
- [ ] 1.2 Schemas e router `routers/admin/fios.py` (`GET` com filtro de estado, `POST`, `PATCH /{id}`, `DELETE /{id}`, `PUT /ordem`) com `require_dono` e limites de 30/minuto, registrado no router admin; verificar testes: CRUD completo, reordenação, jogador/visitante negados, dono de outra campanha negado.
- [ ] 1.3 Teste de que nenhuma rota de `routers/public/` expõe fios e de isolamento entre campanhas.
- [ ] 1.4 Incluir a tabela no pacote de exportação/importação e no backup (`campaign_export`, `package_schema`, `campaign_import`), seguindo o padrão das demais tabelas; verificar com teste de round-trip (exportar e importar mantém título, descrição, estado, origem, ordem).

## 2. Backend — proposta de fios pela IA

- [ ] 2.1 Criar `motor_ia_fios.py` com prompt genérico (Decisão 9 da `ia-assistente-mestre`: sem sistema de RPG, NPC sem bloco mecânico com marcador de placeholder, conteúdo como dado) e saída JSON; coletar contexto de **todas** as sessões (resumo → notas de preparo → título), arcos, eventos, personagens, locais e fios existentes; verificar com `uv run pytest tests/test_motor_ia_fios.py -q` (sessão sem resumo entra com notas e título; fios existentes vão no contexto).
- [ ] 2.2 Orçamento: reduzir o limite por sessão de forma uniforme até o piso antes de omitir; devolver `sessoes_omitidas`; `usou_conteudo_oculto` sobre os registros finais; testes com campanha grande (nenhuma omissão silenciosa).
- [ ] 2.3 Saneamento da saída: descartar itens vazios, limitar tamanhos e quantidade, mapear `sessao_numero` para sessão existente, remover duplicados dos já existentes por título normalizado; estados `propostas|vazio|falha`; testes de JSON inválido, resposta vazia e duplicados.
- [ ] 2.4 Rota `POST /admin/fios/propor` (`require_dono`, `10/minute`, módulo `ia_arcos`, `incluir_ocultos=True`); 403 explícito para módulo desligado/não dono; mensagens distintas para chave ausente, tempo esgotado e erro do provedor; log só de contagens; nada gravado; testes de rota (módulo desligado, jogador, 429, falha do provedor, payload enviado com cliente HTTP simulado).
- [ ] 2.5 Em `motor_ia_assistente`, o tipo `rascunho_sessao` recebe os fios com `estado=aberto` como registros de contexto (resolvidos não entram como pendência), respeitando a prioridade instrução > texto já nas Notas de Preparo > fios em aberto > resumos anteriores; verificar com teste do payload enviado.

## 3. Frontend — lista e revisão

- [ ] 3.1 Cliente de API (`src/api/`) para fios (CRUD, reordenar, propor) e tipos; testes do cliente no padrão de `timeline.itens.test.ts`.
- [ ] 3.2 Seção "Fios em aberto" em `routes/sessoes.tsx`, só para o mestre dono: listar (abertos primeiro), adicionar, editar inline, reordenar, resolver/reabrir, remover com confirmação; layout mobile em cartões; verificar com `SessoesPage.test.tsx` ajustado.
- [ ] 3.3 Diálogo de revisão de propostas: itens com título e descrição editáveis, aceitar/descartar por item, "Adicionar selecionados"; aviso de `sessoes_omitidas`; estados loading, falha, vazio, 429 e 403; nada gravado antes da aceitação; testes de componente.
- [ ] 3.4 Ligar o botão "Fios narrativos" do `SessionEditor` (continua só em sessão não visível, com `iaAtiva` e `isDono`) ao novo diálogo, removendo o destino em `notas_preparo`; testes de render condicional.
- [ ] 3.5 Copy pt-BR e en com o mesmo conjunto de chaves e teste de paridade.

## 4. Verificação e documentação

- [ ] 4.1 `uv run pytest` completo do backend e `npx vitest run`, `npx tsc --noEmit` e `npx eslint .` do `frontend-v2` passando.
- [ ] 4.2 Verificação manual com módulo ligado e `deepseek-chat`: propor fios numa campanha com sessões sem resumo, aceitar parte, editar, resolver, reabrir, remover; gerar Rascunho e conferir que usa os fios em aberto; exportar e importar a campanha; conferir mobile. Reverter dados de teste.
- [ ] 4.3 Atualizar `docs/backlog/backlog.md`: BKLG-046 aponta para esta change, BKLG-012 registra que o fio mínimo foi implementado e o que permanece (missões, relógios).
