# Data Model: Banco de controle e SQLite por campanha

**Feature**: `093-controle-alembic-sqlite`  
**Date**: 2026-09-19

## Layout (filesystem)

| Path | Conteúdo |
|------|----------|
| `{DATA_DIR}/control.db` | Registo de campanhas (só) |
| `{DATA_DIR}/campanhas/<uuid>/campanha.db` | Conteúdo da mesa (schema actual) |
| `{DATA_DIR}/campanhas/<uuid>/uploads/` | Mídia (map, portraits, locals) |

`DATA_DIR` omissão: `./data`. UUID no caminho; slug **nunca** no filesystem.

## Campanha (controle)

| Campo | Tipo | Regras |
|-------|------|--------|
| id | PK | Auto |
| slug | string | Unique; imutável; regex `^[a-z][a-z0-9-]{1,47}$`; sem `--`; não reservado |
| nome | string | Obrigatório na criação |
| sistema | string | Imutável; ex. `wfrp4e`, `wod` |
| modulos_ativos | lista/JSON | Imutável após criar; default por sistema se omitido |
| visibilidade | enum | `listada` \| `so_link`; default `listada` |
| caminho | string | `campanhas/<uuid>`; imutável |
| mapa_arquivo | string | Default `""` |
| cota_bytes | int | Default 10 GiB (10 × 1024³) |
| bytes_usados | int | Default 0; sem enforcement nesta fase |
| activa | bool | Default `true`; CLI cria sempre `true` |

### Validation

- Create: validar slug (formato + reservados + unique); criar pasta + DB na head **ou** rollback (sem órfãos).
- Update: serviço MUST rejeitar mudanças a `slug`, `sistema`, `modulos_ativos`.
- Resolve: slug inexistente ou `activa=false` → erro; sem fallback.

### Transitions

```text
[inexistente] --CLI criar--> [activa=true, sítio head]
[activa=true] --teste marca false--> [activa=false]  (sem CLI em 093)
[activa=false] --resolve slug--> recusa
```

## Conteúdo de campanha (campanha.db)

Sem campos novos. Tabelas existentes (`local`, `npc`, `vinculo`, `arco`, `grupo_posicao`, `waypoint`, `route_segment`, `map_scale`, links). Sem `campanha_id`. Singleton `grupo_posicao` id=1 **por ficheiro**.

### Alembic

- Árvore `alembic_campaign`: revisão inicial = schema corrente (pós-migrações ad hoc históricas).
- Legado: ficheiro sem `alembic_version` válida → ponte `_migrate_sqlite(engine)` → `stamp` head.
- Novo: `upgrade` até head na criação; sem ponte.

## Controlo (control.db)

Só tabela `campanha` nesta fase. Sem Usuario/Membro/Convite/Sessao (095).

### Alembic

- Árvore `alembic_control`: revisão inicial cria `campanha`.

## Identidade

- Campanha: UUID de pasta + `slug` único no controle.
- Conteúdo: IDs autoincrement **locais** ao ficheiro (colisão entre A e B é irrelevante).

## Relação com 092 harness

Uma Campanha de teste por execução; `CAMPAIGN_SLUG` injectado; `DATA_DIR` = `tmp_path`.
