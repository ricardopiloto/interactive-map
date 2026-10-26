# Design

## Context

- Infra de IA: `backend/app/services/ia_provider.py` — `completar()` (gate de módulo, autorização do dono, isolamento de campanha, DeepSeek), `montar_contexto()` filtra por `is_visivel_para_jogador`. `MODULO_IA = "ia_arcos"`. Provedor atual: DeepSeek (`deepseek-chat`, `DEEPSEEK_*` em `config.py`). Hoje `completar` não envia `max_tokens`.
- Padrão de motor a seguir: `motor_ia_sessao_associacoes.py` (prompt fixo em `PROMPT_PADRAO`, `coletar_registros`, saneamento, estados `sugestoes|vazio|falha`) e rota `POST /sessoes/sugerir-associacoes` com `@limiter.limit("10/minute")` e `require_dono` (`routers/admin/sessoes.py`). Rate limit por IP (`services/rate_limit.py`).
- Isolamento: cada campanha tem seu próprio SQLite e `get_session(slug)` abre o banco da campanha da URL. Um `alvo_id` só alcança registros da campanha do slug; ainda assim a rota valida existência e devolve 404 genérico.
- Campos alvo e limites (backend): `Sessao.notas_preparo` / `Sessao.resumo` 50000; personagem/NPC `descricao` / `notas_mecanicas` 10000; `Local.descricao` 10000. `Campanha.sistema` (str, 40) identifica o sistema de RPG. Não há campo de idioma na campanha.
- Frontend de produção: `frontend-v2` apenas. Pontos de integração (citados por componente, as linhas mudam): `SessionEditor` (notas_preparo, resumo; já tem o botão de associações), `PersonagemEditor` em `RelationEditors.tsx` (descricao, notas_mecanicas), `NpcEditor` em `MapEditors.tsx` (descricao; usado em `routes/index.tsx`), `LocalEditor` em `MapEditors.tsx` (descricao, já rotulada como Markdown). Toggle do módulo em `routes/painel.tsx`; rótulo em `locales/*/comum.json` (`moduloIaArcos`).
- O gate de IA no frontend é lido por rota (`sessoes.tsx`, `cronologia.tsx`, `relacoes.tsx`); o mapa (`index.tsx`) não tem gate hoje.

## Goals / Non-Goals

**Goals:**

- Um clique no campo → sugestão coerente com a campanha → revisão → mestre aplica ou descarta.
- Reutilizar `ia_provider`, o gate `ia_arcos` e o padrão de motor; um componente de UI reutilizável para todos os campos.
- Mestre dono recebe sugestões que respeitam os segredos da campanha.

**Non-Goals:**

- Cota, orçamento ou registro de uso de IA além de contagens (decisão do produto: custo por conta nossa, sem controle por ora).
- Módulo de IA separado por recurso. Segue tudo-ou-nada no toggle existente.
- Streaming de resposta, histórico de sugestões, chat multi-turno.
- Estruturar ficha/stat block. Notas mecânicas seguem texto livre (BKLG-042).
- Resumo automático a partir de transcrição colada (BKLG-040), evolução separada.
- Criar entidades (personagens, locais) automaticamente. A IA só devolve texto para um campo que o mestre já está editando.
- Fios narrativos no nível da campanha, fora de uma sessão (não há campo de destino).
- Tocar nos motores existentes (arcos, associações) ou mudar o que eles enviam ao provedor.
- Seletor de idioma da sugestão na UI.

## Decisions

