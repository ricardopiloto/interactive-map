# Research: Visibilidade de Personagem (GM)

**Feature**: `084-personagem-visibility`  
**Date**: 2026-08-13

## 1. Nome do campo

**Decision**: `visivel_para_todos: bool` (default `True`) no modelo `NPC` / schemas Personagem (e espelhado em `NPCRead` onde a API legada `/api/npcs` ainda existe).

**Rationale**: Alinha ao rótulo de UI clarificado; evita colisão semântica com `Vinculo.publico` (que tem default `False` e significado diferente).

**Alternatives considered**: `publico` no personagem — rejeitado (confusão com vínculo). `oculto_gm` invertido — rejeitado (default e migração menos claros).

## 2. Onde filtrar (servidor vs cliente)

**Decision**: Filtrar **sempre** nas rotas públicas. O cliente jogador não deve receber IDs/nomes de personagens ocultos. O cliente GM usa endpoints admin (ou listagens admin de personagens/vínculos já existentes) que devolvem o campo e todos os registos.

**Rationale**: FR-003/004/008 e clarificação «sem indício»; defesa em profundidade.

**Alternatives considered**: Só filtrar no React — rejeitado (leak via Network).

## 3. Regra composta para vínculos

**Decision**: Um vínculo é visível ao jogador sse:

1. `player_visible(v)` actual (já: `publico` + regras `conhecido_*` / tipagem), **e**
2. Ambos `personagem_a` e `personagem_b` têm `visivel_para_todos == True` (tratar `NULL`/ausente como `True` após migração).

**Rationale**: FR-004 + FR-007; personagem oculto sobrepõe-se a vínculo público.

**Alternatives considered**: Esconder só o nó e deixar arestas órfãs — rejeitado (spec). Soft-delete de vínculos ao ocultar — rejeitado (dados do GM mantêm-se).

## 4. Locais / Mapa (`npc_ids`)

**Decision**: Em `LocalRead` **público**, `npc_ids` contém apenas NPCs com `visivel_para_todos`. Rotas admin de locais mantêm a lista completa. `GET /api/npcs` e `GET /api/npcs/{id}` idem (404 se oculto no get público).

**Rationale**: Clarificação Q1 — sem indício no Mapa; `PinModal` usa `local.npc_ids` + lista de NPCs.

**Alternatives considered**: Placeholder «NPC desconhecido» — rejeitado na clarify.

## 5. Migração SQLite

**Decision**: Em `_migrate_sqlite()`, se `npc` existe e não tem coluna `visivel_para_todos`:

```sql
ALTER TABLE npc ADD COLUMN visivel_para_todos BOOLEAN NOT NULL DEFAULT 1
```

Modelo SQLModel: `Field(default=True)`.

**Rationale**: Padrão do repo; SC-003 — personagens antigos ficam visíveis.

**Alternatives considered**: Alembic — fora do padrão actual. Default `0` — rejeitado (spec).

## 6. UI GM

**Decision**:

- `PersonagemFormDialog`: checkbox «Visível para todos» (i18n), default `true` em create; reflecte valor em edit; texto auxiliar «oculto aos jogadores» quando desligado.
- `GraphStage`: distintivo visual no nó quando `!visivel_para_todos` e `isGm` (ex. ícone/classe CSS + `aria`/title localizado). Jogador nunca recebe esses nós.
- Draft/payload em `RelacoesPage` inclui o campo nos create/update admin.

**Rationale**: Clarifications Q2 + Q3.

**Alternatives considered**: Segmento duas opções — rejeitado. Só formulário — rejeitado.

## 7. RelacoesPage data loading

**Decision**: Manter o padrão actual: jogador → `campaignApi.listPersonagens` + `listVinculos`; GM → listagens admin (ou equivalente que já devolve vínculos não públicos). Garantir que a resposta admin inclui `visivel_para_todos` e personagens ocultos.

**Rationale**: Já existe bifurcação `isGm` na página.

## 8. Versão SemVer

**Decision**: **0.17.0** (minor).

**Rationale**: Nova capacidade de produto + campo API; não é só bugfix (0.16.2 foi nav sem mapa).

**Alternatives considered**: 0.16.3 — rejeitado (capability bump).
