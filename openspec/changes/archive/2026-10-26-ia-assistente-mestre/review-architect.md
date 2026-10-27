# Review — Arquiteto de Soluções

**Change:** ia-assistente-mestre
**Data:** 2026-10-25
**Veredito geral:** Bloqueado (1 bloqueante de decisão de produto/privacidade; o resto é ajuste de design)

Base: leitura dos artefatos da change, de `backend/app/services/ia_provider.py`, `config.py`, `openspec/specs/ia-provider`, `docs/backlog/backlog.md` (BKLG-015/046) e consolidação com a revisão prévia do agente Plan. Provedor de IA nesta fase: **DeepSeek** (`deepseek-chat`, via `ia_provider`), decisão registrada pelo usuário.

Não há documento de arquitetura nem ADRs em `docs/` (só `api-contracts.md`, `flows.md`, manuais). O `design.md` das changes OpenSpec faz o papel de ADR; esta revisão se apoia nele.

## 1. Definição da arquitetura técnica
Veredito: Atenção
- Stack coerente: reutiliza `ia_provider` (DeepSeek), padrão de motor (`motor_ia_sessao_associacoes`), rota admin com `require_dono` + limiter, e `frontend-v2`. Nenhuma tecnologia nova. OK.
- Rota genérica única `POST /admin/ia/assistir` com receita de contexto por `tipo` é a decisão certa e vira ponto único de instrumentação. OK.
- `fios_narrativos` é *ação* e não *campo*; o destino é `notas_preparo`. Spec, design e tasks tratam "cinco campos" e "seis tipos" de forma inconsistente — alinhar ("tipo = ação; campo de destino = tabela") e devolver/conhecer o destino para derivar `limiteCaracteres` e `campoPublico`.
- Escalabilidade: a change não declara carga. Para o porte do projeto 10/min por IP é suficiente, mas o payload é muito maior que o dos motores atuais (até ~48k caracteres vs. só nomes). Recomendação: registrar a carga assumida (poucos mestres, chamadas manuais) no design.
- Orçamento de contexto não inclui `texto_atual` (até 50000 chars) nem `instrucao`, então estoura o limite — incluir ambos no orçamento, ordem de corte determinística (mais recente primeiro), sem ranking de "mais relacionado" na 1ª entrega.
- `completar` não define `max_tokens`: saída ilimitada = custo sem teto. Adicionar `max_tokens` opcional derivado do limite do campo (a mitigação de custo mais barata, já que não haverá cota).
- Rota é síncrona e ocupa thread do pool durante o timeout (`deepseek_timeout_seconds`, calibrado para JSON curto). Respostas de prosa longa podem exceder; validar/ajustar o timeout para esta rota.

## 2. Integração com a infraestrutura existente
Veredito: Atenção
- Sem serviço, porta ou processo novo; sem migração; deploy backend+frontend juntos, rollback trivial. OK.
- Dados: nada novo persistido; backup/migração não afetados. OK.
- Escopo de frontend incompleto: `NpcEditor` (`MapEditors.tsx`, usado em `routes/index.tsx`) não está no design/tasks — sem ele, criar personagem pelo mapa fica sem IA, o que contradiz o "Why". Incluir nas tasks 4.2/4.3.
- O gate de IA no frontend é lido por rota (`sessoes.tsx`, `relacoes.tsx`; o mapa não tem), não por editor. A task 3.2/seção 4 deve prever o plumbing de `iaAtiva`/`isDono` para `PersonagemEditor`, `NpcEditor` e `LocalEditor`.
- Definir o arquivo do cliente de API (`api/campanhas.ts` vs `api/campaign.ts`) e citar funções além de números de linha.

