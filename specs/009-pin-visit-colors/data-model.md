# Data Model: 009-pin-visit-colors

## Entity: Local (extended)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| *(existing fields)* | … | … | inalterados |
| `cor_pin` | `str` (hex `#RRGGBB`) | yes | Cor do marcador no mapa |

### Validation

- Pattern: `^#[0-9A-Fa-f]{6}$`
- Create: obrigatório
- Update: se presente, deve ser válido; formulário GM sempre envia valor
- Read: sempre presente após migração/backfill

### Defaults

| Contexto | Valor |
|----------|--------|
| Migração legados | `#c4b5fd` (lilás — sugerido “conhecido não visitado”) |
| Novo local no form (UI) | Swatch lilás pré-selecionado (GM pode mudar) |
| Swatch “visitado” sugerido | `#e5484d` (vermelho atual do pin) |

### Relationships

Sem novas relações. `cor_pin` é atributo escalar de `Local`.

### State

Não há máquina de estados de visita — apenas valor de cor. Troca de cor = update do atributo.
