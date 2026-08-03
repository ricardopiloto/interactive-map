# Data Model: 017-location-connections

## Entity: LocalConexaoLink (nova)

Vínculo dirigido “o grupo saiu da origem para o destino”.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `origem_id` | int | yes | FK → `local.id`, parte da PK |
| `destino_id` | int | yes | FK → `local.id`, parte da PK |

### Constraints

- PK composta `(origem_id, destino_id)` → sem duplicatas da mesma saída
- `origem_id ≠ destino_id` (validar na API / sync; DB pode complementar com CHECK se fácil no SQLite)
- ON DELETE CASCADE (ou delete explícito) em ambas as FKs

### Não armazenar

- Sentido inverso automático
- Tipo de rota, distância, ordem, label

---

## Entity: Local (estendido no contrato)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| *(campos existentes)* | … | … | inalterados |
| `saida_ids` | `list[int]` | yes (read); default `[]` | IDs dos locais destino das saídas |

### Validation (API)

| Regra | Create | Update |
|-------|--------|--------|
| Cada id em `saida_ids` deve existir como Local | sim | se `saida_ids` enviado |
| Não incluir o próprio `id` (update) / origem ainda sem id (create: não incluir id futuro) | sim | sim |
| Duplicatas no array → dedupe | sim | sim |
| Omitir `saida_ids` no PATCH parcial | — | não altera vínculos; cliente GM envia lista completa ao salvar o form |

### Sync semantics

Igual a `npc_ids`: substituir o conjunto de destinos da origem pelo array enviado (clear + attach).

### Read

`LocalRead.saida_ids` = IDs dos destinos ligados como saída daquele local. Não expor `entrada_ids` nesta feature.

---

## Relationships

```text
Local (origem) 1 ──< LocalConexaoLink >── 1 Local (destino)
```

- Um Local tem N saídas (`saida_ids`)
- Um Local pode ser destino de M origens (sem campo dedicado no read)

---

## Lifecycle

| Evento | Efeito |
|--------|--------|
| Create local + `saida_ids` | Cria local; sync vínculos origem→destinos |
| Update `saida_ids` | Substitui saídas da origem |
| Delete local | Remove vínculos onde é origem ou destino |
| Reposition `x`/`y` | Sem mudança de vínculos; linhas usam novas coords no client |

---

## UI session (não persistido)

| Estado | Uso |
|--------|-----|
| `selectedLocalId` | Se não-null, mapa desenha linhas desse local → cada `saida_ids` |
| `hoveredLocalId` | Não controla linhas |
