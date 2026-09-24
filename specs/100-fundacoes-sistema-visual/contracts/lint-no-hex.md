# Contract: Lint / gate anti-hex

**Feature**: `100-fundacoes-sistema-visual`

## Comando

`npm run lint:tokens` → script que exit 0 só se não houver literais `#` de cor de UI fora da allowlist.

## Âmbito

| Incluir | Excluir do gate |
|---------|-----------------|
| `frontend/src/**/*.css` | `tokens.css` (definições) |
| `frontend/src/**/*.{ts,tsx}` | SVG/assets; `rgb()`/`hsl()` literais |
| | Cor de pino: `PIN_COLOR_*`, `--pin-color`, campos `cor` de local documentados |

## Falha

Qualquer `#RGB` / `#RRGGBB` / `#RRGGBBAA` em ficheiro incluído e não allowlisted → exit ≠ 0 + paths.

## CI

Job/local MUST correr este comando após a migração; TDD: introduzir o script a falhar, depois limpar.
