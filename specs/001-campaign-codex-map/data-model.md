# Data Model: 001-campaign-codex-map

## Overview

Uma campanha implícita (singleton). Entidades persistidas em SQLite; imagens referenciadas por URL relativa sob `/uploads/...`.

**UI (não persistido)**: tokens visuais Nocturne — ver [research.md §11](./research.md). Sem alteração de entidades para paleta/auth.

## Auth (operacional)

Credenciais GM (`ADMIN_USER` / `ADMIN_PASSWORD`) vivem em configuração/ambiente, **não** no banco. Não há entidade User.

## Entities

### Arco

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | int | PK, auto | |
| titulo | string | required, 1–200 | |
| resumo | string | default `""`, max 5000 | |
| ordem | int | ≥ 0, default 0 | Ordenação na aba História |

**Relationships**: 1 Arco → N Locais (`Local.arco_id` nullable).

**Delete behavior**: Ao excluir arco, `Local.arco_id` dos vinculados → `null` (local permanece).

---

### NPC

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | int | PK, auto | |
| nome | string | required, 1–200 | |
| descricao | string | default `""`, max 10000 | |
| faccao | string \| null | max 200 | Opcional |
| status | enum \| null | `vivo` \| `morto` \| `desaparecido` \| `desconhecido` | Default UI: `desconhecido` se ausente |
| retrato_url | string \| null | max 500 | Path `/uploads/portraits/...` |

**Relationships**: N:N com Local via `local_npc`.

**Delete behavior**: Remove linhas em `local_npc`; locais permanecem.

---

### Local (Pin)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | int | PK, auto | Ordem de cadastro = ordenação dentro do arco |
| nome | string | required, 1–200 | |
| descricao | string | default `""`, max 10000 | |
| x | float | 0.0–1.0 | Coordenada relativa |
| y | float | 0.0–1.0 | Coordenada relativa |
| imagem_url | string \| null | max 500 | `/uploads/locals/...` |
| data_sessao | string \| null | max 100 | **Texto livre** (rótulo), não date |
| arco_id | int \| null | FK → arco.id | Opcional |

**Relationships**: N:N NPC via `local_npc`; 0..1 Arco.

**Lifecycle**:
- Create: posição via clique no mapa → formulário → persist.
- Update: campos + opcionalmente nova posição (modo clique).
- Delete: remove pin e vínculos N:N; confirmação na UI.

---

### LocalNPCLink

| Field | Type | Constraints |
|-------|------|-------------|
| local_id | int | PK composto, FK local |
| npc_id | int | PK composto, FK npc |

---

### GrupoPosicao

Singleton lógico (`id = 1`).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | int | PK, fixed 1 | |
| x | float | 0.0–1.0 | Default 0.5 |
| y | float | 0.0–1.0 | Default 0.5 |
| atualizado_em | datetime | UTC | Atualizado a cada PUT |

**Bootstrap**: Se ausente no first request GET, criar com defaults.

---

## Validation rules (cross-cutting)

- Coordenadas fora de [0, 1] → rejeitar na API (422).
- `npc_ids` em create/update de Local: todos devem existir; senão 400.
- Upload: MIME ∈ {jpeg, png, webp, gif}; tamanho ≤ `MAX_UPLOAD_BYTES` (default 5 MB).
- Strings: trim; nome/titulo não vazios após trim.

## Indexes

- `local.nome`, `npc.nome`, `arco.ordem`, `local.arco_id` (já previstos no scaffold).

## Seed (dev/teste only)

Fixture opcional com ~5 locais, ~5 NPCs, ~2 arcos (conteúdo do protótipo). **Nunca** aplicada automaticamente em produção (`SEED` / comando explícito).

## Migration note

Scaffold atual: `Local.data_sessao: Optional[date]` → alterar para `Optional[str]` (SQLite permissivo; em dev pode recriar `mapa.db`).
