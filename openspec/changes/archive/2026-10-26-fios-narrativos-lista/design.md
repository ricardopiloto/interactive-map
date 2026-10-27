# Design

## Context

- A change `ia-assistente-mestre` entrega a rota `POST /api/c/{slug}/admin/ia/assistir`, o serviço `motor_ia_assistente.py`, o componente `IaAssistente`, o gate `ia_arcos` e a regra "Rascunho e Fios só em sessão não visível". O tipo `fios_narrativos` hoje devolve texto que o mestre insere em `Sessao.notas_preparo`.
- `Sessao` tem `resumo`, `notas_preparo`, `visivel_para_todos` e `numero` (`models/sessao.py`). Cada campanha tem seu próprio SQLite e o schema evolui por `alembic_campaign` (última revisão: `011_personagem_notas_mecanicas`).
- Padrões a seguir: motores de IA que devolvem JSON estruturado e saneado (`motor_ia_sessao_associacoes.py`, `motor_ia_arcos.py`), CRUD admin com `require_dono` (`routers/admin/arcos.py`), pacote de exportação/importação (`services/campaign_export.py`, `package_schema.py`).
- Modelo de IA em uso: `deepseek-chat` (sem raciocínio). O `deepseek-flash` raciocina e consome `max_tokens` com o raciocínio, deixando o conteúdo vazio; esta change não depende dele.
- BKLG-012 ("Missões, fios abertos e relógios do mestre") descreve uma entidade mais ampla, com ciclo de vida e relógios. Esta change cria só a entidade mínima.

## Goals / Non-Goals

**Goals:**

- Uma lista única, persistente, editável e só do mestre dos fios em aberto da campanha.
- A IA propõe fios lendo todas as sessões, inclusive as sem resumo, e o mestre aceita item a item.
- Os fios em aberto realimentam o Rascunho da próxima sessão.

**Non-Goals:**

- Missões, relógios de progresso, vínculos entre fios e personagens/locais (BKLG-012 completo).
- Mostrar fios a jogadores.
- Proposta de fios fora do editor de sessão não visível, ou automática.
- Resolver fios automaticamente a partir de um resumo novo (o mestre marca).
- Histórico ou versões de cada fio.

## Decisions

1. **Entidade `fio_narrativo`, mínima e extensível.**
   Colunas: `id`, `titulo` (≤200), `descricao` (≤5000), `estado` (`aberto|resolvido`, padrão `aberto`), `origem` (`manual|ia`), `sessao_origem_id` (inteiro nullable que referencia `sessao`), `ordem` (int), `criado_em`. Sem `visivel_para_todos`: a entidade é sempre só do mestre, por construção (nenhum schema ou router público a expõe).
   O SQLite do projeto não liga `PRAGMA foreign_keys` (nenhuma ocorrência em `app/`), então `ON DELETE SET NULL` não seria efetivo. `sessao_service.delete_sessao` zera explicitamente o `sessao_origem_id` dos fios da sessão removida, no mesmo padrão em que já remove os links à mão.
   *Alternativa:* guardar a lista como texto dentro de `notas_preparo` — rejeitada, não permite estado, edição por item nem uso como contexto. *Alternativa:* já modelar missões e relógios do BKLG-012 — rejeitada por tamanho; a tabela pode ganhar colunas depois.
   Migração `012_fio_narrativo` em `alembic_campaign`, idempotente como as anteriores.

2. **CRUD admin sob `/api/c/{slug}/admin/fios`, só `require_dono`.**
   `GET` (filtro opcional por estado), `POST`, `PATCH /{id}`, `DELETE /{id}`, `PUT /ordem` (reordenação) e `POST /lote` (criação em lote, transacional: tudo ou nada, no máximo 10 itens por pedido, usado pelo diálogo de revisão para aceitar várias propostas sem deixar a lista parcial em caso de falha; o `POST` unitário fica para o fio manual). Limites de pedido como os de arcos (30/minuto), inclusive no lote. Nada nas rotas `public/`; teste prova que nenhuma resposta pública contém fios.

3. **Proposta de fios por rota própria, saída JSON estruturada.**
   `POST /api/c/{slug}/admin/fios/propor` (`require_dono`, `10/minute`, módulo `ia_arcos`), em novo serviço `motor_ia_fios.py` sobre `ia_provider.completar(incluir_ocultos=True)`. Corpo: `{ sessao_id? }` (sessão em edição, só para excluí-la do histórico de "já jogadas" quando for o caso; opcional em sessão nova). Resposta: `{ estado: "propostas"|"vazio"|"falha", fios: [{ titulo, descricao, sessao_numero? }], sessoes_omitidas: int, usou_conteudo_oculto: bool, mensagem? }`. Nada é gravado: o cliente grava os aceitos com `POST /fios/lote`.
   O prompt segue o genérico da `ia-assistente-mestre` (Decisão 9: sem sistema de RPG, NPC sem bloco mecânico com o marcador de placeholder, conteúdo da campanha como dado, ignorar ordens dentro dele). Saída em JSON sem markdown, 3 a 6 itens, limite de tamanho por campo; o serviço sanea (descarta itens vazios, limita tamanho, mapeia `sessao_numero` para uma sessão existente, remove duplicados óbvios dos já existentes por título normalizado).
   *Alternativa:* reusar `/ia/assistir` com `tipo=fios_narrativos` e fazer parse do texto — rejeitada, texto livre não permite aceitar item a item de forma confiável. O tipo `fios_narrativos` de `/ia/assistir` deixa de ser usado pela UI e é removido nesta change (rota, `Literal` do schema, testes e copy), para não haver dois caminhos para a mesma função.

