# Data Model: Migração legada e corte

**Feature**: `099-migracao-legado-corte`  
**Date**: 2026-09-20

## Schema changes

**Nenhuma revisão Alembic nova.** Destino usa head de `alembic_campaign` via ponte + stamp (093). Controle: linha `Campanha` + `Membro` dono (095). Campos 096 (`mapa_arquivo`, `cota_bytes`, `bytes_usados`) preenchidos no import.

## Entidades lógicas

### InstanciaLegada (origem, só leitura)

| Campo | Regra |
|-------|--------|
| `raiz` | `--origem` |
| `mapa_db` | `{raiz}/mapa.db` ou `{raiz}/data/mapa.db` |
| `uploads` | `{raiz}/uploads/` ou `{raiz}/data/uploads/` (directório; pode estar vazio) |
| `sistema` | parâmetro CLI (`wfrp4e` \| `wod`) — não lido em silêncio do `.env` |

MUST NOT escrever nesta árvore.

### ImportLegado (operação)

| Campo | Tipo | Notas |
|-------|------|--------|
| slug | str | produção: `wfrp` / `wod` |
| nome | str | catálogo 098 |
| sistema | str | `wfrp4e` / `wod` |
| visibilidade | str | omissão `listada` |
| email_dono | str | utilizador 095 existente |
| cota_bytes | int | omissão 10×1024³ |
| uuid_sitio | UUID | novo (093) |
| resultado | `PASS` \| `FAIL` | |

Estados: `validar` → `criar_sitio` → `copiar` → `ponte_stamp` → `rewrite` → `cota_owner` → `relatorio`. Qualquer falha → `rollback` (apagar sítio UUID + linha `Campanha` / membros criados nesta operação). Origem intacta em todos os estados.

### RelatorioVerificacao

```text
origem: path
destino_slug: str
destino_uuid: str
tabelas: { nome_tabela: { antes: int, depois: int } }
ficheiros_uploads: { antes: int, depois: int }
alembic_destino: revisão head
origem_intacta: bool
resultado: PASS | FAIL
```

**Tabelas canónicas** (`__tablename__`; omitir do relatório se **não existir** na origem **nem** no destino; se existir só num lado → FAIL):

| Tabela | Papel |
|--------|--------|
| `arco` | arcos |
| `npc` | personagens |
| `local` | locais |
| `local_npc` | M2M local–personagem |
| `local_conexao` | saídas |
| `grupo_posicao` | grupo |
| `vinculo` | vínculos |
| `waypoint` | nós de rota |
| `route_segment` | segmentos |
| `map_scale` | escala |

IDs internos preservados (093). Contagem **depois** é no `campanha.db` **já** stampado.

### Campanha (controle, inalterado)

Usado: `slug`, `nome`, `sistema`, `visibilidade`, `caminho`, `mapa_arquivo`, `cota_bytes`, `bytes_usados`, `activa=true`.

### SnippetCorte (stdout)

Não é persistido. Placeholders: hostname `campaign-codex.1nodado.com.br`, `PORTA_API`, `PORTA_WEB`. Sem campos de redirect. Sem entrada hub.

### JanelaRetorno

Dado operacional do runbook (não tabela): início = instante em que as instâncias antigas **param**; duração **14 dias**; acção = pastas `/opt/codex-*` paradas e intactas.

## Relationships

```text
InstanciaLegada (read) ──cópia──► sítio UUID (campanha.db + uploads)
Campanha 1—1 sítio
Campanha 1—1 Membro papel=dono
RelatorioVerificacao descreve um ImportLegado
WFRP ImportLegado ⊥ WoD ImportLegado (sítios e slugs distintos)
```

## Validation

- Slug livre / não reservado (093).
- Email dono existe e activo (095).
- `bytes_usados ≤ cota_bytes` após cópia.
- Relatório PASS obrigatório para o runbook autorizar corte.
- Isolamento: zero linhas/ficheiros de A no sítio de B.
