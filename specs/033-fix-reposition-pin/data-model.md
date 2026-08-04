# Data Model: 033-fix-reposition-pin

Sem entidades de persistência novas. Modelo de **apresentação** no cliente.

## Entities

### Local (persistido)

Lista `locais` em `MapPage` — fonte de verdade após load/refresh/save.

| Campo | Uso no mapa |
|-------|-------------|
| `id`, `x`, `y` | Posição do pin quando não há draft de edição para este id |
| `cor_pin`, … | Restantes atributos do pin |

### LocalFormDraft (existente)

Rascunho de edição; após reposition click contém novos `x`/`y`.

| Campo | Papel nesta feature |
|-------|---------------------|
| `id` | Identifica qual pin da lista sobrescrever |
| `x`, `y` | Posição provisória do pin no mapa |
| `isNew` | Se true, não há pin na lista para sobrescrever (fora do foco) |

### Display Local (derivado)

Não é estado separado: `displayLocais = merge(locais, localDraft)` quando draft de edição activo.

## State / presentation rules

| Condição | Posição do pin do local `id` |
|----------|------------------------------|
| Sem `localDraft` ou draft de outro id / isNew | `locais[].x/y` |
| `localDraft.id === id` e `!isNew` | `localDraft.x/y` |
| Após save + refresh | `locais` actualizados; draft tipicamente limpo |
| Após cancel edição (`draft = null`) | De novo `locais[].x/y` (posição guardada) |

## Transitions (reposition)

```text
[Edit: draft set, pin shows draft(=persisted initially)]
    → Reposition mode (dialog hidden, draft kept)
    → Map click: draft.x/y = click; pin shows new draft coords
    → Save: persist → refresh locais → clear draft → pin = persisted
    → Cancel edit: clear draft → pin = old persisted
    → Banner cancel: placement=none only; draft/pin unchanged
```

## Invariants

- No máximo um local com override de draft de cada vez.
- Connection lines que usam a mesma lista de display MUST usar as coords mescladas (origem/destino coerentes com o pin).
- Não alterar schema de API Local.