4. **Contexto: todas as sessões, com fallback e orçamento sem omissão silenciosa.**
   A coleta e o orçamento reaproveitam o que `motor_ia_assistente.coletar_registros` já faz, extraídos para uma função compartilhada; `motor_ia_fios` mantém só o prompt, o formato de saída e o saneamento. Assim as duas famílias não divergem com o tempo. A carga é de poucos mestres e chamadas manuais, compatível com o limite de 10/minuto.
   Por sessão, na ordem do número: `Sessão N: título` + resumo; se o resumo é vazio, usa `notas_preparo`; se também vazio, só título. Mais arcos, eventos, personagens, locais, e os fios existentes (abertos e resolvidos, com estado, para não repetir). Orçamento total em settings (o da assistência, ~48k caracteres, incluindo o `system`). Se não couber: reduz o limite por sessão de forma uniforme (de ~1500 até um piso, ex.: 300 caracteres) antes de omitir; só se ainda não couber omite as sessões mais antigas e devolve `sessoes_omitidas` > 0. Conteúdo oculto da campanha entra (a lista é só do mestre) e a flag `usou_conteudo_oculto` segue a regra da `ia-assistente-mestre` (calculada sobre os registros finais).
   `max_tokens` moderado (saída é JSON curto), compatível com `deepseek-chat`.

5. **Rascunho usa os fios em aberto.**
   Em `motor_ia_assistente`, o tipo `rascunho_sessao` ganha registros `fio_em_aberto` (só `estado=aberto`), com a prioridade já declarada: instrução do mestre > texto já nas Notas de Preparo > fios em aberto > resumos anteriores. Fios resolvidos não são enviados como pendências. Depende da `ia-assistente-mestre` estar aplicada (e, de preferência, arquivada) antes.

6. **UI: lista na página de Sessões, revisão em diálogo.**
   Seção "Fios em aberto" em `routes/sessoes.tsx`, só para o mestre dono (mesmo gate de dono já usado ali): lista com abertos primeiro, adicionar, editar inline, reordenar, marcar resolvido/reabrir, remover (com confirmação). O botão "Fios narrativos" do `SessionEditor` (que continua só em sessão não visível, com `iaAtiva` e `isDono`) chama `fios/propor` e abre um diálogo de revisão: cada proposta com título e descrição editáveis, aceitar/descartar por item, "Adicionar selecionados". O destino atual (inserir texto em `notas_preparo`) deixa de existir para fios. Layout mobile: lista em cartões empilhados.

7. **Exportação, importação e backup.**
   Decidido: os fios entram no pacote de exportação/importação da campanha, além do backup por cópia do banco, mantendo-se só do mestre. O pacote atual é parcial (`build_content_dict` não inclui eventos nem itens), então esta change inclui `fios` em `build_content_dict`, em `_insert_content` e em `_validate_fks`; este último verifica `sessao_origem_id` contra as sessões do pacote, preservando ids.
   Compatibilidade: `migrate_to_head` só aceita a versão atual ou as registradas em `SCHEMA_MIGRATORS` (hoje só `000_pre`). Ao criar a `012`, todo pacote exportado em `011` passaria a ser recusado como `SCHEMA_FUTURO`. Por isso registra-se um migrador identidade de `011_personagem_notas_mecanicas` para o novo head, e verifica-se se o mesmo problema já existe para `010`.

8. **Erros, limites e observabilidade.**
   Mesmas regras da `ia-assistente-mestre`: 403 explícito para módulo desligado/não dono, `estado="falha"` com mensagem distinta para chave ausente, tempo esgotado e erro do provedor, log só de contagens (campanha, nº de sessões, nº omitidas, tamanho total, flag de oculto, código). Timeout de 120 s para chamadas de IA desta família.

## Risks / Trade-offs

- **[Dependência de sequência]** → Esta change usa código e specs que vivem na `ia-assistente-mestre`. Mitigação: aplicar depois dela; a spec desta change é autocontida e o requirement do Rascunho vira parte de `fios-narrativos`.
- **[Sessões demais para o orçamento]** → Redução uniforme e aviso de `sessoes_omitidas` em vez de omissão silenciosa. Campanhas muito longas podem precisar de resumo em lotes, fora de escopo.
- **[IA repete ou inventa fios]** → Fios existentes vão no contexto, deduplicação por título normalizado no servidor, `sessao_numero` validado, e revisão item a item obrigatória.
- **[Conteúdo oculto no provedor]** → Mesma decisão aceita pelo produto na `ia-assistente-mestre` (Decisão 1); a lista é só do mestre, então não há campo público de destino.
- **[Sobreposição com BKLG-012]** → A entidade mínima não bloqueia o BKLG-012; relógios e vínculos podem ser colunas/tabelas futuras.
- **[Custo sem cota]** → Uma chamada por clique, `deepseek-chat`, JSON curto, 10 pedidos/minuto; contagens em log para decidir cota depois (BKLG-015).

## Migration Plan

Deploy backend e frontend juntos. Migração `012_fio_narrativo` cria a tabela vazia (aplicada por campanha); sem backfill. Fios que o mestre já inseriu como texto em `notas_preparo` permanecem como estão. Rollback: remover as rotas e o componente; a tabela vazia ou preenchida não afeta o resto. Pacotes exportados na revisão 011 continuam importáveis pelo migrador identidade registrado para o novo head.

## Open Questions

- Se o botão de fios também deve existir na própria seção "Fios em aberto" (hoje: apenas no editor de sessão não visível, como pedido).
- Fios resolvidos são enviados à IA com o estado, para evitar reabrir temas (decidido; títulos curtos, custo baixo — medir em campanha grande).
- Piso de caracteres por sessão antes de omitir (ponto de partida 300).
