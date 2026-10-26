# Tasks

## 1. Backend — provedor e contexto

- [x] 1.1 Em `ia_provider.py`, adicionar a `completar`/`montar_contexto` o parâmetro só-keyword `incluir_ocultos` (padrão `False`) e um `max_tokens` opcional no payload; módulo, autorização do dono e isolamento continuam checados antes; `incluir_ocultos=True` sem dono autorizado falha com `IA_NAO_AUTORIZADO`; docstring de `montar_contexto` avisando que não autoriza sozinha; comentário de dívida de nome em `MODULO_IA`. Verificar em `backend/` com `uv run pytest tests/test_ia_provider.py -q` (padrão exclui ocultos; `True` só inclui ocultos da própria campanha; `True` sem dono é recusado sem chamar a rede).
- [x] 1.2 Criar helper único que monta `ItemContextoIa` lendo `visivel_para_todos` da entidade (nenhum chamador passa o booleano); verificar com teste de que um registro oculto nunca entra como visível.
- [x] 1.3 Confirmar que `motor_ia_arcos`, `motor_ia_sessao_associacoes` e `motor_ia_evento_associacoes` seguem sem ocultos (`montar_contexto` chamado sem a flag); verificar com `uv run pytest tests/test_motor_ia_arcos.py tests/test_motor_ia_sessao_associacoes.py tests/test_motor_ia_evento_associacoes.py -q` sem alterar seus testes.

## 2. Backend — serviço e rota de assistência

- [ ] 2.1 Criar `motor_ia_assistente.py` com a tabela tipo → campo de destino → prompt fixo (`PROMPT_VERSAO` constante) → fontes de contexto (seis tipos), instrução de ignorar comandos dentro do conteúdo, `Campanha.sistema` e instrução de idioma (idioma do texto/conteúdo, pt-BR na dúvida) no prompt; `texto_atual` e `instrucao` como registros do JSON, nunca no `system`; verificar com `uv run pytest tests/test_motor_ia_assistente.py -q`, incluindo asserts no prompt (idioma, sistema, anti-injeção).
- [ ] 2.2 Orçamento de contexto em settings (`ia_assistente_contexto_max_chars`, ~48k) incluindo `texto_atual` e `instrucao`, corte por registro (~1500) e corte total em ordem determinística (id decrescente), truncando `texto_atual` pelo início; `max_tokens` derivado do limite do campo; verificar com campanha grande que o payload enviado respeita o limite e mantém os registros mais recentes.
- [ ] 2.3 Calcular `usou_conteudo_oculto` sobre os registros finais pós-orçamento; aplicar trim, resposta vazia → `vazio`/`falha`, truncamento em limite de parágrafo com `truncado: true`, e devolver `limite_caracteres` e `campo_destino`; verificar testes de resposta vazia, grande demais, com cerca de Markdown, e oculto cortado pelo orçamento ⇒ `False`.
- [ ] 2.4 Limiar numérico de "campanha quase vazia" por tipo (constante, ponto de partida 2 registros relevantes, precedente `MIN_SESSOES_PARA_PROPOSTA` em `motor_ia_arcos.py`) com estado `vazio` ou sugestão marcada como genérica; verificar com teste de campanha sem sessões/arcos para `fios_narrativos` e `notas_preparo`.
- [ ] 2.5 Expor schemas e `POST /api/c/{slug}/admin/ia/assistir` com `require_dono` e `@limiter.limit("10/minute")`; `alvo_id` obrigatório por tipo (422), inexistente → 404 genérico, opcional em `notas_preparo`/`fios_narrativos`; módulo desligado e não autorizado → 403 explícito; verificar testes de rota: módulo desligado, jogador negado, dono de outra campanha negado, timeout/erro do provedor, 429, 422/404 de `alvo_id`, e que nada é persistido.
- [ ] 2.6 Teste do payload realmente enviado (client HTTP mockado): com personagem e sessão ocultos, o contexto da assistência os inclui e o dos motores existentes não; teste de isolamento com dono de duas campanhas (`alvo_id` da campanha B no slug de A não é encontrado e nenhum dado de B sai).
- [ ] 2.7 Log apenas de contagens (campanha, tipo, tamanho do contexto, flag de oculto, código de resultado); verificar com teste que nenhum texto da campanha ou da sugestão aparece nos logs capturados.
- [ ] 2.8 Teste de que `notas_preparo` e `notas_mecanicas` não aparecem nos serializers de `routers/public/`.
- [ ] 2.9 Validar o timeout efetivo (`deepseek_timeout_seconds`) para respostas longas; se não bastar, definir valor dedicado a esta rota e documentar.

