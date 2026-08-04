# Data Model: 034-revert-pin-offset

Sem entidades de persistência. Modelo de **estado de feature** e **apresentação**.

## Feature 030 lifecycle

| Estado | Significado |
|--------|-------------|
| Implemented (histórico) | Visual 030 esteve no working tree / produto |
| **Deferred / Staged** (alvo 034) | Artefactos em `specs/030-pin-size-offset/` mantidos; comportamento **não** activo no CSS do produto |
| Re-apply (futuro) | Fora de âmbito; nova feature após validação com reposicionar |

## Presentation entities (CSS)

| Selector | Pré-030 (restaurar) | 030 (remover do produto) |
|----------|---------------------|---------------------------|
| `.campaign-map__pin` | 24×24; margins -12 / -22; rotate -45° | `--pin-size`; margins -size; origin 100% 100% |
| `.campaign-map__pin--selected/hovered` | scale sem origin tip | `transform-origin: 100% 100%` |
| `.campaign-map__party--bandeira` | 24×32; -12 / -28 | vars + tip margin |
| `.campaign-map__party--brasao` | 22×22; -11 / -11 | vars + center margin |
| `@media (max-width: 799px)` pin/party | ausente | `--pin-size: 20px` + party shrink |

## Invariants

- `Local.x/y` / grupo coords inalterados.
- `displayLocais` (033) e unmount dialog (032) inalterados.
- Documentação 030 permanece no repo.
