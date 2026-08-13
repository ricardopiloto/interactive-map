# Data Model: Visibilidade de Personagem (GM)

**Feature**: `084-personagem-visibility`  
**Date**: 2026-08-13

## Personagem (`npc` table)

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| …existing… | | | Unchanged |
| `visivel_para_todos` | boolean | `true` | `true` = jogadores podem ver; `false` = apenas GM |

### Validation

- Sempre presente após migração (`NOT NULL`).
- Create/Update: opcional no Update; Create default `true` se omitido.

### Transitions

```text
[visível] --GM desliga «Visível para todos»--> [apenas GM]
[apenas GM] --GM liga «Visível para todos»--> [visível]
```

Efeito jogador: ao passar a apenas GM, personagem e arestas incidentes deixam de ser devolvidos nas APIs públicas. Ao revelar, personagem volta; arestas só se `player_visible(vínculo)` também passar.

## Conexão (vínculo) — regra de leitura (sem campo novo)

| Audience | Personagem incluído se | Vínculo incluído se |
|----------|------------------------|---------------------|
| Jogador | `visivel_para_todos` | `player_visible(v)` **e** ambos extremos `visivel_para_todos` |
| GM | sempre | sempre (regras admin actuais) |

## Local (leitura pública)

| Field | Player | GM (admin) |
|-------|--------|------------|
| `npc_ids` | só IDs com `visivel_para_todos` | lista completa ligada ao local |

## Migration

- Add column with `DEFAULT 1` → all existing rows visible (SC-003).