1. **Gate = `ia_arcos`, tudo-ou-nada, com envio de oculto aceito (decisão do produto, 2026-10-25).**
   O botão aparece quando `modulos_ativos` inclui `ia_arcos`, como hoje. O valor interno não muda (sem migração). O **rótulo** do toggle muda para "Assistente de IA" e o texto de ajuda passa a dizer, em pt-BR e en, que o assistente pode enviar conteúdo oculto da campanha ao provedor de IA (DeepSeek).
   *Consequência aceita:* campanhas que ligaram o toggle só para arcos passam a enviar conteúdo oculto ao DeepSeek nas assistências, sem novo opt-in. O produto aceitou isso conscientemente; mitigação: texto explícito no toggle, nota de release e envio de oculto limitado ao mestre dono, à própria campanha e a ação explícita.
   *BKLG-015:* esta decisão fecha, para esta change, as perguntas de custo (por conta do produto) e de provedor (DeepSeek por ora). Cota e monetização seguem abertas no BKLG-015.
   *Alternativas:* novo módulo `ia_assistente` com consentimento separado — rejeitada pelo pedido do produto ("all-in ou all-out"); confirmação por pedido — rejeitada pelo atrito de UX.
   *Dívida de nome:* `MODULO_IA = "ia_arcos"` passa a governar mais que arcos; adicionar comentário em `ia_provider.py`.

2. **Uma rota genérica, não uma por campo.**
   `POST /api/c/{slug}/admin/ia/assistir` com `{ tipo, texto_atual?, instrucao?, alvo_id? }`, `require_dono`, `@limiter.limit("10/minute")`. `tipo` é a **ação**; o campo de destino vem de uma tabela:

   | tipo | campo de destino | `alvo_id` |
   |---|---|---|
   | `notas_preparo` | `Sessao.notas_preparo` | opcional (ausente em sessão nova) |
   | `fios_narrativos` | `Sessao.notas_preparo` | opcional (ausente em sessão nova) |
   | `resumo_sessao` | `Sessao.resumo` | obrigatório |
   | `descricao_personagem` | personagem/NPC `descricao` | obrigatório |
   | `notas_mecanicas` | personagem `notas_mecanicas` | obrigatório |
   | `descricao_local` | `Local.descricao` | obrigatório |

   `alvo_id` ausente quando obrigatório → 422; `alvo_id` inexistente → 404 genérico. Módulo desligado ou pedido não autorizado → resposta HTTP 4xx explícita (403), para a UI não mostrar "falha do provedor". Falhas do provedor, timeout, resposta vazia ou inutilizável → `estado="falha"` com `mensagem`.
   Resposta: `{ estado: "sugestao"|"vazio"|"falha", texto?, mensagem?, usou_conteudo_oculto: bool, truncado: bool, limite_caracteres: int, campo_destino: str }`. Limite e destino vêm do servidor, não do tipo no cliente.
   *Alternativa:* seis rotas — rejeitada, o corpo é o mesmo e só muda a receita.

3. **Receita de contexto por tipo (tabela no serviço).**
   Cada `tipo` mapeia para um prompt fixo (constante `PROMPT_VERSAO`, sem infraestrutura de versionamento) e uma lista ordenada de fontes. O texto atual do campo e a instrução opcional do mestre vão como registros próprios do contexto.

   | tipo | contexto além do texto atual |
   |---|---|
   | `notas_preparo` | sessões recentes (resumo), arcos, notas de preparo anteriores, eventos recentes, personagens e locais (nome + papel/resumo curto) |
   | `fios_narrativos` | todas as sessões (resumo), arcos, eventos, personagens, locais e facções; foco em linhas abertas e segredos não revelados |
   | `resumo_sessao` | notas de preparo da própria sessão, personagens e locais ligados, arco da sessão, sessão anterior |
   | `descricao_personagem` | dados do personagem (nome, papel, facção, tipo), personagens da mesma facção, locais associados, arco, `Campanha.sistema` |
   | `notas_mecanicas` | dados do personagem, descrição, `Campanha.sistema`, notas mecânicas de outros personagens do mesmo tipo como exemplo de estilo |
   | `descricao_local` | dados do local, personagens associados, arco, locais vizinhos por nome |

   **Orçamento de contexto:** limite de caracteres por chamada em settings (`ia_assistente_contexto_max_chars`, ponto de partida ~48k), que **inclui** `texto_atual` e `instrucao`. Corte por registro (ex.: 1500 caracteres de cada resumo) e corte total com **ordem determinística**: mais recente primeiro (id decrescente). Sem ranking por relevância na primeira entrega. `texto_atual` acima do que cabe é truncado mantendo o final. Cortar registro a registro, nunca no meio da lista de forma cega.
   **Saída:** `max_tokens` derivado do limite do campo (≈ limite/3), passado a `completar`.
   **Campanha quase vazia:** abaixo de um limiar numérico de registros (constante, ponto de partida 2 sessões ou equivalente por tipo, com precedente em `MIN_SESSOES_PARA_PROPOSTA` de `motor_ia_arcos.py`), o serviço devolve `vazio` com mensagem orientando o mestre, ou uma sugestão marcada como genérica quando o tipo permite (descrição de personagem/local com texto atual).

