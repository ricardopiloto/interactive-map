# Review — Desenvolvedor Fullstack

**Change:** ia-assistente-mestre
**Data:** 2026-10-25
**Veredito geral:** Aprovado com ressalvas (implementável como está; ajustes de tasks e de contrato antes de começar)

Contexto lido: `backend/app/services/ia_provider.py`, `routers/admin/sessoes.py`, `services/rate_limit.py`, schemas (`personagem.py`, `npc.py`, `local.py`), testes existentes (`backend/tests/test_ia_provider.py`, `test_motor_ia_*`), `frontend-v2` (scripts `lint`/`test`/`test:e2e`, `SessoesPage.test.tsx`, `RelationEditors.test.tsx`, `RelationEditors`/`SessionEditor`/`MapEditors`). Não há CI no repositório citado nesta revisão; os scripts locais são a esteira (pytest, vitest, eslint, type-check).

## 1. Desenvolvimento do backend
Veredito: Atenção
- A rota é implementável com o que existe: espelha `sugerir_associacoes_admin` (`@limiter.limit("10/minute")`, `require_dono`, `get_session`). Não colide com `/sessoes/{sessao_id}` se for montada em `/admin/ia/assistir`; se for registrada sob `/sessoes`, declarar antes das rotas parametrizadas, como a atual.
- `completar` não tem `max_tokens`/`temperature` e `incluir_ocultos` ainda não existe. A task 1.1 precisa listar a mudança de assinatura (keyword-only, default `False`), a passagem de `max_tokens` e a atualização dos chamadores; `motor_ia_arcos` chama `montar_contexto` direto, então o default seguro é obrigatório.
- `usou_conteudo_oculto` não sai de `montar_contexto` (os dicts não carregam a visibilidade). A task 2.3 deve especificar o cálculo sobre os registros finais pós-orçamento — e o teste do caso "oculto cortado pelo orçamento ⇒ `False`".
- Contrato da rota subespecificado para codar: `alvo_id` obrigatório por `tipo` (422) e ausente para `notas_preparo`/`fios_narrativos` em sessão nova; devolver/derivar o campo de destino e o limite; `truncado: bool`; erros de módulo desligado/não autorizado como 4xx explícito vs. `estado="falha"`.
- Carregar `alvo_id` com checagem de pertencimento à campanha e 404 genérico; confirmar o escopo da sessão de banco (os motores atuais fazem `select(...)` sem filtro de campanha); incluir teste cruzado na 2.5.
- Orçamento: `texto_atual` (até 50000) e `instrucao` fora do orçamento hoje; incluí-los e definir ordem determinística (id decrescente) — implementável em ~uma função pura, boa para teste unitário.
- Idioma: não há campo na `Campanha`; implementar como instrução no prompt e testar só a presença da instrução.
- Modelos: `Personagem`/`NPC` têm limites 10000, `Sessao` 50000 — usar constantes do schema, não literais duplicados no serviço.
- Rate limit por IP (`rate_limit.py`): igual aos motores atuais; só registrar no BKLG-015.

## 2. Desenvolvimento do frontend
Veredito: **Atenção (escopo incompleto)**
- `NpcEditor` (`MapEditors.tsx`, usado em `routes/index.tsx`) não está nas tasks; sem ele, o fluxo de criação de personagem pelo mapa não ganha IA. Incluir em 4.2/4.3, com `campoPublico` vindo do draft.
- O gate é lido por rota (`sessoes.tsx`, `cronologia.tsx`, `relacoes.tsx`); o mapa (`index.tsx`) não tem. A seção 4 precisa de uma task de plumbing de `iaAtiva`/`isDono` até `PersonagemEditor`, `NpcEditor` e `LocalEditor` — não é trivial e muda a assinatura desses componentes.
- Componente reutilizável é a abordagem certa. Detalhes a fixar para codar: painel como texto puro (não Markdown renderizado); botão desabilitado em loading; descartar resposta tardia se o `alvoId` mudou; painel descartado ao trocar de aba/registro; `campoPublico` reativo ao draft (local e personagem via `visivel_para_todos`).
- Definir o arquivo do cliente (`src/api/campanhas.ts` vs `campaign.ts`) e o tratamento do 429 pela camada de erro existente.
- Mobile: não há menção. O painel de revisão abaixo do textarea e a linha do rótulo com botão precisam funcionar em tela estreita; adicionar critério na 3.1.
- i18n: copy em `comum.json` está ok, mas o volume pede teste de paridade de chaves pt-BR/en.

