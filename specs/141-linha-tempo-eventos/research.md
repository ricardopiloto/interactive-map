# Research: Linha do Tempo vertical da campanha

Sem `[NEEDS CLARIFICATION]` — decisões fechadas no [BP](../../docs/brainstorming/brainstorming-session-2026-09-24-1154.md) / [BKLG-030](../../docs/v2/backlog.md#bklg-030-produto--linha-do-tempo-vertical-da-campanha-novo-menu-ao-lado-de-sessões) e confirmadas contra o código (padrão Sessão).

## Decisão 1 — Espelhar Sessão, não derivar de Sessão/Local

**Decisão**: Entidade `Evento` independente com links N:N (`evento_local`, `evento_npc`) e `sessao_id` opcional. Serviço `evento_service` espelha `sessao_service` (lista pública filtrada por `visivel_para_todos`, admin vê tudo, `_replace_links` no write).

**Rationale**: BP rejeitou timeline derivada; Sessão já prova o pacote CRUD + chips + visibilidade no mesmo produto.

**Alternatives considered**: View automática sobre sessões — rejeitada no BP. Unificar Evento e Sessão — conflitaria com Crônica numerada.

## Decisão 2 — Ordenação `ano ASC, id ASC`

**Decisão**: Lista sempre `ORDER BY ano ASC, id ASC` (mais antigo no topo). `rotulo_era` nunca entra na ordenação. Sem config de calendário/início.

**Rationale**: Spec FR-002 + Assumptions (desempate por id crescente).

**Alternatives considered**: `numero` manual como Sessão — BP pediu ano automático. `ano DESC` — viola “mais antigo no topo”.

## Decisão 3 — Personagens = `npc.id`; API diz `personagem_ids`

**Decisão**: FK para tabela `npc` (PJ|NPC unificados). Schemas/API usam `personagem_ids` / `personagens` como Sessão já faz.

**Rationale**: Não existe tabela `personagem` separada; consistência com `SessaoNpcLink`.

**Alternatives considered**: Só tipo `npc` — quebraria PJs citados.

## Decisão 4 — Chips ocultos: omitir do payload (não placeholder)

**Decisão**: Na vista jogador, `to_public` omite locais/NPCs com `not is_visivel_para_jogador` dos arrays do evento; o evento permanece se `visivel_para_todos`. Mestre recebe listas completas. UI mostra só o que veio na resposta (sem inventar “???”).

**Rationale**: Mesmo contrato efectivo de `sessao_service.to_public(..., filter_hidden_npcs=True)`. Spec FR-006 (“redigir”) cumpre-se ao não expor nome/retrato.

**Alternatives considered**: Omitir o evento inteiro se qualquer ref for oculta — rejeitado no BP. Strings placeholder no backend — desnecessário se o array já filtra.

## Decisão 5 — Nav + rota ao lado de Sessões

**Decisão**: Estender `campaignNav.ts` com id `linha-tempo` (ou `linhaDoTempo`) **imediatamente após** `sessoes`; rota `/c/:slug/linha-do-tempo`; página `LinhaTempoPage` no padrão `SessoesPage` (`useEditMode` → admin vs campaign API).

**Rationale**: FR-001; single source of truth do header/bottom nav.

**Alternatives considered**: Sub-aba dentro de Sessões — BP pediu item de menu próprio.

## Decisão 6 — Export/import fora de escopo (v1)

**Decisão**: Não alterar `campaign_export.build_content_dict` nem loaders de import. Eventos vivem só no SQLite da campanha + API/UI. Documentar follow-up se backup completo for necessário.

**Rationale**: Assumption explícita da spec; reduz risco nesta entrega.

**Alternatives considered**: Incluir Evento no ZIP já — scope creep sem pedido de paridade de backup.

## Decisão 7 — Migração `004_evento`

**Decisão**: `backend/alembic_campaign/versions/004_evento.py` com `down_revision = "003_visibilidade_local_arco"`. Criar `evento`, `evento_local`, `evento_npc` de forma idempotente; `downgrade` dropa as três.

**Rationale**: Cadeia Alembic campaign actual termina em `003_*`.

**Alternatives considered**: Colunas JSON no `evento` para ids — pior para FKs e validação.
