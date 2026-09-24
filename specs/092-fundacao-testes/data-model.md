# Data Model: Fundação de testes do backend

**Feature**: `092-fundacao-testes`  
**Date**: 2026-09-19

Nenhuma tabela nova. A suíte instancia o schema **actual** (`SQLModel.metadata.create_all` + `_migrate_sqlite`) num ficheiro SQLite temporário. Entidades abaixo são o **mínimo de seed** e o ambiente de teste.

## Ambiente de teste (não persistido em produção)

| Campo | Regra |
|-------|--------|
| Ficheiro SQLite | `tmp_path / "campanha.db"` (ou equivalente) **por teste** |
| Pasta uploads | `tmp_path / "uploads"` (+ subpastas `map`, `portraits`, `locals` via lifespan) |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Constantes só da suíte, injectadas em `settings` |
| `SISTEMA` | `wfrp4e` salvo teste de config que pinne o valor injectado |
| `database_url` de desenvolvimento (`./data/mapa.db`) | Nunca o `engine` da suíte |

### Validação

- Após a suíte, `data/mapa.db` e `uploads/` habituais da máquina MUST permanecer intactos (não foram abertos pelo engine de teste).
- Cada teste MUST ver BD vazia ou só o seed desse teste (sem lixo do anterior).

## Seed mínimo — leituras públicas

| Entidade | Tabela | Campos mínimos | Notas |
|----------|--------|----------------|-------|
| Arco | `arco` | `titulo`, `ordem` | Um para detalhe `/api/arcos/{id}` |
| Local | `local` | `nome`, `x`, `y` | Ligado ao arco opcionalmente |
| Personagem visível | `npc` | `nome`, `tipo`, `visivel_para_todos=true` | PJ ou NPC |
| Personagem oculto | `npc` | `nome`, `tipo`, `visivel_para_todos=false` | Ausente nas GET públicas |
| Vínculo público | `vinculo` | ids A/B, `tipo_ab`, `publico=true` | Pin: oculto nos dois extremos → linha **não** sai no GET público |
| Grupo | `grupo_posicao` | — | Pode nascer no `GET /api/grupo` (id=1 default) |

## Seed mínimo — rede de vias

| Entidade | Tabela | Campos mínimos | Notas |
|----------|--------|----------------|-------|
| Waypoint A e B | `waypoint` | `x`, `y` (0–1), `nome` opcional | Dois nós distintos |
| Segmento (só no caso sucesso) | `route_segment` | `waypoint_a_id`, `waypoint_b_id`, `tipo=estrada`, `distancia_milhas > 0` | Sem segmento = rede insuficiente |
| Escala | `map_scale` | default `miles_per_unit` | `get_or_create_scale` pode criar no GET admin |

### Transições (só no teste)

```text
[dois waypoints, sem segmento] --GET /api/routes/plan--> rotas []
[dois waypoints + segmento com milhas > 0] --GET /api/routes/plan--> rotas length ≥ 1
```

## Personagem oculto (já no produto)

Campo existente `npc.visivel_para_todos`. Sem migração. Ver [084](../084-personagem-visibility/data-model.md) para regras de leitura; 092 **só pinna**, não altera.

| Audiência | Listagem personagens/NPCs | Detalhe oculto | Listagem admin |
|-----------|---------------------------|----------------|----------------|
| Jogador | só `true` | 404 código actual | — |
| GM (Basic Auth) | — | — | inclui `false` |

## Identidade

IDs autoincrement SQLite. Testes MUST usar os ids devolvidos pelo seed (não hardcoded `1` para personagens se o grupo/escala ocuparem outros ids). Waypoints de plano: ids do insert daquele teste.
