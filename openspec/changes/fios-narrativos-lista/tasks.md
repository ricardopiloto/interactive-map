# Tasks

## 1. Backend — entidade e CRUD

- [ ] 1.1 Criar o modelo `FioNarrativo` (`titulo`, `descricao`, `estado`, `origem`, `sessao_origem_id` inteiro nullable sem FK efetiva, `ordem`, `criado_em`) e a migração `012_fio_narrativo` em `alembic_campaign`, idempotente (checar `get_table_names`); verificar com `uv run pytest` do teste de migração (nova tabela existe, migração repetida não falha).
- [ ] 1.2 Em `sessao_service.delete_sessao`, zerar `sessao_origem_id` dos fios da sessão removida (o SQLite do projeto não aplica `ON DELETE SET NULL`); verificar com teste (o fio permanece na lista, sem sessão de origem).
- [ ] 1.3 Schemas e router `routers/admin/fios.py` (`GET` com filtro de estado, `POST`, `POST /lote`, `PATCH /{id}`, `DELETE /{id}`, `PUT /ordem`) com `require_dono` e limites de 30/minuto, registrado no router admin; `POST /lote` transacional (tudo ou nada, máximo 10 itens, `origem` e `sessao_origem_id` validados); verificar testes: CRUD completo, reordenação, lote com sucesso, lote com item inválido sem gravar nenhum, lote acima do limite recusado, jogador/visitante negados, dono de outra campanha negado.
- [ ] 1.4 Teste de que nenhuma rota de `routers/public/` expõe fios e de isolamento entre campanhas.
- [ ] 1.5 Incluir `fios` no pacote de exportação/importação (`build_content_dict`, `_insert_content`, `_validate_fks` verificando `sessao_origem_id` contra as sessões do pacote e preservando ids) e no backup; registrar em `SCHEMA_MIGRATORS` um migrador identidade de `011_personagem_notas_mecanicas` para o novo head e verificar se `010` tem o mesmo problema; verificar com teste de round-trip (título, descrição, estado, origem, ordem, sessão de origem) e teste de importação de um pacote exportado em 011.

## 2. Backend — proposta de fios pela IA

- [ ] 2.1 Extrair a coleta de contexto e o orçamento de `motor_ia_assistente.coletar_registros` para uma função compartilhada, sem mudar o comportamento da assistência; verificar com os testes existentes de `motor_ia_assistente` passando.
- [ ] 2.2 Criar `motor_ia_fios.py` com prompt genérico (Decisão 9 da `ia-assistente-mestre`: sem sistema de RPG, NPC sem bloco mecânico com marcador de placeholder, conteúdo como dado, ignorar ordens dentro dele) e saída JSON sem markdown, usando o coletor compartilhado para **todas** as sessões (resumo → notas de preparo → título), arcos, eventos, personagens, locais e fios existentes; verificar com `uv run pytest tests/test_motor_ia_fios.py -q` (sessão sem resumo entra com notas e título; fios existentes vão no contexto; asserts de prompt).
- [ ] 2.3 Orçamento: reduzir o limite por sessão de forma uniforme até o piso antes de omitir; devolver `sessoes_omitidas`; `usou_conteudo_oculto` sobre os registros finais; testes com campanha grande (nenhuma omissão silenciosa).
- [ ] 2.4 Saneamento da saída: descartar itens vazios, limitar tamanhos e quantidade, mapear `sessao_numero` para sessão existente, remover duplicados dos já existentes por título normalizado; estados `propostas|vazio|falha`; testes de JSON inválido, resposta vazia e duplicados.
- [ ] 2.5 Rota `POST /admin/fios/propor` (`require_dono`, `10/minute`, módulo `ia_arcos`, `incluir_ocultos=True`, timeout de 120 s); 403 explícito para módulo desligado/não dono; mensagens distintas para chave ausente, tempo esgotado e erro do provedor; log só de contagens; nada gravado; testes de rota (módulo desligado, jogador, 429, falha do provedor, payload enviado com cliente HTTP simulado).
- [ ] 2.6 Em `motor_ia_assistente`, o tipo `rascunho_sessao` recebe os fios com `estado=aberto` como registros de contexto (resolvidos não entram como pendência), respeitando a prioridade instrução > texto já nas Notas de Preparo > fios em aberto > resumos anteriores; verificar com teste do payload enviado.
- [ ] 2.7 Remover o tipo `fios_narrativos` de `/ia/assistir` (rota, `Literal` do schema, testes e copy); verificar que o tipo é recusado pela validação e que os demais tipos seguem funcionando.

## 3. Frontend — lista e revisão

- [ ] 3.1 Cliente de API (`src/api/`) para fios (CRUD, lote, reordenar, propor) e tipos; testes do cliente no padrão de `timeline.itens.test.ts`.
- [ ] 3.2 Seção "Fios em aberto" em `routes/sessoes.tsx`, só para o mestre dono: listar (abertos primeiro), adicionar, editar inline, reordenar, resolver/reabrir, remover com confirmação; layout mobile em cartões; verificar com `SessoesPage.test.tsx` ajustado.
- [ ] 3.3 Diálogo de revisão de propostas: itens com título e descrição editáveis, aceitar/descartar por item, "Adicionar selecionados" gravando com `POST /fios/lote` (tudo ou nada); aviso de `sessoes_omitidas`; estados loading, falha, vazio, 429 e 403; nada gravado antes da aceitação; testes de componente, incluindo falha do lote sem alterar a lista.
- [ ] 3.4 Ligar o botão "Fios narrativos" do `SessionEditor` (continua só em sessão não visível, com `iaAtiva` e `isDono`) ao novo diálogo, removendo o destino em `notas_preparo` e o uso do tipo `fios_narrativos`; testes de render condicional.
- [ ] 3.5 Copy pt-BR e en com o mesmo conjunto de chaves e teste de paridade.

## 4. Verificação e documentação

- [ ] 4.1 `uv run pytest` completo do backend e `npx vitest run`, `npx tsc --noEmit` e `npx eslint .` do `frontend-v2` passando.
- [ ] 4.2 Verificação manual com módulo ligado e `deepseek-chat`: propor fios numa campanha com sessões sem resumo, aceitar parte, editar, resolver, reabrir, remover; apagar uma sessão de origem e conferir que o fio permanece; gerar Rascunho e conferir que usa os fios em aberto; exportar e importar a campanha e conferir que os fios voltam; conferir mobile. Reverter dados de teste.
- [ ] 4.3 Atualizar `docs/backlog/backlog.md`: BKLG-046 aponta para esta change, BKLG-012 registra que o fio mínimo foi implementado e o que permanece (missões, relógios).