## 3. Qualidade de arquitetura e trade-offs
Veredito: **Bloqueante** (consentimento), com ajustes importantes
- **Bloqueante — consentimento do gate (design Decisão 1 e Migration Plan).** Reutilizar `ia_arcos` faz campanhas que ligaram a IA *só para arcos* (cujo contrato dizia "oculto nunca vai ao provedor") passarem a enviar segredos ao DeepSeek sem novo opt-in. O aviso no toggle é retroativo e pode nunca ser visto. Além disso, o BKLG-015 (custo/privacidade) está registrado como bloqueio de qualquer IA nova, e a change não registra sua resolução. Opções: (1) novo valor `ia_assistente` em `modulos_ativos` (sem migração; um toggle visual pode ligar ambos, mantendo consentimento distinto); (3) manter tudo-ou-nada com a decisão registrada em `design.md` (Decisions, com data) e texto explícito "pode enviar conteúdo oculto ao DeepSeek"; (2) confirmação por pedido — pior UX. É decisão de produto: o pedido original "all-in/all-out" conflita com (1).
- `incluir_ocultos` é o ponto de extensão certo (autorização, módulo e isolamento rodam antes do filtro). Ajustes: parâmetro **keyword-only** default `False` (`motor_ia_arcos` chama `montar_contexto` direto); checagem de dono explícita e testada; docstring avisando que `montar_contexto(..., incluir_ocultos=True)` não autoriza sozinho.
- `ItemContextoIa.visivel_para_todos` tem default `True`: um item oculto montado sem a flag passa como visível. Com 6 tipos de fonte, criar um helper único que leia a visibilidade da entidade, sem aceitar booleano à mão.
- `usou_conteudo_oculto` não é derivável da saída de `montar_contexto`/`completar`. Calcular sobre os registros **finais pós-orçamento** (oculto cortado pelo orçamento ⇒ `False`); cobrir em teste.
- Prompt injection: `texto_atual` e `instrucao` devem entrar como registros do JSON com `tipo` próprio, nunca concatenados ao `system`. Painel de revisão renderiza **texto puro** (Markdown com imagem remota seria canal de exfiltração). A afirmação "jogadores escrevem nesses campos" não foi verificada nos routers — reduzir ou comprovar.
- IDOR por `alvo_id`: confirmar que a sessão de banco é escopada por campanha; senão validar `campanha_id` e devolver 404. Definir `alvo_id` obrigatório (resumo, personagem, notas mecânicas, local) vs. ausente (notas de preparo/fios para sessão nova), com 422; teste de dono de A com `alvo_id` de B.
- Rate limit por IP (não por usuário) com custo por chamada maior e sem cota: aceitar e registrar em BKLG-015, ou chavear por usuário+slug.
- Truncar vs. recusar: spec/design não decidem. Recomendado devolver `estado="sugestao"` com `truncado: true` (corte em parágrafo) e definir o limite efetivo de "Inserir ao final" (`limite − len(texto_atual)`, no backend ou validado no frontend).
- Módulo desligado/não autorizado: definir se vira HTTP 403 ou `estado="falha"` (a UI não deve exibir "falha do provedor" para isso).
- Telemetria mínima: logar apenas contagens (campanha, tipo, tamanho do contexto, flag de oculto), nunca conteúdo — pré-requisito barato para a decisão de cota. Remover da task 5.2 a "confirmação em log do contexto" (loga conteúdo de campanha); trocar por teste do payload enviado ao client mockado.
- Sobre-engenharia a evitar: ranking por relevância e "prompts versionados" como infraestrutura (basta `PROMPT_VERSAO` constante).
- Race de UI: descartar resposta tardia se o mestre trocou de registro (chavear painel por `alvoId`), desabilitar botão em loading.

## 4. Documentação e decisões (ADRs)
Veredito: Atenção
- `design.md` segue o padrão (decisões com alternativas rejeitadas). Mas a decisão mais sensível (tudo-ou-nada + envio de oculto) está só em *Risks*; promover a Decision com data.
- Delta de `ia-provider`: o título "…nunca enviados…" deixa de ser verdadeiro; renomear exige RENAMED/REMOVED+ADDED. O cenário 3 novo ("pedido que não é do mestre dono") duplica o requirement "Apenas mestre autorizado…" — mover/reformular.
- Capability `assistente-ia-mestre` foge do prefixo `motor-ia-*` das specs existentes; renomear para `motor-ia-assistente` agora (barato) em vez de depois do arquivamento.
- Diagrama: não exigido (fluxo linear UI → rota → motor → `ia_provider`).
- Comentar a dívida de nome em `MODULO_IA = "ia_arcos"` caso o valor seja mantido.

## 5. Ponte entre produto e técnico
Veredito: Atenção
- O "Why" (IA com contexto real, coerente com segredos) está traduzido de forma viável. Os 3 pontos de atrito são o consentimento (bloqueante acima), o `NpcEditor` ausente e o idioma.
- Idioma: `Campanha` não tem campo de idioma. Instruir "responda no idioma do texto e do conteúdo; na dúvida, pt-BR" e testar o prompt; seletor fica para depois.
- Cobertura de tasks: faltam teste de "campanha quase vazia" (limiar numérico, como `MIN_SESSOES_PARA_PROPOSTA` em `motor_ia_arcos`), paridade de chaves i18n pt-BR/en, e cenário de "registro oculto ⇒ campo não público ⇒ sem aviso". `campoPublico` do local deve vir de `visivel_para_todos`.
- BKLG-046: registrar dependência de BKLG-015 e sua resolução (task 5.3).

## Open Questions — recomendações
1. Idioma: idioma do conteúdo, pt-BR por padrão, sem seletor agora.
2. Fios narrativos: ação do editor de sessão com destino em `notas_preparo`, suportando sessão nova sem `alvo_id`; nível de campanha fica fora.
3. Orçamento: ~48k chars como constante em settings, incluindo `texto_atual`/`instrucao`; baixar para 24–32k se o timeout apertar; medir no teste manual.

## Bloqueantes antes de implementar
- Decidir o consentimento do envio de conteúdo oculto (opção 1 ou 3 acima) e registrar em `design.md`, incluindo a resolução da dependência do BKLG-015.
- Incluir o `NpcEditor` (e o plumbing de gate por rota) no escopo e nas tasks.
