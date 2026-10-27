# Proposal

## Why

O assistente de IA da change `ia-assistente-mestre` já gera "fios narrativos" (ganchos e linhas em aberto), mas como texto avulso que vai parar nas notas de preparo: some no meio de outro texto, não pode ser marcado como resolvido, não é reaproveitado na sessão seguinte e a IA não enxerga o que já foi proposto ou resolvido. O mestre precisa de um lugar único, visível e editável, com tudo o que está em aberto na campanha.

## What Changes

- Nova **lista de fios narrativos** por campanha, só do mestre dono: cada fio tem título, descrição, estado (em aberto ou resolvido), origem (manual ou IA) e sessão de origem opcional. O mestre adiciona, edita, reordena, remove e marca como resolvido ou reabre.
- A lista aparece na página de Sessões, para o mestre dono, e nunca em área pública.
- A IA **propõe fios** lendo **todas** as sessões já escritas: usa o resumo e, quando a sessão não tem resumo, as notas de preparo e o título. Também considera os fios que já existem, para não repetir, e inclui conteúdo oculto da própria campanha (a lista é só do mestre).
- O botão "Fios narrativos" do editor de sessão (que só existe em sessão ainda não visível para jogadores, regra da `ia-assistente-mestre`) passa a abrir uma revisão **item a item**: o mestre edita, aceita ou descarta cada proposta; só as aceitas entram na lista.
- Os **fios em aberto alimentam o Rascunho** da próxima sessão como contexto.
- Fios novos aceitos substituem o uso atual do botão (que inseria texto em `notas_preparo`), e o tipo `fios_narrativos` de `/ia/assistir` é removido.
- Os fios aceitos são gravados em lote atômico, e entram no pacote de exportação/importação da campanha, que continua aceitando pacotes de versões anteriores.

## Capabilities

### New Capabilities

- `fios-narrativos`: lista persistente, editável e só do mestre de fios narrativos em aberto da campanha; proposta de fios pela IA a partir de todas as sessões; uso dos fios em aberto como contexto do Rascunho.

### Modified Capabilities

<!-- Nenhuma capability principal muda de requirement: `motor-ia-assistente` ainda está na change `ia-assistente-mestre` (não arquivada). O comportamento do Rascunho com fios em aberto fica descrito aqui e, ao arquivar as duas, vale como requirement de `fios-narrativos`. -->

## Impact

- **Backend**: nova tabela por campanha (`fio_narrativo`) com migração em `alembic_campaign`; CRUD admin só para o dono, com `POST /fios/lote` transacional; limpeza explícita de `sessao_origem_id` em `delete_sessao`; serviço de proposta de fios sobre `ia_provider` (JSON estruturado, `incluir_ocultos=True`) com coletor de contexto compartilhado extraído de `motor_ia_assistente`; inclusão dos fios como contexto do tipo `rascunho_sessao`; remoção do tipo `fios_narrativos` de `/ia/assistir`; fios no pacote de exportação/importação (`build_content_dict`, `_insert_content`, `_validate_fks`) com migrador identidade 011→head em `SCHEMA_MIGRATORS`, e no backup; testes.
- **Frontend (`frontend-v2`)**: seção "Fios em aberto" em `routes/sessoes.tsx`; diálogo de revisão de propostas acionado pelo botão de fios do `SessionEditor`; i18n pt-BR/en; testes.
- **Dependência de sequência**: aplicar depois da `ia-assistente-mestre` (usa a rota/serviço de assistência, o gate `ia_arcos`, o aviso de oculto e a regra "Rascunho e Fios só em sessão não visível").
- **Backlog**: aproveita e delimita o BKLG-012 ("Missões, fios abertos e relógios do mestre"): o fio é a entidade mínima, sem relógios nem missões; BKLG-046 passa a apontar para esta change.
- **Privacidade**: a lista é só do mestre; conteúdo oculto enviado ao DeepSeek segue a Decisão 1 da `ia-assistente-mestre`.