4. **Conteúdo oculto: opção explícita em `completar`, ligada só na assistência.**
   Novo parâmetro **só-keyword** `incluir_ocultos: bool = False` em `completar`/`montar_contexto`. A assistência passa `True`; os três motores existentes continuam sem passar nada (`False`). Módulo, autorização do dono e isolamento por campanha são checados **antes** e valem igual; `incluir_ocultos` sem dono autorizado falha com `IA_NAO_AUTORIZADO` (teste explícito). A docstring de `montar_contexto` avisa que, chamada diretamente, ela não autoriza.
   **Visibilidade nunca à mão:** um helper único cria o `ItemContextoIa` lendo `visivel_para_todos` da entidade; nenhum chamador passa o booleano, já que o default do item é `True`.
   **`usou_conteudo_oculto`:** `montar_contexto` não expõe a visibilidade. O serviço calcula `any(not r.visivel_para_todos for r in registros_finais)` sobre os registros **efetivamente enviados**, depois do corte de orçamento. Oculto cortado pelo orçamento ⇒ `False`.
   *Risco tratado:* segredo vazando para campo público. Mitigado pelo aviso na UI (Decisão 6).
   *Alternativa:* manter a regra e enviar só o visível — rejeitada: o mestre pediu sugestões coerentes com os segredos.

5. **Saída em texto, com limite de tamanho.**
   O prompt exige: só o texto sugerido, sem preâmbulo, no idioma predominante do texto atual e do conteúdo da campanha (pt-BR na dúvida), sem inventar ids, respeitando o limite do campo (informado no prompt). O serviço aplica trim, trata resposta vazia como `vazio`/`falha` e, se a resposta exceder o limite, **trunca em limite de parágrafo e devolve `truncado: true`** (estado `sugestao`). Formato por tipo: Markdown só onde o campo é Markdown (descrição de local); nos demais, texto simples.
   O limite efetivo de "Inserir ao final" é `limite − len(texto_atual)`; o frontend valida e bloqueia/avisa ao aplicar acima disso.

6. **UI: um componente reutilizável de assistência.**
   Botão "Sugerir com IA" ao lado do rótulo do campo, campo opcional de instrução curta, painel de revisão abaixo do campo (não sobrescreve o `textarea`) em **texto puro** (sem renderizar Markdown/imagens remotas), com **Inserir ao final**, **Substituir**, **Descartar**. Estados: loading (botão desabilitado), falha, vazio, 429, 403. O componente recebe `tipo`, `alvoId`, `textoAtual` e `campoPublico` (reativo ao rascunho); `limiteCaracteres` e o destino vêm da resposta. O painel é chaveado por `alvoId`: resposta tardia de outro registro é descartada, e o painel é descartado ao trocar de registro ou de aba do editor.
   `campoPublico`: `resumo_sessao` = `visivel_para_todos` da sessão; `descricao_personagem` e `descricao_local` = `visivel_para_todos` do registro (personagem ou local); `notas_preparo`, `fios_narrativos` e `notas_mecanicas` = sempre só do mestre.
   **Gate no frontend:** `iaAtiva` e `isDono` são lidos na rota e levados por prop até `SessionEditor`, `PersonagemEditor`, `NpcEditor` e `LocalEditor`. Rotas sem gate hoje (mapa) passam a ler `modulos_ativos`.
   **Layout:** botão e painel funcionam em tela estreita (mobile): o botão quebra para a linha seguinte ao rótulo e o painel ocupa a largura do campo.
   O botão de "sugerir associações" existente no `SessionEditor` permanece como está.