## 3. Deploy e operação
Veredito: OK com ressalva
- Sem variável, porta ou serviço novo; reutiliza `DEEPSEEK_API_KEY`/`DEEPSEEK_MODEL`/`DEEPSEEK_TIMEOUT_SECONDS`. Sem migração. Deploy conjunto backend+frontend.
- Timeout: o valor atual foi calibrado para JSON curto dos motores; prosa de até 10k–50k chars pode estourar. Validar o timeout efetivo para esta rota (ou parâmetro dedicado) e a latência do `deepseek-chat` com ~48k chars de contexto.
- Observabilidade: a task 5.2 pede "confirmar em log que o contexto incluiu ocultos", o que implicaria logar conteúdo de campanha. Trocar por teste automatizado do payload enviado ao client mockado e logar apenas contagens (campanha, tipo, tamanho, flag de oculto, código de resultado).
- Rota síncrona ocupa thread do pool durante a chamada; aceitável no porte atual, mas anotar.

## 4. Qualidade de código
Veredito: Atenção
- Boa cobertura planejada (gate, autorização, isolamento, falha do provedor, 429, visibilidade). Lacunas:
  - cenário "campanha quase vazia" sem task nem limiar numérico (há precedente em `MIN_SESSOES_PARA_PROPOSTA`);
  - teste de paridade i18n;
  - teste do payload real enviado (client mockado), não só de `montar_contexto`;
  - teste de que `notas_preparo`/`notas_mecanicas` não aparecem em serializers públicos;
  - cenário "registro oculto ⇒ sem aviso".
- Comandos de verificação: as tasks usam `uv run pytest backend/tests/...`; conferir o comando real e o cwd (`backend/`). Testes de frontend: `RelationEditors.test.tsx` e `SessoesPage.test.tsx` existem; **não há teste de `MapEditors`**, então 4.3 e `NpcEditor` criam teste novo (não "ajustam" um existente).
- Helper único para montar `ItemContextoIa` lendo a visibilidade da entidade, para não repetir o default `True` perigoso em seis tipos de fonte.
- Resiliência: falha nunca altera o rascunho (coberto); acrescentar duplo clique e resposta tardia.
- Escopo: seis receitas de contexto numa primeira onda é viável mas é a maior parte do esforço; se precisar cortar, `notas_mecanicas` e `descricao_local` são os de menor valor. Prompts "versionados" bastam como constante `PROMPT_VERSAO`.

## 5. Execução das decisões arquiteturais
Veredito: Atenção
- A task segue o design (rota genérica, `ia_provider`, gate `ia_arcos`, revisão antes de aplicar). Não reabre decisões.
- A task 1.2 ("motores seguem sem ocultos sem alterar seus testes") é a prova correta de não regressão — manter.
- Pontos que a implementação revelaria e voltam ao arquiteto:
  - consentimento: reaproveitar `ia_arcos` passa a enviar ocultos de campanhas que só tinham aceitado "arcos" (ver `review-architect.md`);
  - `texto_atual` + contexto > limite do orçamento;
  - ausência de `max_tokens`;
  - rate limit por IP com payload maior.

## Bloqueantes antes de implementar
- Nenhum de implementação. A decisão de consentimento do envio de oculto (bloqueante do arquiteto) precisa ser fechada antes do apply porque altera a task 4.4 (toggle), o valor de módulo e o `design.md`.

## Limitações técnicas a reportar ao Arquiteto
- Rate limit por IP + custo sem cota + payload de até ~48k chars (agravado por `texto_atual` fora do orçamento).
- Falta de `max_tokens` em `completar`.
- `ItemContextoIa.visivel_para_todos` com default `True` e flag de oculto não derivável da saída de `montar_contexto`.
- Timeout calibrado para JSON curto, não para prosa longa.
- Plumbing de gate por rota e `NpcEditor` fora do escopo declarado.