## 3. Frontend — componente reutilizável

- [ ] 3.1 Criar o componente de assistência em `frontend-v2/src/components/codex/` (botão, instrução opcional, painel de revisão em texto puro com Inserir ao final / Substituir / Descartar; estados loading com botão desabilitado, falha, vazio, 429, 403; aviso de conteúdo oculto quando `campoPublico`), com função de cliente em `src/api/campanhas.ts`; verificar com `npx vitest run` em testes de componente: as três ações, rascunho inalterado em falha, aviso condicional reativo ao `campoPublico`, resposta tardia de outro `alvoId` descartada, painel descartado ao trocar de registro.
- [ ] 3.2 Respeitar o limite do campo: usar `limite_caracteres` da resposta, indicar `truncado`, bloquear/avisar "Inserir ao final" acima de `limite − len(texto_atual)`; verificar em teste.
- [ ] 3.3 Layout responsivo: botão e painel funcionam em tela estreita (botão quebra para linha própria, painel na largura do campo); verificar visualmente em largura mobile e, se viável, teste de render.

## 4. Frontend — gate e integração nos formulários

- [ ] 4.1 Levar `iaAtiva` e `isDono` por prop, lidos em cada rota (`sessoes.tsx`, `relacoes.tsx`, `index.tsx` do mapa, que passa a ler `modulos_ativos`), até `SessionEditor`, `PersonagemEditor`, `NpcEditor` e `LocalEditor`; o botão some inteiro com a IA desligada ou fora do perfil de mestre dono; verificar com teste de render condicional.
- [ ] 4.2 `SessionEditor`: assistência em `notas_preparo` (rascunho e fios narrativos, `campoPublico=false`, funcionando em sessão nova sem `alvo_id`) e em `resumo` (`campoPublico = visivel_para_todos` do rascunho), mantendo o botão de associações; verificar com `SessoesPage.test.tsx` ajustado.
- [ ] 4.3 `PersonagemEditor` (`RelationEditors.tsx`): `descricao` (`campoPublico = visivel_para_todos`) e `notas_mecanicas` (`campoPublico=false`); verificar com `RelationEditors.test.tsx` ajustado.
- [ ] 4.4 `NpcEditor` (`MapEditors.tsx`, usado em `routes/index.tsx`): `descricao` com `campoPublico` do rascunho; `LocalEditor`: `descricao` com `campoPublico = visivel_para_todos` do rascunho; não há teste de `MapEditors` hoje, então criar testes novos para os dois.
- [ ] 4.5 Rótulo "Assistente de IA" e ajuda do toggle em `painel.tsx` e `locales/pt-BR|en/comum.json`, informando que pode enviar conteúdo oculto da campanha ao DeepSeek; copy do assistente em pt-BR e en; verificar troca de idioma e teste de paridade das chaves entre os dois idiomas.

## 5. Verificação e documentação

- [ ] 5.1 `uv run pytest` do backend, `npx vitest run`, `npx eslint .` e type-check (`npx tsc --noEmit`) do `frontend-v2` passando. Sem e2e novo, a menos que a revisão aponte fluxo completo afetado.
- [ ] 5.2 Verificação manual com módulo ligado numa campanha de teste (wfrp): acionar cada tipo, inclusive criar personagem pelo mapa e fios em sessão nova, revisar o painel, aplicar, salvar e conferir via API admin que só o salvo foi persistido; medir latência/timeout com campanha grande; confirmar `usou_conteudo_oculto` na resposta da API (sem inspecionar conteúdo em log). Reverter dados de teste criados.
- [ ] 5.3 Atualizar `docs/backlog/backlog.md`: BKLG-046 com status e link da change, dependência do BKLG-015 e a decisão de 2026-10-25 (custo por conta do produto, DeepSeek por ora, gate tudo-ou-nada com envio de oculto aceito); nota no BKLG-015 para revisitar cota, monetização e rate limit por usuário.
- [ ] 5.4 Nota de release: campanhas com o toggle de IA ligado passam a enviar conteúdo oculto ao DeepSeek nas assistências de escrita.