7. **Prompt injection.**
   O conteúdo da campanha é dado, não instrução. `texto_atual` e `instrucao` do mestre entram como registros do JSON (`tipo` próprio), nunca concatenados ao `system`. Cada prompt fixo declara que o conteúdo recebido é material de referência e que instruções dentro dele devem ser ignoradas. O usuário final controlado é só o mestre dono; o conteúdo da campanha pode vir de importação de pacote ou de edição anterior, então a regra permanece. O dano máximo é texto ruim num painel que o mestre revisa; o painel em texto puro fecha o canal de imagem remota.

8. **Erros, limites e observabilidade.**
   Reutilizar os códigos de `ia_provider` e o envelope `estado`/`mensagem` dos motores atuais. O 429 do limiter vira mensagem própria na UI. Falha nunca altera o rascunho. O limite por minuto é por IP (igual aos motores atuais); aceito e registrado no BKLG-015 como ponto a revisar junto com cota. **Log apenas de contagens** (campanha, tipo, tamanho do contexto em caracteres, flag de oculto, código de resultado) — nunca o conteúdo. O timeout (`deepseek_timeout_seconds`) foi calibrado para JSON curto; validar na verificação manual se basta para prosa longa e ajustar para esta rota se preciso. A rota é síncrona e ocupa uma thread do pool durante a chamada.

## Risks / Trade-offs

- **[Custo sem controle]** → Aceito pelo produto. Mitigação: 10 pedidos por minuto por IP, orçamento de contexto, `max_tokens` por chamada e uma única chamada por clique. Contagens em log permitem decidir cota depois (BKLG-015).
- **[Conteúdo oculto de campanhas existentes passa a sair para o provedor sem novo opt-in]** → Decisão 1: aceito; texto explícito no toggle e nota de release; limitado ao dono, à campanha e à ação explícita.
- **[Segredo vazando para campo público]** → Aviso obrigatório na UI e revisão antes de aplicar. O sistema não detecta o vazamento no texto, só avisa.
- **[Contexto grande estoura o limite do modelo ou o timeout]** → Orçamento incluindo `texto_atual`; reduzir para ~24–32k caracteres se a latência for problema; medir em campanha grande.
- **[Sugestão genérica em campanha quase vazia]** → Limiar numérico e mensagem clara (Decisão 3).
- **[Sugestão acima do limite do campo]** → Limite informado ao prompt, truncamento com `truncado` e validação no "Inserir ao final".
- **[Idioma misturado]** → Instrução de idioma no prompt; teste do prompt e verificação manual com campanha pt-BR.
- **[Resposta aplicada no registro errado]** → Painel chaveado por `alvoId`, resposta tardia descartada.

## Migration Plan

Deploy backend e frontend juntos. Sem migração de banco. Campanhas com `ia_arcos` já ligado passam a ver o assistente nos campos novos e a enviar conteúdo oculto nessas ações; o texto do toggle e a nota de release deixam isso claro. Rollback: remover a rota e o componente; os campos voltam a ser manuais e os motores existentes não são afetados.

## Open Questions

Resolvidas nesta revisão (2026-10-25):

- **Idioma da sugestão:** idioma predominante do texto atual e do conteúdo da campanha, pt-BR na dúvida; sem seletor nesta change.
- **Fios narrativos:** ação do editor de sessão com destino em `notas_preparo`, incluindo sessão nova sem `alvo_id`; nível de campanha fora de escopo.
- **Orçamento de contexto:** ~48k caracteres como constante em settings, incluindo `texto_atual` e `instrucao`; confirmar contra o `deepseek-chat` configurado na implantação e baixar se o timeout apertar.

Abertas:

- Valor final do limiar de "campanha quase vazia" por tipo.
- Se o timeout do DeepSeek precisa de valor dedicado para esta rota.
